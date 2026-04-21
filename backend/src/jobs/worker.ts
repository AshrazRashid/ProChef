import { Worker } from "bullmq";
import { prisma } from "../common/db.js";
import { env } from "../common/config.js";
import { processScanSession } from "./processors/scanProcessor.js";

const connection = { url: env.REDIS_URL };
const DAY_MS = 24 * 60 * 60 * 1000;

async function buildExpiryAlertsForUser(userId: string, days: number) {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + days);

  const expiringItems = await prisma.pantryItem.findMany({
    where: {
      userId,
      expiresAt: {
        gte: now,
        lte: threshold
      }
    },
    include: { ingredient: true },
    orderBy: { expiresAt: "asc" }
  });

  return expiringItems.map((item) => ({
    pantryItemId: item.id,
    ingredientName: item.ingredient.name,
    quantity: item.quantity,
    unit: item.unit,
    expiresAt: item.expiresAt,
    daysUntilExpiry: item.expiresAt
      ? Math.max(0, Math.ceil((item.expiresAt.getTime() - now.getTime()) / DAY_MS))
      : null
  }));
}

new Worker(
  "scan-processing",
  async (job) => {
    const scanSessionId = job.data.scanSessionId as string;
    try {
      await processScanSession(scanSessionId);
    } catch (error) {
      await prisma.scanSession.update({
        where: { id: scanSessionId },
        data: { status: "failed", completedAt: null }
      });
      throw error;
    }
  },
  { connection }
);

new Worker(
  "expiry-notifications",
  async (job) => {
    const days = Math.max(1, Math.min(30, Number(job.data?.days ?? 3)));

    if (job.name === "send-expiry-alert") {
      const userId = job.data?.userId as string | undefined;
      if (!userId) {
        throw new Error("Missing userId for send-expiry-alert job");
      }

      const prefs = await prisma.notificationPreference.findUnique({
        where: { userId }
      });
      if (prefs && !prefs.expiryPushEnabled) {
        return { skipped: true, reason: "disabled_by_user", userId };
      }

      const alerts = await buildExpiryAlertsForUser(userId, days);
      if (alerts.length === 0) {
        return { sent: false, reason: "no_expiring_items", userId, days };
      }

      // Placeholder dispatch. Replace with push/email provider integration later.
      console.log(
        `[expiry-notifications] user=${userId} days=${days} alerts=${alerts.length} ingredients=${alerts
          .map((a) => a.ingredientName)
          .join(", ")}`
      );
      return { sent: true, userId, days, alertsCount: alerts.length };
    }

    return { ignored: true, reason: "unknown_job_name", jobName: job.name };
  },
  { connection }
);

console.log("Workers started");

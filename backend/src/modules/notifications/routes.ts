import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { notificationQueue } from "../../jobs/queues.js";

const prefSchema = z.object({
  expiryPushEnabled: z.boolean(),
  mealPushEnabled: z.boolean()
});

const dispatchExpirySchema = z.object({
  days: z.number().int().min(1).max(30).optional()
});

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/preferences", async (req: AuthedRequest, res) => {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: req.user!.id }
  });
  res.json(
    prefs ?? {
      expiryPushEnabled: true,
      mealPushEnabled: true
    }
  );
});

notificationsRouter.put("/preferences", async (req: AuthedRequest, res) => {
  const parse = prefSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, ...parse.data },
    update: parse.data
  });
  res.json(prefs);
});

notificationsRouter.get("/expiry-alerts", async (req: AuthedRequest, res) => {
  const daysParse = z.coerce.number().int().min(1).max(30).safeParse(req.query.days ?? 3);
  if (!daysParse.success) {
    res.status(400).json({ message: "Invalid query parameter", errors: daysParse.error.flatten() });
    return;
  }

  const days = daysParse.data;
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: req.user!.id }
  });
  const expiryEnabled = prefs?.expiryPushEnabled ?? true;

  if (!expiryEnabled) {
    res.json({
      enabled: false,
      days,
      totalAlerts: 0,
      alerts: []
    });
    return;
  }

  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + days);
  const dayMs = 24 * 60 * 60 * 1000;

  const expiringItems = await prisma.pantryItem.findMany({
    where: {
      userId: req.user!.id,
      expiresAt: {
        gte: now,
        lte: threshold
      }
    },
    include: { ingredient: true },
    orderBy: { expiresAt: "asc" }
  });

  res.json({
    enabled: true,
    days,
    totalAlerts: expiringItems.length,
    alerts: expiringItems.map((item) => ({
      pantryItemId: item.id,
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.unit,
      expiresAt: item.expiresAt,
      daysUntilExpiry: item.expiresAt ? Math.max(0, Math.ceil((item.expiresAt.getTime() - now.getTime()) / dayMs)) : null
    }))
  });
});

notificationsRouter.post("/expiry-alerts/dispatch", async (req: AuthedRequest, res) => {
  const parse = dispatchExpirySchema.safeParse(req.body ?? {});
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: req.user!.id }
  });
  const expiryEnabled = prefs?.expiryPushEnabled ?? true;
  if (!expiryEnabled) {
    res.status(409).json({ message: "Expiry notifications are disabled for this user" });
    return;
  }

  const days = parse.data.days ?? 3;
  const job = await notificationQueue.add(
    "send-expiry-alert",
    { userId: req.user!.id, days },
    {
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );

  res.status(202).json({
    queued: true,
    jobId: job.id,
    days
  });
});

import { Worker } from "bullmq";
import { prisma } from "../common/db.js";
import { env } from "../common/config.js";

const connection = { url: env.REDIS_URL };

new Worker(
  "scan-processing",
  async (job) => {
    const scanSessionId = job.data.scanSessionId as string;
    await prisma.scanSession.update({
      where: { id: scanSessionId },
      data: { status: "processing" }
    });

    // Placeholder scan output until ML model integration.
    const ingredient = await prisma.ingredient.upsert({
      where: { name: "Tomato" },
      update: {},
      create: { name: "Tomato", category: "vegetable", defaultUnit: "unit" }
    });

    await prisma.scanDetection.create({
      data: {
        scanSessionId,
        ingredientId: ingredient.id,
        confidence: 0.88,
        rawLabel: "tomato"
      }
    });

    await prisma.scanSession.update({
      where: { id: scanSessionId },
      data: { status: "completed", completedAt: new Date() }
    });
  },
  { connection }
);

new Worker(
  "expiry-notifications",
  async () => {
    // Placeholder job: add push/email integration.
    return;
  },
  { connection }
);

console.log("Workers started");

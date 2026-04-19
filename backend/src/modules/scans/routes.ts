import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { scanQueue } from "../../jobs/queues.js";

const createScanSchema = z.object({
  objectKey: z.string().min(1),
  contentType: z.string().min(1)
});

export const scansRouter = Router();
scansRouter.use(requireAuth);

scansRouter.post("/upload-url", (req: AuthedRequest, res) => {
  const scanId = randomUUID();
  const objectKey = `scans/${req.user!.id}/${scanId}.jpg`;

  // Placeholder until S3 signed URL helper is integrated.
  res.json({
    scanId,
    objectKey,
    uploadUrl: `https://example-s3-upload-url.local/${objectKey}`
  });
});

scansRouter.post("/", async (req: AuthedRequest, res) => {
  const parse = createScanSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const scan = await prisma.scanSession.create({
    data: {
      userId: req.user!.id,
      imageUrl: parse.data.objectKey,
      status: "uploaded"
    }
  });

  await scanQueue.add("process-scan", { scanSessionId: scan.id });
  res.status(202).json(scan);
});

scansRouter.get("/:scanId", async (req: AuthedRequest, res) => {
  const scan = await prisma.scanSession.findFirst({
    where: { id: req.params.scanId, userId: req.user!.id },
    include: { detections: true }
  });
  if (!scan) {
    res.status(404).json({ message: "Scan not found" });
    return;
  }
  res.json(scan);
});

scansRouter.post("/:scanId/confirm", async (req: AuthedRequest, res) => {
  const scan = await prisma.scanSession.findFirst({
    where: { id: req.params.scanId, userId: req.user!.id },
    include: { detections: true }
  });
  if (!scan) {
    res.status(404).json({ message: "Scan not found" });
    return;
  }

  const pantryItems = await Promise.all(
    scan.detections.map((det) =>
      prisma.pantryItem.create({
        data: {
          userId: req.user!.id,
          ingredientId: det.ingredientId,
          quantity: 1,
          unit: "unit",
          source: "scan"
        }
      })
    )
  );

  res.status(201).json({ created: pantryItems.length });
});

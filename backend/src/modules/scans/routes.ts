import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";
import { buildScanObjectKey, createScanUploadUrl, objectExists } from "../../common/s3.js";
import { scanQueue } from "../../jobs/queues.js";

const uploadUrlSchema = z.object({
  contentType: z.string().min(1)
});

const createScanSchema = z.union([
  z.object({
    scanSessionId: z.string().uuid()
  }),
  z.object({
    objectKey: z.string().min(1),
    contentType: z.string().min(1)
  })
]);

export const scansRouter = Router();
scansRouter.use(requireAuth, requireProEntitlement);

scansRouter.post("/upload-url", async (req: AuthedRequest, res) => {
  const parse = uploadUrlSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const objectKey = buildScanObjectKey(req.user!.id, parse.data.contentType);
  const { uploadUrl, expiresInSeconds } = await createScanUploadUrl({
    objectKey,
    contentType: parse.data.contentType
  });
  const scanSession = await prisma.scanSession.create({
    data: {
      userId: req.user!.id,
      imageUrl: objectKey,
      status: "uploading"
    }
  });

  res.json({
    scanSessionId: scanSession.id,
    objectKey,
    uploadUrl,
    expiresInSeconds
  });
});

scansRouter.post("/", async (req: AuthedRequest, res) => {
  const parse = createScanSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const scan =
    "scanSessionId" in parse.data
      ? await prisma.scanSession.findFirst({
          where: {
            id: parse.data.scanSessionId,
            userId: req.user!.id
          }
        })
      : await prisma.scanSession.create({
          data: {
            userId: req.user!.id,
            imageUrl: parse.data.objectKey,
            status: "uploading"
          }
        });

  if (!scan) {
    res.status(404).json({ message: "Scan session not found" });
    return;
  }

  if (["queued", "processing"].includes(scan.status)) {
    res.status(409).json({ message: "Scan session is already being processed" });
    return;
  }

  if (scan.status === "completed") {
    res.status(409).json({ message: "Scan session is already completed" });
    return;
  }

  const uploaded = await objectExists(scan.imageUrl);
  if (!uploaded) {
    res.status(400).json({ message: "Image has not been uploaded to S3 yet" });
    return;
  }

  const updatedScan = await prisma.scanSession.update({
    where: { id: scan.id },
    data: { status: "queued", completedAt: null }
  });

  await scanQueue.add(
    "process-scan",
    { scanSessionId: scan.id },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 100
    }
  );

  res.status(202).json(updatedScan);
});

scansRouter.get("/:scanId", async (req: AuthedRequest, res) => {
  const scan = await prisma.scanSession.findFirst({
    where: { id: req.params.scanId, userId: req.user!.id },
    include: { detections: { include: { ingredient: true } } }
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

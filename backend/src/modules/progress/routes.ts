import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";
import { buildProgressPhotoObjectKey, createProgressPhotoUploadUrl, objectExists } from "../../common/s3.js";

const uploadUrlSchema = z.object({
  contentType: z.string().min(1)
});

const createPhotoSchema = z.object({
  objectKey: z.string().min(1),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  note: z.string().max(500).optional()
});

export const progressPhotosRouter = Router();
progressPhotosRouter.use(requireAuth, requireProEntitlement);

progressPhotosRouter.post("/upload-url", async (req: AuthedRequest, res) => {
  const parse = uploadUrlSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const objectKey = buildProgressPhotoObjectKey(req.user!.id, parse.data.contentType);
  const { uploadUrl, expiresInSeconds } = await createProgressPhotoUploadUrl({
    objectKey,
    contentType: parse.data.contentType
  });
  res.json({ objectKey, uploadUrl, expiresInSeconds });
});

progressPhotosRouter.post("/", async (req: AuthedRequest, res) => {
  const parse = createPhotoSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const ok = await objectExists(parse.data.objectKey);
  if (!ok) {
    res.status(400).json({ message: "Image has not been uploaded to storage yet" });
    return;
  }
  const row = await prisma.progressPhoto.create({
    data: {
      userId: req.user!.id,
      imageUrl: parse.data.objectKey,
      monthKey: parse.data.monthKey,
      note: parse.data.note ?? null
    }
  });
  res.status(201).json(row);
});

progressPhotosRouter.get("/", async (req: AuthedRequest, res) => {
  const items = await prisma.progressPhoto.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 60
  });
  res.json({ items });
});

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";

const pantryItemSchema = z.object({
  ingredientId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  expiresAt: z.string().datetime().optional()
});

export const pantryRouter = Router();
pantryRouter.use(requireAuth, requireProEntitlement);

pantryRouter.get("/items", async (req: AuthedRequest, res) => {
  const items = await prisma.pantryItem.findMany({
    where: { userId: req.user!.id },
    include: { ingredient: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ items });
});

pantryRouter.post("/items", async (req: AuthedRequest, res) => {
  const parse = pantryItemSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const item = await prisma.pantryItem.create({
    data: {
      userId: req.user!.id,
      ingredientId: parse.data.ingredientId,
      quantity: parse.data.quantity,
      unit: parse.data.unit,
      expiresAt: parse.data.expiresAt ? new Date(parse.data.expiresAt) : null,
      source: "manual"
    }
  });
  res.status(201).json(item);
});

pantryRouter.patch("/items/:itemId", async (req: AuthedRequest, res) => {
  const parse = pantryItemSchema.partial().safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const updated = await prisma.pantryItem.updateMany({
    where: { id: req.params.itemId, userId: req.user!.id },
    data: {
      ...parse.data,
      expiresAt: parse.data.expiresAt ? new Date(parse.data.expiresAt) : undefined
    }
  });
  if (updated.count === 0) {
    res.status(404).json({ message: "Pantry item not found" });
    return;
  }
  const item = await prisma.pantryItem.findUnique({ where: { id: req.params.itemId } });
  res.json(item);
});

pantryRouter.delete("/items/:itemId", async (req: AuthedRequest, res) => {
  const deleted = await prisma.pantryItem.deleteMany({
    where: { id: req.params.itemId, userId: req.user!.id }
  });
  if (deleted.count === 0) {
    res.status(404).json({ message: "Pantry item not found" });
    return;
  }
  res.status(204).send();
});

pantryRouter.get("/items/expiring", async (req: AuthedRequest, res) => {
  const days = Number(req.query.days ?? 3);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);

  const items = await prisma.pantryItem.findMany({
    where: {
      userId: req.user!.id,
      expiresAt: { lte: threshold }
    },
    include: { ingredient: true }
  });

  res.json({ items, days });
});

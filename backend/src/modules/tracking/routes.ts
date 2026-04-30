import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const mealLogSchema = z.object({
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recipeId: z.string().uuid().optional(),
  label: z.string().max(200).optional(),
  calories: z.number().int().min(0).max(20000),
  proteinG: z.number().min(0).max(2000),
  carbG: z.number().min(0).max(2000),
  fatG: z.number().min(0).max(2000)
});

const weightLogSchema = z.object({
  weightKg: z.number().positive().max(500)
});

export const trackingRouter = Router();
trackingRouter.use(requireAuth, requireProEntitlement);

trackingRouter.post("/meal-logs", async (req: AuthedRequest, res) => {
  const parse = mealLogSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const d = parse.data;
  const day = d.loggedDate ? new Date(`${d.loggedDate}T12:00:00.000Z`) : startOfUtcDay(new Date());
  const row = await prisma.mealLog.create({
    data: {
      userId: req.user!.id,
      loggedDate: startOfUtcDay(day),
      recipeId: d.recipeId ?? null,
      label: d.label ?? null,
      calories: d.calories,
      proteinG: d.proteinG,
      carbG: d.carbG,
      fatG: d.fatG
    }
  });
  res.status(201).json(row);
});

trackingRouter.get("/meal-logs", async (req: AuthedRequest, res) => {
  const dateStr = typeof req.query.date === "string" ? req.query.date : undefined;
  const day = dateStr ? new Date(`${dateStr}T12:00:00.000Z`) : startOfUtcDay(new Date());
  const start = startOfUtcDay(day);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const items = await prisma.mealLog.findMany({
    where: {
      userId: req.user!.id,
      loggedDate: { gte: start, lt: end }
    },
    orderBy: { createdAt: "asc" }
  });
  res.json({ date: start.toISOString().slice(0, 10), items });
});

trackingRouter.post("/weight-logs", async (req: AuthedRequest, res) => {
  const parse = weightLogSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const row = await prisma.weightLog.create({
    data: {
      userId: req.user!.id,
      weightKg: parse.data.weightKg
    }
  });
  res.status(201).json(row);
});

trackingRouter.get("/weight-logs", async (req: AuthedRequest, res) => {
  const items = await prisma.weightLog.findMany({
    where: { userId: req.user!.id },
    orderBy: { loggedAt: "desc" },
    take: 120
  });
  res.json({ items });
});

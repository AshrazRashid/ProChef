import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional()
});

const upsertDietSchema = z.object({
  calorieTarget: z.number().int().positive(),
  proteinG: z.number().positive(),
  carbG: z.number().positive(),
  fatG: z.number().positive(),
  dietType: z.string().min(1)
});

const upsertGoalSchema = z.object({
  goalType: z.string().min(1),
  targetWeightKg: z.number().positive().optional(),
  targetDate: z.string().datetime().optional()
});

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/me", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dietProfile: true, goals: true }
  });
  res.json(user);
});

profileRouter.patch("/me", async (req: AuthedRequest, res) => {
  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parse.data
  });
  res.json(user);
});

profileRouter.put("/me/diet-profile", async (req: AuthedRequest, res) => {
  const parse = upsertDietSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const saved = await prisma.dietProfile.upsert({
    where: { userId: req.user!.id },
    update: parse.data,
    create: { ...parse.data, userId: req.user!.id }
  });
  res.json(saved);
});

profileRouter.put("/me/goals", async (req: AuthedRequest, res) => {
  const parse = upsertGoalSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const goal = await prisma.userGoal.create({
    data: {
      userId: req.user!.id,
      ...parse.data,
      targetDate: parse.data.targetDate ? new Date(parse.data.targetDate) : null
    }
  });
  res.status(201).json(goal);
});

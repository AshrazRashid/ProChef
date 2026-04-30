import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { computeNutritionPlan, type GoalType, type Sex } from "../../common/nutritionPlan.js";

const goalTypeSchema = z.enum(["fat_loss", "muscle_gain", "maintenance", "healthy_eating"]);
const sexSchema = z.enum(["male", "female"]);

const updateProfileSchema = z.object({
  displayName: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  sex: sexSchema.optional()
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
  targetDate: z.string().datetime().optional(),
  targetWeeks: z.number().int().min(1).max(104).optional()
});

const planBodySchema = z.object({
  age: z.number().int().min(14).max(100),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  sex: sexSchema,
  goalType: goalTypeSchema,
  targetWeightKg: z.number().positive(),
  targetWeeks: z.number().int().min(1).max(104).optional(),
  dietType: z.string().min(1).default("balanced")
});

async function buildPlanSummaryForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { goals: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  if (!user?.age || !user.heightCm || !user.weightKg || !user.sex) {
    return null;
  }
  const latest = user.goals[0];
  if (!latest?.targetWeightKg || !goalTypeSchema.safeParse(latest.goalType).success) {
    return null;
  }
  const plan = computeNutritionPlan({
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    sex: user.sex as Sex,
    goalType: latest.goalType as GoalType,
    targetWeightKg: latest.targetWeightKg,
    targetWeeks: latest.targetWeeks
  });
  return { ...plan, goalType: latest.goalType as GoalType };
}

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/me", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { dietProfile: true, goals: { orderBy: { createdAt: "desc" } } }
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const planSummary = await buildPlanSummaryForUser(userId);
  res.json({ ...user, planSummary });
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

/** Preview targets and timeline without persisting (onboarding steps). */
profileRouter.post("/me/plan-preview", async (req: AuthedRequest, res) => {
  const parse = planBodySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const d = parse.data;
  const plan = computeNutritionPlan({
    age: d.age,
    heightCm: d.heightCm,
    weightKg: d.weightKg,
    sex: d.sex,
    goalType: d.goalType,
    targetWeightKg: d.targetWeightKg,
    targetWeeks: d.targetWeeks
  });
  res.json({
    plan,
    dietType: d.dietType,
    message:
      "All calorie and timeline values are computed on the server. The client should display this payload only."
  });
});

/** Single source of truth: persist profile metrics, goal, and macro targets from server calculation. */
profileRouter.post("/me/plan-commit", async (req: AuthedRequest, res) => {
  const parse = planBodySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const d = parse.data;
  const plan = computeNutritionPlan({
    age: d.age,
    heightCm: d.heightCm,
    weightKg: d.weightKg,
    sex: d.sex,
    goalType: d.goalType,
    targetWeightKg: d.targetWeightKg,
    targetWeeks: d.targetWeeks
  });

  const userId = req.user!.id;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        age: d.age,
        heightCm: d.heightCm,
        weightKg: d.weightKg,
        sex: d.sex
      }
    }),
    prisma.userGoal.create({
      data: {
        userId,
        goalType: d.goalType,
        targetWeightKg: d.targetWeightKg,
        targetWeeks: d.targetWeeks ?? null,
        targetDate: new Date(plan.projectedGoalDate)
      }
    }),
    prisma.dietProfile.upsert({
      where: { userId },
      create: {
        userId,
        calorieTarget: plan.calorieTarget,
        proteinG: plan.proteinG,
        carbG: plan.carbG,
        fatG: plan.fatG,
        dietType: d.dietType
      },
      update: {
        calorieTarget: plan.calorieTarget,
        proteinG: plan.proteinG,
        carbG: plan.carbG,
        fatG: plan.fatG,
        dietType: d.dietType
      }
    })
  ]);

  const fresh = await prisma.user.findUnique({
    where: { id: userId },
    include: { dietProfile: true, goals: { orderBy: { createdAt: "desc" } } }
  });
  const planSummary = await buildPlanSummaryForUser(userId);
  res.json({
    user: { ...fresh, planSummary },
    plan,
    message: "Profile, goal, and diet targets saved from server-side calculation."
  });
});

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

const createPlanSchema = z.object({
  weekStartDate: z.string().date(),
  days: z.number().int().min(1).max(14).optional(),
  slotTypes: z.array(z.string().min(1)).min(1).max(6).optional(),
  useRecommendations: z.boolean().optional()
});

export const plannerRouter = Router();
plannerRouter.use(requireAuth);

function atUtcMidnight(dateInput: string): Date {
  return new Date(`${dateInput}T00:00:00.000Z`);
}

plannerRouter.post("/", async (req: AuthedRequest, res) => {
  const parse = createPlanSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const days = parse.data.days ?? 7;
  const slotTypes = parse.data.slotTypes ?? ["breakfast", "lunch", "dinner"];
  const useRecommendations = parse.data.useRecommendations ?? true;

  const recommended = useRecommendations
    ? await prisma.mealRecommendation.findMany({
        where: { userId },
        orderBy: { score: "desc" },
        select: { recipeId: true },
        take: 50
      })
    : [];

  const fallbackRecipes =
    recommended.length === 0
      ? await prisma.recipe.findMany({
          select: { id: true },
          orderBy: { title: "asc" },
          take: 200
        })
      : [];

  const candidateRecipeIds =
    recommended.length > 0 ? recommended.map((item) => item.recipeId) : fallbackRecipes.map((item) => item.id);
  if (candidateRecipeIds.length === 0) {
    res.status(409).json({ message: "No recipes available to generate meal plan" });
    return;
  }

  const weekStartDate = atUtcMidnight(parse.data.weekStartDate);
  const slotsToCreate = Array.from({ length: days }).flatMap((_, dayOffset) => {
    const slotDate = new Date(weekStartDate);
    slotDate.setUTCDate(weekStartDate.getUTCDate() + dayOffset);

    return slotTypes.map((slotType, slotIndex) => {
      const recipeIndex = (dayOffset * slotTypes.length + slotIndex) % candidateRecipeIds.length;
      return {
        date: slotDate,
        slotType,
        recipeId: candidateRecipeIds[recipeIndex],
        servings: 1
      };
    });
  });

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      weekStartDate,
      status: "generated",
      slots: {
        create: slotsToCreate
      }
    },
    include: {
      slots: {
        include: { recipe: true },
        orderBy: [{ date: "asc" }, { slotType: "asc" }]
      }
    }
  });
  res.status(201).json(plan);
});

plannerRouter.get("/current", async (req: AuthedRequest, res) => {
  const plan = await prisma.mealPlan.findFirst({
    where: { userId: req.user!.id },
    include: { slots: true },
    orderBy: { weekStartDate: "desc" }
  });
  res.json(plan);
});

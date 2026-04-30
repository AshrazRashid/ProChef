import { Router } from "express";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireProEntitlement);

dashboardRouter.get("/summary", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const expiryThreshold = new Date(now);
  expiryThreshold.setDate(expiryThreshold.getDate() + 3);
  const dayStart = startOfUtcDay(now);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const [pantryTotal, expiringSoon, latestScan, recommendationCount, topRecommendations, currentMealPlan, currentShoppingList, mealLogsToday, dietProfile, latestWeight] =
    await Promise.all([
      prisma.pantryItem.count({ where: { userId } }),
      prisma.pantryItem.count({
        where: {
          userId,
          expiresAt: { gte: now, lte: expiryThreshold }
        }
      }),
      prisma.scanSession.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.mealRecommendation.count({ where: { userId } }),
      prisma.mealRecommendation.findMany({
        where: { userId },
        include: { recipe: true },
        orderBy: { score: "desc" },
        take: 3
      }),
      prisma.mealPlan.findFirst({
        where: { userId },
        orderBy: { weekStartDate: "desc" }
      }),
      prisma.shoppingList.findFirst({
        where: { userId, status: "active" },
        include: { items: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.mealLog.findMany({
        where: { userId, loggedDate: { gte: dayStart, lt: dayEnd } }
      }),
      prisma.dietProfile.findUnique({ where: { userId } }),
      prisma.weightLog.findFirst({
        where: { userId },
        orderBy: { loggedAt: "desc" }
      })
    ]);

  const uncheckedItems = currentShoppingList ? currentShoppingList.items.filter((item) => !item.checked).length : 0;

  const intake = mealLogsToday.reduce(
    (acc, row) => ({
      calories: acc.calories + row.calories,
      proteinG: acc.proteinG + row.proteinG,
      carbG: acc.carbG + row.carbG,
      fatG: acc.fatG + row.fatG
    }),
    { calories: 0, proteinG: 0, carbG: 0, fatG: 0 }
  );

  res.json({
    pantry: {
      totalItems: pantryTotal,
      expiringInDays: 3,
      expiringSoonCount: expiringSoon
    },
    scans: {
      latestStatus: latestScan?.status ?? null,
      latestScanAt: latestScan?.createdAt ?? null
    },
    recommendations: {
      total: recommendationCount,
      top: topRecommendations.map((item) => ({
        recipeId: item.recipeId,
        title: item.recipe.title,
        score: item.score
      }))
    },
    planning: {
      currentMealPlanId: currentMealPlan?.id ?? null,
      currentMealPlanWeekStartDate: currentMealPlan?.weekStartDate ?? null,
      activeShoppingListId: currentShoppingList?.id ?? null,
      uncheckedShoppingItems: uncheckedItems
    },
    intakeToday: {
      ...intake,
      mealCount: mealLogsToday.length
    },
    targets: dietProfile
      ? {
          calorieTarget: dietProfile.calorieTarget,
          proteinG: dietProfile.proteinG,
          carbG: dietProfile.carbG,
          fatG: dietProfile.fatG
        }
      : null,
    weight: latestWeight
      ? { weightKg: latestWeight.weightKg, loggedAt: latestWeight.loggedAt }
      : null
  });
});

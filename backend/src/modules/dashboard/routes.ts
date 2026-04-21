import { Router } from "express";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const expiryThreshold = new Date(now);
  expiryThreshold.setDate(expiryThreshold.getDate() + 3);

  const [pantryTotal, expiringSoon, latestScan, recommendationCount, topRecommendations, currentMealPlan, currentShoppingList] =
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
      })
    ]);

  const uncheckedItems = currentShoppingList ? currentShoppingList.items.filter((item) => !item.checked).length : 0;

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
    }
  });
});

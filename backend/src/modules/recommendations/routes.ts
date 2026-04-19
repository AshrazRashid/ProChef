import { Router } from "express";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

export const recommendationsRouter = Router();
recommendationsRouter.use(requireAuth);

recommendationsRouter.post("/meals", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const recommendations = await prisma.mealRecommendation.findMany({
    where: { userId },
    include: { recipe: true },
    orderBy: { score: "desc" },
    take: 20
  });

  res.json({
    items: recommendations.map((r) => ({
      recipeId: r.recipeId,
      score: r.score,
      reasons: r.reasonJson
    }))
  });
});

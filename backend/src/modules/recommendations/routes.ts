import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";

const recommendMealsSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional()
  })
  .default({});

export const recommendationsRouter = Router();
recommendationsRouter.use(requireAuth);

recommendationsRouter.post("/meals", requireProEntitlement, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const parse = recommendMealsSchema.safeParse(req.body ?? {});
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  const limit = parse.data.limit ?? 20;

  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: { ingredientId: true }
  });
  const pantryIngredientIds = new Set(pantryItems.map((item) => item.ingredientId));

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: { ingredient: true }
      }
    }
  });

  const scored = recipes
    .map((recipe) => {
      const requiredIngredients = recipe.ingredients.filter((ingredient) => !ingredient.optional);
      const matched = requiredIngredients.filter((ingredient) =>
        pantryIngredientIds.has(ingredient.ingredientId)
      );
      const missing = requiredIngredients.filter(
        (ingredient) => !pantryIngredientIds.has(ingredient.ingredientId)
      );
      const matchRatio = requiredIngredients.length === 0 ? 1 : matched.length / requiredIngredients.length;

      // Weighted score favors high pantry coverage and fewer missing required ingredients.
      const score =
        matchRatio * 0.9 +
        (requiredIngredients.length === 0
          ? 0.1
          : ((requiredIngredients.length - missing.length) / requiredIngredients.length) * 0.1);

      return {
        recipeId: recipe.id,
        score: Number(score.toFixed(4)),
        reasonJson: {
          matchedIngredientIds: matched.map((ingredient) => ingredient.ingredientId),
          missingIngredientIds: missing.map((ingredient) => ingredient.ingredientId),
          pantryCoverageRatio: Number(matchRatio.toFixed(4)),
          matchedRequiredCount: matched.length,
          requiredIngredientCount: requiredIngredients.length
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  await prisma.$transaction([
    prisma.mealRecommendation.deleteMany({ where: { userId } }),
    ...(scored.length === 0
      ? []
      : [
          prisma.mealRecommendation.createMany({
            data: scored.map((item) => ({
              userId,
              recipeId: item.recipeId,
              score: item.score,
              reasonJson: item.reasonJson
            }))
          })
        ])
  ]);

  const recommendations = await prisma.mealRecommendation.findMany({
    where: { userId },
    include: { recipe: true },
    orderBy: { score: "desc" },
    take: limit
  });

  res.json({
    items: recommendations.map((r) => ({
      recipeId: r.recipeId,
      score: r.score,
      reasons: r.reasonJson,
      recipe: {
        title: r.recipe.title,
        prepMinutes: r.recipe.prepMinutes,
        cookMinutes: r.recipe.cookMinutes,
        difficulty: r.recipe.difficulty
      }
    }))
  });
});

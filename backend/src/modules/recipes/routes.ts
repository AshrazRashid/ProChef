import { Router } from "express";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth, requireProEntitlement } from "../../common/middleware.js";

type RecipeWithIngredients = Awaited<ReturnType<typeof getRecipesWithIngredients>>[number];

function getRecipeMatchSummary(recipe: RecipeWithIngredients, pantryIngredientIds: Set<string>) {
  const requiredIngredients = recipe.ingredients.filter((ingredient) => !ingredient.optional);
  const matchedRequired = requiredIngredients.filter((ingredient) =>
    pantryIngredientIds.has(ingredient.ingredientId)
  );
  const missingRequired = requiredIngredients.filter(
    (ingredient) => !pantryIngredientIds.has(ingredient.ingredientId)
  );
  const matchRatio = requiredIngredients.length === 0 ? 1 : matchedRequired.length / requiredIngredients.length;

  return {
    requiredCount: requiredIngredients.length,
    matchedCount: matchedRequired.length,
    missingCount: missingRequired.length,
    matchRatio
  };
}

async function getRecipesWithIngredients() {
  return prisma.recipe.findMany({
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { ingredient: { name: "asc" } }
      }
    },
    orderBy: { title: "asc" }
  });
}

export const recipesRouter = Router();
recipesRouter.use(requireAuth, requireProEntitlement);

recipesRouter.get("/", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: { ingredientId: true }
  });
  const pantryIngredientIds = new Set(pantryItems.map((item) => item.ingredientId));

  const favorites = await prisma.favoriteRecipe.findMany({
    where: { userId },
    select: { recipeId: true }
  });
  const favoriteSet = new Set(favorites.map((f) => f.recipeId));

  const recipes = await getRecipesWithIngredients();
  res.json({
    items: recipes.map((recipe) => {
      const match = getRecipeMatchSummary(recipe, pantryIngredientIds);
      return {
        ...recipe,
        pantryMatch: match,
        isFavorite: favoriteSet.has(recipe.id)
      };
    })
  });
});

recipesRouter.get("/:recipeId", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: { ingredientId: true }
  });
  const pantryIngredientIds = new Set(pantryItems.map((item) => item.ingredientId));

  const favorite = await prisma.favoriteRecipe.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId: req.params.recipeId
      }
    }
  });

  const recipe = await prisma.recipe.findUnique({
    where: { id: req.params.recipeId },
    include: {
      ingredients: {
        include: { ingredient: true },
        orderBy: { ingredient: { name: "asc" } }
      }
    }
  });

  if (!recipe) {
    res.status(404).json({ message: "Recipe not found" });
    return;
  }

  res.json({
    ...recipe,
    pantryMatch: getRecipeMatchSummary(recipe, pantryIngredientIds),
    isFavorite: !!favorite
  });
});

recipesRouter.post("/:recipeId/favorite", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const recipeId = req.params.recipeId;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId }
  });
  if (!recipe) {
    res.status(404).json({ message: "Recipe not found" });
    return;
  }

  await prisma.favoriteRecipe.upsert({
    where: {
      userId_recipeId: { userId, recipeId }
    },
    create: { userId, recipeId },
    update: {}
  });

  res.json({ success: true });
});

recipesRouter.delete("/:recipeId/favorite", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const recipeId = req.params.recipeId;

  try {
    await prisma.favoriteRecipe.delete({
      where: {
        userId_recipeId: { userId, recipeId }
      }
    });
  } catch (e) {
    // ignore
  }

  res.json({ success: true });
});


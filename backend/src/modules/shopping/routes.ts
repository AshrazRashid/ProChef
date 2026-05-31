import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

const generateShoppingListSchema = z.object({
  mealPlanId: z.string().uuid().optional(),
  subtractPantry: z.boolean().optional()
});

const patchItemSchema = z.object({
  checked: z.boolean()
});

export const shoppingRouter = Router();
shoppingRouter.use(requireAuth);

shoppingRouter.get("/current", async (req: AuthedRequest, res) => {
  const list = await prisma.shoppingList.findFirst({
    where: { userId: req.user!.id },
    include: {
      items: {
        include: { ingredient: true },
        orderBy: { ingredient: { name: "asc" } }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(list);
});

shoppingRouter.post("/generate", async (req: AuthedRequest, res) => {
  const parse = generateShoppingListSchema.safeParse(req.body ?? {});
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const userId = req.user!.id;
  const subtractPantry = parse.data.subtractPantry ?? true;

  const mealPlan = parse.data.mealPlanId
    ? await prisma.mealPlan.findFirst({
        where: { id: parse.data.mealPlanId, userId },
        include: {
          slots: {
            where: { recipeId: { not: null } },
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: { ingredient: true }
                  }
                }
              }
            }
          }
        }
      })
    : await prisma.mealPlan.findFirst({
        where: { userId },
        orderBy: { weekStartDate: "desc" },
        include: {
          slots: {
            where: { recipeId: { not: null } },
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: { ingredient: true }
                  }
                }
              }
            }
          }
        }
      });

  if (!mealPlan) {
    res.status(404).json({ message: "Meal plan not found" });
    return;
  }

  const aggregated = new Map<string, { ingredientId: string; unit: string; quantity: number }>();

  for (const slot of mealPlan.slots) {
    if (!slot.recipe) {
      continue;
    }
    const recipeServings = Math.max(slot.recipe.servings, 1);
    const slotServings = Math.max(slot.servings ?? 1, 1);
    const scale = slotServings / recipeServings;

    for (const recipeIngredient of slot.recipe.ingredients) {
      if (recipeIngredient.optional) {
        continue;
      }
      const key = `${recipeIngredient.ingredientId}:${recipeIngredient.unit}`;
      const previous = aggregated.get(key);
      const nextQuantity = (previous?.quantity ?? 0) + recipeIngredient.quantity * scale;
      aggregated.set(key, {
        ingredientId: recipeIngredient.ingredientId,
        unit: recipeIngredient.unit,
        quantity: nextQuantity
      });
    }
  }

  if (subtractPantry && aggregated.size > 0) {
    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId },
      select: { ingredientId: true, unit: true, quantity: true }
    });

    for (const pantryItem of pantryItems) {
      const key = `${pantryItem.ingredientId}:${pantryItem.unit}`;
      const current = aggregated.get(key);
      if (!current) {
        continue;
      }
      current.quantity = Math.max(0, current.quantity - pantryItem.quantity);
      if (current.quantity <= 0) {
        aggregated.delete(key);
      } else {
        aggregated.set(key, current);
      }
    }
  }

  await prisma.shoppingList.updateMany({
    where: { userId, status: "active" },
    data: { status: "archived" }
  });

  const list = await prisma.shoppingList.create({
    data: {
      userId,
      mealPlanId: mealPlan.id,
      status: "active",
      items: {
        create: Array.from(aggregated.values()).map((item) => ({
          ingredientId: item.ingredientId,
          unit: item.unit,
          quantity: Number(item.quantity.toFixed(3))
        }))
      }
    },
    include: {
      items: {
        include: { ingredient: true },
        orderBy: { ingredient: { name: "asc" } }
      }
    }
  });

  res.status(201).json(list);
});

shoppingRouter.patch("/items/:itemId", async (req: AuthedRequest, res) => {
  const parse = patchItemSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const existing = await prisma.shoppingListItem.findFirst({
    where: {
      id: req.params.itemId,
      shoppingList: { userId: req.user!.id, status: "active" }
    }
  });
  if (!existing) {
    res.status(404).json({ message: "Shopping list item not found" });
    return;
  }

  const item = await prisma.shoppingListItem.update({
    where: { id: existing.id },
    data: { checked: parse.data.checked },
    include: { ingredient: true }
  });
  res.json(item);
});

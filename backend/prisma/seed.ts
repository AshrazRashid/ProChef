import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Baseline catalog for manual pantry search (`GET /pantry/ingredients`) and scans. Idempotent via `upsert`. */
const INGREDIENTS: { name: string; category: string; defaultUnit: string }[] = [
  { name: "Tomato", category: "vegetable", defaultUnit: "g" },
  { name: "Cherry tomato", category: "vegetable", defaultUnit: "g" },
  { name: "Onion", category: "vegetable", defaultUnit: "unit" },
  { name: "Red onion", category: "vegetable", defaultUnit: "unit" },
  { name: "Garlic", category: "vegetable", defaultUnit: "clove" },
  { name: "Potato", category: "vegetable", defaultUnit: "g" },
  { name: "Sweet potato", category: "vegetable", defaultUnit: "g" },
  { name: "Carrot", category: "vegetable", defaultUnit: "g" },
  { name: "Celery", category: "vegetable", defaultUnit: "g" },
  { name: "Bell pepper", category: "vegetable", defaultUnit: "unit" },
  { name: "Broccoli", category: "vegetable", defaultUnit: "g" },
  { name: "Spinach", category: "vegetable", defaultUnit: "g" },
  { name: "Kale", category: "vegetable", defaultUnit: "g" },
  { name: "Lettuce", category: "vegetable", defaultUnit: "g" },
  { name: "Cucumber", category: "vegetable", defaultUnit: "unit" },
  { name: "Zucchini", category: "vegetable", defaultUnit: "g" },
  { name: "Mushroom", category: "vegetable", defaultUnit: "g" },
  { name: "Eggplant", category: "vegetable", defaultUnit: "unit" },
  { name: "Green beans", category: "vegetable", defaultUnit: "g" },
  { name: "Peas", category: "vegetable", defaultUnit: "g" },
  { name: "Corn", category: "vegetable", defaultUnit: "g" },
  { name: "Avocado", category: "fruit", defaultUnit: "unit" },
  { name: "Lemon", category: "fruit", defaultUnit: "unit" },
  { name: "Lime", category: "fruit", defaultUnit: "unit" },
  { name: "Apple", category: "fruit", defaultUnit: "unit" },
  { name: "Banana", category: "fruit", defaultUnit: "unit" },
  { name: "Egg", category: "protein", defaultUnit: "unit" },
  { name: "Chicken breast", category: "protein", defaultUnit: "g" },
  { name: "Chicken thigh", category: "protein", defaultUnit: "g" },
  { name: "Ground beef", category: "protein", defaultUnit: "g" },
  { name: "Ground turkey", category: "protein", defaultUnit: "g" },
  { name: "Salmon", category: "protein", defaultUnit: "g" },
  { name: "Tuna canned", category: "protein", defaultUnit: "can" },
  { name: "Shrimp", category: "protein", defaultUnit: "g" },
  { name: "Tofu", category: "protein", defaultUnit: "g" },
  { name: "Greek yogurt", category: "dairy", defaultUnit: "g" },
  { name: "Milk", category: "dairy", defaultUnit: "ml" },
  { name: "Butter", category: "dairy", defaultUnit: "g" },
  { name: "Cheddar cheese", category: "dairy", defaultUnit: "g" },
  { name: "Mozzarella", category: "dairy", defaultUnit: "g" },
  { name: "Parmesan", category: "dairy", defaultUnit: "g" },
  { name: "Olive oil", category: "pantry", defaultUnit: "ml" },
  { name: "Vegetable oil", category: "pantry", defaultUnit: "ml" },
  { name: "Salt", category: "pantry", defaultUnit: "g" },
  { name: "Black pepper", category: "pantry", defaultUnit: "g" },
  { name: "Rice", category: "grain", defaultUnit: "g" },
  { name: "Brown rice", category: "grain", defaultUnit: "g" },
  { name: "Pasta", category: "grain", defaultUnit: "g" },
  { name: "Oats", category: "grain", defaultUnit: "g" },
  { name: "Flour", category: "grain", defaultUnit: "g" },
  { name: "Sugar", category: "pantry", defaultUnit: "g" },
  { name: "Honey", category: "pantry", defaultUnit: "ml" },
  { name: "Soy sauce", category: "pantry", defaultUnit: "ml" },
  { name: "Vinegar", category: "pantry", defaultUnit: "ml" },
  { name: "Canned tomatoes", category: "pantry", defaultUnit: "can" },
  { name: "Chicken stock", category: "pantry", defaultUnit: "ml" },
  { name: "Black beans canned", category: "pantry", defaultUnit: "can" },
  { name: "Chickpeas canned", category: "pantry", defaultUnit: "can" }
];

type RecipeSeed = {
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  servings: number;
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: { name: string; quantity: number; unit: string; optional?: boolean }[];
};

/** Recipes for recommendations, meal plans, and shopping list generation (Phase 4). */
const RECIPES: RecipeSeed[] = [
  {
    title: "Spinach Omelette",
    description: "Quick high-protein breakfast with fresh spinach.",
    prepMinutes: 5,
    cookMinutes: 8,
    difficulty: "easy",
    servings: 1,
    caloriesPerServing: 320,
    proteinG: 22,
    carbsG: 6,
    fatG: 22,
    ingredients: [
      { name: "Egg", quantity: 3, unit: "unit" },
      { name: "Spinach", quantity: 80, unit: "g" },
      { name: "Butter", quantity: 10, unit: "g" },
      { name: "Salt", quantity: 2, unit: "g" },
      { name: "Black pepper", quantity: 1, unit: "g" }
    ]
  },
  {
    title: "Salmon Bowl",
    description: "Mediterranean-style bowl with salmon and vegetables.",
    prepMinutes: 15,
    cookMinutes: 20,
    difficulty: "medium",
    servings: 2,
    caloriesPerServing: 540,
    proteinG: 38,
    carbsG: 42,
    fatG: 24,
    ingredients: [
      { name: "Salmon", quantity: 300, unit: "g" },
      { name: "Brown rice", quantity: 180, unit: "g" },
      { name: "Cucumber", quantity: 1, unit: "unit" },
      { name: "Tomato", quantity: 150, unit: "g" },
      { name: "Olive oil", quantity: 15, unit: "ml" },
      { name: "Lemon", quantity: 1, unit: "unit" }
    ]
  },
  {
    title: "Chicken Stir Fry",
    description: "Weeknight stir fry with chicken and mixed vegetables.",
    prepMinutes: 12,
    cookMinutes: 15,
    difficulty: "easy",
    servings: 2,
    caloriesPerServing: 480,
    proteinG: 42,
    carbsG: 35,
    fatG: 18,
    ingredients: [
      { name: "Chicken breast", quantity: 400, unit: "g" },
      { name: "Bell pepper", quantity: 2, unit: "unit" },
      { name: "Broccoli", quantity: 200, unit: "g" },
      { name: "Soy sauce", quantity: 30, unit: "ml" },
      { name: "Vegetable oil", quantity: 15, unit: "ml" },
      { name: "Garlic", quantity: 3, unit: "clove" }
    ]
  },
  {
    title: "Greek Yogurt Parfait",
    description: "Layered yogurt with fruit and oats.",
    prepMinutes: 8,
    cookMinutes: 0,
    difficulty: "easy",
    servings: 1,
    caloriesPerServing: 290,
    proteinG: 18,
    carbsG: 38,
    fatG: 8,
    ingredients: [
      { name: "Greek yogurt", quantity: 200, unit: "g" },
      { name: "Oats", quantity: 40, unit: "g" },
      { name: "Banana", quantity: 1, unit: "unit" },
      { name: "Honey", quantity: 15, unit: "ml" }
    ]
  },
  {
    title: "Tomato Pasta",
    description: "Simple pasta with tomato and parmesan.",
    prepMinutes: 10,
    cookMinutes: 18,
    difficulty: "easy",
    servings: 2,
    caloriesPerServing: 520,
    proteinG: 16,
    carbsG: 72,
    fatG: 16,
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Canned tomatoes", quantity: 1, unit: "can" },
      { name: "Garlic", quantity: 2, unit: "clove" },
      { name: "Olive oil", quantity: 20, unit: "ml" },
      { name: "Parmesan", quantity: 40, unit: "g" }
    ]
  },
  {
    title: "Veggie Omelette",
    description: "Omelette with peppers and mushrooms.",
    prepMinutes: 8,
    cookMinutes: 10,
    difficulty: "easy",
    servings: 1,
    caloriesPerServing: 310,
    proteinG: 20,
    carbsG: 10,
    fatG: 20,
    ingredients: [
      { name: "Egg", quantity: 2, unit: "unit" },
      { name: "Mushroom", quantity: 80, unit: "g" },
      { name: "Bell pepper", quantity: 1, unit: "unit" },
      { name: "Onion", quantity: 0.5, unit: "unit" },
      { name: "Butter", quantity: 8, unit: "g" }
    ]
  }
];

async function ingredientIdByName(name: string) {
  const row = await prisma.ingredient.findUnique({ where: { name } });
  return row?.id ?? null;
}

async function seedRecipes() {
  let recipeCount = 0;
  for (const recipe of RECIPES) {
    const data = {
      description: recipe.description,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      caloriesPerServing: recipe.caloriesPerServing,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG
    };

    let row = await prisma.recipe.findFirst({ where: { title: recipe.title } });
    if (row) {
      row = await prisma.recipe.update({ where: { id: row.id }, data });
    } else {
      row = await prisma.recipe.create({ data: { title: recipe.title, ...data } });
    }

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: row.id } });
    for (const ing of recipe.ingredients) {
      const ingredientId = await ingredientIdByName(ing.name);
      if (!ingredientId) {
        console.warn(`Seed: skip missing ingredient "${ing.name}" for recipe "${recipe.title}"`);
        continue;
      }
      await prisma.recipeIngredient.create({
        data: {
          recipeId: row.id,
          ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          optional: ing.optional ?? false
        }
      });
    }
    recipeCount++;
  }
  console.log(`Seed: upserted ${recipeCount} recipes with ingredients.`);
}

async function main() {
  let count = 0;
  for (const row of INGREDIENTS) {
    await prisma.ingredient.upsert({
      where: { name: row.name },
      create: row,
      update: { category: row.category, defaultUnit: row.defaultUnit }
    });
    count++;
  }
  console.log(`Seed: upserted ${count} ingredients.`);
  await seedRecipes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

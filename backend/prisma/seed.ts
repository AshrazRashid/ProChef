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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

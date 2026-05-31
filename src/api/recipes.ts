import { ImageSourcePropType } from "react-native";

export type PantryMatch = {
  requiredCount: number;
  matchedCount: number;
  missingCount: number;
  matchRatio: number;
};

export type RecipeIngredientRow = {
  quantity: number;
  unit: string;
  optional: boolean;
  ingredient: { id: string; name: string; category: string };
};

export type RecipeDetail = {
  id: string;
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  servings: number;
  imageUrl: string | null;
  caloriesPerServing: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  ingredients: RecipeIngredientRow[];
  pantryMatch?: PantryMatch;
};

export type RecipeListItem = RecipeDetail & { pantryMatch: PantryMatch };

const PLACEHOLDER_IMAGES: ImageSourcePropType[] = [
  require("../assets/images/MediterraneanSalmonBowl.png"),
  require("../assets/images/ProteinBowl.png"),
  require("../assets/images/GreenPowerSmoothie.png"),
  require("../assets/images/QuinoaSalad.png"),
  require("../assets/images/LemonChicken.png"),
  require("../assets/images/SpinachOmelette.png")
];

export function recipePlaceholderImage(title: string): ImageSourcePropType {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash + title.charCodeAt(i) * (i + 1)) % PLACEHOLDER_IMAGES.length;
  }
  return PLACEHOLDER_IMAGES[hash]!;
}

export function matchPercent(recipe: { pantryMatch?: PantryMatch }): number {
  return Math.round((recipe.pantryMatch?.matchRatio ?? 0) * 100);
}

export function matchLabel(recipe: { pantryMatch?: PantryMatch }): string {
  return `${matchPercent(recipe)}% MATCH`;
}

export function totalMinutes(recipe: { prepMinutes: number; cookMinutes: number }): number {
  return recipe.prepMinutes + recipe.cookMinutes;
}

export function formatDifficulty(difficulty: string): string {
  const d = difficulty.toLowerCase();
  if (d === "easy") return "Easy";
  if (d === "medium") return "Med";
  if (d === "hard") return "Hard";
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export type CookingStep = {
  number: string;
  label: string;
  title: string;
  desc: string;
  tip?: string;
};

export function buildCookingSteps(recipe: {
  description: string;
  prepMinutes: number;
  cookMinutes: number;
}): CookingStep[] {
  const sentences = recipe.description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const steps: CookingStep[] = [
    {
      number: "01",
      label: "PREPARATION",
      title: "Prepare ingredients",
      desc: sentences[0] ?? recipe.description,
      tip: recipe.prepMinutes > 0 ? `Allow about ${recipe.prepMinutes} minutes for prep.` : undefined
    }
  ];
  if (sentences.length > 1) {
    steps.push({
      number: "02",
      label: "COOKING",
      title: "Cook the dish",
      desc: sentences.slice(1).join(" "),
      tip: recipe.cookMinutes > 0 ? `Cook for roughly ${recipe.cookMinutes} minutes.` : undefined
    });
  } else if (recipe.cookMinutes > 0) {
    steps.push({
      number: "02",
      label: "COOKING",
      title: "Cook and serve",
      desc: `Follow the recipe and cook for about ${recipe.cookMinutes} minutes before serving.`
    });
  }
  return steps;
}

export function groupIngredientsByCategory(ingredients: RecipeIngredientRow[]) {
  const groups = new Map<string, { name: string; weight: string }[]>();
  for (const row of ingredients) {
    if (row.optional) continue;
    const cat = row.ingredient.category.toUpperCase();
    const list = groups.get(cat) ?? [];
    list.push({
      name: row.ingredient.name,
      weight: `${row.quantity} ${row.unit}`
    });
    groups.set(cat, list);
  }
  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
}

export function macrosFromGrams(protein: number, carbs: number, fats: number) {
  return Math.round(protein * 4 + carbs * 4 + fats * 9);
}

/** ISO date `YYYY-MM-DD` for Monday of the week containing `date` (UTC). */
export function mondayWeekStartIso(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function formatShortDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase().slice(0, 3);
}

export function formatMonthDay(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  const mon = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
  return `${mon} ${d.getUTCDate()}`;
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    vegetable: "Vegetables",
    fruit: "Fruit",
    protein: "Protein",
    dairy: "Dairy",
    grain: "Grains",
    pantry: "Pantry"
  };
  return map[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

export type PlanRecipe = {
  id: string;
  title: string;
  caloriesPerServing: number | null;
  imageUrl: string | null;
};

export type MealPlanSlot = {
  id: string;
  date: string;
  slotType: string;
  servings: number | null;
  recipe: PlanRecipe | null;
};

export type MealPlan = {
  id: string;
  weekStartDate: string;
  status: string;
  slots: MealPlanSlot[];
};

export type ShoppingListItem = {
  id: string;
  quantity: number;
  unit: string;
  checked: boolean;
  ingredient: { id: string; name: string; category: string };
};

export type ShoppingList = {
  id: string;
  status: string;
  items: ShoppingListItem[];
};

export function planDayDates(weekStartIso: string, days = 7): string[] {
  const start = new Date(`${weekStartIso}T00:00:00.000Z`);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function sameCalendarDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

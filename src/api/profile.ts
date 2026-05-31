export type UserGoal = {
  id: string;
  goalType: string;
  targetWeightKg: number | null;
  targetWeeks: number | null;
  createdAt: string;
};

export type DietProfile = {
  calorieTarget: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  dietType: string;
};

export type MeResponse = {
  id: string;
  email: string;
  displayName: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  sex: string | null;
  dietProfile: DietProfile | null;
  goals: UserGoal[];
  planSummary?: Record<string, unknown> | null;
};

const GOAL_LABELS: Record<string, string> = {
  fat_loss: "Fat Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  healthy_eating: "Healthy Eating"
};

export function goalTypeLabel(goalType: string): string {
  return GOAL_LABELS[goalType] ?? goalType.replace(/_/g, " ");
}

export function dietTypeLabel(dietType: string): string {
  return dietType.replace(/_/g, " ").toUpperCase();
}

export function goalProgressPct(currentKg: number | null | undefined, targetKg: number | null | undefined): number {
  if (currentKg == null || targetKg == null || currentKg <= 0) {
    return 0;
  }
  const dist = Math.abs(currentKg - targetKg);
  if (dist < 0.3) {
    return 100;
  }
  const span = Math.max(currentKg * 0.12, dist);
  return Math.min(100, Math.max(8, Math.round(100 - (dist / span) * 100)));
}

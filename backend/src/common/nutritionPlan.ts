export type GoalType = "fat_loss" | "muscle_gain" | "maintenance" | "healthy_eating";

export type Sex = "male" | "female";

export type PlanInputs = {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: Sex;
  goalType: GoalType;
  targetWeightKg: number;
  /** User-stated horizon; timeline is capped and slightly optimistic vs typical safe loss. */
  targetWeeks?: number | null;
};

export type PlanResult = {
  calorieTarget: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  /** Weeks shown in UI (optimistic vs pure linear safe rate). */
  estimatedWeeksToGoal: number;
  /** Physically plausible weeks at moderate pace (informational). */
  realisticWeeksToGoal: number;
  projectedGoalDate: string;
  weightDeltaKg: number;
  bmr: number;
  tdee: number;
};

function mifflinStJeorBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

function goalCalorieDelta(goalType: GoalType): number {
  switch (goalType) {
    case "fat_loss":
      return -500;
    case "muscle_gain":
      return 300;
    case "maintenance":
      return 0;
    case "healthy_eating":
      return -250;
    default:
      return -250;
  }
}

function proteinPerKg(goalType: GoalType): number {
  switch (goalType) {
    case "muscle_gain":
      return 2.0;
    case "fat_loss":
      return 1.85;
    default:
      return 1.65;
  }
}

function roundMacro(n: number): number {
  return Math.round(n * 10) / 10;
}

function distributeMacros(calories: number, proteinG: number, weightKg: number, goalType: GoalType): { carbG: number; fatG: number } {
  const proteinCals = proteinG * 4;
  const fatRatio = goalType === "muscle_gain" ? 0.28 : 0.3;
  let fatG = roundMacro((calories * fatRatio) / 9);
  let carbG = roundMacro((calories - proteinCals - fatG * 9) / 4);
  if (carbG < 40) {
    fatG = roundMacro((calories - proteinCals - 40 * 4) / 9);
    carbG = 40;
  }
  if (fatG < 25) {
    fatG = 25;
    carbG = roundMacro((calories - proteinCals - fatG * 9) / 4);
  }
  return { carbG: Math.max(0, carbG), fatG: Math.max(25, fatG) };
}

const MIN_CALORIES: Record<Sex, number> = { female: 1200, male: 1500 };

export function computeNutritionPlan(inputs: PlanInputs): PlanResult {
  const bmr = mifflinStJeorBmr(inputs.weightKg, inputs.heightCm, inputs.age, inputs.sex);
  const activityFactor = 1.375;
  const tdee = bmr * activityFactor;
  let calorieTarget = Math.round(tdee + goalCalorieDelta(inputs.goalType));
  const floor = MIN_CALORIES[inputs.sex];
  if (calorieTarget < floor) {
    calorieTarget = floor;
  }

  const proteinG = roundMacro(proteinPerKg(inputs.goalType) * inputs.weightKg);
  const { carbG, fatG } = distributeMacros(calorieTarget, proteinG, inputs.weightKg, inputs.goalType);

  const weightDeltaKg = Math.abs(inputs.targetWeightKg - inputs.weightKg);
  const isLoss = inputs.targetWeightKg < inputs.weightKg;
  const isGain = inputs.targetWeightKg > inputs.weightKg;

  let realisticWeeks = 8;
  if (isLoss && weightDeltaKg > 0) {
    realisticWeeks = Math.max(4, Math.ceil(weightDeltaKg / 0.45));
  } else if (isGain && weightDeltaKg > 0) {
    realisticWeeks = Math.max(6, Math.ceil(weightDeltaKg / 0.2));
  } else {
    realisticWeeks = 4;
  }

  const optimisticWeeks = Math.max(4, Math.ceil(realisticWeeks * 0.72));
  let estimatedWeeksToGoal = optimisticWeeks;
  if (inputs.targetWeeks != null && inputs.targetWeeks > 0) {
    estimatedWeeksToGoal = Math.max(4, Math.min(inputs.targetWeeks, optimisticWeeks));
  }

  const projected = new Date();
  projected.setDate(projected.getDate() + estimatedWeeksToGoal * 7);

  return {
    calorieTarget,
    proteinG,
    carbG,
    fatG,
    estimatedWeeksToGoal,
    realisticWeeksToGoal: realisticWeeks,
    projectedGoalDate: projected.toISOString(),
    weightDeltaKg,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee)
  };
}

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ApiGoalType = "fat_loss" | "muscle_gain" | "maintenance" | "healthy_eating";

type OnboardingState = {
  goalType: ApiGoalType;
  targetWeightKg: number;
  currentWeightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  targetWeeks: number;
};

const defaultState: OnboardingState = {
  goalType: "fat_loss",
  targetWeightKg: 68,
  currentWeightKg: 72,
  heightCm: 178,
  age: 28,
  sex: "female",
  targetWeeks: 12
};

type Ctx = {
  draft: OnboardingState;
  setGoalType: (g: ApiGoalType) => void;
  setTargetWeightKg: (n: number) => void;
  setCurrentWeightKg: (n: number) => void;
  setHeightCm: (n: number) => void;
  setAge: (n: number) => void;
  setSex: (s: "male" | "female") => void;
  setTargetWeeks: (n: number) => void;
  reset: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingState>(defaultState);

  const setGoalType = useCallback((g: ApiGoalType) => setDraft((d) => ({ ...d, goalType: g })), []);
  const setTargetWeightKg = useCallback((n: number) => setDraft((d) => ({ ...d, targetWeightKg: n })), []);
  const setCurrentWeightKg = useCallback((n: number) => setDraft((d) => ({ ...d, currentWeightKg: n })), []);
  const setHeightCm = useCallback((n: number) => setDraft((d) => ({ ...d, heightCm: n })), []);
  const setAge = useCallback((n: number) => setDraft((d) => ({ ...d, age: n })), []);
  const setSex = useCallback((s: "male" | "female") => setDraft((d) => ({ ...d, sex: s })), []);
  const setTargetWeeks = useCallback((n: number) => setDraft((d) => ({ ...d, targetWeeks: n })), []);
  const reset = useCallback(() => setDraft(defaultState), []);

  const value = useMemo(
    () => ({
      draft,
      setGoalType,
      setTargetWeightKg,
      setCurrentWeightKg,
      setHeightCm,
      setAge,
      setSex,
      setTargetWeeks,
      reset
    }),
    [draft, setGoalType, setTargetWeightKg, setCurrentWeightKg, setHeightCm, setAge, setSex, setTargetWeeks, reset]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const v = useContext(OnboardingContext);
  if (!v) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return v;
}

import type { MealType } from '../types';

const MEAL_SHARES: Record<MealType, number> = {
  breakfast: 0.25,
  lunch:     0.30,
  dinner:    0.35,
  snack:     0.10,
};

export type MealCalorieRange = {
  min: number;
  max: number;
};

export const getMealCalorieRange = (
  targetCalories: number,
  meal: MealType
): MealCalorieRange => {
  const base = targetCalories * MEAL_SHARES[meal];
  return {
    min: Math.round(base * 0.9),
    max: Math.round(base * 1.1),
  };
};

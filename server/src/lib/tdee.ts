type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type GoalMode = 'cut' | 'bulk' | 'maintain';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENTS: Record<GoalMode, number> = {
  cut: -400,
  bulk: +300,
  maintain: 0,
};

const MACRO_SPLITS: Record<GoalMode, { protein: number; carbs: number; fat: number }> = {
  cut: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  bulk: { protein: 0.25, carbs: 0.50, fat: 0.25 },
  maintain: { protein: 0.25, carbs: 0.45, fat: 0.30 },
};

const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARBS = 4;
const CALORIES_PER_GRAM_FAT = 9;

function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
}): number {
  const base = 10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age;
  return params.sex === 'male' ? base + 5 : base - 161;
}

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

function applyGoalAdjustment(tdee: number, goal: GoalMode): number {
  return tdee + GOAL_CALORIE_ADJUSTMENTS[goal];
}

function calculateMacros(targetCalories: number, goal: GoalMode): {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  const s = MACRO_SPLITS[goal];
  return {
    calories: targetCalories,
    proteinG: Math.round((targetCalories * s.protein) / CALORIES_PER_GRAM_PROTEIN),
    carbsG: Math.round((targetCalories * s.carbs) / CALORIES_PER_GRAM_CARBS),
    fatG: Math.round((targetCalories * s.fat) / CALORIES_PER_GRAM_FAT),
  };
}

export function computeMacroTargets(profile: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: ActivityLevel;
  goalType: GoalMode;
}): { calories: number; proteinG: number; carbsG: number; fatG: number } {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = applyGoalAdjustment(tdee, profile.goalType);
  return calculateMacros(targetCalories, profile.goalType);
}

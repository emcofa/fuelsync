export type GoalMode = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type DietType =
  | 'standard'
  | 'vegetarian'
  | 'vegan'
  | 'pescetarian'
  | 'keto'
  | 'paleo';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  goalType: GoalMode;
  dietType: DietType;
  sex: 'male' | 'female' | null;
  createdAt: string;
};

export type MacroTargets = {
  id: number;
  userId: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean;
  updatedAt: string;
};

export type FoodEntry = {
  id: number;
  userId: string;
  foodName: string;
  barcode: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  mealType: MealType;
  loggedAt: string;
};

export type FoodSearchResult = {
  name: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl: string | null;
  source: 'open_food_facts' | 'custom';
};

export type DailyMacroSummary = {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  entries: FoodEntry[];
};

export type AISuggestion = {
  suggestions: {
    name: string;
    description: string;
    estimatedCalories: number;
    estimatedProteinG: number;
    estimatedCarbsG: number;
    estimatedFatG: number;
  }[];
};

export const queryKeys = {
  dailyLog: (date: string) => ['food-log', date] as const,
  weeklyLog: () => ['food-log', 'week'] as const,
  macroTargets: () => ['macro-targets'] as const,
  userProfile: () => ['user-profile'] as const,
  foodSearch: (query: string) => ['food-search', query] as const,
};

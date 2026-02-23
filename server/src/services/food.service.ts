import * as foodQueries from '../db/queries/food.queries';

type FoodEntryResponse = {
  id: number;
  userId: string;
  foodName: string;
  barcode: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  mealType: string;
  loggedAt: string;
};

type DailyMacroSummary = {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  entries: FoodEntryResponse[];
};

const SERVING_BASE = 100;

const toResponse = (row: Awaited<ReturnType<typeof foodQueries.findByUserAndDateRange>>[number]): FoodEntryResponse => ({
  id: row.id,
  userId: row.user_id,
  foodName: row.food_name,
  barcode: row.barcode,
  calories: row.calories,
  proteinG: Number(row.protein_g),
  carbsG: Number(row.carbs_g),
  fatG: Number(row.fat_g),
  servingG: Number(row.serving_g),
  mealType: row.meal_type,
  loggedAt: row.logged_at.toISOString(),
});

type LogFoodParams = {
  foodName: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingG: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

export const logFood = async (userId: string, params: LogFoodParams): Promise<FoodEntryResponse> => {
  const factor = params.servingG / SERVING_BASE;
  const calories = Math.round(params.caloriesPer100g * factor);
  const proteinG = Math.round(params.proteinPer100g * factor * 100) / 100;
  const carbsG = Math.round(params.carbsPer100g * factor * 100) / 100;
  const fatG = Math.round(params.fatPer100g * factor * 100) / 100;

  const insertId = await foodQueries.insert({
    user_id: userId,
    food_name: params.foodName,
    barcode: params.barcode ?? null,
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
    serving_g: params.servingG,
    meal_type: params.mealType,
    logged_at: new Date(),
  });

  const entry = await foodQueries.findById(Number(insertId), userId);
  if (!entry) throw new Error('Failed to retrieve logged food entry');

  return toResponse(entry);
};

export const getDailyLog = async (userId: string, dateStr?: string): Promise<DailyMacroSummary> => {
  const date = dateStr ?? new Date().toISOString().slice(0, 10);
  const startUtc = new Date(`${date}T00:00:00.000Z`);
  const endUtc = new Date(`${date}T23:59:59.999Z`);

  const rows = await foodQueries.findByUserAndDateRange(userId, startUtc, endUtc);
  const entries = rows.map(toResponse);

  return {
    date,
    totalCalories: entries.reduce((sum, e) => sum + e.calories, 0),
    totalProteinG: Math.round(entries.reduce((sum, e) => sum + e.proteinG, 0) * 100) / 100,
    totalCarbsG: Math.round(entries.reduce((sum, e) => sum + e.carbsG, 0) * 100) / 100,
    totalFatG: Math.round(entries.reduce((sum, e) => sum + e.fatG, 0) * 100) / 100,
    entries,
  };
};

const DAYS_IN_WEEK = 7;

export const getWeeklyLog = async (userId: string): Promise<DailyMacroSummary[]> => {
  const today = new Date();
  const summaries: DailyMacroSummary[] = [];

  for (let i = DAYS_IN_WEEK - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const summary = await getDailyLog(userId, dateStr);
    summaries.push(summary);
  }

  return summaries;
};

export const deleteEntry = async (userId: string, entryId: number): Promise<boolean> => {
  return foodQueries.deleteById(entryId, userId);
};

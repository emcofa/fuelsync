const SERVING_BASE = 100;

type ServingMacros = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
};

type Per100gMacros = {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

/**
 * Convert actual serving macros to per-100g values.
 * Calories are rounded to whole numbers; protein/carbs/fat to 2 decimals.
 */
export const toPer100g = (entry: ServingMacros): Per100gMacros => {
  const factor = entry.servingG > 0 ? SERVING_BASE / entry.servingG : 1;
  return {
    caloriesPer100g: Math.round(entry.calories * factor),
    proteinPer100g: Math.round(entry.proteinG * factor * 100) / 100,
    carbsPer100g: Math.round(entry.carbsG * factor * 100) / 100,
    fatPer100g: Math.round(entry.fatG * factor * 100) / 100,
  };
};

/**
 * Convert per-100g macros to actual serving values.
 * All values rounded to whole numbers.
 */
export const toServing = (per100g: Per100gMacros, servingG: number) => {
  const factor = servingG / SERVING_BASE;
  return {
    calories: Math.round(per100g.caloriesPer100g * factor),
    proteinG: Math.round(per100g.proteinPer100g * factor * 100) / 100,
    carbsG: Math.round(per100g.carbsPer100g * factor * 100) / 100,
    fatG: Math.round(per100g.fatPer100g * factor * 100) / 100,
  };
};

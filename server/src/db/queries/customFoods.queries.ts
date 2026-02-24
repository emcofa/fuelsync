import { db } from '../connection';

export const insert = (
  userId: string,
  data: {
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    defaultServingG: number | null;
  },
) =>
  db
    .insertInto('custom_foods')
    .values({
      user_id: userId,
      name: data.name,
      calories_per_100g: data.caloriesPer100g,
      protein_per_100g: data.proteinPer100g,
      carbs_per_100g: data.carbsPer100g,
      fat_per_100g: data.fatPer100g,
      default_serving_g: data.defaultServingG,
    })
    .executeTakeFirstOrThrow();

export const searchByUser = (userId: string, query: string) =>
  db
    .selectFrom('custom_foods')
    .select([
      'id',
      'name',
      'calories_per_100g',
      'protein_per_100g',
      'carbs_per_100g',
      'fat_per_100g',
      'default_serving_g',
    ])
    .where('user_id', '=', userId)
    .where('name', 'like', `%${query}%`)
    .orderBy('name', 'asc')
    .limit(15)
    .execute();

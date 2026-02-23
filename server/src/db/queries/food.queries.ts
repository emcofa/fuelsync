import { db } from '../connection';

type InsertFoodEntryParams = {
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: Date;
};

export const insert = async (params: InsertFoodEntryParams) => {
  const result = await db
    .insertInto('food_entries')
    .values(params)
    .executeTakeFirstOrThrow();

  return result.insertId;
};

export const findById = async (id: number, userId: string) => {
  return db
    .selectFrom('food_entries')
    .select([
      'id',
      'user_id',
      'food_name',
      'barcode',
      'calories',
      'protein_g',
      'carbs_g',
      'fat_g',
      'serving_g',
      'meal_type',
      'logged_at',
    ])
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
};

export const findByUserAndDateRange = async (
  userId: string,
  startUtc: Date,
  endUtc: Date
) => {
  return db
    .selectFrom('food_entries')
    .select([
      'id',
      'user_id',
      'food_name',
      'barcode',
      'calories',
      'protein_g',
      'carbs_g',
      'fat_g',
      'serving_g',
      'meal_type',
      'logged_at',
    ])
    .where('user_id', '=', userId)
    .where('logged_at', '>=', startUtc)
    .where('logged_at', '<', endUtc)
    .orderBy('logged_at', 'asc')
    .execute();
};

export const deleteById = async (id: number, userId: string) => {
  const result = await db
    .deleteFrom('food_entries')
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return result.numDeletedRows > 0n;
};

import { db } from '../connection';

type InsertFavoriteParams = {
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_serving_g: number | null;
  source: string;
};

export const findByUser = async (userId: string) => {
  return db
    .selectFrom('user_favorites')
    .select([
      'id',
      'user_id',
      'food_name',
      'barcode',
      'calories_per_100g',
      'protein_per_100g',
      'carbs_per_100g',
      'fat_per_100g',
      'default_serving_g',
      'source',
    ])
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .execute();
};

export const insert = async (params: InsertFavoriteParams) => {
  const result = await db
    .insertInto('user_favorites')
    .values(params)
    .executeTakeFirstOrThrow();

  return result.insertId;
};

export const deleteById = async (id: number, userId: string) => {
  const result = await db
    .deleteFrom('user_favorites')
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return result.numDeletedRows > 0n;
};

export const findByUserAndName = async (userId: string, foodName: string) => {
  return db
    .selectFrom('user_favorites')
    .select(['id'])
    .where('user_id', '=', userId)
    .where('food_name', '=', foodName)
    .executeTakeFirst();
};

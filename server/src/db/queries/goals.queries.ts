import { db } from '../connection';

type UpsertMacroTargetsParams = {
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_custom: boolean;
};

export const findByUserId = async (userId: string) => {
  return db
    .selectFrom('macro_targets')
    .select([
      'id',
      'user_id',
      'calories',
      'protein_g',
      'carbs_g',
      'fat_g',
      'is_custom',
      'updated_at',
    ])
    .where('user_id', '=', userId)
    .executeTakeFirst();
};

export const upsert = async (params: UpsertMacroTargetsParams) => {
  const existing = await findByUserId(params.user_id);
  if (existing) {
    await db
      .updateTable('macro_targets')
      .set({
        calories: params.calories,
        protein_g: params.protein_g,
        carbs_g: params.carbs_g,
        fat_g: params.fat_g,
        is_custom: params.is_custom,
      })
      .where('user_id', '=', params.user_id)
      .execute();
  } else {
    await db
      .insertInto('macro_targets')
      .values(params)
      .execute();
  }
};

import { db } from '../connection';

type CreateUserParams = {
  id: string;
  email: string;
};

type UpdateProfileParams = {
  name?: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  sex?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal_type?: 'cut' | 'bulk' | 'maintain';
  diet_type?: string;
};

export const findById = async (id: string) => {
  return db
    .selectFrom('users')
    .select([
      'id',
      'email',
      'name',
      'age',
      'weight_kg',
      'height_cm',
      'sex',
      'activity_level',
      'goal_type',
      'diet_type',
      'created_at',
    ])
    .where('id', '=', id)
    .executeTakeFirst();
};

export const create = async (params: CreateUserParams) => {
  await db
    .insertInto('users')
    .values({
      id: params.id,
      email: params.email,
    })
    .execute();
};

export const updateProfile = async (id: string, params: UpdateProfileParams) => {
  await db
    .updateTable('users')
    .set(params)
    .where('id', '=', id)
    .execute();
};

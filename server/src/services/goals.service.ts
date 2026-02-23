import * as goalsQueries from '../db/queries/goals.queries';
import * as userQueries from '../db/queries/user.queries';
import { computeMacroTargets } from '../lib/tdee';

type MacroTargetsResponse = {
  id: number;
  userId: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean;
  updatedAt: string;
};

const toResponse = (row: NonNullable<Awaited<ReturnType<typeof goalsQueries.findByUserId>>>): MacroTargetsResponse => ({
  id: row.id,
  userId: row.user_id,
  calories: row.calories,
  proteinG: row.protein_g,
  carbsG: row.carbs_g,
  fatG: row.fat_g,
  isCustom: Boolean(row.is_custom),
  updatedAt: row.updated_at.toISOString(),
});

export const getGoals = async (userId: string): Promise<MacroTargetsResponse | null> => {
  const row = await goalsQueries.findByUserId(userId);
  if (!row) return null;
  return toResponse(row);
};

type UpdateGoalsParams = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export const updateGoals = async (userId: string, params: UpdateGoalsParams): Promise<MacroTargetsResponse> => {
  await goalsQueries.upsert({
    user_id: userId,
    calories: params.calories,
    protein_g: params.proteinG,
    carbs_g: params.carbsG,
    fat_g: params.fatG,
    is_custom: true,
  });

  const row = await goalsQueries.findByUserId(userId);
  if (!row) throw new Error('Failed to update goals');
  return toResponse(row);
};

export const resetGoals = async (userId: string): Promise<MacroTargetsResponse> => {
  const user = await userQueries.findById(userId);
  if (!user) throw new Error('User not found');

  if (
    user.weight_kg === null ||
    user.height_cm === null ||
    user.age === null ||
    user.sex === null ||
    user.activity_level === null
  ) {
    throw new Error('Profile incomplete — fill in all body stats before resetting goals');
  }

  const targets = computeMacroTargets({
    weightKg: Number(user.weight_kg),
    heightCm: user.height_cm,
    age: user.age,
    sex: user.sex,
    activityLevel: user.activity_level,
    goalType: user.goal_type,
  });

  await goalsQueries.upsert({
    user_id: userId,
    calories: targets.calories,
    protein_g: targets.proteinG,
    carbs_g: targets.carbsG,
    fat_g: targets.fatG,
    is_custom: false,
  });

  const row = await goalsQueries.findByUserId(userId);
  if (!row) throw new Error('Failed to reset goals');
  return toResponse(row);
};

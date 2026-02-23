import * as userQueries from '../db/queries/user.queries';
import * as goalsQueries from '../db/queries/goals.queries';
import { computeMacroTargets } from '../lib/tdee';

export const syncUser = async (clerkUserId: string, email: string): Promise<void> => {
  const existing = await userQueries.findById(clerkUserId);
  if (!existing) {
    await userQueries.create({ id: clerkUserId, email });
  }
};

export const getProfile = async (userId: string) => {
  const user = await userQueries.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    weightKg: user.weight_kg ? Number(user.weight_kg) : null,
    heightCm: user.height_cm,
    sex: user.sex,
    activityLevel: user.activity_level,
    goalType: user.goal_type,
    dietType: user.diet_type,
    createdAt: user.created_at.toISOString(),
  };
};

const TDEE_FIELDS = ['weightKg', 'heightCm', 'age', 'sex', 'activityLevel', 'goalType'] as const;

type UpdateProfileParams = {
  name?: string;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  sex?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalType?: 'cut' | 'bulk' | 'maintain';
  dietType?: string;
};

export const updateProfile = async (userId: string, params: UpdateProfileParams) => {
  const dbParams: Record<string, unknown> = {};
  if (params.name !== undefined) dbParams.name = params.name;
  if (params.age !== undefined) dbParams.age = params.age;
  if (params.weightKg !== undefined) dbParams.weight_kg = params.weightKg;
  if (params.heightCm !== undefined) dbParams.height_cm = params.heightCm;
  if (params.sex !== undefined) dbParams.sex = params.sex;
  if (params.activityLevel !== undefined) dbParams.activity_level = params.activityLevel;
  if (params.goalType !== undefined) dbParams.goal_type = params.goalType;
  if (params.dietType !== undefined) dbParams.diet_type = params.dietType;

  await userQueries.updateProfile(userId, dbParams as Parameters<typeof userQueries.updateProfile>[1]);

  const hasTdeeChange = TDEE_FIELDS.some((field) => params[field] !== undefined);
  if (hasTdeeChange) {
    const macroTargets = await goalsQueries.findByUserId(userId);
    const isCustom = macroTargets?.is_custom ?? false;

    if (!isCustom) {
      const updatedUser = await userQueries.findById(userId);
      if (
        updatedUser &&
        updatedUser.weight_kg !== null &&
        updatedUser.height_cm !== null &&
        updatedUser.age !== null &&
        updatedUser.sex !== null &&
        updatedUser.activity_level !== null
      ) {
        const targets = computeMacroTargets({
          weightKg: Number(updatedUser.weight_kg),
          heightCm: updatedUser.height_cm,
          age: updatedUser.age,
          sex: updatedUser.sex,
          activityLevel: updatedUser.activity_level,
          goalType: updatedUser.goal_type,
        });

        await goalsQueries.upsert({
          user_id: userId,
          calories: targets.calories,
          protein_g: targets.proteinG,
          carbs_g: targets.carbsG,
          fat_g: targets.fatG,
          is_custom: false,
        });
      }
    }
  }

  return getProfile(userId);
};

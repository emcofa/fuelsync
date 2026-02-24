import type { Generated, ColumnType } from 'kysely';

export type Database = {
  users: UsersTable;
  macro_targets: MacroTargetsTable;
  food_entries: FoodEntriesTable;
  custom_foods: CustomFoodsTable;
  user_favorites: UserFavoritesTable;
};

type UsersTable = {
  id: string;
  email: string;
  name: ColumnType<string | null, string | null | undefined, string | null>;
  age: ColumnType<number | null, number | null | undefined, number | null>;
  weight_kg: ColumnType<number | null, number | null | undefined, number | null>;
  height_cm: ColumnType<number | null, number | null | undefined, number | null>;
  sex: ColumnType<'male' | 'female' | null, 'male' | 'female' | null | undefined, 'male' | 'female' | null>;
  activity_level: ColumnType<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null,
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null | undefined,
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  >;
  goal_type: ColumnType<'cut' | 'bulk' | 'maintain', 'cut' | 'bulk' | 'maintain' | undefined, 'cut' | 'bulk' | 'maintain'>;
  diet_type: ColumnType<string, string | undefined, string>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
};

type MacroTargetsTable = {
  id: Generated<number>;
  user_id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_custom: boolean;
  updated_at: ColumnType<Date, never, never>;
};

type FoodEntriesTable = {
  id: Generated<number>;
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_g: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: ColumnType<Date, Date, never>;
};

type CustomFoodsTable = {
  id: Generated<number>;
  user_id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_serving_g: number | null;
  created_at: ColumnType<Date, never, never>;
};

type UserFavoritesTable = {
  id: Generated<number>;
  user_id: string;
  food_name: string;
  barcode: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  default_serving_g: number | null;
  source: string;
  created_at: ColumnType<Date, never, never>;
};

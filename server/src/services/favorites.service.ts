import * as favoritesQueries from '../db/queries/favorites.queries';

type FavoriteFoodResponse = {
  id: number;
  foodName: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG: number | null;
  source: string;
};

type AddFavoriteParams = {
  foodName: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG?: number;
  source: string;
};

const toResponse = (row: Awaited<ReturnType<typeof favoritesQueries.findByUser>>[number]): FavoriteFoodResponse => ({
  id: row.id,
  foodName: row.food_name,
  barcode: row.barcode,
  caloriesPer100g: row.calories_per_100g,
  proteinPer100g: Number(row.protein_per_100g),
  carbsPer100g: Number(row.carbs_per_100g),
  fatPer100g: Number(row.fat_per_100g),
  defaultServingG: row.default_serving_g !== null ? Number(row.default_serving_g) : null,
  source: row.source,
});

export const getFavorites = async (userId: string): Promise<FavoriteFoodResponse[]> => {
  const rows = await favoritesQueries.findByUser(userId);
  return rows.map(toResponse);
};

export const addFavorite = async (userId: string, params: AddFavoriteParams): Promise<FavoriteFoodResponse> => {
  const existing = await favoritesQueries.findByUserAndName(userId, params.foodName);
  if (existing) {
    throw new Error('DUPLICATE');
  }

  const insertId = await favoritesQueries.insert({
    user_id: userId,
    food_name: params.foodName,
    barcode: params.barcode ?? null,
    calories_per_100g: params.caloriesPer100g,
    protein_per_100g: params.proteinPer100g,
    carbs_per_100g: params.carbsPer100g,
    fat_per_100g: params.fatPer100g,
    default_serving_g: params.defaultServingG ?? null,
    source: params.source,
  });

  type FavoriteRow = Awaited<ReturnType<typeof favoritesQueries.findByUser>>[number];
  const rows: FavoriteRow[] = await favoritesQueries.findByUser(userId);
  const created = rows.find((r: FavoriteRow) => r.id === Number(insertId));
  if (!created) throw new Error('Failed to retrieve created favorite');

  return toResponse(created);
};

export const removeFavorite = async (userId: string, favoriteId: number): Promise<boolean> => {
  return favoritesQueries.deleteById(favoriteId, userId);
};

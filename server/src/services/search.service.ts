import * as customFoodsQueries from '../db/queries/customFoods.queries';

// --- Open Food Facts types ---

type OpenFoodFactsNutriments = {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
};

type OpenFoodFactsProduct = {
  product_name?: string;
  code?: string;
  nutriments?: OpenFoodFactsNutriments;
  image_url?: string;
  serving_quantity?: number;
};

// --- Shared result type ---

type FoodSearchResult = {
  name: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl: string | null;
  source: 'open_food_facts' | 'custom';
  defaultServingG: number | null;
};

// --- Relevance scoring ---

const normalizeDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae');
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const scoreResult = (name: string, query: string): number => {
  const n = normalizeDiacritics(name.toLowerCase().trim());
  const q = normalizeDiacritics(query.toLowerCase().trim());

  if (n === q)                                              return 0;
  if (new RegExp(`^${escapeRegex(q)}\\b`).test(n))         return 1;
  if (n.startsWith(q))                                      return 2;
  if (new RegExp(`\\b${escapeRegex(q)}\\b`).test(n))       return 3;
  if (n.includes(q))                                        return 4;
  return 5;
};

// --- Normalisation ---

const normalizeOpenFoodFacts = (product: OpenFoodFactsProduct): FoodSearchResult => {
  const servingQty = product.serving_quantity;
  const defaultServingG = servingQty && servingQty > 0 ? servingQty : null;

  return {
    name: product.product_name ?? 'Unknown',
    barcode: product.code ?? null,
    caloriesPer100g: product.nutriments?.['energy-kcal_100g'] ?? 0,
    proteinPer100g: product.nutriments?.proteins_100g ?? 0,
    carbsPer100g: product.nutriments?.carbohydrates_100g ?? 0,
    fatPer100g: product.nutriments?.fat_100g ?? 0,
    imageUrl: product.image_url ?? null,
    source: 'open_food_facts',
    defaultServingG,
  };
};

// --- Open Food Facts search (Elasticsearch API, Sweden-filtered) ---

const searchOpenFoodFacts = async (query: string): Promise<FoodSearchResult[]> => {
  const url = new URL('https://search.openfoodfacts.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('countries_tags_en', 'sweden');
  url.searchParams.set('page_size', '20');
  url.searchParams.set('fields', 'product_name,code,nutriments,image_url,serving_quantity');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { hits?: OpenFoodFactsProduct[] };
  const products = data.hits ?? [];

  return products
    .map(normalizeOpenFoodFacts)
    .filter((item) => item.caloriesPer100g > 0);
};

// --- Custom foods search ---

const searchCustomFoods = async (userId: string, query: string): Promise<FoodSearchResult[]> => {
  const rows = await customFoodsQueries.searchByUser(userId, query);
  return rows.map((row) => ({
    name: row.name,
    barcode: null,
    caloriesPer100g: row.calories_per_100g,
    proteinPer100g: row.protein_per_100g,
    carbsPer100g: row.carbs_per_100g,
    fatPer100g: row.fat_per_100g,
    imageUrl: null,
    source: 'custom' as const,
    defaultServingG: row.default_serving_g,
  }));
};

// --- Public API ---

export const searchFood = async (query: string, userId: string): Promise<FoodSearchResult[]> => {
  const [customFoods, offResults] = await Promise.all([
    searchCustomFoods(userId, query),
    searchOpenFoodFacts(query).catch((err) => {
      console.error('Open Food Facts search failed:', err);
      return [] as FoodSearchResult[];
    }),
  ]);

  // Deduplicate custom foods against OFF results
  const customNames = new Set(customFoods.map((f) => f.name.toLowerCase()));
  const filteredOff = offResults.filter((f) => !customNames.has(f.name.toLowerCase()));

  const combined = [...customFoods, ...filteredOff];

  // Filter out irrelevant results and sort by relevance
  return combined
    .filter((f) => scoreResult(f.name, query) < 5)
    .sort((a, b) => scoreResult(a.name, query) - scoreResult(b.name, query))
    .slice(0, 20);
};

export const createCustomFood = async (
  userId: string,
  data: {
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    defaultServingG?: number;
  },
): Promise<FoodSearchResult> => {
  const defaultServingG = data.defaultServingG ?? null;
  await customFoodsQueries.insert(userId, { ...data, defaultServingG });
  return {
    name: data.name,
    barcode: null,
    caloriesPer100g: data.caloriesPer100g,
    proteinPer100g: data.proteinPer100g,
    carbsPer100g: data.carbsPer100g,
    fatPer100g: data.fatPer100g,
    imageUrl: null,
    source: 'custom',
    defaultServingG,
  };
};

export const searchBarcode = async (code: string): Promise<FoodSearchResult | null> => {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`,
  );
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { status: number; product?: OpenFoodFactsProduct };
  if (data.status !== 1 || !data.product) return null;

  const result = normalizeOpenFoodFacts(data.product);
  if (result.caloriesPer100g <= 0) return null;

  return result;
};

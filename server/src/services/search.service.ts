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
};

type FoodSearchResult = {
  name: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  imageUrl: string | null;
  source: 'open_food_facts' | 'custom';
};

const normalizeOpenFoodFacts = (product: OpenFoodFactsProduct): FoodSearchResult => ({
  name: product.product_name ?? 'Unknown',
  barcode: product.code ?? null,
  caloriesPer100g: product.nutriments?.['energy-kcal_100g'] ?? 0,
  proteinPer100g: product.nutriments?.proteins_100g ?? 0,
  carbsPer100g: product.nutriments?.carbohydrates_100g ?? 0,
  fatPer100g: product.nutriments?.fat_100g ?? 0,
  imageUrl: product.image_url ?? null,
  source: 'open_food_facts',
});

export const searchFood = async (query: string): Promise<FoodSearchResult[]> => {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('fields', 'product_name,code,nutriments,image_url');
  url.searchParams.set('page_size', '10');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { products?: OpenFoodFactsProduct[] };
  const products = data.products ?? [];

  return products
    .map(normalizeOpenFoodFacts)
    .filter((item) => item.caloriesPer100g > 0);
};

export const searchBarcode = async (code: string): Promise<FoodSearchResult | null> => {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { status: number; product?: OpenFoodFactsProduct };
  if (data.status !== 1 || !data.product) return null;

  const result = normalizeOpenFoodFacts(data.product);
  if (result.caloriesPer100g <= 0) return null;

  return result;
};

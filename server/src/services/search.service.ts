import * as customFoodsQueries from '../db/queries/customFoods.queries';

const LIVSMEDELSVERKET_BASE = 'https://dataportal.livsmedelsverket.se/livsmedel/api/v1';
const LIVSMEDELSVERKET_PAGE_SIZE = 500;

// --- Livsmedelsverket types ---

type LivsmedelsverketLink = {
  href: string;
  rel: string;
  method: string;
};

type LivsmedelsverketItem = {
  nummer: number;
  namn: string;
  vetenskapligtNamn?: string;
  links: LivsmedelsverketLink[];
};

type LivsmedelsverketPageResponse = {
  _meta: { totalRecords: number };
  livsmedel: LivsmedelsverketItem[];
};

type NaringsvardeItem = {
  euroFIRkod: string;
  enhet: string;
  varde: number;
};

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
  source: 'livsmedelsverket' | 'open_food_facts' | 'custom';
  defaultServingG: number | null;
};

// --- Fetch helper (plain fetch, no timeout for now) ---

const fetchSafe = async (url: string): Promise<Response> => {
  return fetch(url);
};

// --- Livsmedelsverket cache with lock ---

let cachedLivsmedel: LivsmedelsverketItem[] | null = null;
let cacheLoadPromise: Promise<LivsmedelsverketItem[]> | null = null;

const getAllLivsmedel = async (): Promise<LivsmedelsverketItem[]> => {
  if (cachedLivsmedel) return cachedLivsmedel;

  // Prevent concurrent loads — reuse the same promise
  if (cacheLoadPromise) return cacheLoadPromise;

  cacheLoadPromise = loadAllLivsmedel();

  try {
    const items = await cacheLoadPromise;
    cachedLivsmedel = items;
    return items;
  } catch (err) {
    // Reset so next request retries
    cacheLoadPromise = null;
    throw err;
  }
};

const loadAllLivsmedel = async (): Promise<LivsmedelsverketItem[]> => {
  const firstRes = await fetchSafe(
    `${LIVSMEDELSVERKET_BASE}/livsmedel?offset=0&limit=${LIVSMEDELSVERKET_PAGE_SIZE}&sprak=1`,
  );
  if (!firstRes.ok) throw new Error(`Livsmedelsverket initial fetch failed: ${firstRes.status}`);

  const first = (await firstRes.json()) as LivsmedelsverketPageResponse;
  const total = first._meta.totalRecords;
  const items: LivsmedelsverketItem[] = [...first.livsmedel];

  const offsets: number[] = [];
  for (let offset = LIVSMEDELSVERKET_PAGE_SIZE; offset < total; offset += LIVSMEDELSVERKET_PAGE_SIZE) {
    offsets.push(offset);
  }

  if (offsets.length > 0) {
    const pages = await Promise.all(
      offsets.map(async (offset) => {
        const res = await fetchSafe(
          `${LIVSMEDELSVERKET_BASE}/livsmedel?offset=${offset}&limit=${LIVSMEDELSVERKET_PAGE_SIZE}&sprak=1`,
        );
        if (!res.ok) throw new Error(`Livsmedelsverket page fetch failed: ${res.status}`);
        return (await res.json()) as LivsmedelsverketPageResponse;
      }),
    );

    for (const page of pages) {
      items.push(...page.livsmedel);
    }
  }

  console.log(`Livsmedelsverket cache loaded: ${items.length} items`);
  return items;
};

// --- Local search on cached data ---

const searchCached = (items: LivsmedelsverketItem[], query: string): LivsmedelsverketItem[] => {
  const q = query.toLowerCase().trim();
  return items
    .filter((item) => item.namn.toLowerCase().includes(q))
    .sort((a, b) => {
      const aName = a.namn.toLowerCase();
      const bName = b.namn.toLowerCase();
      const score = (name: string) =>
        name === q ? 0 : name.startsWith(q) ? 1 : 2;
      return score(aName) - score(bName);
    })
    .slice(0, 15);
};

// --- Normalisation functions ---

const normalizeLivsmedelsverket = (
  item: LivsmedelsverketItem,
  naringsvarden: NaringsvardeItem[],
): FoodSearchResult => {
  const getVal = (kod: string, enhet?: string): number => {
    const match = naringsvarden.find((n) =>
      n.euroFIRkod === kod && (enhet ? n.enhet === enhet : true),
    );
    return match?.varde ?? 0;
  };

  return {
    name: item.namn,
    barcode: null,
    caloriesPer100g: getVal('ENERC', 'kcal'),
    proteinPer100g: getVal('PROT'),
    carbsPer100g: getVal('CHO'),
    fatPer100g: getVal('FAT'),
    imageUrl: null,
    source: 'livsmedelsverket',
    defaultServingG: null,
  };
};

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

// --- Open Food Facts search (Sweden-filtered fallback) ---

const searchOpenFoodFacts = async (query: string): Promise<FoodSearchResult[]> => {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', query);
  url.searchParams.set('tagtype_0', 'countries');
  url.searchParams.set('tag_contains_0', 'contains');
  url.searchParams.set('tag_0', 'sweden');
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('fields', 'product_name,code,nutriments,image_url,serving_quantity');
  url.searchParams.set('page_size', '15');
  url.searchParams.set('lc', 'sv');

  const res = await fetchSafe(url.toString());
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { products?: OpenFoodFactsProduct[] };
  const products = data.products ?? [];

  return products
    .map(normalizeOpenFoodFacts)
    .filter((item) => item.caloriesPer100g > 0);
};

// --- Public API ---

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

const searchExternalFoods = async (query: string): Promise<FoodSearchResult[]> => {
  // Search both sources in parallel
  // TODO: Livsmedelsverket temporarily disabled for testing
  const [livsmedelItems, offItems] = await Promise.all([
    Promise.resolve([] as FoodSearchResult[]),
    searchOpenFoodFacts(query).catch((err) => {
      console.error('Open Food Facts search failed:', err);
      return [] as FoodSearchResult[];
    }),
  ]);

  // Deduplicate by lowercase name — prefer Livsmedelsverket results
  const seen = new Set<string>();
  const combined: FoodSearchResult[] = [];

  for (const item of livsmedelItems) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }

  for (const item of offItems) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }

  return combined.slice(0, 15);
};

const searchLivsmedelsverket = async (query: string): Promise<FoodSearchResult[]> => {
  const allItems = await getAllLivsmedel();
  const matched = searchCached(allItems, query);

  if (matched.length === 0) return [];

  const results = await Promise.allSettled(
    matched.map(async (item) => {
      const rel = item.links.find((l) => l.rel === 'naringvarden');
      if (!rel) return null;
      const url = `https://dataportal.livsmedelsverket.se/livsmedel${rel.href}`;
      const res = await fetchSafe(url);
      if (!res.ok) throw new Error(`Nutrient fetch failed: ${res.status}`);
      const data = (await res.json()) as NaringsvardeItem[];
      return normalizeLivsmedelsverket(item, data);
    }),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<FoodSearchResult | null> =>
      r.status === 'fulfilled' && r.value !== null && r.value.caloriesPer100g > 0,
    )
    .map((r) => r.value as FoodSearchResult);
};

export const searchFood = async (query: string, userId: string): Promise<FoodSearchResult[]> => {
  const [customFoods, apiResults] = await Promise.all([
    searchCustomFoods(userId, query),
    searchExternalFoods(query),
  ]);

  // Deduplicate custom foods against external results
  const customNames = new Set(customFoods.map((f) => f.name.toLowerCase()));
  const filteredApi = apiResults.filter((f) => !customNames.has(f.name.toLowerCase()));

  return [...customFoods, ...filteredApi].slice(0, 15);
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
  const res = await fetchSafe(
    `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`,
  );
  if (!res.ok) throw new Error(`Open Food Facts API error: ${res.status}`);

  const data = (await res.json()) as { status: number; product?: OpenFoodFactsProduct };
  if (data.status !== 1 || !data.product) return null;

  const result = normalizeOpenFoodFacts(data.product);
  if (result.caloriesPer100g <= 0) return null;

  return result;
};

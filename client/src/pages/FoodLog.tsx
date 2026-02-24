import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, MEAL_LABELS, type FoodSearchResult, type FoodEntry, type MealType } from '../types';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { useRecentFoods } from '../hooks/useRecentFoods';
import { useFavorites } from '../hooks/useFavorites';
import { useDailyLog } from '../hooks/useDailyLog';
import FoodSearchBar from '../components/food/FoodSearchBar';
import FoodCard from '../components/food/FoodCard';
import QuickFoodCard from '../components/food/QuickFoodCard';
import BarcodeScanner from '../components/food/BarcodeScanner';
import AddCustomFoodModal from '../components/food/AddCustomFoodModal';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

type QuickTab = 'recent' | 'favorites' | 'current';

const TAB_LABELS: Record<QuickTab, string> = {
  recent: 'Recent',
  favorites: 'Favorites',
  current: 'This meal',
};

const QUICK_TABS: QuickTab[] = ['recent', 'favorites', 'current'];

const getDefaultMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 13) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
};

const isValidMealType = (value: string | null): value is MealType =>
  value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack';

const SERVING_BASE = 100;

const FoodLog = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const mealParam = searchParams.get('meal');
  const mealType: MealType = isValidMealType(mealParam) ? mealParam : getDefaultMealType();
  const dateParam = searchParams.get('date');
  const logDate = dateParam ?? new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [servingG, setServingG] = useState(SERVING_BASE);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [successMeal, setSuccessMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuickTab>('recent');
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const { data: results, isLoading: isSearching, isFetching, isError: searchError } = useFoodSearch(searchQuery);
  const { data: recentFoods } = useRecentFoods();
  const { data: favorites } = useFavorites();
  const { data: dailyLog } = useDailyLog(logDate);

  const isSearchActive = searchQuery.length >= 2;

  const logMutation = useMutation({
    mutationFn: (food: FoodSearchResult) =>
      apiFetch<FoodEntry>('/food/log', {
        method: 'POST',
        body: JSON.stringify({
          foodName: food.name,
          barcode: food.barcode,
          caloriesPer100g: food.caloriesPer100g,
          proteinPer100g: food.proteinPer100g,
          carbsPer100g: food.carbsPer100g,
          fatPer100g: food.fatPer100g,
          servingG,
          mealType,
          loggedAt: `${logDate}T12:00:00Z`,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog(logDate) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentFoods() });
      setSuccessMeal(`Added to ${MEAL_LABELS[mealType]}`);
      setTimeout(() => {
        setSelected(null);
        setServingG(SERVING_BASE);
        setSearchQuery('');
        setSuccessMeal(null);
      }, 1500);
    },
  });

  const handleMealChange = (meal: MealType) => {
    setSearchParams({ meal, ...(dateParam ? { date: dateParam } : {}) });
  };

  const handleSelect = (food: FoodSearchResult, defaultServing?: number) => {
    setSelected(food);
    setServingG(defaultServing ?? food.defaultServingG ?? SERVING_BASE);
  };

  const handleQuickSelect = (entry: {
    foodName: string;
    barcode: string | null;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    servingG: number;
  }) => {
    const per100g = entry.servingG > 0 ? SERVING_BASE / entry.servingG : 1;
    const food: FoodSearchResult = {
      name: entry.foodName,
      barcode: entry.barcode,
      caloriesPer100g: Math.round(entry.calories * per100g),
      proteinPer100g: Math.round(entry.proteinG * per100g * 100) / 100,
      carbsPer100g: Math.round(entry.carbsG * per100g * 100) / 100,
      fatPer100g: Math.round(entry.fatG * per100g * 100) / 100,
      imageUrl: null,
      source: 'custom',
      defaultServingG: entry.servingG,
    };
    handleSelect(food, entry.servingG);
  };

  const handleBarcodeScan = useCallback(async (code: string) => {
    setScannerOpen(false);
    setBarcodeLoading(true);
    setBarcodeError(null);
    try {
      const result = await apiFetch<FoodSearchResult>(`/search/barcode/${encodeURIComponent(code)}`);
      handleSelect(result);
    } catch {
      setBarcodeError('Product not found for this barcode.');
    } finally {
      setBarcodeLoading(false);
    }
  }, []);

  const handleLog = () => {
    if (!selected) return;
    logMutation.mutate(selected);
  };

  const factor = servingG / SERVING_BASE;

  const currentMealEntries = dailyLog?.entries.filter((e) => e.mealType === mealType) ?? [];

  const makeFavoriteData = (entry: { foodName: string; barcode: string | null; calories: number; proteinG: number; carbsG: number; fatG: number; servingG: number }) => {
    const per100g = entry.servingG > 0 ? SERVING_BASE / entry.servingG : 1;
    return {
      foodName: entry.foodName,
      barcode: entry.barcode,
      caloriesPer100g: Math.round(entry.calories * per100g),
      proteinPer100g: Math.round(entry.proteinG * per100g * 100) / 100,
      carbsPer100g: Math.round(entry.carbsG * per100g * 100) / 100,
      fatPer100g: Math.round(entry.fatG * per100g * 100) / 100,
      source: 'custom',
    };
  };

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Log Food</h1>

      {/* Meal tabs */}
      <nav className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1" aria-label="Select meal">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            type="button"
            onClick={() => handleMealChange(mt)}
            className={
              mt === mealType
                ? 'flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm'
                : 'flex-1 rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'
            }
          >
            {MEAL_LABELS[mt]}
          </button>
        ))}
      </nav>

      {/* Search bar — always directly under meal tabs */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1">
          <FoodSearchBar onSearch={setSearchQuery} isLoading={isFetching} />
        </div>
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          aria-label="Scan barcode"
          className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Scan
        </button>
      </div>

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {barcodeLoading && <p className="mt-4 text-sm text-gray-500">Looking up barcode...</p>}
      {barcodeError && <p className="mt-4 text-sm text-red-500">{barcodeError}</p>}

      {isSearching && <p className="mt-4 text-sm text-gray-500">Searching...</p>}
      {searchError && <p className="mt-4 text-sm text-red-500">Search failed. Try again.</p>}

      {!selected && results && results.length > 0 && (
        <section className="mt-4 space-y-2">
          {results.map((food, i) => (
            <FoodCard key={`${food.barcode ?? food.name}-${i}`} food={food} onSelect={handleSelect} />
          ))}
        </section>
      )}

      {!selected && results && results.length === 0 && searchQuery.length >= 2 && (
        <p className="mt-4 text-sm text-gray-500">No results found.</p>
      )}

      {!selected && isSearchActive && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">Can't find what you're looking for?</p>
          <button
            type="button"
            onClick={() => setCustomModalOpen(true)}
            className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus:underline"
          >
            + Add food manually
          </button>
        </div>
      )}

      {customModalOpen && (
        <AddCustomFoodModal
          initialName={searchQuery}
          onClose={() => setCustomModalOpen(false)}
          onSaved={(food) => handleSelect(food)}
        />
      )}

      {/* Quick tabs — visible when not searching and no food selected */}
      {!selected && !isSearchActive && (
        <>
          <nav className="mb-3 flex gap-1 rounded-lg bg-gray-50 p-1" aria-label="Quick access tabs">
            {QUICK_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  tab === activeTab
                    ? 'flex-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm'
                    : 'flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700'
                }
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>

          <div className="mb-4 space-y-2">
            {activeTab === 'recent' && (
              <>
                {recentFoods && recentFoods.length > 0 ? (
                  recentFoods.map((food) => (
                    <QuickFoodCard
                      key={food.foodName}
                      name={food.foodName}
                      calories={food.calories}
                      proteinG={food.proteinG}
                      carbsG={food.carbsG}
                      fatG={food.fatG}
                      servingG={food.servingG}
                      onSelect={() => handleQuickSelect(food)}
                      favoriteData={makeFavoriteData(food)}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">No recently logged foods.</p>
                )}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {favorites && favorites.length > 0 ? (
                  favorites.map((fav) => {
                    const favServingG = fav.defaultServingG ?? SERVING_BASE;
                    const favFactor = favServingG / SERVING_BASE;
                    return (
                      <QuickFoodCard
                        key={fav.id}
                        name={fav.foodName}
                        calories={Math.round(fav.caloriesPer100g * favFactor)}
                        proteinG={Math.round(fav.proteinPer100g * favFactor * 100) / 100}
                        carbsG={Math.round(fav.carbsPer100g * favFactor * 100) / 100}
                        fatG={Math.round(fav.fatPer100g * favFactor * 100) / 100}
                        servingG={favServingG}
                        onSelect={() =>
                          handleQuickSelect({
                            foodName: fav.foodName,
                            barcode: fav.barcode,
                            calories: Math.round(fav.caloriesPer100g * favFactor),
                            proteinG: Math.round(fav.proteinPer100g * favFactor * 100) / 100,
                            carbsG: Math.round(fav.carbsPer100g * favFactor * 100) / 100,
                            fatG: Math.round(fav.fatPer100g * favFactor * 100) / 100,
                            servingG: favServingG,
                          })
                        }
                        favoriteData={{
                          foodName: fav.foodName,
                          barcode: fav.barcode,
                          caloriesPer100g: fav.caloriesPer100g,
                          proteinPer100g: fav.proteinPer100g,
                          carbsPer100g: fav.carbsPer100g,
                          fatPer100g: fav.fatPer100g,
                          source: fav.source,
                        }}
                      />
                    );
                  })
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">No favorites yet.</p>
                )}
              </>
            )}

            {activeTab === 'current' && (
              <>
                {currentMealEntries.length > 0 ? (
                  currentMealEntries.map((entry) => (
                    <QuickFoodCard
                      key={entry.id}
                      name={entry.foodName}
                      calories={entry.calories}
                      proteinG={entry.proteinG}
                      carbsG={entry.carbsG}
                      fatG={entry.fatG}
                      servingG={entry.servingG}
                      onSelect={() => handleQuickSelect(entry)}
                      favoriteData={makeFavoriteData(entry)}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No entries for {MEAL_LABELS[mealType]} yet.
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      {selected && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{selected.name}</h2>

          <div className="mb-4">
            <label htmlFor="serving" className="mb-1 block text-sm font-medium text-gray-700">
              Serving size (g)
            </label>
            <input
              id="serving"
              type="number"
              min={1}
              value={servingG}
              onChange={(e) => setServingG(Number(e.target.value) || 1)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-40"
            />
            <p className="mt-1 text-xs text-gray-400">
              {selected.defaultServingG
                ? `1 portion = ${selected.defaultServingG}g`
                : 'Per 100g'}
            </p>
          </div>

          <div className="mb-4 rounded-md bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">
              Estimated for {servingG}g:
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {Math.round(selected.caloriesPer100g * factor)} kcal &middot; P{' '}
              {Math.round(selected.proteinPer100g * factor)}g &middot; C{' '}
              {Math.round(selected.carbsPer100g * factor)}g &middot; F{' '}
              {Math.round(selected.fatPer100g * factor)}g
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLog}
              disabled={logMutation.isPending || !!successMeal}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {logMutation.isPending ? 'Logging...' : `Log to ${MEAL_LABELS[mealType]}`}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          {successMeal && (
            <p className="mt-3 text-sm font-medium text-green-600">{successMeal} ✓</p>
          )}
          {logMutation.isError && (
            <p className="mt-3 text-sm text-red-600">Failed to log food. Please try again.</p>
          )}
        </section>
      )}
    </>
  );
};

export default FoodLog;

import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, MEAL_LABELS, type FoodSearchResult, type FoodEntry, type MealType } from '../types';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { useRecentFoods } from '../hooks/useRecentFoods';
import { useFavorites } from '../hooks/useFavorites';
import { useDailyLog } from '../hooks/useDailyLog';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import FoodSearchBar from '../components/food/FoodSearchBar';
import FoodCard from '../components/food/FoodCard';
import BarcodeScanner from '../components/food/BarcodeScanner';
import AddCustomFoodModal from '../components/food/AddCustomFoodModal';
import QuickTabsPanel, { type QuickTab } from '../components/food/QuickTabsPanel';
import FoodConfirmation from '../components/food/FoodConfirmation';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const SERVING_BASE = 100;

const getDefaultMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 13) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
};

const isValidMealType = (value: string | null): value is MealType =>
  value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack';

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
  const [successMeal, setSuccessMeal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuickTab>('recent');
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const { data: results, isLoading: isSearching, isFetching, isError: searchError } = useFoodSearch(searchQuery);
  const { data: recentFoods } = useRecentFoods();
  const { data: favorites } = useFavorites();
  const { data: dailyLog } = useDailyLog(logDate);
  const barcode = useBarcodeScanner();

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

  const handleSelect = useCallback((food: FoodSearchResult, defaultServing?: number) => {
    setSelected(food);
    setServingG(defaultServing ?? food.defaultServingG ?? SERVING_BASE);
  }, []);

  const handleBarcodeScan = useCallback(async (code: string) => {
    const result = await barcode.scan(code);
    if (result) handleSelect(result);
  }, [barcode, handleSelect]);

  const handleLog = () => {
    if (!selected) return;
    logMutation.mutate(selected);
  };

  const currentMealEntries = dailyLog?.entries.filter((e) => e.mealType === mealType) ?? [];

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
          <FoodSearchBar value={searchQuery} onChange={setSearchQuery} isLoading={isFetching} />
        </div>
        <button
          type="button"
          onClick={barcode.open}
          aria-label="Scan barcode"
          className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Scan
        </button>
      </div>

      {barcode.isOpen && (
        <BarcodeScanner onScan={handleBarcodeScan} onClose={barcode.close} />
      )}

      {barcode.isLoading && <p className="mt-4 text-sm text-gray-500">Looking up barcode...</p>}
      {barcode.error && <p className="mt-4 text-sm text-red-500">{barcode.error}</p>}

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
        <QuickTabsPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          recentFoods={recentFoods}
          favorites={favorites}
          currentMealEntries={currentMealEntries}
          mealType={mealType}
          onQuickSelect={handleSelect}
        />
      )}

      {selected && (
        <FoodConfirmation
          food={selected}
          servingG={servingG}
          onServingChange={setServingG}
          mealType={mealType}
          onLog={handleLog}
          onCancel={() => setSelected(null)}
          isPending={logMutation.isPending}
          isError={logMutation.isError}
          successMessage={successMeal}
        />
      )}
    </>
  );
};

export default FoodLog;

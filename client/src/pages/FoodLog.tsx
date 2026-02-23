import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type FoodSearchResult, type FoodEntry, type MealType } from '../types';
import { useFoodSearch } from '../hooks/useFoodSearch';
import FoodSearchBar from '../components/food/FoodSearchBar';
import FoodCard from '../components/food/FoodCard';
import BarcodeScanner from '../components/food/BarcodeScanner';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const FoodLog = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [servingG, setServingG] = useState(100);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const { data: results, isLoading: isSearching, isError: searchError } = useFoodSearch(searchQuery);

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
        }),
      }),
    onSuccess: () => {
      const today = new Date().toISOString().slice(0, 10);
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog(today) });
      setSelected(null);
      setServingG(100);
      setSearchQuery('');
    },
  });

  const handleSelect = (food: FoodSearchResult) => {
    setSelected(food);
    setServingG(100);
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

  const factor = servingG / 100;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Log Food</h1>

      <div className="flex gap-2">
        <div className="flex-1">
          <FoodSearchBar onSearch={setSearchQuery} />
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

      {selected && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{selected.name}</h2>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="serving" className="mb-1 block text-sm font-medium text-gray-700">
                Serving size (g)
              </label>
              <input
                id="serving"
                type="number"
                min={1}
                value={servingG}
                onChange={(e) => setServingG(Number(e.target.value) || 1)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="meal-type" className="mb-1 block text-sm font-medium text-gray-700">
                Meal
              </label>
              <select
                id="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MEAL_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 rounded-md bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">
              Estimated for {servingG}g serving:
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {Math.round(selected.caloriesPer100g * factor)} kcal &middot; P{' '}
              {(selected.proteinPer100g * factor).toFixed(1)}g &middot; C{' '}
              {(selected.carbsPer100g * factor).toFixed(1)}g &middot; F{' '}
              {(selected.fatPer100g * factor).toFixed(1)}g
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLog}
              disabled={logMutation.isPending}
              className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {logMutation.isPending ? 'Logging...' : 'Log Food'}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          {logMutation.isSuccess && (
            <p className="mt-3 text-sm text-green-600">Food logged successfully.</p>
          )}
          {logMutation.isError && (
            <p className="mt-3 text-sm text-red-600">Failed to log food. Please try again.</p>
          )}
        </section>
      )}
    </main>
  );
};

export default FoodLog;

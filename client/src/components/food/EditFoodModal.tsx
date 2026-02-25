import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { toPer100g } from '../../lib/macroConversions';
import { queryKeys, MEAL_LABELS, type FoodEntry, type MealType } from '../../types';
import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';

type EditFoodModalProps = {
  entry: FoodEntry;
  date: string;
  onClose: () => void;
};

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const EditFoodModal = ({ entry, date, onClose }: EditFoodModalProps) => {
  const queryClient = useQueryClient();
  const [servingG, setServingG] = useState(entry.servingG);
  const [mealType, setMealType] = useState<MealType>(entry.mealType);

  const { isFavorite, isToggling, toggle } = useFavoriteToggle(entry.foodName, {
    foodName: entry.foodName,
    barcode: entry.barcode,
    ...toPer100g(entry),
    source: 'custom',
  });

  const factor = servingG / entry.servingG;
  const previewCalories = Math.round(entry.calories * factor);
  const previewProtein = Math.round(entry.proteinG * factor);
  const previewCarbs = Math.round(entry.carbsG * factor);
  const previewFat = Math.round(entry.fatG * factor);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<FoodEntry>(`/food/log/${entry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ servingG, mealType }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog(date) });
      onClose();
    },
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-gray-900">{entry.foodName}</h2>
            <button
              type="button"
              onClick={toggle}
              disabled={isToggling}
              aria-label={isFavorite ? `Remove ${entry.foodName} from favorites` : `Add ${entry.foodName} to favorites`}
              className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="edit-serving" className="mb-1 block text-sm font-medium text-gray-700">
              Serving size (g)
            </label>
            <input
              id="edit-serving"
              type="number"
              min={1}
              value={servingG}
              onChange={(e) => setServingG(Number(e.target.value) || 1)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="edit-meal" className="mb-1 block text-sm font-medium text-gray-700">
              Meal
            </label>
            <select
              id="edit-meal"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MEAL_TYPES.map((mt) => (
                <option key={mt} value={mt}>{MEAL_LABELS[mt]}</option>
              ))}
            </select>
          </div>

          <div className="mb-4 rounded-md bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">Preview for {servingG}g:</p>
            <p className="mt-1 text-sm text-gray-600">
              {previewCalories} kcal &middot; P {previewProtein}g &middot; C {previewCarbs}g &middot; F {previewFat}g
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          {updateMutation.isError && (
            <p className="mt-3 text-sm text-red-600">Failed to update. Please try again.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EditFoodModal;

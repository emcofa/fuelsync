import { useState } from 'react';
import { useAISuggestion } from '../../hooks/useAISuggestion';
import type { GoalMode, DietType, MealType, AISuggestion } from '../../types';

type AISuggestionPanelProps = {
  remainingCalories: number;
  remainingProteinG: number;
  remainingCarbsG: number;
  remainingFatG: number;
  goalMode: GoalMode;
  dietType: DietType;
};

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const AISuggestionPanel = ({
  remainingCalories,
  remainingProteinG,
  remainingCarbsG,
  remainingFatG,
  goalMode,
  dietType,
}: AISuggestionPanelProps) => {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const mutation = useAISuggestion();

  const handleSuggest = () => {
    mutation.mutate({
      remainingCalories,
      remainingProteinG,
      remainingCarbsG,
      remainingFatG,
      goalMode,
      dietType,
      mealType,
    });
  };

  const suggestions = (mutation.data as AISuggestion | undefined)?.suggestions ?? [];

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">AI Meal Suggestions</h2>

      <div className="mb-4 flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="ai-meal-type" className="mb-1 block text-sm font-medium text-gray-700">
            Meal type
          </label>
          <select
            id="ai-meal-type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {MEAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={mutation.isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {mutation.isPending ? 'Thinking...' : 'Get Suggestions'}
        </button>
      </div>

      {mutation.isError && (
        <p className="mb-4 text-sm text-red-600">
          Failed to get suggestions. Please try again.
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className="space-y-3">
          {suggestions.map((item) => (
            <li
              key={item.name}
              className="rounded-md border border-gray-100 bg-gray-50 p-4"
            >
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              <p className="mt-2 text-xs text-gray-500">
                {item.estimatedCalories} kcal &middot; P {item.estimatedProteinG}g &middot; C{' '}
                {item.estimatedCarbsG}g &middot; F {item.estimatedFatG}g
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AISuggestionPanel;

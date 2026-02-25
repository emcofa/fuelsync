import { toServing } from '../../lib/macroConversions';
import { MEAL_LABELS, type FoodSearchResult, type MealType } from '../../types';

type FoodConfirmationProps = {
  food: FoodSearchResult;
  servingG: number;
  onServingChange: (g: number) => void;
  mealType: MealType;
  onLog: () => void;
  onCancel: () => void;
  isPending: boolean;
  isError: boolean;
  successMessage: string | null;
};

const FoodConfirmation = ({
  food,
  servingG,
  onServingChange,
  mealType,
  onLog,
  onCancel,
  isPending,
  isError,
  successMessage,
}: FoodConfirmationProps) => {
  const preview = toServing(food, servingG);

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-4">
        {food.imageUrl && (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <h2 className="text-lg font-semibold text-gray-900">{food.name}</h2>
      </div>

      <div className="mb-4">
        <label htmlFor="serving" className="mb-1 block text-sm font-medium text-gray-700">
          Serving size (g)
        </label>
        <input
          id="serving"
          type="number"
          min={1}
          value={servingG}
          onChange={(e) => onServingChange(Number(e.target.value) || 1)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-40"
        />
        <p className="mt-1 text-xs text-gray-400">
          {food.defaultServingG
            ? `1 portion = ${food.defaultServingG}g`
            : 'Per 100g'}
        </p>
      </div>

      <div className="mb-4 rounded-md bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-700">
          Estimated for {servingG}g:
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {preview.calories} kcal &middot; P{' '}
          {Math.round(preview.proteinG)}g &middot; C{' '}
          {Math.round(preview.carbsG)}g &middot; F{' '}
          {Math.round(preview.fatG)}g
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onLog}
          disabled={isPending || !!successMessage}
          className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? 'Logging...' : `Log to ${MEAL_LABELS[mealType]}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>

      {successMessage && (
        <p className="mt-3 text-sm font-medium text-green-600">{successMessage} ✓</p>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-600">Failed to log food. Please try again.</p>
      )}
    </section>
  );
};

export default FoodConfirmation;

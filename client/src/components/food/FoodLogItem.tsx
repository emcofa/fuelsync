import type { FoodEntry } from '../../types';

type FoodLogItemProps = {
  entry: FoodEntry;
  onDelete: (id: number) => void;
  isDeleting: boolean;
};

const FoodLogItem = ({ entry, onDelete, isDeleting }: FoodLogItemProps) => {
  return (
    <article className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-900">{entry.foodName}</p>
        <p className="text-xs text-gray-500">
          {entry.calories} kcal &middot; P {entry.proteinG}g &middot; C {entry.carbsG}g &middot; F{' '}
          {entry.fatG}g &middot; {entry.servingG}g
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        disabled={isDeleting}
        aria-label={`Delete ${entry.foodName}`}
        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
      >
        {isDeleting ? '...' : 'Delete'}
      </button>
    </article>
  );
};

export default FoodLogItem;

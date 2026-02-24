import type { FoodEntry } from '../../types';

type FoodLogItemProps = {
  entry: FoodEntry;
  onDelete: (id: number) => void;
  onEdit: (entry: FoodEntry) => void;
  isDeleting: boolean;
};

const FoodLogItem = ({ entry, onDelete, onEdit, isDeleting }: FoodLogItemProps) => {
  return (
    <article className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-900">{entry.foodName}</p>
        <p className="text-xs text-gray-500">
          {entry.calories} kcal &middot; P {entry.proteinG}g &middot; C {entry.carbsG}g &middot; F{' '}
          {entry.fatG}g &middot; {entry.servingG}g
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          aria-label={`Edit ${entry.foodName}`}
          className="rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          disabled={isDeleting}
          aria-label={`Delete ${entry.foodName}`}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </article>
  );
};

export default FoodLogItem;

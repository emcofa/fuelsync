import type { FoodEntry } from '../../types';

type FoodLogItemProps = {
  entry: FoodEntry;
  onDelete: (id: number) => void;
  onEdit: (entry: FoodEntry) => void;
  isDeleting: boolean;
};

const FoodLogItem = ({ entry, onDelete, onEdit, isDeleting }: FoodLogItemProps) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <p className="min-w-0 flex-1 truncate text-sm text-gray-800">{entry.foodName}</p>
      <span className="shrink-0 text-xs text-gray-500">
        {entry.calories} kcal &middot; {entry.servingG}g
      </span>
      <button
        type="button"
        onClick={() => onEdit(entry)}
        aria-label={`Edit ${entry.foodName}`}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        disabled={isDeleting}
        aria-label={`Delete ${entry.foodName}`}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.5.06l-.5-6a.75.75 0 01.72-.78zm2.84 0a.75.75 0 01.72.78l-.5 6a.75.75 0 01-1.5-.06l.5-6a.75.75 0 01.78-.72z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default FoodLogItem;

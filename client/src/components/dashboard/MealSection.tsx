import { useNavigate } from 'react-router-dom';
import type { FoodEntry, MealType } from '../../types';
import FoodLogItem from '../food/FoodLogItem';

type MealSectionProps = {
  mealType: MealType;
  label: string;
  entries: FoodEntry[];
  onDelete: (id: number) => void;
  deletingId: number | null;
  date: string;
};

const MealSection = ({ mealType, label, entries, onDelete, deletingId, date }: MealSectionProps) => {
  const navigate = useNavigate();
  const filtered = entries.filter((e) => e.mealType === mealType);
  const totalCals = filtered.reduce((sum, e) => sum + e.calories, 0);

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
        <span className="text-xs text-gray-500">{totalCals} kcal</span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400">No entries yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <FoodLogItem
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              isDeleting={deletingId === entry.id}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => navigate(`/food?meal=${mealType}&date=${date}`)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        Add food
      </button>
    </section>
  );
};

export default MealSection;

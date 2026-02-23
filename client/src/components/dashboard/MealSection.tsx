import type { FoodEntry, MealType } from '../../types';
import FoodLogItem from '../food/FoodLogItem';

type MealSectionProps = {
  mealType: MealType;
  label: string;
  entries: FoodEntry[];
  onDelete: (id: number) => void;
  deletingId: number | null;
};

const MealSection = ({ mealType, label, entries, onDelete, deletingId }: MealSectionProps) => {
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
    </section>
  );
};

export default MealSection;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FoodEntry, MealType } from '../../types';
import { getMealCalorieRange } from '../../lib/mealRecommendations';
import FoodLogItem from '../food/FoodLogItem';
import EditFoodModal from '../food/EditFoodModal';

const MEAL_CONFIG: Record<string, { emoji: string; borderColor: string }> = {
  breakfast: { emoji: '\u{1F305}', borderColor: 'border-l-orange-400' },
  lunch:     { emoji: '\u{2600}\u{FE0F}', borderColor: 'border-l-yellow-400' },
  dinner:    { emoji: '\u{1F319}', borderColor: 'border-l-indigo-400' },
  snack:     { emoji: '\u{1F34E}', borderColor: 'border-l-green-400' },
};

type MealSectionProps = {
  mealType: MealType;
  label: string;
  entries: FoodEntry[];
  onDelete: (id: number) => void;
  deletingId: number | null;
  date: string;
  targetCalories: number;
};

const MealSection = ({ mealType, label, entries, onDelete, deletingId, date, targetCalories }: MealSectionProps) => {
  const navigate = useNavigate();
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const filtered = entries.filter((e) => e.mealType === mealType);
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCals = filtered.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = filtered.reduce((sum, e) => sum + e.proteinG, 0);
  const totalCarbs = filtered.reduce((sum, e) => sum + e.carbsG, 0);
  const totalFat = filtered.reduce((sum, e) => sum + e.fatG, 0);
  const range = getMealCalorieRange(targetCalories, mealType);

  return (
    <>
      <section className={`rounded-lg border border-gray-200 border-l-4 bg-white shadow-sm ${MEAL_CONFIG[mealType]?.borderColor ?? ''}`}>
        {/* Clickable header */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none"
          aria-expanded={isExpanded}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                <span className="mr-1.5">{MEAL_CONFIG[mealType]?.emoji}</span>
                {label}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {filtered.length === 0
                  ? `${range.min}–${range.max} kcal`
                  : `${totalCals} kcal`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">
              {filtered.length === 0
                ? 'No entries yet'
                : `P ${Math.round(totalProtein)}g \u00B7 K ${Math.round(totalCarbs)}g \u00B7 F ${Math.round(totalFat)}g`}
              {filtered.length > 0 && (
                <span className="ml-2 text-gray-300">
                  &middot; {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </p>
          </div>

          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
          >
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Expandable content */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-gray-100 px-4 pb-3 pt-1">
            {filtered.length > 0 && (
              <div className="divide-y divide-gray-100">
                {filtered.map((entry) => (
                  <FoodLogItem
                    key={entry.id}
                    entry={entry}
                    onDelete={onDelete}
                    onEdit={setEditingEntry}
                    isDeleting={deletingId === entry.id}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(`/food?meal=${mealType}&date=${date}`)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              + L&auml;gg till matvara
            </button>
          </div>
        </div>
      </section>

      {editingEntry && (
        <EditFoodModal
          entry={editingEntry}
          date={date}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
};

export default MealSection;

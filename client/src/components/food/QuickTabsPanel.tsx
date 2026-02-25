import { toPer100g, toServing } from '../../lib/macroConversions';
import { MEAL_LABELS, type FoodSearchResult, type FoodEntry, type MealType, type RecentFood, type FavoriteFood } from '../../types';
import QuickFoodCard from './QuickFoodCard';

type QuickTab = 'recent' | 'favorites' | 'current';

const TAB_LABELS: Record<QuickTab, string> = {
  recent: 'Recent',
  favorites: 'Favorites',
  current: 'This meal',
};

const QUICK_TABS: QuickTab[] = ['recent', 'favorites', 'current'];

const SERVING_BASE = 100;

type QuickTabsPanelProps = {
  activeTab: QuickTab;
  onTabChange: (tab: QuickTab) => void;
  recentFoods: RecentFood[] | undefined;
  favorites: FavoriteFood[] | undefined;
  currentMealEntries: FoodEntry[];
  mealType: MealType;
  onQuickSelect: (food: FoodSearchResult, defaultServing: number) => void;
};

const makeFavoriteData = (entry: { foodName: string; barcode: string | null; calories: number; proteinG: number; carbsG: number; fatG: number; servingG: number }) => ({
  foodName: entry.foodName,
  barcode: entry.barcode,
  ...toPer100g(entry),
  source: 'custom',
});

const entryToSearchResult = (entry: { foodName: string; barcode: string | null; calories: number; proteinG: number; carbsG: number; fatG: number; servingG: number }): { food: FoodSearchResult; servingG: number } => ({
  food: {
    name: entry.foodName,
    barcode: entry.barcode,
    ...toPer100g(entry),
    imageUrl: null,
    source: 'custom',
    defaultServingG: entry.servingG,
  },
  servingG: entry.servingG,
});

const QuickTabsPanel = ({
  activeTab,
  onTabChange,
  recentFoods,
  favorites,
  currentMealEntries,
  mealType,
  onQuickSelect,
}: QuickTabsPanelProps) => {
  const handleEntrySelect = (entry: { foodName: string; barcode: string | null; calories: number; proteinG: number; carbsG: number; fatG: number; servingG: number }) => {
    const { food, servingG } = entryToSearchResult(entry);
    onQuickSelect(food, servingG);
  };

  return (
    <>
      <nav className="mb-3 flex gap-1 rounded-lg bg-gray-50 p-1" aria-label="Quick access tabs">
        {QUICK_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={
              tab === activeTab
                ? 'flex-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 shadow-sm'
                : 'flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700'
            }
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      <div className="mb-4 space-y-2">
        {activeTab === 'recent' && (
          <>
            {recentFoods && recentFoods.length > 0 ? (
              recentFoods.map((food) => (
                <QuickFoodCard
                  key={food.foodName}
                  name={food.foodName}
                  calories={food.calories}
                  proteinG={food.proteinG}
                  carbsG={food.carbsG}
                  fatG={food.fatG}
                  servingG={food.servingG}
                  onSelect={() => handleEntrySelect(food)}
                  favoriteData={makeFavoriteData(food)}
                />
              ))
            ) : (
              <p className="py-4 text-center text-xs text-gray-400">No recently logged foods.</p>
            )}
          </>
        )}

        {activeTab === 'favorites' && (
          <>
            {favorites && favorites.length > 0 ? (
              favorites.map((fav) => {
                const favServingG = fav.defaultServingG ?? SERVING_BASE;
                const serving = toServing(fav, favServingG);
                return (
                  <QuickFoodCard
                    key={fav.id}
                    name={fav.foodName}
                    calories={serving.calories}
                    proteinG={serving.proteinG}
                    carbsG={serving.carbsG}
                    fatG={serving.fatG}
                    servingG={favServingG}
                    onSelect={() =>
                      handleEntrySelect({
                        foodName: fav.foodName,
                        barcode: fav.barcode,
                        ...serving,
                        servingG: favServingG,
                      })
                    }
                    favoriteData={{
                      foodName: fav.foodName,
                      barcode: fav.barcode,
                      caloriesPer100g: fav.caloriesPer100g,
                      proteinPer100g: fav.proteinPer100g,
                      carbsPer100g: fav.carbsPer100g,
                      fatPer100g: fav.fatPer100g,
                      source: fav.source,
                    }}
                  />
                );
              })
            ) : (
              <p className="py-4 text-center text-xs text-gray-400">No favorites yet.</p>
            )}
          </>
        )}

        {activeTab === 'current' && (
          <>
            {currentMealEntries.length > 0 ? (
              currentMealEntries.map((entry) => (
                <QuickFoodCard
                  key={entry.id}
                  name={entry.foodName}
                  calories={entry.calories}
                  proteinG={entry.proteinG}
                  carbsG={entry.carbsG}
                  fatG={entry.fatG}
                  servingG={entry.servingG}
                  onSelect={() => handleEntrySelect(entry)}
                  favoriteData={makeFavoriteData(entry)}
                />
              ))
            ) : (
              <p className="py-4 text-center text-xs text-gray-400">
                No entries for {MEAL_LABELS[mealType]} yet.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default QuickTabsPanel;
export type { QuickTab };

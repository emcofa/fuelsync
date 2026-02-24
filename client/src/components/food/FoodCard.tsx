import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';
import type { FoodSearchResult } from '../../types';

type FoodCardProps = {
  food: FoodSearchResult;
  onSelect: (food: FoodSearchResult) => void;
};

const FoodCard = ({ food, onSelect }: FoodCardProps) => {
  const { isFavorite, isToggling, toggle } = useFavoriteToggle(food.name, {
    foodName: food.name,
    barcode: food.barcode,
    caloriesPer100g: food.caloriesPer100g,
    proteinPer100g: food.proteinPer100g,
    carbsPer100g: food.carbsPer100g,
    fatPer100g: food.fatPer100g,
    source: food.source,
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onSelect(food)}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      >
        {food.imageUrl ? (
          <img
            src={food.imageUrl}
            alt={food.name}
            className="h-12 w-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
            No img
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{food.name}</p>
          <p className="text-xs text-gray-500">
            {Math.round(food.caloriesPer100g)} kcal &middot; P {Math.round(food.proteinPer100g)}g &middot; C{' '}
            {Math.round(food.carbsPer100g)}g &middot; F {Math.round(food.fatPer100g)}g
            <span className="ml-1 text-gray-400">(per 100g)</span>
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={toggle}
        disabled={isToggling}
        aria-label={isFavorite ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
        className="absolute right-2 top-2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
  );
};

export default FoodCard;

import type { FoodSearchResult } from '../../types';

type FoodCardProps = {
  food: FoodSearchResult;
  onSelect: (food: FoodSearchResult) => void;
};

const FoodCard = ({ food, onSelect }: FoodCardProps) => {
  return (
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
          {food.caloriesPer100g} kcal &middot; P {food.proteinPer100g}g &middot; C{' '}
          {food.carbsPer100g}g &middot; F {food.fatPer100g}g
          <span className="ml-1 text-gray-400">(per 100g)</span>
        </p>
      </div>
    </button>
  );
};

export default FoodCard;

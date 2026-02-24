import { useFavoriteToggle } from '../../hooks/useFavoriteToggle';

type FavoriteData = {
  foodName: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: string;
};

type QuickFoodCardProps = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingG: number;
  onSelect: () => void;
  favoriteData?: FavoriteData;
};

const HeartButton = ({ data }: { data: FavoriteData }) => {
  const { isFavorite, isToggling, toggle } = useFavoriteToggle(data.foodName, data);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isToggling}
      aria-label={isFavorite ? `Remove ${data.foodName} from favorites` : `Add ${data.foodName} to favorites`}
      className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isFavorite ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-red-500">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
    </button>
  );
};

const QuickFoodCard = ({ name, calories, proteinG, carbsG, fatG, servingG, onSelect, favoriteData }: QuickFoodCardProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      >
        <p className="truncate text-sm font-medium text-gray-900">{name}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {calories} kcal &middot; P {Math.round(proteinG)}g &middot; C {Math.round(carbsG)}g &middot; F {Math.round(fatG)}g &middot; {servingG}g
        </p>
      </button>
      {favoriteData && <HeartButton data={favoriteData} />}
    </div>
  );
};

export default QuickFoodCard;

import { useState } from 'react';

type FoodSearchBarProps = {
  onSearch: (query: string) => void;
  isLoading?: boolean;
};

const FoodSearchBar = ({ onSearch, isLoading }: FoodSearchBarProps) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    onSearch(next);
  };

  return (
    <div className="relative">
      <label htmlFor="food-search" className="sr-only">
        Search food
      </label>
      <input
        id="food-search"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search for a food..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 pr-9 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {isLoading && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 animate-spin text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default FoodSearchBar;

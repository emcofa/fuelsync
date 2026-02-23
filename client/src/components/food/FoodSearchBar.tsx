import { useState } from 'react';

type FoodSearchBarProps = {
  onSearch: (query: string) => void;
};

const FoodSearchBar = ({ onSearch }: FoodSearchBarProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().length >= 2) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="food-search" className="sr-only">
        Search food
      </label>
      <input
        id="food-search"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for a food..."
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
};

export default FoodSearchBar;

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type FoodSearchResult } from '../types';

export const useFoodSearch = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: queryKeys.foodSearch(debouncedQuery),
    queryFn: () => apiFetch<FoodSearchResult[]>(`/search/food?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: debouncedQuery.length >= 2 ? (prev) => prev : undefined,
  });
};

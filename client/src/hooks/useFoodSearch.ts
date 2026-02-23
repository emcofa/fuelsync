import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type FoodSearchResult } from '../types';

export const useFoodSearch = (query: string) => {
  return useQuery({
    queryKey: queryKeys.foodSearch(query),
    queryFn: () => apiFetch<FoodSearchResult[]>(`/search/food?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 2,
  });
};

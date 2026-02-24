import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type RecentFood } from '../types';

export const useRecentFoods = () =>
  useQuery({
    queryKey: queryKeys.recentFoods(),
    queryFn: () => apiFetch<RecentFood[]>('/food/recent'),
    staleTime: 1000 * 60 * 5,
  });

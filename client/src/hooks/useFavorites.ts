import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type FavoriteFood } from '../types';

export const useFavorites = () =>
  useQuery({
    queryKey: queryKeys.favorites(),
    queryFn: () => apiFetch<FavoriteFood[]>('/favorites'),
    staleTime: 1000 * 60 * 10,
  });

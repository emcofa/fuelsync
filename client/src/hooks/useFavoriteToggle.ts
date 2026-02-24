import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys } from '../types';
import { useFavorites } from './useFavorites';

type FavoriteData = {
  foodName: string;
  barcode: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: string;
};

export const useFavoriteToggle = (foodName: string, data: FavoriteData) => {
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();

  const match = favorites?.find((f) => f.foodName === foodName);
  const isFavorite = !!match;

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          foodName: data.foodName,
          barcode: data.barcode,
          caloriesPer100g: data.caloriesPer100g,
          proteinPer100g: data.proteinPer100g,
          carbsPer100g: data.carbsPer100g,
          fatPer100g: data.fatPer100g,
          source: data.source,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/favorites/${match?.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites() });
    },
  });

  const isToggling = addMutation.isPending || removeMutation.isPending;

  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isToggling) return;
    if (isFavorite) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return { isFavorite, isToggling, toggle };
};

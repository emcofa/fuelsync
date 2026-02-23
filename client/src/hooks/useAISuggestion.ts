import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import type { AISuggestion, GoalMode, DietType, MealType } from '../types';

type AISuggestRequest = {
  remainingCalories: number;
  remainingProteinG: number;
  remainingCarbsG: number;
  remainingFatG: number;
  goalMode: GoalMode;
  dietType: DietType;
  mealType: MealType;
};

export const useAISuggestion = () => {
  return useMutation({
    mutationFn: (params: AISuggestRequest) =>
      apiFetch<AISuggestion>('/ai/suggest', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  });
};

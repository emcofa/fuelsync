import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type DailyMacroSummary } from '../types';

export const useWeeklyProgress = () => {
  return useQuery({
    queryKey: queryKeys.weeklyLog(),
    queryFn: () => apiFetch<DailyMacroSummary[]>('/food/log/week'),
  });
};

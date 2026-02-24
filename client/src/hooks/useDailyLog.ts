import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type DailyMacroSummary } from '../types';

export const useDailyLog = (date: string) => {
  return useQuery({
    queryKey: queryKeys.dailyLog(date),
    queryFn: () => apiFetch<DailyMacroSummary>(`/food/log/today?date=${date}`),
    staleTime: 1000 * 60 * 2,
  });
};

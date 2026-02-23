import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { queryKeys, type MacroTargets } from '../types';

export const useMacroTargets = () => {
  return useQuery({
    queryKey: queryKeys.macroTargets(),
    queryFn: () => apiFetch<MacroTargets>('/goals'),
  });
};

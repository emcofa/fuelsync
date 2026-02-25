import { useState, useCallback, useMemo } from 'react';
import { apiFetch } from '../lib/api';
import type { FoodSearchResult } from '../types';

export const useBarcodeScanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const scan = useCallback(async (code: string): Promise<FoodSearchResult | null> => {
    setIsOpen(false);
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<FoodSearchResult>(`/search/barcode/${encodeURIComponent(code)}`);
      return result;
    } catch {
      setError('Product not found for this barcode.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ isOpen, isLoading, error, open, close, scan }),
    [isOpen, isLoading, error, open, close, scan],
  );
};

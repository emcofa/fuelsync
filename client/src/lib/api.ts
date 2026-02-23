let getTokenFn: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

export const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = getTokenFn ? await getTokenFn() : null;

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
};
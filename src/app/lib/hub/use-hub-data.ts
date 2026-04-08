'use client';
import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for fetching data from hub API endpoints.
 * Automatically refetches when `refreshVersion` changes.
 * Returns { data, loading, error, refetch }.
 */
export function useHubData<T>(
  url: string | null,
  refreshVersion: number = 0,
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(0);

  const refetch = useCallback(() => setCounter(c => c + 1), []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setData(json.data ?? json);
        } else {
          setError(json.error || `HTTP ${res.status}`);
          setData(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Network error');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [url, refreshVersion, counter]);

  return { data, loading, error, refetch };
}

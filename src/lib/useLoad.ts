import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError } from './errors';

export interface Loaded<T> {
  data: T | null;
  /** True on the first load only; later reloads keep showing the old data. */
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Loads data when the component appears and again whenever `key` changes.
 * A slow, older request can never overwrite a newer one.
 */
export function useLoad<T>(load: () => Promise<T>, key: string | number = ''): Loaded<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);
  const loader = useRef(load);
  loader.current = load;

  const reload = useCallback(async () => {
    const ticket = ++latest.current;
    try {
      const result = await loader.current();
      if (ticket !== latest.current) return;
      setData(result);
      setError(null);
    } catch (caught) {
      if (ticket !== latest.current) return;
      setError(friendlyError(caught, 'We could not load this. Check your connection and try again.'));
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void reload();
    return () => {
      latest.current++;
    };
  }, [key, reload]);

  return { data, loading, error, reload };
}

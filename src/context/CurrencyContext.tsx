import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { site } from '@/data/site';
import { readStore, writeStore } from '@/lib/utils';

export type Currency = 'USD' | 'KES';

interface CurrencyValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Formats an amount given in US dollars in the visitor's chosen currency. */
  format: (usd: number, options?: { decimals?: number }) => string;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);
const STORAGE_KEY = 'globyx.currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() =>
    readStore<Currency>(STORAGE_KEY, 'USD') === 'KES' ? 'KES' : 'USD',
  );

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    writeStore(STORAGE_KEY, next);
  }, []);

  const format = useCallback(
    (usd: number, options?: { decimals?: number }) => {
      if (currency === 'KES') {
        const kes = usd * site.kesPerUsd;
        return `KES ${kes.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
      }
      const decimals = options?.decimals ?? 2;
      return `$${usd.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [currency],
  );

  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, setCurrency, format]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyValue {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useCurrency must be used inside CurrencyProvider');
  return value;
}

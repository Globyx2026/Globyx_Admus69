/**
 * Catalogue service. The UI only ever calls these functions, never the mock
 * data directly.
 * BACKEND: swap the bodies for Supabase queries (or the number provider's
 * API) and nothing in the components needs to change.
 */
import { countries, type Country, type CountryCode, type NumberType } from '@/data/countries';
import { catalogueNumbers, type CatalogueNumber } from '@/data/numbers';
import { fakeLatency } from '@/lib/utils';

export type NumberSort = 'popular' | 'price-low' | 'price-high' | 'newest';

export interface NumberFilters {
  search: string;
  country: CountryCode | 'all';
  type: NumberType | 'all';
  sms: boolean;
  voice: boolean;
  mms: boolean;
  sort: NumberSort;
}

export const defaultNumberFilters: NumberFilters = {
  search: '',
  country: 'all',
  type: 'all',
  sms: false,
  voice: false,
  mms: false,
  sort: 'popular',
};

export async function listCountries(): Promise<Country[]> {
  await fakeLatency();
  return countries;
}

export async function listNumbers(filters: NumberFilters): Promise<CatalogueNumber[]> {
  await fakeLatency();
  const query = filters.search.trim().toLowerCase();
  const names = Object.fromEntries(countries.map((c) => [c.code, c.name.toLowerCase()]));

  const matches = catalogueNumbers.filter((n) => {
    if (filters.country !== 'all' && n.country !== filters.country) return false;
    if (filters.type !== 'all' && n.type !== filters.type) return false;
    if (filters.sms && !n.sms) return false;
    if (filters.voice && !n.voice) return false;
    if (filters.mms && !n.mms) return false;
    if (!query) return true;
    return (
      names[n.country].includes(query) ||
      n.city.toLowerCase().includes(query) ||
      n.masked.replace(/\s/g, '').includes(query.replace(/\s/g, ''))
    );
  });

  const sorted = [...matches];
  switch (filters.sort) {
    case 'price-low':
      sorted.sort((a, b) => a.monthly - b.monthly);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.monthly - a.monthly);
      break;
    case 'newest':
      sorted.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
      break;
    default:
      sorted.sort((a, b) => b.popularity - a.popularity);
  }
  return sorted;
}

/**
 * Catalogue service: the numbers that are for sale, read from the
 * `number_catalog` table in Supabase. Only available numbers are returned,
 * and never the full number (the database refuses to send it).
 * BACKEND: the table holds sample inventory. Keep it in sync with a number
 * provider's API and nothing in the pages needs to change.
 */
import { countries, type Country, type CountryCode, type NumberType } from '@/data/countries';
import { centsToUsd, supabase } from '@/lib/supabase';

export interface CatalogueNumber {
  id: string;
  country: CountryCode;
  city: string;
  type: NumberType;
  /** Number with the middle digits hidden. The full number is shown once it is rented. */
  masked: string;
  sms: boolean;
  voice: boolean;
  mms: boolean;
  /** Monthly price in USD. */
  monthly: number;
  /** One-off setup fee in USD. */
  setupFee: number;
  /** 1-100, higher is requested more often. */
  popularity: number;
  addedAt: string;
}

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

const COLUMNS = 'id, country_code, city, type, masked, sms, voice, mms, monthly_cents, setup_cents, popularity, added_at';

interface CatalogRow {
  id: string;
  country_code: string;
  city: string;
  type: string;
  masked: string;
  sms: boolean;
  voice: boolean;
  mms: boolean;
  monthly_cents: number;
  setup_cents: number;
  popularity: number;
  added_at: string;
}

function fromRow(row: CatalogRow): CatalogueNumber {
  return {
    id: row.id,
    country: row.country_code as CountryCode,
    city: row.city,
    type: row.type as NumberType,
    masked: row.masked,
    sms: row.sms,
    voice: row.voice,
    mms: row.mms,
    monthly: centsToUsd(row.monthly_cents),
    setupFee: centsToUsd(row.setup_cents),
    popularity: row.popularity,
    addedAt: row.added_at,
  };
}

export function listCountries(): Country[] {
  return countries;
}

/** Available numbers that match the filters. Throws if the request fails. */
export async function listNumbers(filters: NumberFilters): Promise<CatalogueNumber[]> {
  let query = supabase.from('number_catalog').select(COLUMNS).eq('status', 'available');
  if (filters.country !== 'all') query = query.eq('country_code', filters.country);
  if (filters.type !== 'all') query = query.eq('type', filters.type);
  if (filters.sms) query = query.eq('sms', true);
  if (filters.voice) query = query.eq('voice', true);
  if (filters.mms) query = query.eq('mms', true);

  switch (filters.sort) {
    case 'price-low':
      query = query.order('monthly_cents', { ascending: true });
      break;
    case 'price-high':
      query = query.order('monthly_cents', { ascending: false });
      break;
    case 'newest':
      query = query.order('added_at', { ascending: false });
      break;
    default:
      query = query.order('popularity', { ascending: false });
  }

  const { data, error } = await query.order('id').limit(500);
  if (error) throw error;

  const numbers = (data as CatalogRow[]).map(fromRow);
  const search = filters.search.trim().toLowerCase();
  if (!search) return numbers;

  // The search box matches a country name, a city, or digits of the number.
  const names = Object.fromEntries(countries.map((c) => [c.code, c.name.toLowerCase()]));
  const digits = search.replace(/\s/g, '');
  return numbers.filter(
    (n) =>
      (names[n.country] ?? '').includes(search) ||
      n.city.toLowerCase().includes(search) ||
      n.masked.replace(/\s/g, '').includes(digits),
  );
}

/** One available number by id, or null if it has been taken. */
export async function getNumber(id: string): Promise<CatalogueNumber | null> {
  const { data, error } = await supabase
    .from('number_catalog')
    .select(COLUMNS)
    .eq('id', id)
    .eq('status', 'available')
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as CatalogRow) : null;
}

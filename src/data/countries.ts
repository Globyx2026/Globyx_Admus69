/**
 * MOCK DATA: countries where numbers are sold, with monthly prices in USD.
 * BACKEND: replace with a `countries` table in Supabase, kept in sync with the
 * number provider's rate card.
 */

export type CountryCode =
  | 'AE' | 'AU' | 'BR' | 'CA' | 'DE' | 'EG' | 'ES' | 'FR' | 'GB' | 'GH'
  | 'IN' | 'IT' | 'KE' | 'NG' | 'NL' | 'PL' | 'SE' | 'SG' | 'US' | 'ZA';

export type NumberType = 'local' | 'mobile' | 'tollfree';

export const NUMBER_TYPE_LABEL: Record<NumberType, string> = {
  local: 'Local',
  mobile: 'Mobile',
  tollfree: 'Toll-free',
};

export interface Country {
  code: CountryCode;
  name: string;
  dial: string;
  cities: string[];
  /** Monthly price in USD per number type. A missing type is not offered. */
  prices: Partial<Record<NumberType, number>>;
  /** One-off setup fee in USD. */
  setupFee: number;
  mms: boolean;
}

export const countries: Country[] = [
  { code: 'KE', name: 'Kenya', dial: '254', cities: ['Nairobi', 'Mombasa', 'Kisumu'], prices: { local: 6, mobile: 9 }, setupFee: 2, mms: false },
  { code: 'NG', name: 'Nigeria', dial: '234', cities: ['Lagos', 'Abuja', 'Port Harcourt'], prices: { local: 8, mobile: 12 }, setupFee: 3, mms: false },
  { code: 'ZA', name: 'South Africa', dial: '27', cities: ['Johannesburg', 'Cape Town', 'Durban'], prices: { local: 4.5, mobile: 7.5, tollfree: 12 }, setupFee: 1, mms: false },
  { code: 'GH', name: 'Ghana', dial: '233', cities: ['Accra', 'Kumasi'], prices: { local: 9, mobile: 13 }, setupFee: 3, mms: false },
  { code: 'EG', name: 'Egypt', dial: '20', cities: ['Cairo', 'Alexandria'], prices: { local: 10 }, setupFee: 4, mms: false },
  { code: 'GB', name: 'United Kingdom', dial: '44', cities: ['London', 'Manchester', 'Edinburgh'], prices: { local: 2, mobile: 3.5, tollfree: 5 }, setupFee: 0, mms: false },
  { code: 'DE', name: 'Germany', dial: '49', cities: ['Berlin', 'Frankfurt', 'Munich'], prices: { local: 3, mobile: 6, tollfree: 9 }, setupFee: 1, mms: false },
  { code: 'FR', name: 'France', dial: '33', cities: ['Paris', 'Lyon', 'Marseille'], prices: { local: 3, mobile: 6.5, tollfree: 9 }, setupFee: 1, mms: false },
  { code: 'NL', name: 'Netherlands', dial: '31', cities: ['Amsterdam', 'Rotterdam'], prices: { local: 3.5, mobile: 7 }, setupFee: 1, mms: false },
  { code: 'ES', name: 'Spain', dial: '34', cities: ['Madrid', 'Barcelona', 'Valencia'], prices: { local: 3.5, mobile: 7 }, setupFee: 1, mms: false },
  { code: 'IT', name: 'Italy', dial: '39', cities: ['Rome', 'Milan'], prices: { local: 4, mobile: 8 }, setupFee: 1, mms: false },
  { code: 'SE', name: 'Sweden', dial: '46', cities: ['Stockholm', 'Gothenburg'], prices: { local: 3, mobile: 5 }, setupFee: 0, mms: false },
  { code: 'PL', name: 'Poland', dial: '48', cities: ['Warsaw', 'Krakow'], prices: { local: 3, mobile: 5.5 }, setupFee: 0, mms: false },
  { code: 'US', name: 'United States', dial: '1', cities: ['New York', 'Austin', 'San Francisco', 'Chicago'], prices: { local: 2.5, tollfree: 4 }, setupFee: 0, mms: true },
  { code: 'CA', name: 'Canada', dial: '1', cities: ['Toronto', 'Vancouver', 'Montreal'], prices: { local: 2.5, tollfree: 4 }, setupFee: 0, mms: true },
  { code: 'BR', name: 'Brazil', dial: '55', cities: ['São Paulo', 'Rio de Janeiro'], prices: { local: 5, mobile: 9 }, setupFee: 2, mms: false },
  { code: 'AE', name: 'United Arab Emirates', dial: '971', cities: ['Dubai', 'Abu Dhabi'], prices: { local: 12, mobile: 18 }, setupFee: 5, mms: false },
  { code: 'IN', name: 'India', dial: '91', cities: ['Mumbai', 'Bengaluru', 'Delhi'], prices: { local: 6, tollfree: 14 }, setupFee: 2, mms: false },
  { code: 'SG', name: 'Singapore', dial: '65', cities: ['Singapore'], prices: { local: 8, mobile: 12 }, setupFee: 2, mms: false },
  { code: 'AU', name: 'Australia', dial: '61', cities: ['Sydney', 'Melbourne', 'Brisbane'], prices: { local: 4, mobile: 6, tollfree: 9 }, setupFee: 1, mms: false },
];

export const countryByCode = Object.fromEntries(countries.map((c) => [c.code, c])) as Record<CountryCode, Country>;

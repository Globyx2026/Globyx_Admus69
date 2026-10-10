/**
 * MOCK DATA: about 60 phone numbers for the public catalogue.
 * They are generated from a fixed seed so the list is the same on every load.
 * BACKEND: replace with live inventory from the number provider's API.
 */
import { countries, type CountryCode, type NumberType } from './countries';

export interface CatalogueNumber {
  id: string;
  country: CountryCode;
  city: string;
  type: NumberType;
  /** Full number, shown only to signed-in customers. */
  number: string;
  /** Number with the middle digits hidden, for the public catalogue. */
  masked: string;
  sms: boolean;
  voice: boolean;
  mms: boolean;
  monthly: number;
  setupFee: number;
  /** 1-100, higher is requested more often. */
  popularity: number;
  /** Days since the number was added to inventory. */
  addedDaysAgo: number;
}

/** Small deterministic random generator (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AREA_CODES: Partial<Record<CountryCode, Partial<Record<NumberType, string[]>>>> = {
  US: { local: ['212', '512', '415', '312'], tollfree: ['888', '877'] },
  CA: { local: ['416', '604', '514'], tollfree: ['888', '866'] },
  GB: { local: ['20', '161', '131'], mobile: ['7700'], tollfree: ['808'] },
  KE: { local: ['20', '41', '57'], mobile: ['7'] },
};

function digits(random: () => number, count: number): string {
  let out = '';
  for (let i = 0; i < count; i++) out += Math.floor(random() * 10);
  return out;
}

function build(): CatalogueNumber[] {
  const random = seeded(20260218);
  const list: CatalogueNumber[] = [];

  countries.forEach((country) => {
    const types = Object.keys(country.prices) as NumberType[];
    for (let i = 0; i < 3; i++) {
      const type = types[i % types.length];
      const cityIndex = i % country.cities.length;
      const areas = AREA_CODES[country.code]?.[type];
      const area = areas ? areas[cityIndex % areas.length] : digits(random, 2).replace(/^0/, '2');
      let middle = digits(random, 3);
      let last = digits(random, 4);
      // Where a country reserves ranges for fiction, stay inside them so a
      // sample number can never belong to a real person.
      if (country.dial === '1') {
        middle = '555';
        last = `01${last.slice(2)}`;
      } else if (country.code === 'GB' && type === 'mobile') {
        middle = '900';
        last = last.slice(1);
      }
      const base = country.prices[type] ?? 0;
      // Memorable endings cost a little more, as they do with real carriers.
      const premium = random() > 0.8 ? 1.5 : 0;

      list.push({
        id: `${country.code}-${type}-${i}`,
        country: country.code,
        city: type === 'local' ? country.cities[cityIndex] : 'Nationwide',
        type,
        number: `+${country.dial} ${area} ${middle} ${last}`,
        masked: `+${country.dial} ${area} ••• ${last}`,
        sms: type !== 'tollfree' || country.mms,
        voice: true,
        mms: country.mms && type === 'local',
        monthly: base + premium,
        setupFee: country.setupFee,
        popularity: 20 + Math.floor(random() * 80),
        addedDaysAgo: Math.floor(random() * 60),
      });
    }
  });

  return list;
}

export const catalogueNumbers: CatalogueNumber[] = build();

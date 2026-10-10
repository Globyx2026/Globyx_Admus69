import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Image as ImageIcon, MessageSquare, Phone, Search, SearchX, TriangleAlert, X } from 'lucide-react';
import { countryByCode, NUMBER_TYPE_LABEL, type CountryCode, type NumberType } from '@/data/countries';
import { images } from '@/lib/images';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import {
  defaultNumberFilters,
  listNumbers,
  type CatalogueNumber,
  type NumberFilters,
  type NumberSort,
} from '@/services/catalog';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { inputClass } from '@/components/ui/Field';
import { Flag } from '@/components/ui/Flag';
import { Reveal } from '@/components/ui/Reveal';
import { Segmented } from '@/components/ui/Segmented';

const PAGE_SIZE = 12;

const SORT_OPTIONS: Array<{ value: NumberSort; label: string }> = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

function Capability({ icon: Icon, label, on }: { icon: typeof Phone; label: string; on: boolean }) {
  return (
    <span
      title={on ? label : `${label} not available`}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium',
        on ? 'bg-char/[0.06] text-char' : 'text-muted/50 line-through',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
      {!on && <span className="sr-only"> not available</span>}
    </span>
  );
}

function NumberCard({ item, onBuy }: { item: CatalogueNumber; onBuy: (item: CatalogueNumber) => void }) {
  const { format } = useCurrency();
  const country = countryByCode[item.country];

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-char/15 hover:shadow-[0_24px_48px_-28px_rgba(18,16,14,0.4)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2.5 text-sm text-char">
          <Flag code={item.country} />
          <span className="truncate">{country.name}</span>
        </span>
        <span className="micro shrink-0 rounded-full bg-accent/10 px-2 py-1 text-accent-ink">
          {NUMBER_TYPE_LABEL[item.type]}
        </span>
      </div>

      <p className="mt-5 font-mono text-[19px] tracking-tight text-char">{item.masked}</p>
      <p className="mt-1 text-[13px] text-muted">{item.city}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Capability icon={MessageSquare} label="SMS" on={item.sms} />
        <Capability icon={Phone} label="Voice" on={item.voice} />
        <Capability icon={ImageIcon} label="MMS" on={item.mms} />
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <p className="font-serif text-[1.625rem] leading-none tracking-[-0.02em] text-char">
            {format(item.monthly)}
            <span className="ml-1 font-sans text-xs tracking-normal text-muted">/ month</span>
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {item.setupFee > 0 ? `${format(item.setupFee)} setup` : 'No setup fee'}
          </p>
        </div>
        <Button variant="dark" size="sm" onClick={() => onBuy(item)} aria-label={`Buy ${item.masked}`}>
          Buy
        </Button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="h-[252px] animate-pulse rounded-2xl border border-line bg-white p-5" aria-hidden="true">
      <div className="h-4 w-32 rounded-full bg-char/[0.08]" />
      <div className="mt-6 h-6 w-48 rounded-full bg-char/[0.08]" />
      <div className="mt-3 h-3 w-20 rounded-full bg-char/[0.06]" />
      <div className="mt-5 flex gap-2">
        <div className="h-7 w-14 rounded-full bg-char/[0.06]" />
        <div className="h-7 w-16 rounded-full bg-char/[0.06]" />
      </div>
      <div className="mt-9 h-7 w-28 rounded-full bg-char/[0.08]" />
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent-ink">
        <SearchX className="h-6 w-6" />
      </span>
      <h2 className="type-h3 mt-5 text-char">No numbers match those filters</h2>
      <p className="mt-2 max-w-sm text-[15px] text-muted">
        Try another country or number type, or remove a capability. Stock changes through the day.
      </p>
      <Button variant="outline" className="mt-6" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

function SignInDialog({ item, onClose }: { item: CatalogueNumber | null; onClose: () => void }) {
  const { format } = useCurrency();

  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] animate-fade-in bg-ink/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[90] w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 animate-fade-in rounded-3xl bg-white p-7 shadow-2xl">
          <Dialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-char/[0.06] hover:text-char"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <p className="micro text-accent-ink">Almost there</p>
          <Dialog.Title className="type-h3 mt-3 text-char">Sign in to buy this number</Dialog.Title>
          <Dialog.Description className="mt-2 text-[15px] text-muted">
            You need an account so the number has an owner and a wallet to renew from.
          </Dialog.Description>

          {item && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-paper p-4">
              <span className="flex min-w-0 items-center gap-3">
                <Flag code={item.country} />
                <span className="truncate font-mono text-[15px] text-char">{item.masked}</span>
              </span>
              <span className="shrink-0 text-sm font-medium text-char">{format(item.monthly)} / month</span>
            </div>
          )}

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <ButtonLink to={`/signup${item ? `?rent=${item.id}` : ''}`}>Create account</ButtonLink>
            <ButtonLink to={`/login${item ? `?rent=${item.id}` : ''}`} variant="outline">
              Log in
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function isCountryCode(value: string | null): value is CountryCode {
  return value !== null && value in countryByCode;
}

export default function Numbers() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();
  const initialCountry = params.get('country');

  const [filters, setFilters] = useState<NumberFilters>({
    ...defaultNumberFilters,
    country: isCountryCode(initialCountry) ? initialCountry : 'all',
  });
  const [results, setResults] = useState<CatalogueNumber[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [buying, setBuying] = useState<CatalogueNumber | null>(null);

  // Signed-in customers go straight to the dashboard to rent; everyone else is asked to sign in.
  function onBuy(item: CatalogueNumber) {
    if (session) navigate(`/app/numbers?rent=${encodeURIComponent(item.id)}`);
    else setBuying(item);
  }

  // Reload whenever a filter changes. The flag stops a slow, older request
  // from overwriting a newer one.
  useEffect(() => {
    let current = true;
    setResults(null);
    setLoadError('');
    listNumbers(filters).then(
      (list) => {
        if (!current) return;
        setResults(list);
        setVisible(PAGE_SIZE);
      },
      (error) => {
        if (!current) return;
        setResults([]);
        setLoadError(friendlyError(error, 'We could not load the numbers. Check your connection and try again.'));
      },
    );
    return () => {
      current = false;
    };
  }, [filters, attempt]);

  function update<K extends keyof NumberFilters>(key: K, value: NumberFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    if (key === 'country') {
      const next = new URLSearchParams(params);
      if (value === 'all') next.delete('country');
      else next.set('country', String(value));
      setParams(next, { replace: true, preventScrollReset: true });
    }
  }

  function clearFilters() {
    setFilters(defaultNumberFilters);
    setParams(new URLSearchParams(), { replace: true, preventScrollReset: true });
  }

  const filtersActive =
    filters.search !== '' ||
    filters.country !== 'all' ||
    filters.type !== 'all' ||
    filters.sms ||
    filters.voice ||
    filters.mms;

  const shown = results?.slice(0, visible) ?? [];

  return (
    <>
      <PageHeader
        label="Virtual numbers"
        title="Local numbers in 60+ countries."
        intro="Search live stock by country, by type and by what the number can do. Sign in when you are ready to buy."
        image={images.header_numbers}
      />

      <section className="bg-paper py-12 md:py-16">
        <div className="shell">
          {/* Filters */}
          <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
              <label className="relative block">
                <span className="sr-only">Search numbers</span>
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(e) => update('search', e.target.value)}
                  placeholder="Search a country, city or digits"
                  className={cn(inputClass, 'h-11 pl-10')}
                />
              </label>
              <CountrySelect
                label="Country"
                allowAll
                value={filters.country}
                onChange={(value) => update('country', value)}
              />
              <label className="relative block">
                <span className="sr-only">Sort by</span>
                <select
                  value={filters.sort}
                  onChange={(e) => update('sort', e.target.value as NumberSort)}
                  className={cn(inputClass, 'h-11 appearance-none pr-9')}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="no-scrollbar -mx-1 max-w-full overflow-x-auto px-1">
                <Segmented<NumberType | 'all'>
                  label="Number type"
                  value={filters.type}
                  onChange={(value) => update('type', value)}
                  options={[
                    { value: 'all', label: 'All types' },
                    { value: 'local', label: 'Local' },
                    { value: 'mobile', label: 'Mobile' },
                    { value: 'tollfree', label: 'Toll-free' },
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Must support">
                <span className="micro mr-1 text-muted">Must support</span>
                {(['sms', 'voice', 'mms'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={filters[key]}
                    onClick={() => update(key, !filters[key])}
                    className={cn(
                      'h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
                      filters[key]
                        ? 'border-char bg-char text-cream'
                        : 'border-line bg-white text-muted hover:border-char/30 hover:text-char',
                    )}
                  >
                    {key === 'voice' ? 'Voice' : key.toUpperCase()}
                  </button>
                ))}
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto text-[13px] font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <p className="mt-8 text-sm text-muted" aria-live="polite">
            {results === null
              ? 'Loading numbers…'
              : loadError
                ? ''
                : `${results.length} ${results.length === 1 ? 'number' : 'numbers'} available`}
          </p>

          <div className="mt-4">
            {results === null ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : loadError ? (
              <div
                role="alert"
                className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-16 text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fde4e1] text-[#8f2a22]">
                  <TriangleAlert className="h-6 w-6" />
                </span>
                <h2 className="type-h3 mt-5 text-char">The catalogue did not load</h2>
                <p className="mt-2 max-w-sm text-[15px] text-muted">{loadError}</p>
                <Button variant="outline" className="mt-6" onClick={() => setAttempt((count) => count + 1)}>
                  Try again
                </Button>
              </div>
            ) : results.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((item) => (
                    <li key={item.id}>
                      <NumberCard item={item} onBuy={onBuy} />
                    </li>
                  ))}
                </ul>
                {visible < results.length && (
                  <div className="mt-10 text-center">
                    <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                      Show {Math.min(PAGE_SIZE, results.length - visible)} more
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <Reveal className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="type-h3 text-char">Need a country that is not listed?</h2>
            <p className="mt-2 max-w-xl text-[15px] text-muted">
              Tell us where you need a number. We add countries when customers ask for them.
            </p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 text-[15px] font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
          >
            Request a country
          </Link>
        </Reveal>
      </section>

      <SignInDialog item={buying} onClose={() => setBuying(null)} />
    </>
  );
}

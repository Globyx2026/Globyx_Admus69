import { useState } from 'react';
import { MessageSquare, Phone, Image as ImageIcon } from 'lucide-react';
import { countryByCode, NUMBER_TYPE_LABEL, type CountryCode, type NumberType } from '@/data/countries';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Flag } from '@/components/ui/Flag';
import { Segmented } from '@/components/ui/Segmented';

/** Pick a country and number type to see the monthly price. */
export function NumberPricePicker({ className }: { className?: string }) {
  const { format } = useCurrency();
  const [code, setCode] = useState<CountryCode>('KE');
  const [type, setType] = useState<NumberType>('local');

  const country = countryByCode[code];
  const available = Object.keys(country.prices) as NumberType[];
  // If the chosen type is not sold in this country, fall back to the first that is.
  const activeType = available.includes(type) ? type : available[0];
  const monthly = country.prices[activeType] ?? 0;

  const capabilities = [
    { label: 'SMS', icon: MessageSquare, on: activeType !== 'tollfree' || country.mms },
    { label: 'Voice', icon: Phone, on: true },
    { label: 'MMS', icon: ImageIcon, on: country.mms && activeType === 'local' },
  ];

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12', className)}>
      <div>
        <p className="micro text-muted">Country</p>
        <CountrySelect label="Country" value={code} onChange={setCode} className="mt-2 h-12" />

        <p className="micro mt-7 text-muted">Number type</p>
        <Segmented<NumberType>
          label="Number type"
          className="mt-2"
          value={activeType}
          onChange={setType}
          options={available.map((value) => ({ value, label: NUMBER_TYPE_LABEL[value] }))}
        />

        <p className="micro mt-7 text-muted">What it can do</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {capabilities.map(({ label, icon: Icon, on }) => (
            <li
              key={label}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px]',
                on ? 'border-line bg-white text-char' : 'border-dashed border-line text-muted/70 line-through',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {!on && <span className="sr-only"> not available</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col rounded-3xl bg-ink p-7 text-cream">
        <div className="flex items-center gap-2.5">
          <Flag code={code} />
          <p className="micro text-cream/55">
            {country.name} · {NUMBER_TYPE_LABEL[activeType]}
          </p>
        </div>
        <p className="mt-4 font-serif text-[3rem] leading-none tracking-[-0.02em] tabular-nums" aria-live="polite">
          {format(monthly)}
          <span className="ml-1 font-sans text-sm tracking-normal text-cream/55">/ month</span>
        </p>
        <p className="mt-3 text-[13px] text-cream/65">
          {country.setupFee > 0 ? `One-off setup fee of ${format(country.setupFee)}.` : 'No setup fee.'} Cancel renewal
          at any time.
        </p>

        <ButtonLink to={`/numbers?country=${code}`} className="mt-8 w-full">
          See numbers in {country.name}
        </ButtonLink>
        <p className="mt-3 text-center text-xs text-cream/50">Dial code +{country.dial}</p>
      </div>
    </div>
  );
}

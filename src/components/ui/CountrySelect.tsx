import type { ReactNode } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { countries, countryByCode, type CountryCode } from '@/data/countries';
import { cn } from '@/lib/utils';
import { Flag } from './Flag';

interface CountrySelectProps<T extends CountryCode | 'all'> {
  value: T;
  onChange: (value: T) => void;
  /** Adds an "All countries" option at the top. */
  allowAll?: boolean;
  label: string;
  className?: string;
}

/** Country dropdown with flags, keyboard navigation and type-ahead. */
export function CountrySelect<T extends CountryCode | 'all'>({
  value,
  onChange,
  allowAll = false,
  label,
  className,
}: CountrySelectProps<T>) {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as T)}>
      <Select.Trigger
        aria-label={label}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3.5 text-sm text-char transition-colors hover:border-char/30 focus:outline-none focus-visible:border-accent data-[state=open]:border-accent',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {value === 'all' ? (
            <Globe className="h-4 w-4 shrink-0 text-muted" />
          ) : (
            <Flag code={value as CountryCode} />
          )}
          <span className="truncate">{value === 'all' ? 'All countries' : countryByCode[value as CountryCode].name}</span>
        </span>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-[80] max-h-[min(360px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-56 animate-pop-in overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(18,16,14,0.35)]"
        >
          <Select.Viewport className="p-1.5">
            {allowAll && (
              <Option value="all">
                <Globe className="h-4 w-4 shrink-0 text-muted" />
                All countries
              </Option>
            )}
            {sorted.map((country) => (
              <Option key={country.code} value={country.code}>
                <Flag code={country.code} />
                {country.name}
                <span className="ml-auto font-mono text-[11px] text-muted">+{country.dial}</span>
              </Option>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function Option({ value, children }: { value: string; children: ReactNode }) {
  return (
    <Select.Item
      value={value}
      className="relative flex cursor-pointer items-center gap-2.5 rounded-xl py-2 pr-9 pl-2.5 text-sm text-char outline-none select-none data-[highlighted]:bg-paper"
    >
      <Select.ItemText asChild>
        <span className="flex min-w-0 flex-1 items-center gap-2.5">{children}</span>
      </Select.ItemText>
      <Select.ItemIndicator className="absolute right-3">
        <Check className="h-4 w-4 text-accent-ink" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

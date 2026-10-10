import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  /** Accessible name for the group, for example "Currency". */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

/** Pill-shaped toggle between a few options, with a sliding highlight. */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  tone = 'light',
  size = 'md',
  className,
}: SegmentedProps<T>) {
  const id = useId();
  const dark = tone === 'dark';

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex max-w-full rounded-full p-1',
        dark ? 'bg-white/[0.08] ring-1 ring-white/10' : 'bg-char/[0.06]',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-full font-medium whitespace-nowrap transition-colors duration-200',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-[13px]',
              active
                ? dark
                  ? 'text-ink'
                  : 'text-char'
                : dark
                  ? 'text-cream/70 hover:text-cream'
                  : 'text-muted hover:text-char',
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${id}`}
                className={cn('absolute inset-0 rounded-full', dark ? 'bg-cream' : 'bg-white shadow-sm')}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

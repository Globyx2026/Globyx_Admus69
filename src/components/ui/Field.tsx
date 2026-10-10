import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Shared look for text inputs, selects and textareas on light surfaces. */
export const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 text-sm text-char placeholder:text-muted/70 ' +
  'transition-colors hover:border-char/30 focus:border-accent focus:outline-none ' +
  'aria-[invalid=true]:border-danger';

/** The same, for inputs that sit on dark or glass surfaces. */
export const inputClassDark =
  'w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 text-sm text-cream placeholder:text-cream/40 ' +
  'transition-colors hover:border-white/30 focus:border-accent focus:outline-none ' +
  'aria-[invalid=true]:border-danger';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  tone?: 'light' | 'dark';
  className?: string;
  /** The input itself. Give it the same `id`, and `aria-describedby={`${id}-note`}`. */
  children: ReactNode;
}

/** Label, input and a line underneath for a hint or a validation error. */
export function Field({ id, label, error, hint, tone = 'light', className, children }: FieldProps) {
  const dark = tone === 'dark';
  return (
    <div className={className}>
      <label htmlFor={id} className={cn('mb-1.5 block text-[13px] font-medium', dark ? 'text-cream/85' : 'text-char')}>
        {label}
      </label>
      {children}
      <p
        id={`${id}-note`}
        role={error ? 'alert' : undefined}
        className={cn(
          'mt-1.5 min-h-[1.125rem] text-[12.5px] leading-tight',
          error ? 'text-danger' : dark ? 'text-cream/50' : 'text-muted',
          !dark && error && 'text-[#c0322f]',
        )}
      >
        {error ?? hint ?? ''}
      </p>
    </div>
  );
}

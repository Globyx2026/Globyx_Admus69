import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none ' +
  'transition-[transform,background-color,border-color,box-shadow,color] duration-200 ' +
  'active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  // Dark text on the orange keeps contrast above 4.5:1.
  primary: 'bg-accent text-ink shadow-glow hover:-translate-y-px hover:bg-accent-hover active:bg-accent-deep',
  secondary: 'bg-white text-char hover:-translate-y-px hover:bg-cream',
  ghost: 'border border-white/25 text-cream hover:border-white/45 hover:bg-white/10',
  outline: 'border border-line bg-white text-char hover:border-char/35',
  dark: 'bg-ink text-cream hover:-translate-y-px hover:bg-ink-3',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-[52px] px-7 text-[15px]',
};

export function buttonClass({ variant = 'primary', size = 'md', className }: StyleProps = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & StyleProps>(
  function Button({ variant, size, className, type = 'button', ...rest }, ref) {
    return <button ref={ref} type={type} className={buttonClass({ variant, size, className })} {...rest} />;
  },
);

/** A router link styled as a button. */
export function ButtonLink({ variant, size, className, ...rest }: LinkProps & StyleProps) {
  return <Link className={buttonClass({ variant, size, className })} {...rest} />;
}

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Two interlocking arcs that read as a globe, with the meridian in orange. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn('h-7 w-7', className)} aria-hidden="true">
      <path d="M27 16A11 11 0 1 1 16 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 27c-3.100-2.700-4.800-6.600-4.800-11S12.900 7.700 16 5c3.100 2.700 4.800 6.600 4.800 11"
        stroke="#FF5A1F"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="Globyx home" className={cn('inline-flex items-center gap-2.5 rounded-md', className)}>
      <LogoMark />
      <span className="font-serif text-[22px] leading-none font-semibold tracking-[-0.02em]">Globyx</span>
    </Link>
  );
}

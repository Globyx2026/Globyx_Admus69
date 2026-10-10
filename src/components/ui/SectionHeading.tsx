import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

/** Mono micro-label, serif headline and an optional lead paragraph. */
export function SectionHeading({ label, title, intro, tone = 'light', className }: SectionHeadingProps) {
  const dark = tone === 'dark';
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      <p className={cn('micro', dark ? 'text-glow' : 'text-accent-ink')}>{label}</p>
      <h2 className={cn('type-h2 mt-4', dark ? 'text-cream' : 'text-char')}>{title}</h2>
      {intro && <p className={cn('type-lead mt-5 max-w-2xl', dark ? 'text-cream/70' : 'text-muted')}>{intro}</p>}
    </Reveal>
  );
}

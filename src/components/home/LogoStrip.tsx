import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

/**
 * A quiet band under the hero.
 *
 * The original brief asked for "Trusted by" with customer logos. Globyx has
 * no published customers yet, so this names the kinds of team the product is
 * built for instead. To show real customer logos later, replace `sectors`
 * with logo images and change the caption to "Trusted by growing teams".
 */
const sectors: Array<{ name: string; className: string }> = [
  { name: 'E-commerce', className: 'font-serif text-[1.375rem] italic tracking-[-0.01em]' },
  { name: 'AGENCIES', className: 'font-sans text-[0.8125rem] font-semibold tracking-[0.32em]' },
  { name: 'research', className: 'font-mono text-[1.0625rem] tracking-[-0.04em]' },
  { name: 'Fintech', className: 'font-sans text-[1.375rem] font-bold tracking-[-0.05em]' },
  { name: 'Logistics', className: 'font-serif text-[1.375rem] font-medium tracking-[0.01em]' },
  { name: 'support.', className: 'font-sans text-[1.25rem] font-light tracking-[-0.02em]' },
];

export function LogoStrip() {
  return (
    <section className="border-b border-line bg-white" aria-label="Who Globyx is built for">
      <Reveal className="shell flex flex-col items-center gap-6 py-10 lg:flex-row lg:gap-12">
        <p className="micro shrink-0 text-muted">Built for growing teams in</p>
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-4 lg:justify-between">
          {sectors.map((sector) => (
            <li key={sector.name} className={cn('leading-none text-char/60', sector.className)}>
              {sector.name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

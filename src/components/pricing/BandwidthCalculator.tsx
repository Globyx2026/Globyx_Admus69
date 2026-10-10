import { useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { bandwidthTiers, quoteBandwidth } from '@/data/pricing';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';

// The slider is not linear: each stop takes the same width, so small volumes
// are as easy to pick as large ones.
const STOPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
const SEGMENT = 100;
const MAX_POSITION = (STOPS.length - 1) * SEGMENT;

function positionToGb(position: number): number {
  const index = Math.min(Math.floor(position / SEGMENT), STOPS.length - 2);
  const t = (position - index * SEGMENT) / SEGMENT;
  return Math.round(STOPS[index] + (STOPS[index + 1] - STOPS[index]) * t);
}

function gbToPosition(gb: number): number {
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (gb <= STOPS[i + 1]) {
      return (i + (gb - STOPS[i]) / (STOPS[i + 1] - STOPS[i])) * SEGMENT;
    }
  }
  return MAX_POSITION;
}

type Kind = 'residential' | 'mobile';

/** Live bandwidth quote: drag the slider and the price per GB falls. */
export function BandwidthCalculator({ className }: { className?: string }) {
  const { format } = useCurrency();
  const [kind, setKind] = useState<Kind>('residential');
  const [gb, setGb] = useState(50);

  const quote = quoteBandwidth(kind, gb);
  const tiers = bandwidthTiers[kind];

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12', className)}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Segmented<Kind>
            label="Proxy network"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'residential', label: 'Residential' },
              { value: 'mobile', label: 'Mobile' },
            ]}
          />
          <p className="font-serif text-[2.5rem] leading-none tracking-[-0.02em] text-char tabular-nums">
            {gb.toLocaleString('en-US')} <span className="text-[1.5rem] text-muted">GB</span>
          </p>
        </div>

        <Slider.Root
          className="relative mt-8 flex h-6 w-full touch-none items-center select-none"
          min={0}
          max={MAX_POSITION}
          step={1}
          value={[gbToPosition(gb)]}
          onValueChange={([position]) => setGb(positionToGb(position))}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-char/10">
            <Slider.Range className="bg-sunset absolute h-full rounded-full" />
          </Slider.Track>
          <Slider.Thumb
            aria-label="Monthly bandwidth"
            aria-valuetext={`${gb} gigabytes`}
            className="block h-6 w-6 rounded-full border-2 border-accent bg-white shadow-[0_4px_14px_rgba(255,90,31,0.45)] transition-transform hover:scale-110 focus-visible:scale-110"
          />
        </Slider.Root>

        <div className="mt-5 flex flex-wrap gap-2">
          {[1, 10, 50, 100, 500, 1000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setGb(preset)}
              aria-pressed={gb === preset}
              className={cn(
                'h-8 rounded-full px-3.5 font-mono text-[11px] tracking-wide transition-colors',
                gb === preset
                  ? 'bg-char text-cream'
                  : 'bg-char/[0.06] text-muted hover:bg-char/10 hover:text-char',
              )}
            >
              {preset} GB
            </button>
          ))}
        </div>

        <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Volume price tiers">
          {tiers.map((tier, index) => {
            const active = index === quote.tierIndex;
            return (
              <li
                key={tier.minGb}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'rounded-xl border px-3 py-2.5 transition-colors duration-300',
                  active ? 'border-accent bg-accent/[0.08]' : 'border-line bg-white',
                )}
              >
                <p className="micro text-muted">{tier.minGb} GB+</p>
                <p className={cn('mt-1 text-sm font-medium tabular-nums', active ? 'text-accent-ink' : 'text-char')}>
                  {format(tier.perGb)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col rounded-3xl bg-ink p-7 text-cream">
        <p className="micro text-cream/55">Price per GB</p>
        <p className="mt-2 font-serif text-[2rem] leading-none tracking-[-0.02em] tabular-nums">{format(quote.perGb)}</p>

        <div className="my-6 h-px bg-white/10" />

        <p className="micro text-cream/55">Total for {gb.toLocaleString('en-US')} GB</p>
        <p className="mt-2 font-serif text-[3rem] leading-none tracking-[-0.02em] tabular-nums" aria-live="polite">
          {format(quote.total)}
        </p>
        <p className="mt-3 min-h-6 text-[13px] text-cream/65">
          {quote.saving > 0 ? (
            <>
              <span className="mr-2 rounded-full bg-success/15 px-2 py-0.5 font-medium text-success">
                Save {Math.round(quote.saving * 100)}%
              </span>
              against the 1 GB rate
            </>
          ) : (
            'Buy 5 GB or more to unlock a lower rate.'
          )}
        </p>

        <ButtonLink to="/signup" className="mt-8 w-full">
          Get proxies
        </ButtonLink>
        <p className="mt-3 text-center text-xs text-cream/50">Charged from your wallet. No contract.</p>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

/* Tiny interface mock-ups that sit at the bottom of each card. */

function NumberMock() {
  return (
    <div className="rounded-2xl bg-ink/90 p-4 text-cream shadow-[0_18px_40px_-18px_rgba(18,16,14,0.7)]">
      <div className="flex items-center justify-between">
        <span className="micro text-cream/55">Kenya · Mobile</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Active
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Flag code="KE" className="h-5 w-[30px]" />
        <span className="font-mono text-base tracking-tight">+254 7•• ••• 204</span>
      </div>
    </div>
  );
}

function UsageRingMock() {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const used = 0.68;
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/[0.16] p-4 ring-1 ring-white/25 backdrop-blur-sm">
      <svg viewBox="0 0 72 72" className="h-[72px] w-[72px] -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${circumference * used} ${circumference}`}
        />
      </svg>
      <div>
        <p className="micro text-white/75">Bandwidth this month</p>
        <p className="mt-1 font-serif text-2xl leading-none tracking-[-0.02em] text-white">
          34 <span className="text-base text-white/70">of 50 GB</span>
        </p>
      </div>
    </div>
  );
}

function UptimeMock() {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
      <div className="flex items-end justify-between">
        <div>
          <p className="micro text-cream/55">Uptime, last 90 days</p>
          <p className="mt-1 font-serif text-2xl leading-none tracking-[-0.02em]">99.9%</p>
        </div>
        <span className="micro text-success">Operational</span>
      </div>
      <svg viewBox="0 0 240 40" className="mt-3 h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="uptime-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ff5a1f" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 14 L24 12 L48 13 L72 10 L96 12 L120 9 L132 22 L144 10 L168 11 L192 8 L216 10 L240 8 L240 40 L0 40 Z"
          fill="url(#uptime-fill)"
        />
        <path
          d="M0 14 L24 12 L48 13 L72 10 L96 12 L120 9 L132 22 L144 10 L168 11 L192 8 L216 10 L240 8"
          fill="none"
          stroke="#ff8a3d"
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

interface Card {
  label: string;
  title: string;
  body: string;
  surface: string;
  labelTone: string;
  bodyTone: string;
  mock: ReactNode;
}

const cards: Card[] = [
  {
    label: 'Numbers',
    title: 'A local presence in minutes',
    body: 'Pick a country, pick a number, and start taking calls and texts. No hardware and no contract.',
    surface: 'bg-sunset text-ink',
    labelTone: 'text-ink/70',
    bodyTone: 'text-ink/80',
    mock: <NumberMock />,
  },
  {
    label: 'Proxies',
    title: 'Pay only for what you route',
    body: 'Bandwidth is metered per GB and gets cheaper as you grow. Watch your usage as it happens.',
    surface: 'bg-dusk-grad text-white',
    labelTone: 'text-white/75',
    bodyTone: 'text-white/85',
    mock: <UsageRingMock />,
  },
  {
    label: 'Reliability',
    title: 'Built to stay connected',
    body: 'Several carriers and IP pools sit behind every product, so your lines and sessions keep running.',
    surface: 'bg-night text-cream',
    labelTone: 'text-cream/60',
    bodyTone: 'text-cream/75',
    mock: <UptimeMock />,
  },
];

export function Difference() {
  return (
    <section id="platform" className="bg-paper py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          label="The difference"
          title="Why teams confidently scale their global presence with Globyx."
        />

        <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal key={card.label} delay={index * 0.08}>
              <article
                className={cn(
                  'flex h-full min-h-[440px] flex-col rounded-3xl p-7 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-28px_rgba(18,16,14,0.55)] md:p-8',
                  card.surface,
                )}
              >
                <p className={cn('micro', card.labelTone)}>{card.label}</p>
                <h3 className="type-h3 mt-4">{card.title}</h3>
                <p className={cn('mt-3 text-[15px] leading-relaxed', card.bodyTone)}>{card.body}</p>
                <div className="mt-auto pt-10">{card.mock}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useMemo } from 'react';
import { headlineStats } from '@/data/site';
import { decodeMapDots, MAP_CITIES, MAP_HEIGHT, MAP_WIDTH } from '@/data/worldMap';
import { CountUp, Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

// Cities that get a visible name on wider screens. The rest show on hover.
const LABELLED = new Set(['Nairobi', 'London', 'New York', 'Singapore', 'São Paulo']);

function WorldMap() {
  // All land dots are drawn as one path of zero-length round-capped strokes,
  // which is far lighter than 2,600 separate circles.
  const path = useMemo(
    () =>
      decodeMapDots()
        .map((dot) => `M${dot.x.toFixed(1)} ${dot.y.toFixed(2)}h0`)
        .join(''),
    [],
  );

  return (
    <svg
      viewBox={`-1 -1 ${MAP_WIDTH + 2} ${MAP_HEIGHT + 2}`}
      className="w-full"
      role="img"
      aria-label="Dotted world map with Globyx points of presence marked in orange across Africa, Europe, the Americas, the Middle East and Asia Pacific"
    >
      <path d={path} stroke="rgba(244,239,232,0.22)" strokeWidth="0.42" strokeLinecap="round" fill="none" />
      {MAP_CITIES.map((city, index) => (
        <g key={city.name}>
          <title>{city.name}</title>
          <circle
            cx={city.x}
            cy={city.y}
            r="0.55"
            fill="#ff5a1f"
            className="animate-ping-soft"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${(index % 5) * 0.45}s` }}
          />
          <circle cx={city.x} cy={city.y} r="0.55" fill="#ff5a1f" />
          <circle cx={city.x} cy={city.y} r="0.2" fill="#ffd9c2" />
          {LABELLED.has(city.name) && (
            <text
              x={city.x + 1.3}
              y={city.y + 0.45}
              className="hidden fill-cream/75 font-mono md:block"
              style={{ fontSize: 1.25, letterSpacing: '0.06em' }}
            >
              {city.name.toUpperCase()}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Coverage() {
  return (
    <section id="coverage" className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 50% 55%, rgba(255,90,31,0.13), transparent 70%)' }}
      />
      <div className="shell relative">
        <SectionHeading
          tone="dark"
          label="Global coverage"
          title="One account. The whole map."
          intro="Numbers and exit points across Africa, Europe, the Americas and Asia Pacific, managed from a single dashboard and paid for from a single wallet."
        />

        <Reveal delay={0.1} className="mt-10 md:mt-14">
          <WorldMap />
        </Reveal>

        {/* PLACEHOLDER STATS: see src/data/site.ts. */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/10 pt-10 md:mt-14 lg:grid-cols-4">
          {headlineStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <dt className="micro text-cream/55">{stat.label}</dt>
              <dd className="mt-2 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.03em]">
                <CountUp value={stat.value} decimals={'decimals' in stat ? stat.decimals : 0} suffix={stat.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

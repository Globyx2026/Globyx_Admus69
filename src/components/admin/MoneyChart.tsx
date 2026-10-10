import { useState } from 'react';
import type { DailyMoney } from '@/services/admin';
import { usd } from './AdminList';

/**
 * Money in and money out per day, as paired columns.
 * The two colours were checked for colour-blind separation and contrast on a
 * white card; the legend, the hover readout and the table underneath mean
 * colour is never the only way to tell the series apart.
 */
const SERIES = [
  { key: 'topups', label: 'Topped up', color: '#e8480f' },
  { key: 'spend', label: 'Spent', color: '#4a55c4' },
] as const;

const W = 720;
const H = 250;
const PAD = { top: 12, right: 8, bottom: 30, left: 52 };
const BAR = 12;
const GAP = 2;

function dayLabel(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/** A round number at or above the largest value, so the axis ends on a clean tick. */
function niceMax(value: number): number {
  if (value <= 0) return 10;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((multiple) => multiple * power >= value) ?? 10;
  return step * power;
}

function compact(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** A column with a rounded top and a square foot on the baseline. */
function column(x: number, y: number, width: number, height: number): string {
  const r = Math.min(4, width / 2, height);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
}

export function MoneyChart({ days }: { days: DailyMoney[] }) {
  const [active, setActive] = useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(0, ...days.flatMap((d) => [d.topups, d.spend])));
  const band = plotW / Math.max(1, days.length);
  const ticks = [0, max / 2, max];
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
  const empty = days.every((d) => d.topups === 0 && d.spend === 0);
  const shown = active !== null ? days[active] : null;

  return (
    <figure className="m-0">
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted" aria-label="Legend">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: series.color }} aria-hidden="true" />
            {series.label}
          </li>
        ))}
      </ul>

      <div className="relative" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Money topped up and spent per day over the last 14 days. The same figures are in the table below.">
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#e6e1d9" strokeWidth="1" />
              <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#6e6761" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {compact(tick)}
              </text>
            </g>
          ))}

          {days.map((d, index) => {
            const center = PAD.left + band * index + band / 2;
            const lit = active === index;
            return (
              <g key={d.day}>
                {lit && <rect x={center - band / 2} y={PAD.top} width={band} height={plotH} fill="#1a1714" opacity="0.05" rx="6" />}
                {SERIES.map((series, s) => {
                  const value = d[series.key];
                  if (value <= 0) return null;
                  const height = Math.max(2, (value / max) * plotH);
                  const x = s === 0 ? center - GAP / 2 - BAR : center + GAP / 2;
                  return (
                    <path
                      key={series.key}
                      d={column(x, PAD.top + plotH - height, BAR, height)}
                      fill={series.color}
                      opacity={active === null || lit ? 1 : 0.45}
                    />
                  );
                })}
                {(index % 2 === 1 || days.length <= 7) && (
                  <text x={center} y={H - 9} textAnchor="middle" fontSize="11" fill="#6e6761">
                    {dayLabel(d.day)}
                  </text>
                )}
                {/* The whole day is the hover and focus target, not just the painted columns. */}
                <rect
                  x={center - band / 2}
                  y={PAD.top}
                  width={band}
                  height={plotH + PAD.bottom}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${dayLabel(d.day)}: topped up ${usd(d.topups)}, spent ${usd(d.spend)}`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  style={{ outline: 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {shown && active !== null && (
          <div
            className="pointer-events-none absolute top-1 z-10 w-44 -translate-x-1/2 rounded-xl border border-line bg-white p-3 shadow-[0_16px_40px_-16px_rgba(18,16,14,0.4)]"
            style={{ left: `${Math.min(86, Math.max(14, ((PAD.left + band * active + band / 2) / W) * 100))}%` }}
          >
            <p className="text-xs text-muted">{dayLabel(shown.day)}</p>
            {SERIES.map((series) => (
              <p key={series.key} className="mt-1.5 flex items-center justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-0.5 w-3 rounded-full" style={{ background: series.color }} aria-hidden="true" />
                  {series.label}
                </span>
                <span className="font-semibold text-char tabular-nums">{usd(shown[series.key])}</span>
              </p>
            ))}
          </div>
        )}

        {empty && (
          <p className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-[15px] text-muted">
            No money has moved in the last 14 days.
          </p>
        )}
      </div>

      <figcaption className="mt-2 text-xs text-muted">Days are counted in UTC.</figcaption>

      <details className="mt-3 text-[13px]">
        <summary className="w-fit rounded-md font-medium text-char underline decoration-accent decoration-2 underline-offset-4">
          Show as a table
        </summary>
        <table className="mt-3 w-full max-w-md text-left">
          <caption className="sr-only">Money topped up and spent per day</caption>
          <thead>
            <tr className="micro text-muted">
              <th scope="col" className="py-1.5 pr-4 font-medium">
                Day
              </th>
              <th scope="col" className="py-1.5 pr-4 text-right font-medium">
                Topped up
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Spent
              </th>
            </tr>
          </thead>
          <tbody>
            {[...days].reverse().map((d) => (
              <tr key={d.day} className="border-t border-line">
                <td className="py-1.5 pr-4 text-char">{dayLabel(d.day)}</td>
                <td className="py-1.5 pr-4 text-right text-char tabular-nums">{usd(d.topups)}</td>
                <td className="py-1.5 text-right text-char tabular-nums">{usd(d.spend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

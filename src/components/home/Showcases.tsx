import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { images, type SiteImage } from '@/lib/images';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

interface ShowcaseProps {
  label: string;
  title: string;
  body: string;
  bullets: string[];
  cta: { label: string; to: string };
  image: SiteImage;
  /** Put the photograph on the right instead of the left. */
  reverse?: boolean;
  /** The glass card that floats over the photograph. */
  floating: ReactNode;
}

function Showcase({ label, title, body, bullets, cta, image, reverse = false, floating }: ShowcaseProps) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className={cn('relative', reverse && 'lg:order-2')}>
        <Photo
          image={image}
          sizes="(min-width: 1024px) 560px, 100vw"
          widths={[480, 800, 1200]}
          className="aspect-[4/5] rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]"
        />
        <div
          className={cn(
            'absolute bottom-5 w-[min(300px,calc(100%-2.5rem))] animate-drift',
            reverse ? 'left-5 lg:-left-10' : 'right-5 lg:-right-10',
          )}
        >
          {floating}
        </div>
      </Reveal>

      <Reveal delay={0.1} className={cn(reverse && 'lg:order-1')}>
        <p className="micro text-accent-ink">{label}</p>
        <h2 className="type-h2 mt-4 text-char">{title}</h2>
        <p className="type-lead mt-5 text-muted">{body}</p>
        <ul className="mt-8 space-y-3.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-[15px] text-char">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-ink">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <ButtonLink to={cta.to} variant="dark" className="mt-9">
          {cta.label}
        </ButtonLink>
      </Reveal>
    </div>
  );
}

const messages = [
  { from: '+44 7700 900 431', text: 'Hi, is my order arriving today?', time: '09:41', unread: true },
  { from: '+254 7•• ••• 204', text: 'Can I change my delivery address?', time: '09:38', unread: true },
  { from: '+1 512 555 0147', text: 'Thanks, got the invoice.', time: '09:12', unread: false },
];

function InboxCard() {
  return (
    <div className="glass-solid p-4 text-cream" aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="micro text-cream/60">Shared inbox</span>
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-ink">2 new</span>
      </div>
      <ul className="mt-3 divide-y divide-white/10">
        {messages.map((message) => (
          <li key={message.from} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', message.unread ? 'bg-accent' : 'bg-white/25')} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-cream/75">{message.from}</span>
                <span className="font-mono text-[10px] text-cream/45">{message.time}</span>
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-cream">{message.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BANDWIDTH_PATH = 'M0 30 C 16 28, 22 14, 38 16 S 62 30, 78 22 S 104 4, 122 10 S 150 26, 168 18 S 196 6, 220 8';

function ProxySessionCard() {
  return (
    <div className="glass-solid p-4 text-cream" aria-hidden="true">
      <div className="flex items-center justify-between">
        <span className="micro text-cream/60">Live session</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-success" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Connected
        </span>
      </div>
      <p className="mt-3 flex items-center gap-2 font-serif text-[18px] tracking-[-0.01em]">
        Nairobi <ArrowRight className="h-4 w-4 text-glow" /> Frankfurt
      </p>
      <p className="mt-1 font-mono text-[11px] text-cream/60">Residential · rotating · HTTPS</p>

      <svg viewBox="0 0 220 36" className="mt-3 h-12 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bandwidth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffb067" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffb067" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${BANDWIDTH_PATH} L220 36 L0 36 Z`} fill="url(#bandwidth-fill)" />
        <motion.path
          d={BANDWIDTH_PATH}
          fill="none"
          stroke="#ffb067"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-cream/70">
        <span>142 ms</span>
        <span>3.2 GB used</span>
      </div>
    </div>
  );
}

export function NumbersShowcase() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="shell">
        <Showcase
          label="Virtual numbers"
          title="A local number for every market you serve."
          body="Customers answer local numbers and trust local texts. Give each market its own line, and run them all from one inbox."
          bullets={[
            'SMS and voice on the same number',
            'Calls forwarded to your team, wherever they are',
            'One shared inbox with the full message history',
            'A webhook for every message and call',
          ]}
          cta={{ label: 'Browse numbers', to: '/numbers' }}
          image={images.numbers_showcase}
          floating={<InboxCard />}
        />
      </div>
    </section>
  );
}

export function ProxiesShowcase() {
  return (
    <section className="bg-white pb-20 md:pb-28">
      <div className="shell">
        <Showcase
          reverse
          label="Proxies"
          title="See the web the way your customers do."
          body="Check prices, ads and search results from the countries you sell in, through IPs that are sourced with consent."
          bullets={[
            'Residential, mobile, ISP and datacenter networks',
            'Targeting by country and city',
            'Rotating or sticky sessions',
            'HTTP, HTTPS and SOCKS5',
          ]}
          cta={{ label: 'Compare proxy types', to: '/proxies' }}
          image={images.proxies_showcase}
          floating={<ProxySessionCard />}
        />
      </div>
    </section>
  );
}

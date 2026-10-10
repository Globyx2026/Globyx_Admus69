import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils';

// How long each stage is held before the next card appears. After the third
// card the stack rests, then clears and starts again.
const HOLD_MS = [700, 1300, 1300, 5600];

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-cream/80 uppercase">
      {children}
    </span>
  );
}

function NumberCard() {
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between">
        <span className="micro text-cream/60">Number activated</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Active
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Flag code="GB" className="h-5 w-[30px]" />
        <span className="font-mono text-[17px] tracking-tight text-cream">+44 7700 900 218</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-cream/65">
        <span className="mr-1">United Kingdom</span>
        <Chip>SMS</Chip>
        <Chip>Voice</Chip>
      </div>
    </div>
  );
}

function ChatCard() {
  return (
    <div className="glass p-4">
      <span className="micro text-cream/60">Customer inbox</span>
      <div className="mt-3 space-y-2 text-[13px] leading-snug">
        <p className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-white/[0.14] px-3.5 py-2 text-cream">
          Hi, is my order arriving today?
        </p>
        <p className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 font-medium text-ink">
          Yes, it's out for delivery now.
        </p>
      </div>
    </div>
  );
}

function ProxyCard() {
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between">
        <span className="micro text-cream/60">Proxy connected</span>
        <Chip>Residential</Chip>
      </div>
      <p className="mt-3 flex items-center gap-2.5 font-serif text-[19px] tracking-[-0.01em] text-cream">
        Nairobi
        <ArrowRight className="h-4 w-4 text-glow" aria-label="to" />
        Frankfurt
      </p>
      <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-cream/70">
        <span>142 ms</span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
          <span className="bg-sunset block h-full w-[32%] rounded-full" />
        </span>
        <span>3.2 GB used</span>
      </div>
    </div>
  );
}

const CARDS = [
  { key: 'number', node: <NumberCard />, offset: 'lg:mr-10', delay: '0s' },
  { key: 'chat', node: <ChatCard />, offset: 'lg:ml-10', delay: '-2.3s' },
  { key: 'proxy', node: <ProxyCard />, offset: 'lg:mr-4 lg:ml-6', delay: '-4.6s' },
];

/**
 * The stack of glass cards in the hero. Cards arrive one after another like a
 * live activity feed, rest, then start over. Purely illustrative.
 */
export function ActivityFeed({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(reduced ? CARDS.length : 0);

  useEffect(() => {
    if (reduced) {
      setVisible(CARDS.length);
      return;
    }
    let timer = 0;
    const run = (count: number) => {
      setVisible(count);
      timer = window.setTimeout(() => run(count >= CARDS.length ? 0 : count + 1), HOLD_MS[count]);
    };
    run(0);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <div className={cn('w-full max-w-[400px]', className)}>
      <p className="sr-only">
        Example account activity: a United Kingdom number is activated, a customer message is answered, and a
        residential proxy connects from Nairobi to Frankfurt.
      </p>
      <div className="flex flex-col gap-3" aria-hidden="true">
        {CARDS.map((card, index) => {
          const shown = index < visible;
          return (
            <motion.div
              key={card.key}
              className={card.offset}
              initial={false}
              animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 18, scale: shown ? 1 : 0.97 }}
              transition={{ duration: shown ? 0.55 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="animate-drift" style={{ animationDelay: card.delay }}>
                {card.node}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

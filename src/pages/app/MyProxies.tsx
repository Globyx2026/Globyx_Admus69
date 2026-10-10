import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Globe } from 'lucide-react';
import { proxyProducts, type ProxyKind } from '@/data/pricing';
import { useCurrency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import {
  PROXY_MAX,
  PROXY_UNIT,
  buyProxyPlan,
  listProxyPlans,
  listProxyRates,
  quoteProxy,
  type ProxyPlan,
  type ProxyRate,
} from '@/services/account';
import { useAccount } from '@/components/app/AppShell';
import {
  Card,
  ConfirmDialog,
  CopyButton,
  Empty,
  LoadError,
  PageTitle,
  Pill,
  SectionTitle,
  SkeletonRows,
  TestNote,
  daysUntil,
  formatDate,
} from '@/components/app/ui';
import { Button, ButtonLink } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';

const NAME: Record<ProxyKind, string> = Object.fromEntries(proxyProducts.map((p) => [p.kind, p.name])) as Record<
  ProxyKind,
  string
>;

const KINDS: ProxyKind[] = ['residential', 'mobile', 'isp', 'datacenter'];

function unitLabel(unit: 'gb' | 'ip', quantity: number): string {
  if (unit === 'gb') return `${quantity} GB`;
  return `${quantity} ${quantity === 1 ? 'IP address' : 'IP addresses'}`;
}

/* ------------------------------ Buying ------------------------------ */

function BuyPanel({ rates, onBought }: { rates: ProxyRate[]; onBought: () => void }) {
  const { format } = useCurrency();
  const { balance, refreshBalance } = useAccount();
  const [kind, setKind] = useState<ProxyKind>('residential');
  const [amount, setAmount] = useState('5');
  const [confirming, setConfirming] = useState(false);

  const unit = PROXY_UNIT[kind];
  const max = PROXY_MAX[unit];
  const quantity = Number(amount);
  const valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= max;
  const quote = valid ? quoteProxy(rates, kind, quantity) : { unitPrice: 0, total: 0 };
  const tiers = rates.filter((rate) => rate.kind === kind);
  const short = valid && balance !== null && balance < quote.total;
  const product = proxyProducts.find((p) => p.kind === kind);

  function choose(next: ProxyKind) {
    setKind(next);
    setAmount(PROXY_UNIT[next] === 'gb' ? '5' : '1');
  }

  async function confirm() {
    try {
      await buyProxyPlan(kind, quantity);
      await refreshBalance();
      toast.success('Proxy plan added', { description: 'Your connection details are listed below.' });
      setConfirming(false);
      onBought();
    } catch (error) {
      toast.error('Could not buy this plan', { description: friendlyError(error) });
    }
  }

  return (
    <Card>
      <SectionTitle>Buy a plan</SectionTitle>

      <div role="radiogroup" aria-label="Proxy network" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {KINDS.map((option) => {
          const active = option === kind;
          const from = rates.filter((rate) => rate.kind === option).at(-1)?.unitPrice ?? 0;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(option)}
              className={cn(
                'rounded-2xl border p-4 text-left transition-colors',
                active ? 'border-char bg-char text-cream' : 'border-line bg-white text-char hover:border-char/30',
              )}
            >
              <span className="block font-serif text-lg leading-tight">{NAME[option]}</span>
              <span className={cn('mt-1 block text-xs', active ? 'text-cream/65' : 'text-muted')}>
                from {format(from)} / {PROXY_UNIT[option] === 'gb' ? 'GB' : 'IP'}
              </span>
            </button>
          );
        })}
      </div>

      {product && <p className="mt-4 text-[15px] leading-relaxed text-muted">{product.summary}</p>}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div>
          <label htmlFor="proxy-amount" className="mb-1.5 block text-[13px] font-medium text-char">
            {unit === 'gb' ? 'Bandwidth (GB)' : 'IP addresses'}
          </label>
          <input
            id="proxy-amount"
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={!valid}
            aria-describedby="proxy-amount-note"
            className={cn(inputClass, 'h-11')}
          />
          <p id="proxy-amount-note" className={cn('mt-1.5 text-[12.5px]', valid ? 'text-muted' : 'text-[#c0322f]')}>
            {valid
              ? unit === 'gb'
                ? 'Valid for 30 days. Unused bandwidth does not roll over.'
                : 'Each address is yours for 30 days, with unmetered bandwidth.'
              : `Enter a whole number from 1 to ${max}.`}
          </p>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick amounts">
            {(unit === 'gb' ? [1, 5, 25, 100] : [1, 5, 10, 50]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={cn(
                  'h-8 rounded-full border px-3 text-xs font-medium transition-colors',
                  quantity === preset
                    ? 'border-char bg-char text-cream'
                    : 'border-line text-muted hover:border-char/30 hover:text-char',
                )}
              >
                {unit === 'gb' ? `${preset} GB` : `${preset} IP${preset > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-4">
          <p className="micro text-muted">Volume pricing</p>
          <ul className="mt-2.5 space-y-1.5 text-[13px]">
            {tiers.map((tier, index) => {
              const next = tiers[index + 1];
              const current = valid && quantity >= tier.minQuantity && (!next || quantity < next.minQuantity);
              return (
                <li
                  key={tier.minQuantity}
                  className={cn('flex justify-between gap-3', current ? 'font-medium text-char' : 'text-muted')}
                >
                  <span>
                    {next ? `${tier.minQuantity} to ${next.minQuantity - 1}` : `${tier.minQuantity} or more`}{' '}
                    {unit === 'gb' ? 'GB' : 'IPs'}
                  </span>
                  <span>
                    {format(tier.unitPrice)} / {unit === 'gb' ? 'GB' : 'IP'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="micro text-muted">Total for 30 days</p>
          <p className="mt-1 font-serif text-[2rem] leading-none tracking-[-0.02em] text-char">
            {valid ? format(quote.total) : '—'}
          </p>
          {valid && (
            <p className="mt-1.5 text-[13px] text-muted">
              {unitLabel(unit, quantity)} at {format(quote.unitPrice)} each
            </p>
          )}
        </div>
        {short ? (
          <div className="sm:text-right">
            <p role="alert" className="text-[13px] text-[#a3271d]">
              You need {format(quote.total - (balance ?? 0))} more in your wallet.
            </p>
            <ButtonLink to="/app/wallet?add=1" className="mt-2.5">
              Add funds
            </ButtonLink>
          </div>
        ) : (
          <Button onClick={() => setConfirming(true)} disabled={!valid || balance === null}>
            Buy plan
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={confirm}
        title={`Buy ${NAME[kind]} proxies?`}
        body={`${format(quote.total)} will be taken from your wallet for ${unitLabel(unit, quantity)}, valid for 30 days.`}
        confirmLabel={`Pay ${format(quote.total)}`}
        busyLabel="Buying…"
      />
    </Card>
  );
}

/* ------------------------------ Plans ------------------------------ */

function Detail({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
  const [shown, setShown] = useState(!secret);
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-paper py-1.5 pr-1.5 pl-3.5">
      <span className="min-w-0">
        <span className="micro block text-muted">{label}</span>
        <span className="block truncate font-mono text-[13px] text-char">{shown ? value : '•'.repeat(12)}</span>
      </span>
      <span className="flex shrink-0">
        {secret && (
          <button
            type="button"
            onClick={() => setShown((current) => !current)}
            aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={shown}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-char/[0.06] hover:text-char"
          >
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        <CopyButton value={value} label={label} />
      </span>
    </div>
  );
}

function PlanCard({ plan }: { plan: ProxyPlan }) {
  const { format } = useCurrency();
  const days = daysUntil(plan.expiresAt);
  const expired = days <= 0;
  const usedGb = plan.usedMb / 1024;
  const share = plan.unit === 'gb' ? Math.min(100, (usedGb / plan.quantity) * 100) : 0;

  return (
    <li className={cn('rounded-3xl border border-line bg-white p-5 sm:p-6', expired && 'opacity-70')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl tracking-[-0.015em] text-char">{NAME[plan.kind]}</h3>
          <p className="mt-0.5 text-[13px] text-muted">
            {unitLabel(plan.unit, plan.quantity)} · {format(plan.price)} · bought {formatDate(plan.purchasedAt)}
          </p>
        </div>
        {expired ? (
          <Pill>Expired</Pill>
        ) : days <= 5 ? (
          <Pill tone="warn">{days} {days === 1 ? 'day' : 'days'} left</Pill>
        ) : (
          <Pill tone="good">{days} days left</Pill>
        )}
      </div>

      {plan.unit === 'gb' && (
        <div className="mt-4">
          <div
            className="h-2 overflow-hidden rounded-full bg-char/[0.08]"
            role="progressbar"
            aria-label="Bandwidth used"
            aria-valuemin={0}
            aria-valuemax={plan.quantity}
            aria-valuenow={Number(usedGb.toFixed(2))}
          >
            <div className="bg-sunset h-full rounded-full" style={{ width: `${share}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {usedGb.toFixed(2)} of {plan.quantity} GB used
          </p>
        </div>
      )}

      {!expired && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <Detail label="Host and port" value={`${plan.host}:${plan.port}`} />
          <Detail label="Username" value={plan.username} />
          <Detail label="Password" value={plan.password} secret />
        </div>
      )}
    </li>
  );
}

export default function MyProxies() {
  const rates = useLoad(listProxyRates);
  const plans = useLoad(listProxyPlans);

  return (
    <div className="space-y-8">
      <PageTitle
        label="Proxies"
        title="Your proxies"
        intro="Buy bandwidth or dedicated addresses, then copy the connection details into your tools."
      />

      {rates.loading ? (
        <SkeletonRows rows={1} className="[&>div]:h-[420px] [&>div]:rounded-3xl" />
      ) : rates.error || !rates.data ? (
        <LoadError message={rates.error ?? 'We could not load the price list.'} onRetry={rates.reload} />
      ) : (
        <BuyPanel rates={rates.data} onBought={() => void plans.reload()} />
      )}

      <section>
        <SectionTitle>Your plans</SectionTitle>
        {plans.loading ? (
          <SkeletonRows rows={2} className="[&>div]:h-[150px] [&>div]:rounded-3xl" />
        ) : plans.error ? (
          <LoadError message={plans.error} onRetry={plans.reload} />
        ) : plans.data && plans.data.length > 0 ? (
          <ul className="space-y-4">
            {plans.data.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </ul>
        ) : (
          <Empty
            icon={Globe}
            title="No proxy plans yet"
            body="Choose a network above. Your connection details appear here the moment you buy."
          />
        )}
        <TestNote className="mt-4">
          The proxy network is not connected yet. The host, username and password are placeholders and will not carry
          traffic.
        </TestNote>
      </section>
    </div>
  );
}

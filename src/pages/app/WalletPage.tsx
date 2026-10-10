import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, Bitcoin, CreditCard, Plus, ReceiptText, Smartphone } from 'lucide-react';
import { site } from '@/data/site';
import { useCurrency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import { listTransactions, topUpWallet, type PaymentMethod, type Transaction } from '@/services/account';
import { useAccount } from '@/components/app/AppShell';
import { Card, Empty, LoadError, Modal, PageTitle, SectionTitle, SkeletonRows, TestNote, formatDateTime } from '@/components/app/ui';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';

const PAGE = 15;
const PRESETS = [10, 25, 50, 100];
const MIN = 5;
const MAX = 500;

const METHODS: Array<{ value: PaymentMethod; label: string; note: string; icon: typeof CreditCard }> = [
  { value: 'mpesa', label: 'M-Pesa', note: 'Pay from your phone', icon: Smartphone },
  { value: 'card', label: 'Card', note: 'Visa or Mastercard', icon: CreditCard },
  { value: 'crypto', label: 'Crypto', note: 'USDT or Bitcoin', icon: Bitcoin },
];

const METHOD_LABEL: Record<PaymentMethod, string> = { mpesa: 'M-Pesa', card: 'Card', crypto: 'Crypto' };

function TopUpDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { format } = useCurrency();
  const { refreshBalance } = useAccount();
  const [amount, setAmount] = useState('25');
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [busy, setBusy] = useState(false);

  const value = Number(amount);
  const valid =
    Number.isFinite(value) && value >= MIN && value <= MAX && Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) {
      document.getElementById('topup-amount')?.focus();
      return;
    }
    setBusy(true);
    try {
      await topUpWallet(value, method);
      await refreshBalance();
      toast.success('Funds added', { description: `${format(value)} is in your wallet.` });
      onDone();
      onClose();
    } catch (error) {
      toast.error('Could not add funds', { description: friendlyError(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Wallet"
      title="Add funds"
      description="Your balance is held in US dollars and pays for numbers and proxies."
    >
      <form onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-char">Amount</legend>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={value === preset}
                onClick={() => setAmount(String(preset))}
                className={cn(
                  'h-11 rounded-xl border text-sm font-medium transition-colors',
                  value === preset
                    ? 'border-char bg-char text-cream'
                    : 'border-line bg-white text-char hover:border-char/30',
                )}
              >
                ${preset}
              </button>
            ))}
          </div>
          <label htmlFor="topup-amount" className="mt-4 mb-1.5 block text-[13px] font-medium text-char">
            Or enter an amount in US dollars
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted">$</span>
            <input
              id="topup-amount"
              type="number"
              inputMode="decimal"
              min={MIN}
              max={MAX}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={!valid}
              aria-describedby="topup-amount-note"
              className={cn(inputClass, 'h-11 pl-7')}
            />
          </div>
          <p id="topup-amount-note" className={cn('mt-1.5 text-[12.5px]', valid ? 'text-muted' : 'text-[#c0322f]')}>
            {valid
              ? `About KES ${(value * site.kesPerUsd).toLocaleString('en-KE', { maximumFractionDigits: 0 })} at ${site.kesPerUsd} KES per dollar.`
              : `Enter an amount from $${MIN} to $${MAX}.`}
          </p>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="mb-2 text-[13px] font-medium text-char">Pay with</legend>
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-3">
            {METHODS.map(({ value: option, label, note, icon: Icon }) => {
              const active = option === method;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMethod(option)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:flex-col sm:items-start sm:gap-2',
                    active ? 'border-accent bg-accent/[0.06]' : 'border-line bg-white hover:border-char/30',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-accent-ink' : 'text-muted')} />
                  <span>
                    <span className="block text-sm font-medium text-char">{label}</span>
                    <span className="block text-xs text-muted">{note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <TestNote className="mt-5">
          No payment is taken and no card or phone details are asked for. The amount is added to your wallet as test
          funds so you can try everything.
        </TestNote>

        <Button type="submit" disabled={busy} className="mt-5 w-full">
          {busy ? 'Adding funds…' : valid ? `Add ${format(value)}` : 'Add funds'}
        </Button>
      </form>
    </Modal>
  );
}

function Row({ item }: { item: Transaction }) {
  const { format } = useCurrency();
  const credit = item.amount > 0;
  return (
    <tr className="border-t border-line">
      <td className="py-3.5 pr-4">
        <span className="flex items-center gap-3">
          <span
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-full',
              credit ? 'bg-[#dff5ea] text-[#0f6b45]' : 'bg-char/[0.06] text-char',
            )}
          >
            {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-char">{item.description}</span>
            <span className="block text-xs text-muted md:hidden">{formatDateTime(item.createdAt)}</span>
          </span>
        </span>
      </td>
      <td className="hidden py-3.5 pr-4 text-[13px] whitespace-nowrap text-muted md:table-cell">
        {formatDateTime(item.createdAt)}
      </td>
      <td className="hidden py-3.5 pr-4 text-[13px] text-muted lg:table-cell">
        {item.method ? METHOD_LABEL[item.method] : 'Wallet'}
      </td>
      <td
        className={cn(
          'py-3.5 text-right font-mono text-[13px] whitespace-nowrap',
          credit ? 'text-[#0f6b45]' : 'text-char',
        )}
      >
        {credit ? '+' : '−'}
        {format(Math.abs(item.amount))}
      </td>
      <td className="hidden py-3.5 pl-4 text-right font-mono text-[13px] whitespace-nowrap text-muted sm:table-cell">
        {format(item.balanceAfter)}
      </td>
    </tr>
  );
}

export default function WalletPage() {
  const [params, setParams] = useSearchParams();
  const { format, currency } = useCurrency();
  const { balance } = useAccount();
  const [adding, setAdding] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const { data, loading, error, reload } = useLoad(() => listTransactions(limit), limit);

  // Links such as /app/wallet?add=1 open the dialog straight away.
  useEffect(() => {
    if (!params.get('add')) return;
    setParams(new URLSearchParams(), { replace: true });
    setAdding(true);
  }, [params, setParams]);

  return (
    <div className="space-y-8">
      <PageTitle label="Wallet" title="Your wallet" intro="One balance pays for every number and every proxy." />

      <div className="bg-night relative overflow-hidden rounded-3xl p-6 text-cream sm:p-8">
        <p className="micro text-cream/55">Available balance</p>
        <p className="mt-3 font-serif text-[clamp(2.5rem,7vw,4rem)] leading-none tracking-[-0.02em]">
          {balance === null ? '…' : format(balance)}
        </p>
        <p className="mt-3 text-sm text-cream/60">
          {balance === null
            ? ' '
            : currency === 'KES'
              ? `Held as $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, shown at ${site.kesPerUsd} KES per dollar.`
              : `About KES ${(balance * site.kesPerUsd).toLocaleString('en-KE', { maximumFractionDigits: 0 })}.`}
        </p>
        <Button className="mt-6" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add funds
        </Button>
      </div>

      <Card>
        <SectionTitle
          aside={data ? <span className="micro text-muted">{data.total} in total</span> : undefined}
        >
          Transactions
        </SectionTitle>
        {loading && !data ? (
          <SkeletonRows rows={3} className="[&>div]:h-12 [&>div]:rounded-xl [&>div]:border-0 [&>div]:bg-char/[0.05]" />
        ) : error ? (
          <LoadError message={error} onRetry={reload} />
        ) : data && data.items.length > 0 ? (
          <>
            <table className="w-full text-left">
              <caption className="sr-only">Wallet transactions, newest first</caption>
              <thead>
                <tr className="micro text-muted">
                  <th scope="col" className="pr-4 pb-3 font-medium">
                    Description
                  </th>
                  <th scope="col" className="hidden pr-4 pb-3 font-medium md:table-cell">
                    Date
                  </th>
                  <th scope="col" className="hidden pr-4 pb-3 font-medium lg:table-cell">
                    Paid with
                  </th>
                  <th scope="col" className="pb-3 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="hidden pb-3 pl-4 text-right font-medium sm:table-cell">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </tbody>
            </table>
            {data.items.length < data.total && (
              <div className="mt-5 text-center">
                <Button variant="outline" size="sm" onClick={() => setLimit((current) => current + PAGE)} disabled={loading}>
                  {loading ? 'Loading…' : 'Show more'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <Empty
            icon={ReceiptText}
            title="No transactions yet"
            body="Add funds to get started. Every top-up and purchase is listed here."
            action={<Button onClick={() => setAdding(true)}>Add funds</Button>}
          />
        )}
      </Card>

      <TopUpDialog open={adding} onClose={() => setAdding(false)} onDone={() => void reload()} />
    </div>
  );
}

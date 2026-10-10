import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Check, Globe, KeyRound, MessageSquare, Phone, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import {
  countUnreadMessages,
  listApiKeys,
  listMyNumbers,
  listProxyPlans,
  listTransactions,
  type Transaction,
} from '@/services/account';
import { useAccount } from '@/components/app/AppShell';
import { Card, LoadError, PageTitle, SectionTitle, formatDateTime } from '@/components/app/ui';
import { ButtonLink } from '@/components/ui/Button';

async function loadOverview() {
  const [numbers, plans, keys, unread, activity] = await Promise.all([
    listMyNumbers(),
    listProxyPlans(),
    listApiKeys(),
    countUnreadMessages(),
    listTransactions(5),
  ]);
  const now = Date.now();
  return {
    numbers: numbers.length,
    plans: plans.filter((plan) => new Date(plan.expiresAt).getTime() > now).length,
    keys: keys.filter((key) => !key.revokedAt).length,
    unread,
    activity: activity.items,
    everToppedUp: activity.total > 0,
  };
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Stat({
  to,
  icon: Icon,
  label,
  value,
  note,
}: {
  to: string;
  icon: typeof Phone;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-3xl border border-line bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-char/15 hover:shadow-[0_24px_48px_-30px_rgba(18,16,14,0.4)]"
    >
      <span className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent-ink">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-char" />
      </span>
      <span className="micro mt-5 text-muted">{label}</span>
      <span className="mt-1.5 font-serif text-[2rem] leading-none tracking-[-0.02em] text-char">{value}</span>
      <span className="mt-2 text-[13px] text-muted">{note}</span>
    </Link>
  );
}

function Step({ done, title, body, to, cta }: { done: boolean; title: string; body: string; to: string; cta: string }) {
  return (
    <li className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <span
        className={cn(
          'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border',
          done ? 'border-transparent bg-[#dff5ea] text-[#0f6b45]' : 'border-line text-muted',
        )}
        aria-hidden="true"
      >
        {done && <Check className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[15px] font-medium', done ? 'text-muted line-through' : 'text-char')}>
          {title}
          {done && <span className="sr-only"> (done)</span>}
        </p>
        {!done && <p className="mt-0.5 text-[13px] text-muted">{body}</p>}
      </div>
      {!done && (
        <ButtonLink to={to} variant="outline" size="sm">
          {cta}
        </ButtonLink>
      )}
    </li>
  );
}

function ActivityRow({ item }: { item: Transaction }) {
  const { format } = useCurrency();
  const credit = item.amount > 0;
  return (
    <li className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full',
          credit ? 'bg-[#dff5ea] text-[#0f6b45]' : 'bg-char/[0.06] text-char',
        )}
      >
        {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-char">{item.description}</span>
        <span className="block text-xs text-muted">{formatDateTime(item.createdAt)}</span>
      </span>
      <span className={cn('shrink-0 font-mono text-[13px]', credit ? 'text-[#0f6b45]' : 'text-char')}>
        {credit ? '+' : '−'}
        {format(Math.abs(item.amount))}
      </span>
    </li>
  );
}

export default function Overview() {
  const { displayName } = useAuth();
  const { balance } = useAccount();
  const { format } = useCurrency();
  const { data, loading, error, reload } = useLoad(loadOverview);

  const firstName = displayName.split(' ')[0];
  const stepsLeft = data
    ? [data.everToppedUp, data.numbers > 0, data.plans > 0, data.keys > 0].filter((done) => !done).length
    : 0;

  return (
    <div className="space-y-8">
      <PageTitle
        label="Overview"
        title={`${greeting()}, ${firstName}.`}
        intro="Your numbers, proxies and wallet in one place."
        action={
          <>
            <ButtonLink to="/app/numbers?browse=1">Get a number</ButtonLink>
            <ButtonLink to="/app/proxies" variant="outline">
              Buy proxies
            </ButtonLink>
          </>
        }
      />

      {error && <LoadError message={error} onRetry={reload} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          to="/app/wallet"
          icon={Wallet}
          label="Wallet balance"
          value={balance === null ? '…' : format(balance)}
          note="Top up by card, M-Pesa or crypto"
        />
        <Stat
          to="/app/numbers"
          icon={Phone}
          label="Active numbers"
          value={loading || !data ? '…' : String(data.numbers)}
          note={data && data.numbers === 1 ? 'Number on your account' : 'Numbers on your account'}
        />
        <Stat
          to="/app/proxies"
          icon={Globe}
          label="Proxy plans"
          value={loading || !data ? '…' : String(data.plans)}
          note="Active right now"
        />
        <Stat
          to="/app/numbers"
          icon={MessageSquare}
          label="Unread messages"
          value={loading || !data ? '…' : String(data.unread)}
          note="Across all your inboxes"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle
            aside={
              <Link
                to="/app/wallet"
                className="text-[13px] font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
              >
                All transactions
              </Link>
            }
          >
            Recent activity
          </SectionTitle>
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-11 animate-pulse rounded-xl bg-char/[0.05]" />
              ))}
            </div>
          ) : data && data.activity.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-paper px-4 py-8 text-center text-[15px] text-muted">
              Nothing yet. Your top-ups and purchases will appear here.
            </p>
          )}
        </Card>

        <Card>
          <SectionTitle
            aside={
              data && stepsLeft > 0 ? (
                <span className="micro text-muted">{4 - stepsLeft} of 4 done</span>
              ) : undefined
            }
          >
            {data && stepsLeft === 0 ? 'You are all set' : 'Get started'}
          </SectionTitle>
          {data && stepsLeft === 0 ? (
            <p className="text-[15px] leading-relaxed text-muted">
              Your wallet is funded and you have a number, a proxy plan and an API key. The{' '}
              <Link to="/developers" className="text-char underline decoration-accent decoration-2 underline-offset-4">
                API docs
              </Link>{' '}
              show what to build next.
            </p>
          ) : (
            <ol className="divide-y divide-line">
              <Step
                done={Boolean(data?.everToppedUp)}
                title="Add funds to your wallet"
                body="Everything is paid for from one balance."
                to="/app/wallet?add=1"
                cta="Add funds"
              />
              <Step
                done={Boolean(data && data.numbers > 0)}
                title="Rent your first number"
                body="Pick a country and it is live in seconds."
                to="/app/numbers?browse=1"
                cta="Browse"
              />
              <Step
                done={Boolean(data && data.plans > 0)}
                title="Buy a proxy plan"
                body="Residential, mobile, ISP or datacenter."
                to="/app/proxies"
                cta="Choose"
              />
              <Step
                done={Boolean(data && data.keys > 0)}
                title="Create an API key"
                body="For connecting your own software."
                to="/app/api-keys"
                cta="Create"
              />
            </ol>
          )}
        </Card>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent-ink">
            <KeyRound className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="font-serif text-xl tracking-[-0.015em] text-char">Building something?</h2>
            <p className="mt-1 text-[15px] text-muted">
              Read how numbers, messages and proxies will work through the API.
            </p>
          </div>
        </div>
        <ButtonLink to="/developers" variant="outline" className="shrink-0">
          Read the docs
        </ButtonLink>
      </Card>
    </div>
  );
}

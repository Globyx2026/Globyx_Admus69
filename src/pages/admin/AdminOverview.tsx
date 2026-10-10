import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Inbox, Landmark, Phone, TrendingDown, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { useLoad } from '@/lib/useLoad';
import { getOverview, listAllTransactions } from '@/services/admin';
import { usd } from '@/components/admin/AdminList';
import { MoneyChart } from '@/components/admin/MoneyChart';
import { Card, LoadError, PageTitle, SectionTitle, TestNote, formatDateTime } from '@/components/app/ui';
import { cn } from '@/lib/utils';

async function load() {
  const [overview, latest] = await Promise.all([getOverview(), listAllTransactions('', '', 6)]);
  return { overview, latest: latest.items };
}

function Stat({
  to,
  icon: Icon,
  label,
  value,
  note,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 flex-col rounded-3xl border border-line bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-char/15 hover:shadow-[0_24px_48px_-30px_rgba(18,16,14,0.4)]"
    >
      <span className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent-ink">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-char" />
      </span>
      <span className="micro mt-5 text-muted">{label}</span>
      <span className="mt-1.5 truncate font-serif text-[1.875rem] leading-none tracking-[-0.02em] text-char">{value}</span>
      <span className="mt-2 text-[13px] leading-snug text-muted">{note}</span>
    </Link>
  );
}

const plural = (count: number, one: string, many: string) => `${count.toLocaleString('en-US')} ${count === 1 ? one : many}`;

export default function AdminOverview() {
  const { data, loading, error, reload } = useLoad(load);
  const o = data?.overview;
  const dash = '…';

  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Business overview"
        intro="Everything customers have done, across every account."
      />

      <TestNote>
        Top-ups are test funds, not real payments, so the money figures here are not income yet.
      </TestNote>

      {error && <LoadError message={error} onRetry={reload} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          to="/admin/transactions"
          icon={TrendingUp}
          label="Topped up, all time"
          value={o ? usd(o.topups) : dash}
          note={o ? `${plural(o.transactions, 'transaction', 'transactions')} in total` : 'Money added to wallets'}
        />
        <Stat
          to="/admin/transactions"
          icon={TrendingDown}
          label="Spent, all time"
          value={o ? usd(o.spend) : dash}
          note={o ? `${usd(o.spendNumbers)} on numbers, ${usd(o.spendProxies)} on proxies` : 'On numbers and proxies'}
        />
        <Stat
          to="/admin/customers"
          icon={Landmark}
          label="Held in wallets"
          value={o ? usd(o.walletTotal) : dash}
          note="Unspent balance across all customers"
        />
        <Stat
          to="/admin/customers"
          icon={Users}
          label="Customers"
          value={o ? o.customers.toLocaleString('en-US') : dash}
          note={
            o
              ? `${o.customersThisWeek} new in the last 7 days${o.demoAccounts > 0 ? `, plus ${plural(o.demoAccounts, 'demo account', 'demo accounts')}` : ''}`
              : 'Accounts with an email address'
          }
        />
        <Stat
          to="/admin/numbers"
          icon={Phone}
          label="Numbers rented"
          value={o ? o.numbersActive.toLocaleString('en-US') : dash}
          note={o ? `${o.numbersDue} with payment due, ${o.numbersInStock} still in stock` : 'Active right now'}
        />
        <Stat
          to="/admin/proxies"
          icon={Globe}
          label="Active proxy plans"
          value={o ? o.proxyPlansActive.toLocaleString('en-US') : dash}
          note={
            o
              ? `${o.proxyGbActive.toLocaleString('en-US')} GB sold (${o.proxyGbUsed.toLocaleString('en-US')} used), ${plural(o.proxyIpsActive, 'IP address', 'IP addresses')}`
              : 'Bandwidth and addresses'
          }
        />
        <Stat
          to="/admin/messages"
          icon={Inbox}
          label="Contact messages"
          value={o ? o.contactMessages.toLocaleString('en-US') : dash}
          note={o ? `${o.contactMessagesThisWeek} in the last 7 days` : 'From the contact form'}
        />
        <Stat
          to="/admin/messages"
          icon={Users}
          label="Newsletter"
          value={o ? o.subscribers.toLocaleString('en-US') : dash}
          note="People signed up for product news"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <SectionTitle>Money in and out, last 14 days</SectionTitle>
          {o ? (
            <MoneyChart days={o.daily} />
          ) : (
            <div className={cn('h-[280px] rounded-2xl bg-char/[0.05]', loading && 'animate-pulse')} aria-busy={loading} />
          )}
        </Card>

        <Card>
          <SectionTitle
            aside={
              <Link
                to="/admin/transactions"
                className="text-[13px] font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
              >
                See all
              </Link>
            }
          >
            Latest activity
          </SectionTitle>
          {loading && !data ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="h-12 animate-pulse rounded-xl bg-char/[0.05]" />
              ))}
            </div>
          ) : data && data.latest.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.latest.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-char">{item.description}</span>
                    <span className="block truncate text-xs text-muted">
                      {item.email ?? 'Demo account'} · {formatDateTime(item.createdAt)}
                    </span>
                  </span>
                  <span className={cn('shrink-0 font-mono text-[13px]', item.amount > 0 ? 'text-[#0f6b45]' : 'text-char')}>
                    {item.amount > 0 ? '+' : ''}
                    {usd(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-paper px-4 py-8 text-center text-[15px] text-muted">
              No activity yet. It appears here as soon as a customer adds funds.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

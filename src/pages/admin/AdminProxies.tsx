import { Globe } from 'lucide-react';
import { proxyProducts, type ProxyKind } from '@/data/pricing';
import { listAllProxyPlans, type AdminProxyPlan } from '@/services/admin';
import { AdminList, OwnerCell, usd, utc, type Column, type CsvColumn } from '@/components/admin/AdminList';
import { PageTitle, Pill, TestNote, daysUntil, formatDate } from '@/components/app/ui';

type State = 'active' | 'expired' | '';

const NAME = Object.fromEntries(proxyProducts.map((p) => [p.kind, p.name])) as Record<ProxyKind, string>;

const gb = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });

function bought(row: AdminProxyPlan): string {
  return row.unit === 'gb' ? `${row.quantity} GB` : `${row.quantity} ${row.quantity === 1 ? 'IP' : 'IPs'}`;
}

/** Bandwidth left on a per-GB plan. Per-IP plans are unmetered, so they have no balance. */
function remainingGb(row: AdminProxyPlan): number | null {
  return row.unit === 'gb' ? Math.max(0, row.quantity - row.usedMb / 1024) : null;
}

function Balance({ row }: { row: AdminProxyPlan }) {
  const left = remainingGb(row);
  if (left === null) return <span className="text-muted">Unmetered</span>;
  const share = Math.min(100, (row.usedMb / 1024 / row.quantity) * 100);
  return (
    <span className="block min-w-[150px]">
      <span className="block whitespace-nowrap">
        <span className="font-medium">{gb(left)} GB left</span>
        <span className="text-muted"> · {gb(row.usedMb / 1024)} used</span>
      </span>
      <span
        className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#fbd9cc]"
        role="progressbar"
        aria-label="Bandwidth used"
        aria-valuemin={0}
        aria-valuemax={row.quantity}
        aria-valuenow={Number((row.usedMb / 1024).toFixed(2))}
      >
        <span className="block h-full rounded-full bg-accent-deep" style={{ width: `${share}%` }} />
      </span>
    </span>
  );
}

function state(row: AdminProxyPlan): { label: string; tone: 'good' | 'warn' | 'neutral' } {
  if (!row.active) return { label: 'Expired', tone: 'neutral' };
  const days = daysUntil(row.expiresAt);
  return days <= 5 ? { label: `${days}d left`, tone: 'warn' } : { label: `${days}d left`, tone: 'good' };
}

const columns: Column<AdminProxyPlan>[] = [
  {
    header: 'Plan',
    cell: (row) => (
      <span className="block whitespace-nowrap">
        <span className="block font-medium">{NAME[row.kind] ?? row.kind}</span>
        <span className="block font-mono text-xs text-muted">{row.username}</span>
      </span>
    ),
  },
  { header: 'Customer', cell: (row) => <OwnerCell owner={row} />, className: 'max-w-[220px]' },
  { header: 'Bought', cell: (row) => <span className="whitespace-nowrap">{bought(row)}</span> },
  { header: 'Balance', cell: (row) => <Balance row={row} /> },
  { header: 'Status', cell: (row) => <Pill tone={state(row).tone}>{state(row).label}</Pill>, from: 'md' },
  { header: 'Expires', cell: (row) => <span className="whitespace-nowrap text-muted">{formatDate(row.expiresAt)}</span>, from: 'lg' },
  { header: 'Paid', align: 'right', cell: (row) => <span className="font-mono">{usd(row.price)}</span> },
];

const csv: CsvColumn<AdminProxyPlan>[] = [
  { header: 'Network', value: (row) => NAME[row.kind] ?? row.kind },
  { header: 'Proxy username', value: (row) => row.username },
  { header: 'Customer email', value: (row) => row.email ?? 'Demo account' },
  { header: 'Customer name', value: (row) => row.fullName },
  { header: 'Bought', value: bought },
  { header: 'Used (GB)', value: (row) => (row.unit === 'gb' ? (row.usedMb / 1024).toFixed(2) : '') },
  { header: 'Remaining (GB)', value: (row) => remainingGb(row)?.toFixed(2) ?? '' },
  { header: 'Status', value: (row) => (row.active ? 'Active' : 'Expired') },
  { header: 'Bought on (UTC)', value: (row) => utc(row.purchasedAt) },
  { header: 'Expires (UTC)', value: (row) => utc(row.expiresAt) },
  { header: 'Paid (USD)', value: (row) => row.price.toFixed(2) },
];

export default function AdminProxies() {
  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Proxies"
        intro="Every proxy plan with its balance: what was bought, what has been used and what is left."
      />
      <AdminList<AdminProxyPlan, State>
        load={listAllProxyPlans}
        columns={columns}
        rowKey={(row) => row.id}
        caption="All proxy plans"
        searchPlaceholder="Search email, name, network or username"
        filterLabel="Status"
        filters={[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'expired', label: 'Expired' },
        ]}
        csv={csv}
        csvName="globyx-proxy-plans"
        empty={{
          icon: Globe,
          title: 'No proxy plans yet',
          body: 'When a customer buys bandwidth or addresses, the plan and its balance are listed here.',
        }}
      />
      <TestNote>
        No proxy provider is connected yet, so usage stays at zero and every balance shows the full amount bought.
      </TestNote>
    </div>
  );
}

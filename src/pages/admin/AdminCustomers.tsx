import { Users } from 'lucide-react';
import { listCustomers, type AdminCustomer } from '@/services/admin';
import { AdminList, usd, utc, type Column, type CsvColumn } from '@/components/admin/AdminList';
import { PageTitle, Pill, formatDate } from '@/components/app/ui';

const columns: Column<AdminCustomer>[] = [
  {
    header: 'Customer',
    className: 'max-w-[260px]',
    cell: (row) => (
      <span className="block min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{row.fullName || (row.isDemo ? 'Demo account' : 'No name given')}</span>
          {row.isAdmin && <Pill tone="accent">Admin</Pill>}
          {row.isDemo && <Pill>Demo</Pill>}
        </span>
        <span className="block truncate text-xs text-muted">
          {row.email ?? 'No email address'}
          {row.company ? ` · ${row.company}` : ''}
        </span>
      </span>
    ),
  },
  { header: 'Joined', cell: (row) => <span className="whitespace-nowrap text-muted">{formatDate(row.createdAt)}</span>, from: 'md' },
  {
    header: 'Last seen',
    cell: (row) => <span className="whitespace-nowrap text-muted">{row.lastSignInAt ? formatDate(row.lastSignInAt) : 'Never'}</span>,
    from: 'xl',
  },
  { header: 'Numbers', align: 'right', cell: (row) => row.numbers, from: 'lg' },
  { header: 'Proxy plans', align: 'right', cell: (row) => row.proxyPlans, from: 'lg' },
  { header: 'Topped up', align: 'right', cell: (row) => <span className="font-mono text-muted">{usd(row.topups)}</span>, from: 'md' },
  { header: 'Spent', align: 'right', cell: (row) => <span className="font-mono text-muted">{usd(row.spend)}</span> },
  { header: 'Wallet', align: 'right', cell: (row) => <span className="font-mono font-medium">{usd(row.balance)}</span> },
];

const csv: CsvColumn<AdminCustomer>[] = [
  { header: 'Email', value: (row) => row.email ?? '' },
  { header: 'Name', value: (row) => row.fullName },
  { header: 'Company', value: (row) => row.company },
  { header: 'Account type', value: (row) => (row.isAdmin ? 'Admin' : row.isDemo ? 'Demo' : 'Customer') },
  { header: 'Joined (UTC)', value: (row) => utc(row.createdAt) },
  { header: 'Last seen (UTC)', value: (row) => utc(row.lastSignInAt) },
  { header: 'Active numbers', value: (row) => row.numbers },
  { header: 'Active proxy plans', value: (row) => row.proxyPlans },
  { header: 'Topped up (USD)', value: (row) => row.topups.toFixed(2) },
  { header: 'Spent (USD)', value: (row) => row.spend.toFixed(2) },
  { header: 'Wallet balance (USD)', value: (row) => row.balance.toFixed(2) },
];

export default function AdminCustomers() {
  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Customers"
        intro="Every account, with what it holds, what it has paid in and what is left in its wallet."
      />
      <AdminList<AdminCustomer>
        load={(search, _filter, limit) => listCustomers(search, limit)}
        columns={columns}
        rowKey={(row) => row.id}
        caption="All customers"
        searchPlaceholder="Search email, name or company"
        csv={csv}
        csvName="globyx-customers"
        empty={{
          icon: Users,
          title: 'No customers yet',
          body: 'Accounts appear here as soon as someone signs up on the site.',
        }}
      />
    </div>
  );
}

import { Phone } from 'lucide-react';
import { countryByCode, NUMBER_TYPE_LABEL } from '@/data/countries';
import { listAllNumbers, type AdminNumber } from '@/services/admin';
import { AdminList, OwnerCell, usd, utc, type Column, type CsvColumn } from '@/components/admin/AdminList';
import { PageTitle, Pill, daysUntil, formatDate } from '@/components/app/ui';
import { Flag } from '@/components/ui/Flag';

type Status = 'active' | 'released' | '';

function state(row: AdminNumber): { label: string; tone: 'good' | 'bad' | 'warn' | 'neutral' } {
  if (row.status === 'released') return { label: 'Released', tone: 'neutral' };
  const days = daysUntil(row.renewsAt);
  if (days <= 0) return { label: 'Payment due', tone: 'bad' };
  if (days <= 5) return { label: `Due in ${days}d`, tone: 'warn' };
  return { label: 'Active', tone: 'good' };
}

const columns: Column<AdminNumber>[] = [
  {
    header: 'Number',
    cell: (row) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <Flag code={row.country} />
        <span className="font-mono text-sm">{row.number}</span>
      </span>
    ),
  },
  { header: 'Customer', cell: (row) => <OwnerCell owner={row} />, className: 'max-w-[220px]' },
  {
    header: 'Where and type',
    cell: (row) => (
      <span className="text-muted">
        {countryByCode[row.country]?.name ?? row.country} · {row.city} · {NUMBER_TYPE_LABEL[row.type]}
      </span>
    ),
    from: 'lg',
  },
  { header: 'Status', cell: (row) => <Pill tone={state(row).tone}>{state(row).label}</Pill> },
  {
    header: 'Paid until',
    cell: (row) => (
      <span className="whitespace-nowrap text-muted">
        {row.status === 'released' && row.releasedAt ? `Released ${formatDate(row.releasedAt)}` : formatDate(row.renewsAt)}
      </span>
    ),
    from: 'md',
  },
  { header: 'Texts', align: 'right', cell: (row) => row.messages, from: 'xl' },
  { header: 'Per month', align: 'right', cell: (row) => <span className="font-mono">{usd(row.monthly)}</span> },
];

const csv: CsvColumn<AdminNumber>[] = [
  { header: 'Number', value: (row) => row.number },
  { header: 'Country', value: (row) => countryByCode[row.country]?.name ?? row.country },
  { header: 'City', value: (row) => row.city },
  { header: 'Type', value: (row) => NUMBER_TYPE_LABEL[row.type] },
  { header: 'Customer email', value: (row) => row.email ?? 'Demo account' },
  { header: 'Customer name', value: (row) => row.fullName },
  { header: 'Label', value: (row) => row.label },
  { header: 'Status', value: (row) => state(row).label },
  { header: 'Rented on (UTC)', value: (row) => utc(row.purchasedAt) },
  { header: 'Paid until (UTC)', value: (row) => utc(row.renewsAt) },
  { header: 'Released on (UTC)', value: (row) => utc(row.releasedAt) },
  { header: 'Texts received', value: (row) => row.messages },
  { header: 'Per month (USD)', value: (row) => row.monthly.toFixed(2) },
];

type NumberPage = Awaited<ReturnType<typeof listAllNumbers>>;

export default function AdminNumbers() {
  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Numbers"
        intro="Every number customers have rented: who holds it, what it earns and when it is due."
      />
      <AdminList<AdminNumber, Status, NumberPage>
        load={listAllNumbers}
        columns={columns}
        rowKey={(row) => row.id}
        caption="All rented numbers"
        searchPlaceholder="Search email, name, digits or city"
        filterLabel="Status"
        filters={[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'released', label: 'Released' },
        ]}
        summary={(page) => (
          <>
            Active numbers here bring in <span className="font-mono font-medium">{usd(page.monthly)}</span> a month
          </>
        )}
        csv={csv}
        csvName="globyx-numbers"
        empty={{
          icon: Phone,
          title: 'No numbers rented yet',
          body: 'When a customer rents a number it is listed here with its owner and renewal date.',
        }}
      />
    </div>
  );
}

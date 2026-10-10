import { ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionKind } from '@/services/account';
import { listAllTransactions, type AdminTransaction } from '@/services/admin';
import { AdminList, OwnerCell, usd, utc, type Column, type CsvColumn } from '@/components/admin/AdminList';
import { PageTitle, Pill, formatDateTime } from '@/components/app/ui';

const KIND: Record<TransactionKind, { label: string; tone: 'good' | 'neutral' | 'accent' | 'warn' }> = {
  topup: { label: 'Top-up', tone: 'good' },
  number: { label: 'Number', tone: 'accent' },
  renewal: { label: 'Renewal', tone: 'accent' },
  proxy: { label: 'Proxy', tone: 'neutral' },
  refund: { label: 'Refund', tone: 'warn' },
};

const METHOD = { mpesa: 'M-Pesa', card: 'Card', crypto: 'Crypto' } as const;

const paidWith = (row: AdminTransaction) => (row.method ? METHOD[row.method] : 'Wallet');

const columns: Column<AdminTransaction>[] = [
  { header: 'Date', cell: (row) => <span className="whitespace-nowrap text-muted">{formatDateTime(row.createdAt)}</span> },
  { header: 'Customer', cell: (row) => <OwnerCell owner={row} />, className: 'max-w-[220px]' },
  { header: 'Description', cell: (row) => row.description, from: 'md' },
  { header: 'Type', cell: (row) => <Pill tone={KIND[row.kind].tone}>{KIND[row.kind].label}</Pill> },
  { header: 'Paid with', cell: (row) => <span className="text-muted">{paidWith(row)}</span>, from: 'xl' },
  {
    header: 'Amount',
    align: 'right',
    cell: (row) => (
      <span className={cn('font-mono whitespace-nowrap', row.amount > 0 ? 'text-[#0f6b45]' : 'text-char')}>
        {row.amount > 0 ? '+' : ''}
        {usd(row.amount)}
      </span>
    ),
  },
  {
    header: 'Balance after',
    align: 'right',
    cell: (row) => <span className="font-mono whitespace-nowrap text-muted">{usd(row.balanceAfter)}</span>,
    from: 'lg',
  },
];

const csv: CsvColumn<AdminTransaction>[] = [
  { header: 'Date (UTC)', value: (row) => utc(row.createdAt) },
  { header: 'Customer email', value: (row) => row.email ?? 'Demo account' },
  { header: 'Customer name', value: (row) => row.fullName },
  { header: 'Type', value: (row) => KIND[row.kind].label },
  { header: 'Description', value: (row) => row.description },
  { header: 'Paid with', value: paidWith },
  { header: 'Amount (USD)', value: (row) => row.amount.toFixed(2) },
  { header: 'Balance after (USD)', value: (row) => row.balanceAfter.toFixed(2) },
  { header: 'Transaction id', value: (row) => row.id },
];

type TransactionPage = Awaited<ReturnType<typeof listAllTransactions>>;

export default function AdminTransactions() {
  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Transactions"
        intro="Every top-up and purchase, across all customers, newest first."
      />
      <AdminList<AdminTransaction, TransactionKind | '', TransactionPage>
        load={listAllTransactions}
        columns={columns}
        rowKey={(row) => row.id}
        caption="All transactions"
        searchPlaceholder="Search email, name or description"
        filterLabel="Type"
        filters={[
          { value: '', label: 'All' },
          { value: 'topup', label: 'Top-ups' },
          { value: 'number', label: 'Numbers' },
          { value: 'renewal', label: 'Renewals' },
          { value: 'proxy', label: 'Proxies' },
        ]}
        summary={(page) => (
          <>
            Net of these {page.total}: <span className="font-mono font-medium">{usd(page.sum)}</span>
          </>
        )}
        csv={csv}
        csvName="globyx-transactions"
        empty={{
          icon: ReceiptText,
          title: 'No transactions yet',
          body: 'Top-ups and purchases appear here as soon as customers make them.',
        }}
      />
    </div>
  );
}

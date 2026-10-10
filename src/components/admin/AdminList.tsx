import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Download, Search, type LucideIcon } from 'lucide-react';
import { friendlyError } from '@/lib/errors';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import type { Owner, Page } from '@/services/admin';
import { Card, Empty, LoadError, SkeletonRows } from '@/components/app/ui';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';

const STEP = 50;
/** The most rows one request returns, and so the most a CSV download holds. */
const EXPORT_LIMIT = 500;

/** Admin figures are always shown in US dollars, the currency wallets are held in. */
export function usd(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** A timestamp for the CSV files, always in UTC whatever the database returns. */
export function utc(timestamp: string | null): string {
  return timestamp ? new Date(timestamp).toISOString() : '';
}

export function OwnerCell({ owner }: { owner: Owner }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate text-sm text-char">{owner.fullName || (owner.email ? '' : 'Demo account')}</span>
      <span className="block truncate text-xs text-muted">{owner.email ?? 'No email address'}</span>
    </span>
  );
}

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'right';
  /** Hide the column on narrow screens. */
  from?: 'md' | 'lg' | 'xl';
  className?: string;
}

/** One column of the CSV download. The file can hold more than the table shows. */
export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

const FROM: Record<NonNullable<Column<unknown>['from']>, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

/** Stops a spreadsheet from treating a cell that starts with = + - or @ as a formula. */
function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface AdminListProps<T, F extends string, P extends Page<T>> {
  /** Loads the newest `limit` rows that match. */
  load: (search: string, filter: F, limit: number) => Promise<P>;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  caption: string;
  searchPlaceholder: string;
  filters?: Array<{ value: F; label: string }>;
  filterLabel?: string;
  /** A line of totals shown above the table. */
  summary?: (page: P) => ReactNode;
  /** Columns and file name (without the date) for the CSV download. */
  csv?: CsvColumn<T>[];
  csvName?: string;
  empty: { icon: LucideIcon; title: string; body: string };
}

/** Searchable, filterable table used by every admin page. */
export function AdminList<T, F extends string = '', P extends Page<T> = Page<T>>({
  load,
  columns,
  rowKey,
  caption,
  searchPlaceholder,
  filters,
  filterLabel = 'Show',
  summary,
  csv,
  csvName,
  empty,
}: AdminListProps<T, F, P>) {
  const [typed, setTyped] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<F>((filters?.[0]?.value ?? '') as F);
  const [limit, setLimit] = useState(STEP);
  const [exporting, setExporting] = useState(false);

  // Wait until typing pauses before asking the database.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(typed.trim());
      setLimit(STEP);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [typed]);

  const { data, loading, error, reload } = useLoad(() => load(search, filter, limit), `${search}|${filter}|${limit}`);
  const searching = search !== '' || filter !== ((filters?.[0]?.value ?? '') as F);

  async function onExport() {
    if (!csv || !csvName) return;
    setExporting(true);
    try {
      const page = await load(search, filter, EXPORT_LIMIT);
      const lines = [
        csv.map((column) => csvCell(column.header)).join(','),
        ...page.items.map((row) => csv.map((column) => csvCell(column.value(row))).join(',')),
      ];
      download(`${csvName}-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\r\n'));
      toast.success('CSV downloaded', {
        description:
          page.total > page.items.length
            ? `The newest ${page.items.length} of ${page.total} rows. Narrow the search to get the rest.`
            : `${page.items.length} ${page.items.length === 1 ? 'row' : 'rows'}.`,
      });
    } catch (caught) {
      toast.error('Could not make the CSV', { description: friendlyError(caught) });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn(inputClass, 'h-10 pl-10')}
          />
        </label>
        {filters && (
          <div className="no-scrollbar -mx-1 max-w-full overflow-x-auto px-1">
            <Segmented<F>
              label={filterLabel}
              size="sm"
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setLimit(STEP);
              }}
              options={filters}
            />
          </div>
        )}
        {csv && csvName && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={exporting || !data || data.items.length === 0}
            className="ml-auto"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Preparing…' : 'Download CSV'}
          </Button>
        )}
      </div>

      {loading && !data ? (
        <SkeletonRows rows={4} className="[&>div]:h-14" />
      ) : error ? (
        <LoadError message={error} onRetry={reload} />
      ) : data && data.items.length > 0 ? (
        <Card className={cn('!p-0 transition-opacity', loading && 'opacity-60')}>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-3.5 sm:px-6">
            <p className="text-[13px] text-muted" aria-live="polite">
              Showing {data.items.length} of {data.total}
            </p>
            {summary && <p className="text-[13px] text-char">{summary(data)}</p>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <caption className="sr-only">{caption}</caption>
              <thead>
                <tr className="micro text-muted">
                  {columns.map((column) => (
                    <th
                      key={column.header}
                      scope="col"
                      className={cn(
                        'px-3 py-3 font-medium first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6',
                        column.align === 'right' && 'text-right',
                        column.from && FROM[column.from],
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((row) => (
                  <tr key={rowKey(row)} className="border-t border-line align-middle">
                    {columns.map((column) => (
                      <td
                        key={column.header}
                        className={cn(
                          'px-3 py-3 text-[13px] text-char first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6',
                          column.align === 'right' && 'text-right tabular-nums',
                          column.from && FROM[column.from],
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length < data.total && (
            <div className="border-t border-line p-4 text-center">
              {limit >= EXPORT_LIMIT ? (
                <p className="text-[13px] text-muted">
                  These are the newest {EXPORT_LIMIT}. Narrow the search to see older rows.
                </p>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setLimit((current) => current + STEP)} disabled={loading}>
                  {loading ? 'Loading…' : `Show ${Math.min(STEP, data.total - data.items.length)} more`}
                </Button>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Empty
          icon={empty.icon}
          title={searching ? 'Nothing matches' : empty.title}
          body={searching ? 'Try a different search, or clear the filter.' : empty.body}
        />
      )}
    </div>
  );
}

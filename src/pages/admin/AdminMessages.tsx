import { useEffect, useState } from 'react';
import { Inbox, Mail, Search } from 'lucide-react';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import { listContactMessages, listSubscribers, type AdminSubscriber } from '@/services/admin';
import { AdminList, type Column, type CsvColumn, utc } from '@/components/admin/AdminList';
import { Card, Empty, LoadError, PageTitle, Pill, SkeletonRows, formatDate, formatDateTime } from '@/components/app/ui';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';

const STEP = 25;

function ContactMessages() {
  const [typed, setTyped] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(STEP);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(typed.trim());
      setLimit(STEP);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [typed]);

  const { data, loading, error, reload } = useLoad(() => listContactMessages(search, limit), `${search}|${limit}`);

  return (
    <div className="space-y-4">
      <label className="relative block w-full sm:w-72">
        <span className="sr-only">Search messages</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="Search name, email, topic or text"
          className={cn(inputClass, 'h-10 pl-10')}
        />
      </label>

      {loading && !data ? (
        <SkeletonRows rows={3} className="[&>div]:h-28 [&>div]:rounded-3xl" />
      ) : error ? (
        <LoadError message={error} onRetry={reload} />
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-[13px] text-muted" aria-live="polite">
            Showing {data.items.length} of {data.total}
          </p>
          <ul className={cn('space-y-3 transition-opacity', loading && 'opacity-60')}>
            {data.items.map((message) => (
              <li key={message.id}>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[15px] font-medium text-char">{message.name}</span>
                      <Pill tone="accent">{message.topic}</Pill>
                    </div>
                    <span className="text-xs text-muted">{formatDateTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-3 max-w-3xl text-[15px] leading-relaxed whitespace-pre-wrap text-char">{message.message}</p>
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: your message to Globyx (${message.topic})`)}`}
                    className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
                  >
                    <Mail className="h-4 w-4" />
                    Reply to {message.email}
                  </a>
                </Card>
              </li>
            ))}
          </ul>
          {data.items.length < data.total && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={() => setLimit((current) => current + STEP)} disabled={loading}>
                {loading ? 'Loading…' : 'Show more'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Empty
          icon={Inbox}
          title={search ? 'Nothing matches' : 'No messages yet'}
          body={search ? 'Try a different search.' : 'Messages sent from the contact page arrive here.'}
        />
      )}
    </div>
  );
}

const subscriberColumns: Column<AdminSubscriber>[] = [
  { header: 'Email', cell: (row) => row.email },
  { header: 'Signed up', align: 'right', cell: (row) => <span className="text-muted">{formatDate(row.createdAt)}</span> },
];

const subscriberCsv: CsvColumn<AdminSubscriber>[] = [
  { header: 'Email', value: (row) => row.email },
  { header: 'Signed up (UTC)', value: (row) => utc(row.createdAt) },
];

export default function AdminMessages() {
  const [view, setView] = useState<'contact' | 'newsletter'>('contact');

  return (
    <div className="space-y-8">
      <PageTitle
        label="Admin"
        title="Messages"
        intro="What people have sent through the contact form, and who has asked for product news."
      />

      <Segmented<'contact' | 'newsletter'>
        label="Which list"
        value={view}
        onChange={setView}
        options={[
          { value: 'contact', label: 'Contact form' },
          { value: 'newsletter', label: 'Newsletter' },
        ]}
      />

      {view === 'contact' ? (
        <ContactMessages />
      ) : (
        <AdminList<AdminSubscriber>
          load={(search, _filter, limit) => listSubscribers(search, limit)}
          columns={subscriberColumns}
          rowKey={(row) => row.email}
          caption="Newsletter subscribers"
          searchPlaceholder="Search email"
          csv={subscriberCsv}
          csvName="globyx-newsletter"
          empty={{
            icon: Mail,
            title: 'No subscribers yet',
            body: 'People who sign up in the site footer are listed here.',
          }}
        />
      )}
    </div>
  );
}

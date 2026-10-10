import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Inbox, MessageSquarePlus, Pencil, Phone, Plus, RefreshCw, SearchX, Trash2 } from 'lucide-react';
import { countryByCode, NUMBER_TYPE_LABEL, type CountryCode, type NumberType } from '@/data/countries';
import { useCurrency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import {
  deleteMessage,
  listMessages,
  listMyNumbers,
  markMessagesRead,
  releaseNumber,
  renameNumber,
  renewNumber,
  rentNumber,
  sendTestMessage,
  type RentedNumber,
} from '@/services/account';
import { defaultNumberFilters, getNumber, listNumbers, type CatalogueNumber } from '@/services/catalog';
import { useAccount } from '@/components/app/AppShell';
import {
  ConfirmDialog,
  CopyButton,
  Empty,
  LoadError,
  Modal,
  PageTitle,
  Pill,
  SkeletonRows,
  TestNote,
  daysUntil,
  formatDate,
  formatDateTime,
} from '@/components/app/ui';
import { Button, ButtonLink } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { inputClass } from '@/components/ui/Field';
import { Flag } from '@/components/ui/Flag';
import { Segmented } from '@/components/ui/Segmented';

/* ------------------------------ Renting ------------------------------ */

function RentConfirm({
  item,
  onBack,
  onRented,
}: {
  item: CatalogueNumber;
  onBack?: () => void;
  onRented: () => void;
}) {
  const { format } = useCurrency();
  const { balance, refreshBalance } = useAccount();
  const [busy, setBusy] = useState(false);
  const total = item.monthly + item.setupFee;
  const short = balance !== null && balance < total;

  async function onRent() {
    setBusy(true);
    try {
      await rentNumber(item.id);
      await refreshBalance();
      toast.success('Number rented', { description: 'It is on your account now, with its full digits.' });
      onRented();
    } catch (error) {
      toast.error('Could not rent this number', { description: friendlyError(error) });
      setBusy(false);
    }
  }

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-char"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the list
        </button>
      )}
      <div className="rounded-2xl bg-paper p-4">
        <div className="flex items-center gap-3">
          <Flag code={item.country} />
          <span className="font-mono text-[17px] text-char">{item.masked}</span>
        </div>
        <p className="mt-1.5 text-[13px] text-muted">
          {countryByCode[item.country].name} · {item.city} · {NUMBER_TYPE_LABEL[item.type]}
        </p>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">First month</dt>
          <dd className="text-char">{format(item.monthly)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Setup fee</dt>
          <dd className="text-char">{item.setupFee > 0 ? format(item.setupFee) : 'None'}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-2.5 text-[15px] font-medium">
          <dt className="text-char">Due now</dt>
          <dd className="text-char">{format(total)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Wallet balance</dt>
          <dd className={short ? 'text-[#a3271d]' : 'text-char'}>{balance === null ? '…' : format(balance)}</dd>
        </div>
      </dl>

      {short ? (
        <div className="mt-5">
          <p role="alert" className="rounded-2xl bg-[#fdf3f1] px-4 py-3 text-[13px] text-[#8f2a22]">
            You need {format(total - (balance ?? 0))} more in your wallet to rent this number.
          </p>
          <ButtonLink to="/app/wallet?add=1" className="mt-4 w-full">
            Add funds
          </ButtonLink>
        </div>
      ) : (
        <Button className="mt-5 w-full" onClick={onRent} disabled={busy || balance === null}>
          {busy ? 'Renting…' : `Rent for ${format(total)}`}
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted">
        Renews monthly from your wallet when you choose. Use is covered by the{' '}
        <Link to="/legal/acceptable-use" className="underline underline-offset-2 hover:text-char">
          Acceptable Use Policy
        </Link>
        .
      </p>
    </div>
  );
}

function BrowseDialog({
  open,
  initial,
  onClose,
  onRented,
}: {
  open: boolean;
  /** A number chosen on the public catalogue before signing in. */
  initial: CatalogueNumber | null;
  onClose: () => void;
  onRented: () => void;
}) {
  const { format } = useCurrency();
  const [country, setCountry] = useState<CountryCode | 'all'>('all');
  const [type, setType] = useState<NumberType | 'all'>('all');
  const [chosen, setChosen] = useState<CatalogueNumber | null>(null);
  const { data, loading, error, reload } = useLoad(
    () => (open ? listNumbers({ ...defaultNumberFilters, country, type }) : Promise.resolve([])),
    `${open}-${country}-${type}`,
  );

  useEffect(() => {
    if (open) setChosen(initial);
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide={!chosen}
      label="Get a number"
      title={chosen ? 'Confirm your number' : 'Choose a number'}
      description={
        chosen
          ? 'The full number is shown as soon as it is yours.'
          : 'These are in stock right now. Middle digits stay hidden until you rent.'
      }
    >
      {chosen ? (
        <RentConfirm
          item={chosen}
          onBack={() => setChosen(null)}
          onRented={() => {
            onRented();
            onClose();
          }}
        />
      ) : (
        <div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <CountrySelect label="Country" allowAll value={country} onChange={setCountry} />
            <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
              <Segmented<NumberType | 'all'>
                label="Number type"
                size="sm"
                value={type}
                onChange={setType}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'local', label: 'Local' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'tollfree', label: 'Toll-free' },
                ]}
              />
            </div>
          </div>

          <div className="mt-4 max-h-[min(420px,52svh)] overflow-y-auto rounded-2xl border border-line">
            {loading ? (
              <div className="space-y-px" aria-busy="true">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="h-[62px] animate-pulse bg-char/[0.04]" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4">
                <LoadError message={error} onRetry={reload} />
              </div>
            ) : data && data.length > 0 ? (
              <ul className="divide-y divide-line">
                {data.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <Flag code={item.country} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-sm text-char">{item.masked}</span>
                      <span className="block truncate text-xs text-muted">
                        {item.city} · {NUMBER_TYPE_LABEL[item.type]}
                        {item.sms ? ' · SMS' : ''}
                        {item.mms ? ' · MMS' : ''}
                      </span>
                      <span className="block text-xs font-medium text-char sm:hidden">{format(item.monthly)} per month</span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      <span className="block text-sm font-medium text-char">{format(item.monthly)}</span>
                      <span className="block text-[11px] text-muted">per month</span>
                    </span>
                    <Button variant="dark" size="sm" onClick={() => setChosen(item)} aria-label={`Choose ${item.masked}`}>
                      Choose
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <SearchX className="h-6 w-6 text-muted" />
                <p className="mt-3 text-[15px] text-char">No numbers in stock for that choice</p>
                <p className="mt-1 text-[13px] text-muted">Try another country or number type.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------ Inbox ------------------------------ */

function InboxDialog({ number, onClose, onChanged }: { number: RentedNumber | null; onClose: () => void; onChanged: () => void }) {
  const numberId = number?.id ?? '';
  const { data, loading, error, reload } = useLoad(
    () => (numberId ? listMessages(numberId) : Promise.resolve([])),
    numberId,
  );
  const [sending, setSending] = useState(false);

  // Opening the inbox marks everything in it as read. The ref makes sure each
  // batch of new messages is only reported once.
  const reported = useRef('');
  useEffect(() => {
    const unread = (data ?? []).filter((message) => !message.read).map((message) => message.id);
    const signature = `${numberId}:${unread.join(',')}`;
    if (!numberId || unread.length === 0 || reported.current === signature) return;
    reported.current = signature;
    markMessagesRead(numberId).then(onChanged, () => undefined);
  }, [numberId, data, onChanged]);

  async function onSendTest() {
    setSending(true);
    try {
      await sendTestMessage(numberId);
      await reload();
      onChanged();
    } catch (caught) {
      toast.error('Could not send a test message', { description: friendlyError(caught) });
    } finally {
      setSending(false);
    }
  }

  async function onDelete(messageId: string) {
    try {
      await deleteMessage(messageId);
      await reload();
    } catch (caught) {
      toast.error('Could not delete the message', { description: friendlyError(caught) });
    }
  }

  return (
    <Modal
      open={Boolean(number)}
      onClose={onClose}
      wide
      label="Inbox"
      title={number?.number ?? ''}
      description="Text messages sent to this number, newest first."
    >
      {number && !number.sms ? (
        <p className="rounded-2xl bg-paper px-4 py-8 text-center text-[15px] text-muted">
          This number takes calls only. It cannot receive text messages.
        </p>
      ) : (
        <>
          <div className="max-h-[min(380px,48svh)] overflow-y-auto">
            {loading ? (
              <SkeletonRows rows={2} />
            ) : error ? (
              <LoadError message={error} onRetry={reload} />
            ) : data && data.length > 0 ? (
              <ul className="space-y-2.5">
                {data.map((message) => (
                  <li key={message.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-char">
                        {message.sender}
                        {!message.read && <Pill tone="accent">New</Pill>}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        {formatDateTime(message.receivedAt)}
                        <button
                          type="button"
                          onClick={() => onDelete(message.id)}
                          aria-label={`Delete message from ${message.sender}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-char/[0.06] hover:text-[#a3271d]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </span>
                    </div>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-char">{message.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-paper px-4 py-10 text-center text-[15px] text-muted">
                No messages yet. Send a test message to see how the inbox works.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TestNote className="sm:max-w-[60%]">
              Numbers are not connected to a carrier yet, so real texts cannot arrive.
            </TestNote>
            <Button variant="outline" onClick={onSendTest} disabled={sending} className="shrink-0">
              <MessageSquarePlus className="h-4 w-4" />
              {sending ? 'Sending…' : 'Send a test message'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------ Rename ------------------------------ */

function RenameDialog({ number, onClose, onSaved }: { number: RentedNumber | null; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (number) setLabel(number.label);
  }, [number]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!number) return;
    setBusy(true);
    try {
      await renameNumber(number.id, label);
      toast.success('Label saved');
      onSaved();
      onClose();
    } catch (caught) {
      toast.error('Could not save the label', { description: friendlyError(caught) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={Boolean(number)}
      onClose={onClose}
      title="Label this number"
      description="A short name only you see, such as “Support line” or “Nairobi office”."
    >
      <form onSubmit={onSubmit}>
        <label htmlFor="number-label" className="mb-1.5 block text-[13px] font-medium text-char">
          Label
        </label>
        <input
          id="number-label"
          value={label}
          maxLength={40}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Support line"
          className={cn(inputClass, 'h-11')}
        />
        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save label'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------ List ------------------------------ */

function NumberRow({
  item,
  onInbox,
  onRename,
  onRenew,
  onRelease,
}: {
  item: RentedNumber;
  onInbox: () => void;
  onRename: () => void;
  onRenew: () => void;
  onRelease: () => void;
}) {
  const { format } = useCurrency();
  const days = daysUntil(item.renewsAt);
  const expired = days <= 0;

  return (
    <li className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Flag code={item.country} />
            <span className="font-mono text-[19px] tracking-tight text-char">{item.number}</span>
            <CopyButton value={item.number.replace(/\s/g, '')} label="Number" className="-ml-1.5" />
            {expired ? (
              <Pill tone="bad">Payment due</Pill>
            ) : days <= 5 ? (
              <Pill tone="warn">Renews in {days} {days === 1 ? 'day' : 'days'}</Pill>
            ) : (
              <Pill tone="good">Active</Pill>
            )}
          </div>
          <p className="mt-2 text-[13px] text-muted">
            <button
              type="button"
              onClick={onRename}
              className="mr-2 inline-flex items-center gap-1.5 rounded-md font-medium text-char hover:text-accent-ink"
            >
              {item.label || 'Add a label'}
              <Pencil className="h-3 w-3" />
            </button>
            {countryByCode[item.country].name} · {item.city} · {NUMBER_TYPE_LABEL[item.type]} ·{' '}
            {[item.sms && 'SMS', item.voice && 'Voice', item.mms && 'MMS'].filter(Boolean).join(', ')}
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {format(item.monthly)} per month · {expired ? 'Was paid until' : 'Paid until'} {formatDate(item.renewsAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="dark" size="sm" onClick={onInbox}>
            <Inbox className="h-4 w-4" />
            Inbox
            {item.unread > 0 && (
              <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-ink">
                {item.unread}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={onRenew}>
            <RefreshCw className="h-3.5 w-3.5" />
            Renew
          </Button>
          <Button variant="outline" size="sm" onClick={onRelease} className="text-[#a3271d] hover:border-[#a3271d]/40">
            Release
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function MyNumbers() {
  const [params, setParams] = useSearchParams();
  const { format } = useCurrency();
  const { refreshBalance } = useAccount();
  const { data, loading, error, reload } = useLoad(listMyNumbers);

  const [browsing, setBrowsing] = useState(false);
  const [preselected, setPreselected] = useState<CatalogueNumber | null>(null);
  const [inbox, setInbox] = useState<RentedNumber | null>(null);
  const [renaming, setRenaming] = useState<RentedNumber | null>(null);
  const [renewing, setRenewing] = useState<RentedNumber | null>(null);
  const [releasing, setReleasing] = useState<RentedNumber | null>(null);

  // Links such as /app/numbers?browse=1 or ?rent=KE-local-0 open the dialog straight away.
  useEffect(() => {
    const rent = params.get('rent');
    const browse = params.get('browse');
    if (!rent && !browse) return;
    setParams(new URLSearchParams(), { replace: true });
    if (!rent) {
      setPreselected(null);
      setBrowsing(true);
      return;
    }
    getNumber(rent)
      .then((found) => {
        if (!found) toast.info('That number has just been taken', { description: 'Here is what is in stock now.' });
        setPreselected(found);
        setBrowsing(true);
      })
      .catch(() => {
        setPreselected(null);
        setBrowsing(true);
      });
  }, [params, setParams]);

  function openBrowser() {
    setPreselected(null);
    setBrowsing(true);
  }

  async function confirmRenew() {
    if (!renewing) return;
    try {
      await renewNumber(renewing.id);
      await Promise.all([reload(), refreshBalance()]);
      toast.success('Renewed for one more month');
      setRenewing(null);
    } catch (caught) {
      toast.error('Could not renew', { description: friendlyError(caught) });
    }
  }

  async function confirmRelease() {
    if (!releasing) return;
    try {
      await releaseNumber(releasing.id);
      await reload();
      toast.success('Number released');
      setReleasing(null);
    } catch (caught) {
      toast.error('Could not release the number', { description: friendlyError(caught) });
    }
  }

  return (
    <div className="space-y-8">
      <PageTitle
        label="Numbers"
        title="Your numbers"
        intro="Rent a number, read its messages, and renew or release it whenever you like."
        action={
          <Button onClick={openBrowser}>
            <Plus className="h-4 w-4" />
            Get a number
          </Button>
        }
      />

      {loading ? (
        <SkeletonRows rows={2} className="[&>div]:h-[132px] [&>div]:rounded-3xl" />
      ) : error ? (
        <LoadError message={error} onRetry={reload} />
      ) : data && data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((item) => (
            <NumberRow
              key={item.id}
              item={item}
              onInbox={() => setInbox(item)}
              onRename={() => setRenaming(item)}
              onRenew={() => setRenewing(item)}
              onRelease={() => setReleasing(item)}
            />
          ))}
        </ul>
      ) : (
        <Empty
          icon={Phone}
          title="No numbers yet"
          body="Pick a country and a number type. Your number is live as soon as you rent it."
          action={<Button onClick={openBrowser}>Get a number</Button>}
        />
      )}

      <TestNote>
        Numbers come from sample stock and are not connected to a phone network yet, so they cannot take real calls
        or texts.
      </TestNote>

      <BrowseDialog
        open={browsing}
        initial={preselected}
        onClose={() => setBrowsing(false)}
        onRented={() => void reload()}
      />
      <InboxDialog number={inbox} onClose={() => setInbox(null)} onChanged={() => void reload()} />
      <RenameDialog number={renaming} onClose={() => setRenaming(null)} onSaved={() => void reload()} />

      <ConfirmDialog
        open={Boolean(renewing)}
        onClose={() => setRenewing(null)}
        onConfirm={confirmRenew}
        title="Renew for one more month?"
        body={
          renewing
            ? `${format(renewing.monthly)} will be taken from your wallet and ${renewing.number} will be paid for one more month.`
            : ''
        }
        confirmLabel="Renew"
        busyLabel="Renewing…"
      />
      <ConfirmDialog
        open={Boolean(releasing)}
        onClose={() => setReleasing(null)}
        onConfirm={confirmRelease}
        title="Release this number?"
        body={
          releasing
            ? `${releasing.number} will leave your account straight away and go back on sale. You will no longer be able to read its messages, and the time left is not refunded.`
            : ''
        }
        confirmLabel="Release number"
        busyLabel="Releasing…"
        danger
      />
    </div>
  );
}

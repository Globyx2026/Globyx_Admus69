import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRound, Plus, ShieldCheck } from 'lucide-react';
import { friendlyError } from '@/lib/errors';
import { useLoad } from '@/lib/useLoad';
import { cn } from '@/lib/utils';
import { createApiKey, listApiKeys, revokeApiKey, type ApiKey } from '@/services/account';
import { Card, ConfirmDialog, CopyButton, Empty, LoadError, Modal, PageTitle, Pill, SkeletonRows, TestNote, formatDate } from '@/components/app/ui';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';

function CreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  function close() {
    setName('');
    setError('');
    setSecret(null);
    onClose();
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Give the key a name so you can recognise it later.');
      document.getElementById('key-name')?.focus();
      return;
    }
    setBusy(true);
    try {
      setSecret(await createApiKey(name));
      onCreated();
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      label="API keys"
      title={secret ? 'Copy your key now' : 'Create an API key'}
      description={
        secret
          ? 'This is the only time the full key is shown. We store a fingerprint of it, not the key itself.'
          : 'Use one key per app or server, so you can revoke one without breaking the others.'
      }
    >
      {secret ? (
        <div>
          <div className="flex items-center gap-2 rounded-2xl bg-ink p-2 pl-4 text-cream">
            <code className="min-w-0 flex-1 font-mono text-[13px] break-all">{secret}</code>
            <CopyButton value={secret} label="API key" className="text-cream/70 hover:bg-white/10 hover:text-cream" />
          </div>
          <p className="mt-3 flex items-start gap-2 text-[13px] text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f6b45]" />
            Keep it out of web pages and public code. Anyone who has it can act as you.
          </p>
          <Button className="mt-5 w-full" onClick={close}>
            I have saved it
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="key-name" className="mb-1.5 block text-[13px] font-medium text-char">
            Key name
          </label>
          <input
            id="key-name"
            value={name}
            maxLength={40}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
            placeholder="Production server"
            aria-invalid={Boolean(error)}
            aria-describedby="key-name-note"
            className={cn(inputClass, 'h-11')}
          />
          <p id="key-name-note" role={error ? 'alert' : undefined} className="mt-1.5 min-h-[1.125rem] text-[12.5px] text-[#c0322f]">
            {error}
          </p>
          <div className="mt-3 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create key'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function ApiKeys() {
  const { data, loading, error, reload } = useLoad(listApiKeys);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  async function confirmRevoke() {
    if (!revoking) return;
    try {
      await revokeApiKey(revoking.id);
      await reload();
      toast.success('Key revoked');
      setRevoking(null);
    } catch (caught) {
      toast.error('Could not revoke the key', { description: friendlyError(caught) });
    }
  }

  return (
    <div className="space-y-8">
      <PageTitle
        label="API keys"
        title="API keys"
        intro="Keys let your own software work with your Globyx account."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Create key
          </Button>
        }
      />

      {loading ? (
        <SkeletonRows rows={2} />
      ) : error ? (
        <LoadError message={error} onRetry={reload} />
      ) : data && data.length > 0 ? (
        <Card className="!p-0">
          <ul className="divide-y divide-line">
            {data.map((key) => (
              <li key={key.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 sm:px-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent-ink">
                  <KeyRound className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1 basis-44">
                  <span className={cn('block truncate text-[15px] font-medium', key.revokedAt ? 'text-muted' : 'text-char')}>
                    {key.name}
                  </span>
                  <span className="block font-mono text-xs text-muted">
                    {key.prefix}
                    {'•'.repeat(8)}
                  </span>
                </span>
                <span className="text-[13px] text-muted">Created {formatDate(key.createdAt)}</span>
                {key.revokedAt ? (
                  <Pill>Revoked {formatDate(key.revokedAt)}</Pill>
                ) : (
                  <>
                    <Pill tone="good">Active</Pill>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevoking(key)}
                      className="text-[#a3271d] hover:border-[#a3271d]/40"
                    >
                      Revoke
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Empty
          icon={KeyRound}
          title="No API keys yet"
          body="Create a key when you are ready to connect an app, a script or a server."
          action={<Button onClick={() => setCreating(true)}>Create key</Button>}
        />
      )}

      <TestNote>
        The public API is still a preview, so keys cannot make live requests yet. The{' '}
        <Link to="/developers" className="font-medium underline underline-offset-2">
          API docs
        </Link>{' '}
        show how it will work.
      </TestNote>

      <CreateDialog open={creating} onClose={() => setCreating(false)} onCreated={() => void reload()} />
      <ConfirmDialog
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        onConfirm={confirmRevoke}
        title="Revoke this key?"
        body={
          revoking
            ? `“${revoking.name}” will stop working straight away. This cannot be undone, but you can create a new key.`
            : ''
        }
        confirmLabel="Revoke key"
        busyLabel="Revoking…"
        danger
      />
    </div>
  );
}

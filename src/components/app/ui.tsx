/** Small building blocks shared by the dashboard pages. */
import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { Check, Copy, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/* ------------------------------ Layout ------------------------------ */

export function PageTitle({
  label,
  title,
  intro,
  action,
}: {
  label: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="micro text-accent-ink">{label}</p>
        <h1 className="mt-2 font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] tracking-[-0.02em] text-char">
          {title}
        </h1>
        {intro && <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2.5">{action}</div>}
    </header>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('min-w-0 rounded-3xl border border-line bg-white p-5 sm:p-6', className)}>{children}</div>;
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-serif text-[1.375rem] leading-tight tracking-[-0.015em] text-char">{children}</h2>
      {aside}
    </div>
  );
}

export function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent-ink">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="type-h3 mt-5 text-char">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2.5">{action}</div>}
    </div>
  );
}

/** Shown when a page could not load its data. */
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-3xl border border-[#f1c9c4] bg-[#fdf3f1] p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-3 text-[15px] text-[#8f2a22]">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
        {message}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function SkeletonRows({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-[76px] animate-pulse rounded-2xl border border-line bg-white" />
      ))}
    </div>
  );
}

type PillTone = 'neutral' | 'good' | 'warn' | 'bad' | 'accent';

const PILL: Record<PillTone, string> = {
  neutral: 'bg-char/[0.06] text-char',
  good: 'bg-[#dff5ea] text-[#0f6b45]',
  warn: 'bg-[#fff1cf] text-[#7a5200]',
  bad: 'bg-[#fde4e1] text-[#8f2a22]',
  accent: 'bg-accent/10 text-accent-ink',
};

export function Pill({ tone = 'neutral', children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={cn('micro inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 whitespace-nowrap', PILL[tone])}>
      {children}
    </span>
  );
}

/** A plain-language note that something is simulated. */
export function TestNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('rounded-2xl bg-[#fff6e0] px-4 py-3 text-[13px] leading-relaxed text-[#6b4a00]', className)}>
      <span className="font-semibold">Test mode. </span>
      {children}
    </p>
  );
}

/* ------------------------------ Dialogs ------------------------------ */

export function Modal({
  open,
  onClose,
  label,
  title,
  description,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] animate-fade-in bg-ink/60 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-[90] max-h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 animate-fade-in overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7',
            wide ? 'max-w-[640px]' : 'max-w-[460px]',
          )}
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-char/[0.06] hover:text-char"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          {label && <p className="micro text-accent-ink">{label}</p>}
          <Dialog.Title className={cn('type-h3 pr-10 text-char', label && 'mt-3')}>{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-[15px] leading-relaxed text-muted">{description}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Asks before doing something that cannot be undone. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  busyLabel,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  body: string;
  confirmLabel: string;
  busyLabel: string;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => undefined : onClose} title={title} description={body}>
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'dark' : 'primary'}
          onClick={run}
          disabled={busy}
          className={danger ? 'bg-[#a3271d] hover:bg-[#8a2018]' : undefined}
        >
          {busy ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------ Copy ------------------------------ */

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure pages: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const ok = await copyText(value);
    if (!ok) {
      toast.error('Could not copy', { description: 'Select the text and copy it manually.' });
      return;
    }
    setCopied(true);
    toast.success(`${label} copied`);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label.toLowerCase()}`}
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-char/[0.06] hover:text-char',
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4 text-[#0f6b45]" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

/* ------------------------------ Dates ------------------------------ */

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Whole days from now until the date. Negative once it has passed. */
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

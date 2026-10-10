import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowLeftRight,
  Globe,
  Inbox,
  LayoutDashboard,
  Menu,
  Phone,
  ReceiptText,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { UserBlock } from '@/components/app/AppShell';
import { Logo, LogoMark } from '@/components/layout/Logo';
import { ButtonLink } from '@/components/ui/Button';

const NAV: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/admin/numbers', label: 'Numbers', icon: Phone },
  { to: '/admin/proxies', label: 'Proxies', icon: Globe },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm transition-colors -outline-offset-2',
                isActive ? 'bg-white/[0.1] text-cream' : 'text-cream/60 hover:bg-white/[0.05] hover:text-cream',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-glow')} />
                {label}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function AdminBadge() {
  return (
    <span className="micro inline-flex items-center gap-1.5 rounded-full bg-glow/15 px-2.5 py-1 text-glow">
      <ShieldCheck className="h-3.5 w-3.5" />
      Admin
    </span>
  );
}

function CustomerViewLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      to="/app"
      onClick={onNavigate}
      className="flex h-10 items-center justify-center gap-2 rounded-full text-[13px] text-cream/75 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-cream"
    >
      <ArrowLeftRight className="h-4 w-4" />
      Customer dashboard
    </Link>
  );
}

function MobileBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 bg-ink px-4 text-cream lg:hidden">
      <Link to="/admin" aria-label="Admin home" className="inline-flex items-center gap-2 rounded-md">
        <LogoMark />
        <span className="font-serif text-xl leading-none font-semibold tracking-[-0.02em]">Globyx</span>
      </Link>
      <div className="flex items-center gap-2">
        <AdminBadge />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[70] animate-fade-in bg-ink/60 lg:hidden" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed inset-y-0 right-0 z-[75] flex w-[min(320px,88vw)] animate-fade-in flex-col gap-6 overflow-y-auto bg-ink p-5 text-cream lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Dialog.Title className="micro text-cream/50">Admin menu</Dialog.Title>
                <Dialog.Close
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <nav aria-label="Admin">
                <NavItems onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-auto space-y-5">
                <CustomerViewLink onNavigate={() => setOpen(false)} />
                <UserBlock />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}

function FullPage({ title, body, busy = false }: { title: string; body?: string; busy?: boolean }) {
  return (
    <div className="bg-night grid min-h-[100svh] place-items-center px-6 text-cream" aria-busy={busy}>
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <LogoMark className={cn('h-10 w-10', busy && 'animate-pulse')} />
        {busy ? (
          <p className="text-sm text-cream/60">{title}</p>
        ) : (
          <>
            <h1 className="type-h3">{title}</h1>
            {body && <p className="text-[15px] leading-relaxed text-cream/70">{body}</p>}
            <ButtonLink to="/app" className="mt-2">
              Go to your dashboard
            </ButtonLink>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The admin frame. Only accounts listed in the database's `admins` table get
 * in, and the database enforces that again on every request, so hiding this
 * screen is a convenience rather than the lock itself.
 */
export default function AdminShell() {
  const { loading, session, isAdmin, recovering } = useAuth();
  const location = useLocation();

  if (loading) return <FullPage busy title="Opening the admin dashboard…" />;
  if (recovering) return <Navigate to="/reset-password" replace />;
  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  if (isAdmin === null) return <FullPage busy title="Checking your access…" />;
  if (!isAdmin) {
    return (
      <FullPage
        title="This area is for Globyx staff"
        body="Your account does not have admin access. If you think it should, ask the account owner to add you."
      />
    );
  }

  return (
    <div className="min-h-[100svh] bg-paper lg:pl-[264px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col gap-7 overflow-y-auto bg-ink p-5 text-cream lg:flex">
        <div className="flex items-center justify-between gap-3 px-1.5 pt-1">
          <Logo />
          <AdminBadge />
        </div>
        <nav aria-label="Admin" className="flex-1">
          <NavItems />
        </nav>
        <CustomerViewLink />
        <UserBlock />
      </aside>

      <MobileBar />

      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}

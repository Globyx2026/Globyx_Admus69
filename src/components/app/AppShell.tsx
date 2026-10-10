import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  FlaskConical,
  Globe,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  Plus,
  Settings,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { getBalance } from '@/services/account';
import { signOut } from '@/services/auth';
import { Logo, LogoMark } from '@/components/layout/Logo';

/* ------------------------- Wallet, shared by every page ------------------------- */

interface AccountValue {
  /** Wallet balance in USD, or null while it is loading. */
  balance: number | null;
  refreshBalance: () => Promise<void>;
}

const AccountContext = createContext<AccountValue | null>(null);

export function useAccount(): AccountValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error('useAccount must be used inside the dashboard');
  return value;
}

/* ------------------------------ Navigation ------------------------------ */

const NAV: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/numbers', label: 'Numbers', icon: Phone },
  { to: '/app/proxies', label: 'Proxies', icon: Globe },
  { to: '/app/wallet', label: 'Wallet', icon: Wallet },
  { to: '/app/api-keys', label: 'API keys', icon: KeyRound },
  { to: '/app/settings', label: 'Settings', icon: Settings },
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

function BalanceCard({ onNavigate }: { onNavigate?: () => void }) {
  const { balance } = useAccount();
  const { format } = useCurrency();

  return (
    <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
      <p className="micro text-cream/50">Wallet balance</p>
      <p className="mt-2 font-serif text-[1.75rem] leading-none tracking-[-0.02em] text-cream">
        {balance === null ? <span className="text-cream/40">…</span> : format(balance)}
      </p>
      <Link
        to="/app/wallet?add=1"
        onClick={onNavigate}
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-accent text-[13px] font-medium text-ink transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        Add funds
      </Link>
    </div>
  );
}

function UserBlock() {
  const { displayName, user, isDemo } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onLogOut() {
    setBusy(true);
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      toast.error('Could not log out', { description: friendlyError(error) });
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunset font-serif text-lg text-ink">
        {displayName.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-cream">{displayName}</span>
        <span className="block truncate text-xs text-cream/50">{isDemo ? 'Demo account' : user?.email}</span>
      </span>
      <button
        type="button"
        onClick={onLogOut}
        disabled={busy}
        aria-label="Log out"
        title="Log out"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function MobileBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { balance } = useAccount();
  const { format } = useCurrency();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 bg-ink px-4 text-cream lg:hidden">
      <Link to="/app" aria-label="Dashboard home" className="inline-flex items-center gap-2 rounded-md">
        <LogoMark />
        <span className="font-serif text-xl leading-none font-semibold tracking-[-0.02em]">Globyx</span>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          to="/app/wallet"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.08] px-3.5 text-[13px] ring-1 ring-white/10"
        >
          <Wallet className="h-4 w-4 text-glow" />
          {balance === null ? '…' : format(balance)}
        </Link>
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
                <Dialog.Title className="micro text-cream/50">Menu</Dialog.Title>
                <Dialog.Close
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <nav aria-label="Dashboard">
                <NavItems onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-auto space-y-5">
                <BalanceCard onNavigate={() => setOpen(false)} />
                <UserBlock />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}

function FullPageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="bg-night grid min-h-[100svh] place-items-center px-6 text-cream" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-cream/60">{children}</p>
      </div>
    </div>
  );
}

/** The dashboard frame: sidebar, wallet and the page inside. Signed-in customers only. */
export default function AppShell() {
  const { loading, session, recovering } = useAuth();
  const location = useLocation();
  const [balance, setBalance] = useState<number | null>(null);
  const userId = session?.user.id ?? null;

  const refreshBalance = useCallback(async () => {
    try {
      setBalance(await getBalance());
    } catch {
      /* The pages show their own load errors; the sidebar keeps the last known balance. */
    }
  }, []);

  useEffect(() => {
    setBalance(null);
    if (userId) void refreshBalance();
  }, [userId, refreshBalance]);

  const account = useMemo(() => ({ balance, refreshBalance }), [balance, refreshBalance]);

  if (loading) return <FullPageMessage>Opening your dashboard…</FullPageMessage>;
  if (recovering) return <Navigate to="/reset-password" replace />;
  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return (
    <AccountContext.Provider value={account}>
      <div className="min-h-[100svh] bg-paper lg:pl-[264px]">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col gap-7 overflow-y-auto bg-ink p-5 text-cream lg:flex">
          <Logo className="px-1.5 pt-1" />
          <nav aria-label="Dashboard" className="flex-1">
            <NavItems />
          </nav>
          <BalanceCard />
          <UserBlock />
        </aside>

        <MobileBar />

        <div className="flex items-center justify-center gap-2 bg-[#fff1cf] px-4 py-2 text-center text-[12.5px] leading-snug text-[#6b4a00]">
          <FlaskConical className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
          <span>
            <span className="font-semibold">Test mode.</span> Payments, numbers and proxies are simulated. No real
            money moves.
          </span>
        </div>

        <main className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
          <Outlet />
        </main>
      </div>
    </AccountContext.Provider>
  );
}

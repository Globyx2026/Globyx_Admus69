import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getSession, signOut } from '@/services/auth';
import { Logo } from '@/components/layout/Logo';
import { Button, ButtonLink } from '@/components/ui/Button';

/**
 * Holding page for /app until the customer dashboard is built (stage 2).
 * BACKEND: replace this whole route with the dashboard shell.
 */
export default function AppPlaceholder() {
  const navigate = useNavigate();
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;

  function onLogOut() {
    signOut();
    toast.success('Logged out');
    navigate('/');
  }

  return (
    <div className="bg-night flex min-h-[100svh] flex-col px-5 py-6 text-cream sm:px-8">
      <div className="flex items-center justify-between">
        <Logo />
        <Button variant="ghost" size="sm" onClick={onLogOut}>
          Log out
        </Button>
      </div>

      <main className="m-auto w-full max-w-xl py-16 text-center">
        <p className="micro text-glow">{session.demo ? 'Demo account' : 'Signed in'}</p>
        <h1 className="type-h2 mt-4">Welcome, {session.name}.</h1>
        <p className="type-lead mt-5 text-cream/75">
          Your dashboard is being built. This is where your numbers, proxies, wallet and API keys will live.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/numbers">Browse numbers</ButtonLink>
          <ButtonLink to="/pricing" variant="ghost">
            See pricing
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}

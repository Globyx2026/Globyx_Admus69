import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { friendlyError } from '@/lib/errors';
import { requestPasswordReset, updatePassword } from '@/services/auth';
import { cn, isValidEmail } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, inputClassDark } from '@/components/ui/Field';

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-night flex min-h-[100svh] flex-col px-5 py-6 text-cream sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <Link
          to="/login"
          className="text-[13px] font-medium text-cream underline decoration-accent decoration-2 underline-offset-4"
        >
          Back to log in
        </Link>
      </div>
      <main className="m-auto w-full max-w-[430px] py-10">
        <div className="glass p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}

/** Step 1: ask for a reset link by email. */
function Forgot() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(email.trim() ? 'That email address does not look right.' : 'Enter your email address.');
      document.getElementById('forgot-email')?.focus();
      return;
    }
    setError('');
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSentTo(email.trim());
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <Frame>
        <div role="status">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
            <MailCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-serif text-[2rem] leading-tight tracking-[-0.02em]">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-cream/70">
            If an account exists for <span className="font-medium text-cream">{sentTo}</span>, a link to choose a new
            password is on its way. It works for one hour.
          </p>
          <ButtonLink to="/login" className="mt-6 w-full">
            Back to log in
          </ButtonLink>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="font-serif text-[2rem] leading-tight tracking-[-0.02em]">Forgot your password?</h1>
      <p className="mt-2 text-sm text-cream/65">Enter your email and we will send a link to choose a new one.</p>
      <form onSubmit={onSubmit} noValidate className="mt-7">
        <Field id="forgot-email" label="Email address" error={error || undefined} tone="dark">
          <input
            id="forgot-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby="forgot-email-note"
            className={cn(inputClassDark, 'h-11')}
          />
        </Field>
        <Button type="submit" disabled={busy} className="mt-1 w-full">
          {busy ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </Frame>
  );
}

/** Step 2: the link in the email signs the customer in, and they choose a new password. */
function Reset() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [errors, setErrors] = useState<{ password?: string; again?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    if (password.length < 8) found.password = 'Use at least 8 characters.';
    if (again !== password) found.again = 'The two passwords do not match.';
    setErrors(found);
    if (found.password || found.again) {
      document.getElementById(found.password ? 'reset-password' : 'reset-again')?.focus();
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success('Password changed', { description: 'You are logged in.' });
      navigate('/app', { replace: true });
    } catch (caught) {
      setErrors({ password: friendlyError(caught) });
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Frame>
        <p className="py-10 text-center text-sm text-cream/60" aria-busy="true">
          Checking your link…
        </p>
      </Frame>
    );
  }

  if (!session) {
    return (
      <Frame>
        <h1 className="font-serif text-[2rem] leading-tight tracking-[-0.02em]">This link has expired</h1>
        <p className="mt-2 text-sm leading-relaxed text-cream/70">
          Reset links work once, for one hour. Ask for a new one and use it straight away.
        </p>
        <ButtonLink to="/forgot-password" className="mt-6 w-full">
          Send a new link
        </ButtonLink>
      </Frame>
    );
  }

  return (
    <Frame>
      <h1 className="font-serif text-[2rem] leading-tight tracking-[-0.02em]">Choose a new password</h1>
      <p className="mt-2 text-sm text-cream/65">You will stay logged in on this device.</p>
      <form onSubmit={onSubmit} noValidate className="mt-7">
        <Field id="reset-password" label="New password" error={errors.password} hint="At least 8 characters." tone="dark">
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="reset-password-note"
            className={cn(inputClassDark, 'h-11')}
          />
        </Field>
        <Field id="reset-again" label="Repeat new password" error={errors.again} tone="dark">
          <input
            id="reset-again"
            type="password"
            autoComplete="new-password"
            value={again}
            onChange={(event) => setAgain(event.target.value)}
            aria-invalid={Boolean(errors.again)}
            aria-describedby="reset-again-note"
            className={cn(inputClassDark, 'h-11')}
          />
        </Field>
        <Button type="submit" disabled={busy} className="mt-1 w-full">
          {busy ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </Frame>
  );
}

export default function Password({ mode }: { mode: 'forgot' | 'reset' }) {
  return mode === 'forgot' ? <Forgot /> : <Reset />;
}

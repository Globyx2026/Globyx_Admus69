import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { friendlyError } from '@/lib/errors';
import { images } from '@/lib/images';
import { isDemoAvailable, resendConfirmation, signIn, signInAsDemo, signUp } from '@/services/auth';
import { cn, isValidEmail } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Field, inputClassDark } from '@/components/ui/Field';
import { Photo } from '@/components/ui/Photo';

type Mode = 'login' | 'signup';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  agree?: string;
}

const COPY: Record<Mode, { title: string; intro: string; submit: string; busy: string; quote: string }> = {
  login: {
    title: 'Welcome back',
    intro: 'Log in to manage your numbers, proxies and wallet.',
    submit: 'Log in',
    busy: 'Logging in…',
    quote: 'One wallet for every number and every proxy.',
  },
  signup: {
    title: 'Create your account',
    intro: 'It takes less than a minute. No card needed to look around.',
    submit: 'Create account',
    busy: 'Creating account…',
    quote: 'Your first number can be live before your coffee is cold.',
  },
};

/** Only follow "next" links that stay inside the dashboard. */
function safeNext(value: string | null): string {
  return value && value.startsWith('/app') ? value : '/app';
}

export default function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, loading } = useAuth();
  const signup = mode === 'signup';
  const copy = COPY[mode];
  const image = signup ? images.auth_signup : images.auth_login;
  const rent = params.get('rent');
  const next = rent ? `/app/numbers?rent=${encodeURIComponent(rent)}` : safeNext(params.get('next'));
  const carry = rent ? `?rent=${encodeURIComponent(rent)}` : '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoOffered, setDemoOffered] = useState(false);
  const [confirmFor, setConfirmFor] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let active = true;
    isDemoAvailable().then((available) => active && setDemoOffered(available));
    return () => {
      active = false;
    };
  }, []);

  // Already signed in (or just signed in): go straight to the dashboard.
  if (!loading && session && !confirmFor) return <Navigate to={next} replace />;

  function validate(): Errors {
    const found: Errors = {};
    if (signup && name.trim().length < 2) found.name = 'Enter your name.';
    if (!email.trim()) found.email = 'Enter your email address.';
    else if (!isValidEmail(email)) found.email = 'That email address does not look right.';
    if (!password) found.password = 'Enter your password.';
    else if (signup && password.length < 8) found.password = 'Use at least 8 characters.';
    if (signup && !agree) found.agree = 'Please accept the terms to continue.';
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) {
      const first = (['name', 'email', 'password', 'agree'] as const).find((key) => found[key]);
      if (first) document.getElementById(`auth-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      if (signup) {
        const { needsConfirmation } = await signUp(name, email, password);
        if (needsConfirmation) {
          setConfirmFor(email.trim());
          return;
        }
        toast.success('Account created', { description: `Welcome, ${name.trim().split(' ')[0]}.` });
      } else {
        await signIn(email, password);
        toast.success('Logged in', { description: 'Welcome back.' });
      }
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  async function onDemo() {
    setDemoBusy(true);
    setFormError('');
    try {
      await signInAsDemo();
      toast.success('Demo account ready', { description: 'Add test funds in the wallet to try things out.' });
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setDemoBusy(false);
    }
  }

  async function onResend() {
    if (!confirmFor) return;
    setResending(true);
    try {
      await resendConfirmation(confirmFor);
      toast.success('Email sent again', { description: 'Check your inbox and your spam folder.' });
    } catch (error) {
      toast.error('Could not send the email', { description: friendlyError(error) });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-ink text-cream lg:grid lg:grid-cols-2">
      {/* Photograph (wide screens) */}
      <div className="relative isolate hidden lg:block">
        <Photo image={image} priority sizes="50vw" className="absolute inset-0 -z-20" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to top, rgba(18,16,14,0.88) 0%, rgba(18,16,14,0.2) 50%, rgba(18,16,14,0.45) 100%)',
          }}
        />
        <div className="flex h-full min-h-[100svh] flex-col justify-between p-12 xl:p-16">
          <Logo />
          <div>
            <p className="micro text-glow">Connect beyond borders</p>
            <p className="type-h2 mt-4 max-w-[16ch]">{copy.quote}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative isolate flex min-h-[100svh] flex-col px-5 py-6 sm:px-8">
        <Photo image={image} sizes="100vw" className="absolute inset-0 -z-20 lg:hidden" />
        <div className="absolute inset-0 -z-10 bg-ink/70 lg:hidden" />
        <div
          className="absolute inset-0 -z-10 hidden lg:block"
          style={{
            background:
              'radial-gradient(70% 55% at 80% 0%, rgba(255,90,31,0.2), transparent 65%), radial-gradient(60% 50% at 10% 100%, rgba(91,95,138,0.28), transparent 70%)',
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <Logo className="lg:invisible" />
          <p className="text-[13px] text-cream/65">
            {signup ? 'Already have an account?' : 'New to Globyx?'}{' '}
            <Link
              to={`${signup ? '/login' : '/signup'}${carry}`}
              className="font-medium text-cream underline decoration-accent decoration-2 underline-offset-4"
            >
              {signup ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </div>

        <main className="m-auto w-full max-w-[430px] py-10">
          <div className="glass p-6 sm:p-8">
            {confirmFor ? (
              <div role="status">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                  <MailCheck className="h-6 w-6" />
                </span>
                <h1 className="mt-5 font-serif text-[2rem] leading-tight tracking-[-0.02em]">Check your email</h1>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  We sent a confirmation link to <span className="font-medium text-cream">{confirmFor}</span>. Open it
                  to finish creating your account, then log in.
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-cream/55">
                  Nothing after a few minutes? Look in your spam folder, or send it again.
                </p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  <Button variant="ghost" onClick={onResend} disabled={resending}>
                    {resending ? 'Sending…' : 'Send it again'}
                  </Button>
                  <Link to={`/login${carry}`} className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-ink shadow-glow transition-colors hover:bg-accent-hover">
                    Go to log in
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-[2rem] leading-tight tracking-[-0.02em]">{copy.title}</h1>
                <p className="mt-2 text-sm text-cream/65">{copy.intro}</p>

                <form onSubmit={onSubmit} noValidate className="mt-7">
                  {signup && (
                    <Field id="auth-name" label="Your name" error={errors.name} tone="dark">
                      <input
                        id="auth-name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby="auth-name-note"
                        className={cn(inputClassDark, 'h-11')}
                      />
                    </Field>
                  )}

                  <Field id="auth-email" label="Email address" error={errors.email} tone="dark">
                    <input
                      id="auth-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby="auth-email-note"
                      className={cn(inputClassDark, 'h-11')}
                    />
                  </Field>

                  <Field
                    id="auth-password"
                    label="Password"
                    error={errors.password}
                    hint={signup ? 'At least 8 characters.' : undefined}
                    tone="dark"
                  >
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={signup ? 'new-password' : 'current-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby="auth-password-note"
                        className={cn(inputClassDark, 'h-11 pr-11')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  {signup && (
                    <div className="mt-1 mb-2">
                      <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-snug text-cream/75">
                        <input
                          id="auth-agree"
                          type="checkbox"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          aria-invalid={Boolean(errors.agree)}
                          aria-describedby="auth-agree-note"
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#ff5a1f]"
                        />
                        <span>
                          I agree to the{' '}
                          <Link to="/legal/terms" className="text-cream underline underline-offset-2">
                            Terms
                          </Link>{' '}
                          and the{' '}
                          <Link to="/legal/acceptable-use" className="text-cream underline underline-offset-2">
                            Acceptable Use Policy
                          </Link>
                          , and I will use Globyx for legitimate purposes only.
                        </span>
                      </label>
                      <p id="auth-agree-note" role={errors.agree ? 'alert' : undefined} className="mt-1.5 min-h-[1.125rem] text-[12.5px] text-danger">
                        {errors.agree ?? ''}
                      </p>
                    </div>
                  )}

                  {!signup && (
                    <p className="-mt-1 mb-3 text-right text-[13px]">
                      <Link to="/forgot-password" className="text-cream/75 underline underline-offset-4 hover:text-cream">
                        Forgot your password?
                      </Link>
                    </p>
                  )}

                  {formError && (
                    <p role="alert" className="mb-3 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[13px] text-[#ffc9c9]">
                      {formError}
                    </p>
                  )}

                  <Button type="submit" disabled={busy || demoBusy} className="mt-1 w-full">
                    {busy ? copy.busy : copy.submit}
                  </Button>
                </form>

                {demoOffered && (
                  <>
                    <div className="my-5 flex items-center gap-3 text-xs text-cream/45">
                      <span className="h-px flex-1 bg-white/12" />
                      or
                      <span className="h-px flex-1 bg-white/12" />
                    </div>

                    <Button variant="ghost" className="w-full" onClick={onDemo} disabled={busy || demoBusy}>
                      {demoBusy ? 'Opening the demo…' : 'Continue as demo user'}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

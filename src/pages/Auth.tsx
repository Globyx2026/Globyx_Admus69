import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { images } from '@/lib/images';
import { signIn, signInAsDemo, signUp } from '@/services/auth';
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

export default function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const signup = mode === 'signup';
  const copy = COPY[mode];
  const image = signup ? images.auth_signup : images.auth_login;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

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
    if (Object.keys(found).length > 0) {
      const first = (['name', 'email', 'password', 'agree'] as const).find((key) => found[key]);
      if (first) document.getElementById(`auth-${first}`)?.focus();
      return;
    }
    setBusy(true);
    // BACKEND: replace with Supabase Auth. The password is not stored or sent anywhere yet.
    const session = signup ? await signUp(name, email) : await signIn(email);
    setBusy(false);
    toast.success(signup ? 'Account created' : 'Logged in', { description: `Welcome, ${session.name}.` });
    navigate('/app');
  }

  async function onDemo() {
    const session = await signInAsDemo();
    toast.success('Logged in as demo user', { description: `Welcome, ${session.name}.` });
    navigate('/app');
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
              to={signup ? '/login' : '/signup'}
              className="font-medium text-cream underline decoration-accent decoration-2 underline-offset-4"
            >
              {signup ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        </div>

        <main className="m-auto w-full max-w-[430px] py-10">
          <div className="glass p-6 sm:p-8">
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

              <Button type="submit" disabled={busy} className="mt-1 w-full">
                {busy ? copy.busy : copy.submit}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-cream/45">
              <span className="h-px flex-1 bg-white/12" />
              or
              <span className="h-px flex-1 bg-white/12" />
            </div>

            <Button variant="ghost" className="w-full" onClick={onDemo}>
              Continue as demo user
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

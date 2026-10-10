import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { site } from '@/data/site';
import { useAuth } from '@/context/AuthContext';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { friendlyError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { updateProfile } from '@/services/account';
import { signOut, updatePassword } from '@/services/auth';
import { Card, PageTitle, SectionTitle } from '@/components/app/ui';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';

function ProfileForm() {
  const { user, profile, isDemo, refreshProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [chosenCurrency, setChosenCurrency] = useState<Currency>(currency);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setCompany(profile.company);
    setChosenCurrency(profile.currency);
  }, [profile]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!isDemo && fullName.trim().length < 2) {
      setError('Enter your name.');
      document.getElementById('settings-name')?.focus();
      return;
    }
    setError('');
    setBusy(true);
    try {
      await updateProfile(user.id, { fullName, company, currency: chosenCurrency });
      setCurrency(chosenCurrency);
      await refreshProfile();
      toast.success('Settings saved');
    } catch (caught) {
      toast.error('Could not save your settings', { description: friendlyError(caught) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <SectionTitle>Profile</SectionTitle>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <Field id="settings-name" label="Your name" error={error || undefined}>
            <input
              id="settings-name"
              autoComplete="name"
              value={fullName}
              maxLength={80}
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby="settings-name-note"
              className={cn(inputClass, 'h-11')}
            />
          </Field>
          <Field id="settings-company" label="Company" hint="Optional.">
            <input
              id="settings-company"
              autoComplete="organization"
              value={company}
              maxLength={80}
              onChange={(event) => setCompany(event.target.value)}
              aria-describedby="settings-company-note"
              className={cn(inputClass, 'h-11')}
            />
          </Field>
        </div>

        <Field
          id="settings-email"
          label="Email address"
          hint={isDemo ? 'Demo accounts have no email address.' : `To change it, write to ${site.supportEmail}.`}
        >
          <input
            id="settings-email"
            value={user?.email ?? 'Demo account'}
            readOnly
            aria-describedby="settings-email-note"
            className={cn(inputClass, 'h-11 bg-paper text-muted')}
          />
        </Field>

        <p id="settings-currency-label" className="mb-1.5 text-[13px] font-medium text-char">
          Show prices in
        </p>
        <Segmented<Currency>
          label="Show prices in"
          value={chosenCurrency}
          onChange={setChosenCurrency}
          options={[
            { value: 'USD', label: 'US dollars' },
            { value: 'KES', label: 'Kenyan shillings' },
          ]}
        />
        <p className="mt-1.5 text-[12.5px] text-muted">
          Your wallet is always held in US dollars. Shillings are shown at {site.kesPerUsd} KES per dollar.
        </p>

        <Button type="submit" disabled={busy || !profile} className="mt-6">
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Card>
  );
}

function PasswordForm() {
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
      document.getElementById(found.password ? 'settings-password' : 'settings-password-again')?.focus();
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      setPassword('');
      setAgain('');
      toast.success('Password changed');
    } catch (caught) {
      toast.error('Could not change your password', { description: friendlyError(caught) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <SectionTitle>Password</SectionTitle>
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <Field id="settings-password" label="New password" error={errors.password} hint="At least 8 characters.">
            <input
              id="settings-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="settings-password-note"
              className={cn(inputClass, 'h-11')}
            />
          </Field>
          <Field id="settings-password-again" label="Repeat new password" error={errors.again}>
            <input
              id="settings-password-again"
              type="password"
              autoComplete="new-password"
              value={again}
              onChange={(event) => setAgain(event.target.value)}
              aria-invalid={Boolean(errors.again)}
              aria-describedby="settings-password-again-note"
              className={cn(inputClass, 'h-11')}
            />
          </Field>
        </div>
        <Button type="submit" variant="dark" disabled={busy} className="mt-2">
          {busy ? 'Changing…' : 'Change password'}
        </Button>
      </form>
    </Card>
  );
}

export default function SettingsPage() {
  const { isDemo } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  async function onLogOut() {
    setLeaving(true);
    try {
      await signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (caught) {
      toast.error('Could not log out', { description: friendlyError(caught) });
      setLeaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageTitle label="Settings" title="Account settings" intro="Your details, your currency and how you sign in." />

      <ProfileForm />

      {isDemo ? (
        <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-xl tracking-[-0.015em] text-char">This is a demo account</h2>
            <p className="mt-1 max-w-lg text-[15px] text-muted">
              It lives in this browser only and is lost when you log out. Create a free account to keep your numbers
              and wallet.
            </p>
          </div>
          <ButtonLink to="/signup" className="shrink-0">
            Create an account
          </ButtonLink>
        </Card>
      ) : (
        <PasswordForm />
      )}

      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-xl tracking-[-0.015em] text-char">Log out</h2>
          <p className="mt-1 text-[15px] text-muted">
            End your session on this device. To close your account for good, write to {site.supportEmail}.
          </p>
        </div>
        <Button variant="outline" onClick={onLogOut} disabled={leaving} className="shrink-0">
          {leaving ? 'Logging out…' : 'Log out'}
        </Button>
      </Card>
    </div>
  );
}

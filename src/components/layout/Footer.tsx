import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Globe, Mail } from 'lucide-react';
import { site } from '@/data/site';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { subscribeToNewsletter } from '@/services/contact';
import { isValidEmail } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Logo } from './Logo';

const columns: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Products',
    links: [
      { label: 'Virtual numbers', to: '/numbers' },
      { label: 'Proxies', to: '/proxies' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Coverage', to: '/#coverage' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API docs', to: '/developers' },
      { label: 'Authentication', to: '/developers#authentication' },
      { label: 'Webhooks', to: '/developers#webhooks' },
      { label: 'Errors', to: '/developers#errors' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Log in', to: '/login' },
      { label: 'Create account', to: '/signup' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Acceptable use', to: '/legal/acceptable-use' },
      { label: 'Terms of service', to: '/legal/terms' },
      { label: 'Privacy policy', to: '/legal/privacy' },
    ],
  },
];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.530 2.870 8.370 6.840 9.730.5.090.680-.220.680-.490 0-.240-.010-1.040-.010-1.890-2.510.470-3.160-.630-3.360-1.200-.110-.290-.600-1.200-1.020-1.440-.350-.190-.850-.670-.010-.680.790-.010 1.350.740 1.540 1.050.900 1.550 2.340 1.110 2.910.850.090-.670.350-1.110.640-1.370-2.220-.260-4.550-1.140-4.550-5.050 0-1.110.390-2.030 1.030-2.750-.100-.260-.450-1.300.100-2.710 0 0 .840-.270 2.750 1.050a9.200 9.200 0 0 1 5 0c1.910-1.330 2.750-1.050 2.750-1.050.550 1.410.200 2.450.100 2.710.640.720 1.030 1.630 1.030 2.750 0 3.920-2.340 4.790-4.570 5.050.360.320.680.940.680 1.900 0 1.370-.010 2.470-.010 2.810 0 .270.180.590.690.490A10.130 10.130 0 0 0 22 12.250C22 6.580 17.520 2 12 2Z" />
    </svg>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('That email address does not look right. Check it and try again.');
      return;
    }
    setError('');
    setBusy(true);
    const added = await subscribeToNewsletter(email);
    setBusy(false);
    if (added) {
      toast.success('Subscribed', { description: 'Product news will arrive about once a month.' });
      setEmail('');
    } else {
      toast.info('You are already subscribed', { description: 'Nothing more to do.' });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 max-w-md">
      <label htmlFor="newsletter-email" className="micro text-cream/55">
        Product news, about once a month
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className="h-11 w-full min-w-0 shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-cream placeholder:text-cream/40 focus:border-accent focus:outline-none aria-[invalid=true]:border-danger sm:w-auto sm:flex-1"
        />
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </div>
      <p id="newsletter-error" role="alert" className="mt-2 min-h-5 text-[13px] text-danger">
        {error}
      </p>
    </form>
  );
}

export function Footer() {
  const { currency, setCurrency } = useCurrency();

  return (
    <footer className="bg-ink text-cream">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-20">
          <div>
            <Logo />
            <p className="type-lead mt-5 max-w-sm text-cream/65">
              Phone numbers and proxies for teams that work across borders.
            </p>
            <Newsletter />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="micro font-mono text-cream/50">{column.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="rounded-sm text-sm text-cream/75 transition-colors duration-200 hover:text-cream"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-cream/60">
            {/* BACKEND: drive this from a real status page. */}
            <span className="inline-flex items-center gap-2 text-cream/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-success" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              All systems operational
            </span>
            <span>© {new Date().getFullYear()} Globyx. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Segmented<Currency>
              label="Currency"
              tone="dark"
              size="sm"
              value={currency}
              onChange={setCurrency}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'KES', label: 'KES' },
              ]}
            />
            <label className="relative inline-flex items-center">
              <span className="sr-only">Language</span>
              <Globe className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-cream/60" />
              <select
                defaultValue="en"
                className="h-9 w-[120px] appearance-none truncate rounded-full bg-white/[0.08] pr-4 pl-8 text-xs text-cream ring-1 ring-white/10 focus:outline-none focus-visible:ring-accent"
              >
                <option value="en" className="text-char">
                  English
                </option>
                <option value="sw" disabled className="text-char">
                  Kiswahili (coming soon)
                </option>
                <option value="fr" disabled className="text-char">
                  Français (coming soon)
                </option>
              </select>
            </label>
            <a
              href={`mailto:${site.supportEmail}`}
              aria-label="Email Globyx support"
              className="grid h-9 w-9 place-items-center rounded-full text-cream/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/Globyx2026"
              target="_blank"
              rel="noreferrer"
              aria-label="Globyx on GitHub"
              className="grid h-9 w-9 place-items-center rounded-full text-cream/70 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

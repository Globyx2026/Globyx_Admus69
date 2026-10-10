import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, LifeBuoy, Mail, ShieldAlert } from 'lucide-react';
import { site } from '@/data/site';
import { images } from '@/lib/images';
import { sendContactMessage } from '@/services/contact';
import { cn, isValidEmail } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Reveal } from '@/components/ui/Reveal';

const TOPICS = ['Sales', 'Support', 'Billing', 'Partnerships', 'Something else'];

interface FormState {
  name: string;
  email: string;
  topic: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: '', email: '', topic: TOPICS[0], message: '' };

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!form.email.trim()) errors.email = 'Enter your email address.';
  else if (!isValidEmail(form.email)) errors.email = 'That email address does not look right.';
  if (form.message.trim().length < 10) errors.message = 'Tell us a little more, at least 10 characters.';
  return errors;
}

const channels = [
  {
    icon: LifeBuoy,
    title: 'Support',
    body: 'Help with a number, a proxy or your wallet.',
    link: { label: site.supportEmail, href: `mailto:${site.supportEmail}` },
  },
  {
    icon: Mail,
    title: 'Sales',
    body: 'Volume pricing, contracts and custom plans.',
    link: { label: site.salesEmail, href: `mailto:${site.salesEmail}` },
  },
  {
    icon: ShieldAlert,
    title: 'Report abuse',
    body: 'Unwanted calls, messages or traffic from our network.',
    link: { label: 'abuse@globyx.com', href: 'mailto:abuse@globyx.com' },
  },
];

export default function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the first field that needs attention.
      const first = (['name', 'email', 'message'] as const).find((key) => found[key]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setBusy(true);
    await sendContactMessage(form);
    setBusy(false);
    setSent(true);
    setForm(EMPTY);
    toast.success('Message sent', { description: 'We reply within one working day.' });
  }

  return (
    <>
      <PageHeader
        label="Contact"
        title="Talk to a person."
        intro="Questions about pricing, a country you need, or something that is not working. Send it here and a member of the team will reply."
        image={images.header_contact}
      />

      <section className="bg-paper py-14 md:py-20">
        <div className="shell grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
          <Reveal className="rounded-3xl border border-line bg-white p-6 sm:p-8 md:p-10">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-success/20 text-[#0f7a4f]">
                  <CircleCheck className="h-7 w-7" />
                </span>
                <h2 className="type-h3 mt-5 text-char">Message sent</h2>
                <p className="mt-2 max-w-sm text-[15px] text-muted">
                  Thank you. We reply within one working day, usually sooner.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h2 className="type-h3 text-char">Send us a message</h2>
                <div className="mt-6 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                  <Field id="contact-name" label="Your name" error={errors.name}>
                    <input
                      id="contact-name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby="contact-name-note"
                      className={cn(inputClass, 'h-11')}
                    />
                  </Field>
                  <Field id="contact-email" label="Email address" error={errors.email}>
                    <input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby="contact-email-note"
                      className={cn(inputClass, 'h-11')}
                    />
                  </Field>
                </div>

                <Field id="contact-topic" label="What is it about?">
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(e) => set('topic', e.target.value)}
                    className={cn(inputClass, 'h-11')}
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </Field>

                <Field
                  id="contact-message"
                  label="Message"
                  error={errors.message}
                  hint="Include your account email if you already have one."
                >
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby="contact-message-note"
                    className={cn(inputClass, 'resize-y py-3')}
                  />
                </Field>

                <div className="mt-2 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <p className="max-w-xs text-xs text-muted">
                    We use your details only to reply. See the{' '}
                    <Link to="/legal/privacy" className="underline underline-offset-2 hover:text-char">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    {busy ? 'Sending…' : 'Send message'}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>

          <ul className="space-y-4">
            {channels.map(({ icon: Icon, title, body, link }, index) => (
              <li key={title}>
                <Reveal delay={0.1 + index * 0.07} className="rounded-3xl border border-line bg-white p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-serif text-xl tracking-[-0.01em] text-char">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                  <a
                    href={link.href}
                    className="mt-3 inline-block text-sm font-medium break-all text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink"
                  >
                    {link.label}
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

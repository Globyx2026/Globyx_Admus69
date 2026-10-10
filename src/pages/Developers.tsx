import { useEffect, useState, type ReactNode } from 'react';
import {
  buyNumberSamples,
  errorSample,
  proxyCredentialSamples,
  sendMessageSamples,
  webhookSample,
} from '@/data/codeSamples';
import { site } from '@/data/site';
import { images } from '@/lib/images';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { CodePanel } from '@/components/ui/CodePanel';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'messages', label: 'Messages' },
  { id: 'proxies', label: 'Proxies' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate limits' },
] as const;

/** Highlights the last section whose heading has scrolled past the top. */
function useActiveSection(): string {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 180) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return active;
}

function Endpoint({ method, path }: { method: 'GET' | 'POST' | 'DELETE'; path: string }) {
  return (
    <p className="my-5 flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-2.5 font-mono text-[13px] text-char">
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
          method === 'GET' ? 'bg-success/20 text-[#0f7a4f]' : 'bg-accent/15 text-accent-ink',
        )}
      >
        {method}
      </span>
      <span className="break-all">{path}</span>
    </p>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-10 border-t border-line py-12 first:border-0 first:pt-0">
      <h2 className="font-serif text-[1.875rem] leading-tight tracking-[-0.02em] text-char md:text-[2.25rem]">{title}</h2>
      <div className="mt-4 max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted [&_p>code]:rounded-md [&_p>code]:bg-char/[0.06] [&_p>code]:px-1.5 [&_p>code]:py-0.5 [&_p>code]:font-mono [&_p>code]:text-[13px] [&_p>code]:text-char [&_strong]:font-medium [&_strong]:text-char">
        {children}
      </div>
    </section>
  );
}

function ParamTable({ rows }: { rows: Array<[name: string, type: string, description: string]> }) {
  return (
    <div className="!mt-6 overflow-hidden rounded-2xl border border-line bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, description]) => (
            <tr key={name} className="flex flex-col gap-1 border-b border-line p-4 last:border-0 sm:table-row sm:p-0">
              <td className="font-mono text-[13px] text-char sm:w-40 sm:p-4 sm:align-top">{name}</td>
              <td className="font-mono text-xs text-accent-ink sm:w-28 sm:p-4 sm:align-top">{type}</td>
              <td className="text-muted sm:p-4">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Developers() {
  const active = useActiveSection();

  return (
    <>
      <PageHeader
        label="Developers"
        title="Build on Globyx."
        intro="A REST API for numbers, messages and proxies, with webhooks for everything that happens on your account."
        image={images.header_developers}
      >
        <p className="micro mt-8 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-ink/40 px-4 py-2 text-cream/85 normal-case backdrop-blur-md">
          <span className="text-glow uppercase">Base URL</span>
          <span className="truncate tracking-normal">{site.apiBase}</span>
        </p>
      </PageHeader>

      {/* Phones and tablets: section links scroll sideways under the navbar. */}
      <nav
        aria-label="Documentation sections"
        className="no-scrollbar sticky top-[68px] z-30 flex gap-1.5 overflow-x-auto border-b border-line bg-paper/95 px-5 py-2.5 backdrop-blur lg:hidden"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={active === section.id ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors',
              active === section.id ? 'bg-char text-cream' : 'text-muted hover:text-char',
            )}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="bg-paper">
        <div className="shell grid gap-12 py-12 md:py-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          {/* Wide screens: sticky left navigation. */}
          <nav aria-label="Documentation sections" className="hidden lg:block">
            <ul className="sticky top-28 space-y-0.5 border-l border-line">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={active === section.id ? 'true' : undefined}
                    className={cn(
                      '-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors',
                      active === section.id
                        ? 'border-accent font-medium text-char'
                        : 'border-transparent text-muted hover:text-char',
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <p className="mb-10 rounded-2xl border border-warning/50 bg-warning/15 px-4 py-3 text-sm text-char">
              <strong className="font-medium">Preview documentation.</strong> The public API opens together with the
              customer dashboard. Endpoints and fields may change before then.
            </p>

            <DocSection id="introduction" title="Introduction">
              <p>
                The Globyx API is organised around resources: <code>numbers</code>, <code>messages</code> and{' '}
                <code>proxies</code>. Requests and responses are JSON, and every response carries a standard HTTP
                status code.
              </p>
              <p>
                Anything you can do in the dashboard you can do here, so you can rent a number when a customer signs
                up, read its inbox from your own app, or hand proxy credentials to a job as it starts.
              </p>
            </DocSection>

            <DocSection id="authentication" title="Authentication">
              <p>
                Create an API key in the dashboard under <strong>Developers</strong>, then send it as a bearer token
                with every request. A key is shown once, when you create it, so store it somewhere safe.
              </p>
              <p>
                Keep keys on your server. Never ship one in a mobile app or in front-end code, and revoke a key the
                moment you think it has leaked.
              </p>
              <CodePanel
                className="!mt-6"
                groups={[
                  {
                    label: 'Header',
                    samples: [{ label: 'HTTP', code: 'Authorization: Bearer $GLOBYX_API_KEY' }],
                  },
                ]}
              />
            </DocSection>

            <DocSection id="numbers" title="Numbers">
              <p>Rent a number by country and type. The number is charged to your wallet and active straight away.</p>
              <Endpoint method="POST" path="/numbers" />
              <ParamTable
                rows={[
                  ['country', 'string', 'Two-letter country code, for example GB or KE.'],
                  ['type', 'string', 'One of local, mobile or tollfree.'],
                  ['capabilities', 'string[]', 'What the number must support: sms, voice, mms.'],
                ]}
              />
              <CodePanel className="!mt-6" groups={[{ label: 'Buy a number', samples: buyNumberSamples }]} />
            </DocSection>

            <DocSection id="messages" title="Messages">
              <p>
                Send a text from any number you rent. Incoming messages arrive on your webhook and are kept in the
                number’s inbox.
              </p>
              <Endpoint method="POST" path="/messages" />
              <ParamTable
                rows={[
                  ['from', 'string', 'One of your Globyx numbers, in international format.'],
                  ['to', 'string', 'The recipient, in international format.'],
                  ['text', 'string', 'The message body, up to 1,600 characters.'],
                ]}
              />
              <CodePanel className="!mt-6" groups={[{ label: 'Send a message', samples: sendMessageSamples }]} />
            </DocSection>

            <DocSection id="proxies" title="Proxies">
              <p>
                Ask for credentials for one of your proxy plans. Choose the country, and whether each request gets a
                new address or keeps the same one for a while.
              </p>
              <Endpoint method="GET" path="/proxies/credentials" />
              <ParamTable
                rows={[
                  ['plan', 'string', 'residential, mobile, isp or datacenter.'],
                  ['country', 'string', 'Two-letter country code for the exit address.'],
                  ['session', 'string', 'rotating, or sticky_1m, sticky_10m, sticky_30m.'],
                ]}
              />
              <CodePanel className="!mt-6" groups={[{ label: 'Get credentials', samples: proxyCredentialSamples }]} />
            </DocSection>

            <DocSection id="webhooks" title="Webhooks">
              <p>
                Add an HTTPS endpoint in the dashboard and Globyx will POST an event to it when a message arrives, a
                call ends, a number renews or your balance runs low.
              </p>
              <p>
                Reply with any <code>2xx</code> status within ten seconds. If your endpoint is down, delivery is
                retried with a growing delay for 24 hours.
              </p>
              <CodePanel className="!mt-6" groups={[{ label: 'Event', samples: webhookSample }]} />
            </DocSection>

            <DocSection id="errors" title="Errors">
              <p>
                Errors use ordinary HTTP status codes and a JSON body with a stable <code>code</code> you can check in
                your own code, and a <code>message</code> written for people.
              </p>
              <ParamTable
                rows={[
                  ['400', 'invalid_request', 'A field is missing or has the wrong format.'],
                  ['401', 'unauthorized', 'The API key is missing, wrong or revoked.'],
                  ['402', 'insufficient_balance', 'The wallet cannot cover this purchase. Top up and retry.'],
                  ['404', 'not_found', 'The number, message or plan does not exist on your account.'],
                  ['429', 'rate_limited', 'Too many requests. Wait for the time in the Retry-After header.'],
                ]}
              />
              <CodePanel className="!mt-6" groups={[{ label: 'Error', samples: errorSample }]} />
            </DocSection>

            <DocSection id="rate-limits" title="Rate limits">
              <p>
                Each API key may make 600 requests a minute. Every response tells you where you stand in the{' '}
                <code>X-RateLimit-Remaining</code> header.
              </p>
              <p>
                If you go over, you receive a <code>429</code> with a <code>Retry-After</code> header. Proxy traffic
                itself is not counted against this limit.
              </p>
            </DocSection>

            <div className="bg-night mt-4 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 text-cream md:flex-row md:items-center md:p-10">
              <div>
                <h2 className="type-h3">Ready when you are.</h2>
                <p className="mt-2 text-[15px] text-cream/70">Create an account and you will get API keys with it.</p>
              </div>
              <ButtonLink to="/signup" className="shrink-0">
                Create an account
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

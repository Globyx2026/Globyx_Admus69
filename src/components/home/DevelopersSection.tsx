import { Braces, KeyRound, Webhook } from 'lucide-react';
import { buyNumberSamples, proxyCredentialSamples } from '@/data/codeSamples';
import { ButtonLink } from '@/components/ui/Button';
import { CodePanel } from '@/components/ui/CodePanel';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const points = [
  { icon: Braces, title: 'REST and JSON', body: 'Predictable resources and plain JSON in both directions.' },
  { icon: Webhook, title: 'Webhooks', body: 'Hear about every message, call and low balance as it happens.' },
  { icon: KeyRound, title: 'Scoped API keys', body: 'Create a key per project and revoke it without touching the others.' },
];

export function DevelopersSection() {
  return (
    <section className="bg-ink-2 py-20 text-cream md:py-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            tone="dark"
            label="Developers"
            title="Everything in the dashboard is in the API."
            intro="Buy a number, read an inbox or fetch proxy credentials with one request."
          />
          <ul className="mt-9 space-y-5">
            {points.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal delay={index * 0.08} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-glow ring-1 ring-white/10">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-cream">{title}</span>
                    <span className="mt-0.5 block text-sm text-cream/65">{body}</span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
          <ButtonLink to="/developers" variant="secondary" className="mt-10">
            Read the docs
          </ButtonLink>
        </div>

        <Reveal delay={0.15} className="min-w-0">
          <CodePanel
            groups={[
              { label: 'Buy a number', samples: buyNumberSamples },
              { label: 'Get proxy credentials', samples: proxyCredentialSamples },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

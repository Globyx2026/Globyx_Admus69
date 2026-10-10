import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  { title: 'Create your account', body: 'Sign up with an email address. It takes less than a minute.' },
  { title: 'Add funds', body: 'Top up your wallet with M-Pesa, a card or crypto.' },
  { title: 'Choose numbers or proxies', body: 'Filter by country, type and budget, then check out from your wallet.' },
  { title: 'Go live in seconds', body: 'Your number or proxy credentials are ready as soon as you pay.' },
];

export function HowItWorks() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="shell">
        <SectionHeading label="How it works" title="From sign-up to live in four steps." />

        <div className="relative mt-14 md:mt-20">
          {/* The thin line that joins the four numerals on wide screens. */}
          <span aria-hidden="true" className="absolute top-[2.6rem] right-0 left-0 hidden h-px bg-line lg:block" />
          <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 0.1}>
                  <span className="inline-block bg-paper pr-5 font-serif text-[5rem] leading-none font-normal tracking-[-0.04em] text-char">
                    {String(index + 1).padStart(2, '0')}
                    <span className="text-accent">.</span>
                  </span>
                  <h3 className="type-h3 mt-6 text-char">{step.title}</h3>
                  <p className="mt-2.5 max-w-xs text-[15px] leading-relaxed text-muted">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

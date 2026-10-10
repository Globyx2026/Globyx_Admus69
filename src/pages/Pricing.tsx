import { useState } from 'react';
import { Check } from 'lucide-react';
import { faqs } from '@/data/faq';
import { ANNUAL_DISCOUNT, planComparison, plans, type Plan } from '@/data/pricing';
import { images } from '@/lib/images';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { BandwidthCalculator } from '@/components/pricing/BandwidthCalculator';
import { NumberPricePicker } from '@/components/pricing/NumberPricePicker';
import { ButtonLink } from '@/components/ui/Button';
import { FaqList } from '@/components/ui/FaqList';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Segmented } from '@/components/ui/Segmented';
import { cn } from '@/lib/utils';

type Billing = 'monthly' | 'annual';

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
  const { format } = useCurrency();
  const featured = Boolean(plan.featured);
  const annual = billing === 'annual';
  const paid = plan.monthly !== null && plan.monthly > 0;
  const perMonth = plan.monthly === null ? null : annual ? plan.monthly * (1 - ANNUAL_DISCOUNT) : plan.monthly;

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-3xl border p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1',
        featured
          ? 'bg-night border-transparent text-cream shadow-[0_30px_60px_-30px_rgba(14,19,48,0.8)]'
          : 'border-line bg-white text-char hover:shadow-[0_28px_56px_-30px_rgba(18,16,14,0.4)]',
      )}
    >
      {featured && (
        <span className="micro absolute top-6 right-6 rounded-full bg-accent px-2.5 py-1 text-ink">Recommended</span>
      )}
      <h3 className="type-h3">{plan.name}</h3>
      <p className={cn('mt-2 min-h-[3.25rem] text-sm leading-relaxed', featured ? 'text-cream/70' : 'text-muted')}>
        {plan.blurb}
      </p>

      <div className="mt-6 min-h-[5.25rem]">
        {perMonth === null ? (
          <p className="font-serif text-[2.75rem] leading-none tracking-[-0.02em]">Custom</p>
        ) : (
          <>
            <p className="font-serif text-[2.75rem] leading-none tracking-[-0.02em] tabular-nums">
              {format(perMonth, { decimals: 0 })}
              <span className={cn('ml-1.5 font-sans text-sm tracking-normal', featured ? 'text-cream/60' : 'text-muted')}>
                / month
              </span>
            </p>
            <p className={cn('mt-2 text-[13px]', featured ? 'text-cream/60' : 'text-muted')}>
              {!paid
                ? 'Pay only for what you use'
                : annual
                  ? `${format(perMonth * 12, { decimals: 0 })} billed once a year`
                  : 'Billed monthly, cancel any time'}
            </p>
          </>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className={cn('mt-0.5 h-4 w-4 shrink-0', featured ? 'text-glow' : 'text-accent-ink')} strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <ButtonLink
          to={plan.id === 'enterprise' ? '/contact' : '/signup'}
          variant={featured ? 'primary' : 'dark'}
          className="w-full"
        >
          {plan.cta}
        </ButtonLink>
      </div>
    </article>
  );
}

function PlanComparison() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">What each plan includes</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[24%] p-5">
                <span className="sr-only">Feature</span>
              </th>
              {plans.map((plan) => (
                <th key={plan.id} scope="col" className="p-5 font-serif text-xl font-medium tracking-[-0.01em] text-char">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planComparison.map((row) => (
              <tr key={row.label} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                <th scope="row" className="p-5 font-medium text-char">
                  {row.label}
                </th>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-5 text-muted">
                    {row.values[plan.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-serif text-xl tracking-[-0.01em] text-char">{plan.name}</h3>
            <dl className="mt-4 space-y-3">
              {planComparison.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="text-right text-sm font-medium text-char">{row.values[plan.id]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <PageHeader
        label="Pricing"
        title="Pay for what you use. Pay less as you grow."
        intro="Start with a wallet top-up and standard rates. Move to a plan when the discount is worth more than the fee."
        image={images.header_pricing}
      />

      <section className="bg-paper py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented<Billing>
                label="Billing period"
                value={billing}
                onChange={setBilling}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'annual', label: 'Annual' },
                ]}
              />
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  billing === 'annual' ? 'bg-success/20 text-[#0f7a4f]' : 'bg-char/[0.06] text-muted',
                )}
              >
                2 months free with annual
              </span>
            </div>
            <Segmented<Currency>
              label="Currency"
              size="sm"
              value={currency}
              onChange={setCurrency}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'KES', label: 'KES' },
              ]}
            />
          </div>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, index) => (
              <li key={plan.id}>
                <Reveal delay={index * 0.07} className="h-full">
                  <PlanCard plan={plan} billing={billing} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <SectionHeading label="Compare plans" title="What each plan includes." />
          <Reveal delay={0.1} className="mt-10 md:mt-14">
            <PlanComparison />
          </Reveal>
        </div>
      </section>

      <section id="calculator" className="bg-paper py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            label="Bandwidth calculator"
            title="Work out your proxy bill."
            intro="Drag the slider to the volume you expect in a month. The rate drops at each tier."
          />
          <Reveal delay={0.1} className="mt-10 rounded-[28px] border border-line bg-white p-5 sm:p-8 md:mt-14 lg:p-10">
            <BandwidthCalculator />
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            label="Number prices"
            title="Every country has one clear monthly price."
            intro="Choose a country and a number type to see it."
          />
          <Reveal delay={0.1} className="mt-10 rounded-[28px] border border-line bg-paper p-5 sm:p-8 md:mt-14 lg:p-10">
            <NumberPricePicker />
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading label="Billing questions" title="How paying works." />
          <Reveal delay={0.1}>
            <FaqList items={faqs.filter((item) => item.billing)} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

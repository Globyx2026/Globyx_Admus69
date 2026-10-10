import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCurrency, type Currency } from '@/context/CurrencyContext';
import { BandwidthCalculator } from '@/components/pricing/BandwidthCalculator';
import { NumberPricePicker } from '@/components/pricing/NumberPricePicker';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Segmented } from '@/components/ui/Segmented';

type Tab = 'numbers' | 'proxies';

export function PricingPreview() {
  const [tab, setTab] = useState<Tab>('proxies');
  const { currency, setCurrency } = useCurrency();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          label="Live pricing"
          title="Know the price before you sign up."
          intro="Pick a product and move the controls. What you see here is what your wallet is charged."
        />

        <Reveal delay={0.1} className="mt-12 rounded-[28px] border border-line bg-paper p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Segmented<Tab>
              label="Product"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'numbers', label: 'Numbers' },
                { value: 'proxies', label: 'Proxies' },
              ]}
            />
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

          <div className="mt-8">
            {/* Keyed so the panel fades in again each time the tab changes. */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'proxies' ? <BandwidthCalculator /> : <NumberPricePicker />}
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { Hero } from '@/components/home/Hero';
import { LogoStrip } from '@/components/home/LogoStrip';
import { Difference } from '@/components/home/Difference';
import { NumbersShowcase, ProxiesShowcase } from '@/components/home/Showcases';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PricingPreview } from '@/components/home/PricingPreview';
import { Coverage } from '@/components/home/Coverage';
import { UseCases } from '@/components/home/UseCases';
import { DevelopersSection } from '@/components/home/DevelopersSection';
import { Promises } from '@/components/home/Promises';
import { FaqSection, FinalCta } from '@/components/home/Closing';

export default function Home() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <Difference />
      <NumbersShowcase />
      <ProxiesShowcase />
      <HowItWorks />
      <PricingPreview />
      <Coverage />
      <UseCases />
      <DevelopersSection />
      <Promises />
      <FaqSection />
      <FinalCta />
    </>
  );
}

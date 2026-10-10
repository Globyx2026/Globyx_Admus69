import { Link } from 'react-router-dom';
import { faqs } from '@/data/faq';
import { images } from '@/lib/images';
import { ButtonLink } from '@/components/ui/Button';
import { FaqList } from '@/components/ui/FaqList';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function FaqSection() {
  // The home page shows the eight general questions.
  const items = faqs.filter((item) => item.id !== 'annual');

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading label="Questions" title="Answers before you ask." />
          <Reveal delay={0.1}>
            <p className="mt-6 text-[15px] text-muted">
              Something else on your mind?{' '}
              <Link to="/contact" className="font-medium text-char underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink">
                Talk to our team
              </Link>
              .
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <FaqList items={items} />
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      <Photo image={images.cta_bg} sizes="100vw" className="absolute inset-0 -z-20" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to right, rgba(18,16,14,0.9) 0%, rgba(18,16,14,0.55) 50%, rgba(18,16,14,0.15) 100%), linear-gradient(to top, rgba(18,16,14,0.7), transparent 45%)',
        }}
      />
      <Reveal className="shell py-28 md:py-40">
        <h2 className="type-hero max-w-[14ch]">Ready to connect beyond borders?</h2>
        <p className="type-lead mt-6 max-w-lg text-cream/85">
          Create an account, add funds, and have your first number or proxy running today.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink to="/signup" size="lg">
            Create your account
          </ButtonLink>
          <ButtonLink to="/contact" variant="ghost" size="lg">
            Talk to sales
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}

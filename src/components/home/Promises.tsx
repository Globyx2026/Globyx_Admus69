import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * This section stands where customer testimonials will go.
 *
 * The brief asked for three testimonial cards with placeholder people. Made-up
 * customer quotes should not appear on a public site, so until real ones are
 * collected the cards carry Globyx's own commitments instead.
 *
 * TO ADD REAL TESTIMONIALS: fill in `testimonials` below with quotes you have
 * permission to publish. When the list is not empty the section shows them in
 * place of the commitments, in the same card design.
 */
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** Optional portrait URL. Initials are shown when it is missing. */
  photo?: string;
}

const testimonials: Testimonial[] = [];

const commitments = [
  {
    label: 'Clear pricing',
    quote: 'You see the full price before you pay. No surprise setup costs, and no renewal you did not agree to.',
  },
  {
    label: 'Human support',
    quote: 'When something breaks at two in the morning, a person answers. Not a form, and not a queue number.',
  },
  {
    label: 'A clean network',
    quote: 'We check how numbers and IPs are used and remove abuse quickly, so your traffic keeps good company.',
  },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Promises() {
  const showTestimonials = testimonials.length > 0;

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          label={showTestimonials ? 'Customers' : 'Our commitments'}
          title={showTestimonials ? 'What our customers say.' : 'Three things we hold ourselves to.'}
        />

        <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-3">
          {showTestimonials
            ? testimonials.map((item, index) => (
                <Reveal key={item.name} delay={index * 0.08}>
                  <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-8">
                    <blockquote className="font-serif text-[1.375rem] leading-[1.4] tracking-[-0.01em] text-char">
                      “{item.quote}”
                    </blockquote>
                    <figcaption className="mt-auto flex items-center gap-3 pt-8">
                      {item.photo ? (
                        <img src={item.photo} alt="" loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                      ) : (
                        <span className="bg-sunset grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-ink">
                          {initials(item.name)}
                        </span>
                      )}
                      <span>
                        <span className="block text-sm font-medium text-char">{item.name}</span>
                        <span className="block text-[13px] text-muted">{item.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))
            : commitments.map((item, index) => (
                <Reveal key={item.label} delay={index * 0.08}>
                  <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-8">
                    <span aria-hidden="true" className="font-serif text-[4rem] leading-[0.6] text-accent">
                      “
                    </span>
                    <blockquote className="mt-4 font-serif text-[1.375rem] leading-[1.4] tracking-[-0.01em] text-char">
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-auto flex items-center justify-between gap-3 pt-8">
                      <span className="micro text-accent-ink">{item.label}</span>
                      <span className="text-[13px] text-muted">The Globyx team</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}

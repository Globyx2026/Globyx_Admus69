import { HandCoins, Headset, ShieldCheck, Wallet } from 'lucide-react';
import { images } from '@/lib/images';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const values = [
  {
    icon: HandCoins,
    title: 'Say the price',
    body: 'Every number and every gigabyte has a price you can see before you pay. We would rather lose a sale than surprise a customer.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep the network clean',
    body: 'Abuse on a shared network hurts everyone on it. We check how the service is used and act quickly when it is misused.',
  },
  {
    icon: Wallet,
    title: 'Pay the way you already pay',
    body: 'M-Pesa sits next to cards and crypto, and prices show in shillings as readily as dollars. Nobody should need a foreign card to do business abroad.',
  },
  {
    icon: Headset,
    title: 'Put a person on it',
    body: 'When your line is down, you need someone who can fix it. Support is staffed by people who know the product.',
  },
];

export default function About() {
  return (
    <>
      <PageHeader
        label="About Globyx"
        title="We make borders a detail, not a barrier."
        intro="Globyx gives growing teams the two things they need to work in a new country from day one: a local phone number, and a local view of the web."
        image={images.about_story}
      />

      <section className="bg-paper py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <p className="micro text-accent-ink">Our story</p>
            <h2 className="type-h2 mt-4 text-char">Business crosses borders long before offices do.</h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-[17px] leading-[1.75] text-char/80">
            <p className="type-lead text-char">
              A shop in Nairobi sells to London. A freelancer in Lagos works for a studio in Berlin. A two-person team
              runs ads in six countries.
            </p>
            <p>
              They all hit the same two walls. Customers do not pick up calls from a number they do not recognise. And
              the web looks different from every country, so you cannot check your own prices, ads or rankings without
              being there.
            </p>
            <p>
              The tools to fix this have existed for years, but they were built for large companies with foreign bank
              cards and patient procurement teams. Globyx puts numbers and proxies in one account, with one wallet you
              can top up by M-Pesa, and prices you can read before you sign up.
            </p>
            <p>
              We are just as clear about what Globyx is not for. It is not a tool for spam, fake accounts or hiding
              from the services you use. Those uses are banned, and we enforce it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <SectionHeading label="What we value" title="Four rules we run the company by." />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14">
            {values.map(({ icon: Icon, title, body }, index) => (
              <li key={title}>
                <Reveal delay={(index % 2) * 0.08} className="h-full rounded-3xl border border-line bg-paper p-7 md:p-8">
                  <span className="bg-sunset grid h-11 w-11 place-items-center rounded-2xl text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="type-h3 mt-6 text-char">{title}</h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <Photo image={images.about_team} sizes="100vw" className="absolute inset-0 -z-20" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to right, rgba(18,16,14,0.92) 0%, rgba(18,16,14,0.6) 55%, rgba(18,16,14,0.2) 100%)',
          }}
        />
        <Reveal className="shell py-24 md:py-36">
          <p className="micro text-glow">The team</p>
          <h2 className="type-h2 mt-4 max-w-[18ch]">Built by people who work the way our customers do.</h2>
          <p className="type-lead mt-5 max-w-xl text-cream/80">
            Remotely, across time zones, and on a first-name basis with the people we serve. If that sounds like a team
            you would like to talk to, we would like to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/contact" size="lg">
              Get in touch
            </ButtonLink>
            <ButtonLink to="/signup" variant="ghost" size="lg">
              Create an account
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}

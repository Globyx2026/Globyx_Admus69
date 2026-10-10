import { images, type SiteImage } from '@/lib/images';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface UseCase {
  title: string;
  body: string;
  product: string;
  image: SiteImage;
}

export const useCases: UseCase[] = [
  {
    title: 'E-commerce price monitoring',
    body: 'Track competitor prices in each region, exactly as local shoppers see them.',
    product: 'Proxies',
    image: images.usecase_ecommerce,
  },
  {
    title: 'Customer support lines',
    body: 'Give customers a local number to call or text, wherever your team sits.',
    product: 'Numbers',
    image: images.usecase_support,
  },
  {
    title: 'Ad verification',
    body: 'Confirm your ads appear correctly in every market you pay for.',
    product: 'Proxies',
    image: images.usecase_ads,
  },
  {
    title: 'SEO and SERP tracking',
    body: 'See real search rankings by country and by city.',
    product: 'Proxies',
    image: images.usecase_seo,
  },
  {
    title: 'Market research',
    body: 'Collect public data at scale over stable, well-sourced IPs.',
    product: 'Proxies',
    image: images.usecase_research,
  },
  {
    title: 'Freelancers and remote teams',
    body: 'Keep a business line that is separate from your personal number.',
    product: 'Numbers',
    image: images.usecase_freelancer,
  },
];

export function UseCases() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          label="Use cases"
          title="Built for honest work, at any scale."
          intro="Globyx is for legitimate business use. These are the jobs it is built for."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {useCases.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={(index % 3) * 0.08}>
                <article className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 text-cream sm:aspect-[4/4.6]">
                  <Photo
                    image={item.image}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    widths={[400, 640, 900]}
                    className="absolute inset-0 -z-20"
                    imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/95 via-ink/45 to-ink/5" />
                  <p className="micro absolute top-6 left-6 rounded-full border border-white/20 bg-ink/35 px-2.5 py-1 text-cream/85 backdrop-blur-md">
                    {item.product}
                  </p>
                  <h3 className="type-h3">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-cream/75">{item.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

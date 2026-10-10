import { motion } from 'framer-motion';
import { images, imageSrcSet, imageUrl } from '@/lib/images';
import { ButtonLink } from '@/components/ui/Button';
import { ActivityFeed } from './ActivityFeed';

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero() {
  const desktop = images.hero_desktop;
  const mobile = images.hero_mobile;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink text-cream">
      {/* Photograph: a tall crop on phones, the wide frame from tablet up. */}
      <div className="photo-grade absolute inset-0 -z-20 overflow-hidden">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={imageSrcSet(desktop, [1280, 1920, 2560]) ?? imageUrl(desktop, 1920)}
            sizes="100vw"
          />
          <img
            src={imageUrl(mobile, 828, 1472)}
            srcSet={imageSrcSet(mobile, [640, 828, 1080], 16 / 9)}
            sizes="100vw"
            alt={desktop.alt}
            decoding="async"
            {...{ fetchpriority: 'high' }}
            className="h-full w-full animate-slow-zoom object-cover object-[58%_40%] md:object-[50%_40%]"
          />
        </picture>
      </div>

      {/* Dark wash from the bottom-left keeps the headline readable. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top right, rgba(18,16,14,0.94) 0%, rgba(18,16,14,0.68) 34%, rgba(18,16,14,0.18) 66%, rgba(18,16,14,0) 100%), linear-gradient(to bottom, rgba(18,16,14,0.6) 0%, rgba(18,16,14,0) 24%)',
        }}
      />

      {/* Extra wash while the layout is stacked and the text sits over the sun. */}
      <div className="absolute inset-0 -z-10 bg-ink/40 lg:hidden" />

      <div className="shell grid gap-12 pt-32 pb-10 md:pb-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}>
          <motion.h1 variants={rise} className="type-hero max-w-[15ch]">
            Phone numbers and proxies for a borderless business.
          </motion.h1>
          <motion.p variants={rise} className="type-lead mt-6 max-w-xl text-cream/85">
            Rent local numbers in 60+ countries and route your traffic through residential, mobile, ISP and datacenter
            IPs. One wallet, one dashboard.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/#platform" size="lg">
              Explore the platform
            </ButtonLink>
            <ButtonLink to="/pricing" variant="ghost" size="lg">
              See pricing
            </ButtonLink>
          </motion.div>
          <motion.p
            variants={rise}
            className="micro mt-10 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-ink/40 px-4 py-2 text-cream/85 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            190+ countries · 99.9% uptime
          </motion.p>
        </motion.div>

        <ActivityFeed className="lg:ml-auto" />
      </div>
    </section>
  );
}

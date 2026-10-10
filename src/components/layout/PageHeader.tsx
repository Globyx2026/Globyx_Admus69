import type { ReactNode } from 'react';
import type { SiteImage } from '@/lib/images';
import { Photo } from '@/components/ui/Photo';

interface PageHeaderProps {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: SiteImage;
  children?: ReactNode;
}

/** Dark opening band used at the top of every inner page. */
export function PageHeader({ label, title, intro, image, children }: PageHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {image && (
        <Photo image={image} priority sizes="100vw" className="absolute inset-0 -z-20" imgClassName="opacity-80" />
      )}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: image
            ? 'linear-gradient(180deg, rgba(18,16,14,0.72) 0%, rgba(18,16,14,0.5) 40%, rgba(18,16,14,0.92) 100%)'
            : 'radial-gradient(90% 120% at 85% -10%, rgba(255,90,31,0.22), transparent 55%)',
        }}
      />
      <div className="shell pt-36 pb-14 md:pt-48 md:pb-20">
        <p className="micro text-glow">{label}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.05] font-medium tracking-[-0.02em] text-balance">
          {title}
        </h1>
        {intro && <p className="type-lead mt-5 max-w-2xl text-cream/75">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

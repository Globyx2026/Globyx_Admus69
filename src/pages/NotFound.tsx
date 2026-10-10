import { images } from '@/lib/images';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-cream">
      <Photo image={images.not_found} priority sizes="100vw" className="absolute inset-0 -z-20" />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top right, rgba(18,16,14,0.94) 0%, rgba(18,16,14,0.6) 45%, rgba(18,16,14,0.2) 100%), linear-gradient(to bottom, rgba(18,16,14,0.55), transparent 25%)',
        }}
      />
      <div className="shell pt-40 pb-16 md:pb-24">
        <p className="micro text-glow">Error 404</p>
        <h1 className="type-hero mt-4">Lost in transit.</h1>
        <p className="type-lead mt-5 max-w-md text-cream/80">
          This page does not exist, or it has moved. The links below will get you back on route.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/" size="lg">
            Back to the home page
          </ButtonLink>
          <ButtonLink to="/numbers" variant="ghost" size="lg">
            Browse numbers
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

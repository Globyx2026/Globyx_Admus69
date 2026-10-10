import { useEffect, useRef, useState, type ReactNode } from 'react';
import { imagePlaceholder, imageSrcSet, imageUrl, type SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

interface PhotoProps {
  image: SiteImage;
  /** Classes for the frame. It is `relative` unless you pass `absolute`. */
  className?: string;
  imgClassName?: string;
  /** The `sizes` attribute, so the browser picks the right file. */
  sizes?: string;
  widths?: number[];
  /** Load immediately (use for the first image on a page only). */
  priority?: boolean;
  /** Apply the shared warm colour grade. */
  grade?: boolean;
  children?: ReactNode;
}

const DEFAULT_WIDTHS = [480, 800, 1200, 1600, 2400];

/**
 * Lazy-loaded, object-cover photograph with a blurred placeholder that fades
 * into the full image once it has loaded.
 */
export function Photo({
  image,
  className,
  imgClassName,
  sizes = '100vw',
  widths = DEFAULT_WIDTHS,
  priority = false,
  grade = true,
  children,
}: PhotoProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const placeholder = imagePlaceholder(image);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div
      className={cn('relative overflow-hidden bg-ink-3', grade && 'photo-grade', className)}
      style={
        placeholder
          ? {
              backgroundImage: `url(${placeholder})`,
              backgroundSize: 'cover',
              backgroundPosition: image.focus ?? 'center',
            }
          : undefined
      }
    >
      <img
        ref={ref}
        src={imageUrl(image, widths[Math.min(2, widths.length - 1)])}
        srcSet={imageSrcSet(image, widths)}
        sizes={sizes}
        alt={image.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchpriority: 'high' } : {})}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
        style={{ objectPosition: image.focus }}
      />
      {children}
    </div>
  );
}

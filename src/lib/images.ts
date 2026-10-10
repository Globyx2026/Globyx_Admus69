/**
 * Every photograph on the site is listed here. To swap one, change its `src`
 * to another Unsplash photo id ("photo-...") or to any full image URL, or to
 * a file you put in /public (for example "/photos/hero.jpg").
 *
 * All photos are real nature photography from Unsplash (free licence), chosen
 * for a shared golden-hour palette. The `photo-grade` CSS utility adds one
 * warm overlay on top so they read as a set.
 */

export interface SiteImage {
  /** Unsplash photo id, full URL, or a path under /public. */
  src: string;
  alt: string;
  /** Photographer, for the credits list in the README. */
  credit?: string;
  /** CSS object-position, to steer the crop. */
  focus?: string;
}

const UNSPLASH = 'https://images.unsplash.com/';

function isUnsplash(image: SiteImage): boolean {
  return image.src.startsWith('photo-');
}

/**
 * Builds the URL for a photo at a given pixel width. Pass a height as well to
 * get a centre crop at that exact size (used for the tall mobile hero).
 */
export function imageUrl(image: SiteImage, width: number, height?: number): string {
  if (!isUnsplash(image)) return image.src;
  const crop = height ? `&h=${height}` : '';
  return `${UNSPLASH}${image.src}?auto=format&fit=crop&w=${width}${crop}&q=72`;
}

/** A `srcset` of several widths. `ratio` is height / width for a fixed crop. */
export function imageSrcSet(image: SiteImage, widths: number[], ratio?: number): string | undefined {
  if (!isUnsplash(image)) return undefined;
  return widths
    .map((w) => `${imageUrl(image, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`)
    .join(', ');
}

/** Tiny blurred version shown while the full photo loads. */
export function imagePlaceholder(image: SiteImage): string | undefined {
  if (!isUnsplash(image)) return undefined;
  return `${UNSPLASH}${image.src}?auto=format&fit=crop&w=48&q=30&blur=60`;
}

export const images = {
  hero_desktop: {
    src: 'photo-1781825151998-9c4acca59a4c',
    alt: 'Aerial view of a long sandy coastline at golden hour, with the sun low over the horizon and waves rolling in',
    credit: 'Junel Mujar',
    focus: '50% 40%',
  },
  hero_mobile: {
    src: 'photo-1781825151998-9c4acca59a4c',
    alt: 'Aerial view of a long sandy coastline at golden hour, with the sun low over the horizon and waves rolling in',
    credit: 'Junel Mujar',
    focus: '58% 40%',
  },
  numbers_showcase: {
    src: 'photo-1559740451-b895701fa4b5',
    alt: 'Tall grass glowing in the last light of the day, with the sun setting behind a line of trees',
    credit: 'Samuel Myles',
  },
  proxies_showcase: {
    src: 'photo-1605810257524-b66f77c5066d',
    alt: 'Beams of warm sunlight streaming between tall forest trees',
    credit: 'Maxim Hopman',
  },
  usecase_ecommerce: {
    src: 'photo-1603657523988-76184975d205',
    alt: 'Mountain ridges lit orange under a glowing evening sky',
    credit: 'Jake Weirick',
  },
  usecase_support: {
    src: 'photo-1669820509976-e1b0d9216c25',
    alt: 'A still lake at sunrise with mist rising in front of an autumn treeline',
    credit: 'Samuel Girven',
  },
  usecase_ads: {
    src: 'photo-1604358700679-618e30e1d3b8',
    alt: 'Close-up of dry grass seed heads backlit by warm evening light',
    credit: 'Janan',
  },
  usecase_seo: {
    src: 'photo-1557995744-18c7f67f4307',
    alt: 'Rippled sand dunes stretching to the horizon in warm light',
    credit: 'Christian Weiss',
  },
  usecase_research: {
    src: 'photo-1611273651216-29b4f282d36b',
    alt: 'Sunbeams breaking through fog over a forest canopy, seen from above',
    credit: 'Brendan Beale',
  },
  usecase_freelancer: {
    src: 'photo-1516026672322-bc52d61a55d5',
    alt: 'A lone acacia tree on the savanna at sunset, with hills in the distance',
    credit: 'Hu Chen',
  },
  about_story: {
    src: 'photo-1547471080-7cc2caa01a7e',
    alt: 'A single tree on an open plain under a dramatic orange sunset sky',
    credit: 'Damian Patkowski',
    focus: '50% 60%',
  },
  about_team: {
    src: 'photo-1603346996604-cd77fc859e1d',
    alt: 'Morning light falling in beams across a green forest clearing',
    credit: 'Erik van Dijk',
  },
  cta_bg: {
    src: 'photo-1503803548695-c2a7b4a5b875',
    alt: 'The sun breaking through clouds over a calm sea at golden hour',
    credit: 'Sebastien Gabriel',
    focus: '50% 45%',
  },
  auth_login: {
    src: 'photo-1504386106331-3e4e71712b38',
    alt: 'The sun above layered mountain silhouettes under a deep orange sky',
    credit: 'Andrey Grinkevich',
  },
  auth_signup: {
    src: 'photo-1500964757637-c85e8a162699',
    alt: 'Layers of mountains fading into a pink and gold sunset',
    credit: 'simon',
  },
  header_numbers: {
    src: 'photo-1708748513828-2227f6d39c04',
    alt: 'The sharp crest of a sand dune, half in sunlight and half in shadow',
    credit: 'Tim Arterbury',
  },
  header_proxies: {
    src: 'photo-1558709995-98a2f442ecca',
    alt: 'Soft, wind-shaped sand dunes in low evening light',
    credit: 'Christian Weiss',
  },
  header_pricing: {
    src: 'photo-1618768638775-4e4b35be986e',
    alt: 'A dark dune ridge against a pale, glowing sky',
    credit: 'Brandon Smith',
    focus: '50% 70%',
  },
  header_contact: {
    src: 'photo-1784350724014-b65f93d2457b',
    alt: 'A small boat on a calm, misty lake with mountains behind at sunset',
    credit: 'Nguyễn Đức',
    focus: '50% 70%',
  },
  header_developers: {
    src: 'photo-1575571991314-295b0809f460',
    alt: 'A river winding through marshland, seen from the air in evening light',
    credit: 'Andrew Banner',
    focus: '50% 70%',
  },
  not_found: {
    src: 'photo-1554213808-9c5bab0f624e',
    alt: 'An empty sea under a red sunset sky',
    credit: 'Hannah Reding',
  },
} satisfies Record<string, SiteImage>;

export type ImageSlot = keyof typeof images;

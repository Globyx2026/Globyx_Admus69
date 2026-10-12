/**
 * Every photograph on the site is listed here. To swap one, change its `src`
 * to another Unsplash photo id ("photo-...") or to any full image URL, or to
 * a file you put in /public (for example "/photos/hero.jpg").
 *
 * All photos are real photographs of world landmarks and natural wonders from
 * Unsplash (free licence), one per page or section, from the Great Wall of
 * China in the hero to the moai of Easter Island on the "not found" page. The
 * `photo-grade` CSS utility adds a light finishing touch so they read as a set.
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
    src: 'photo-1718027808460-7069cf0ca9ae',
    alt: 'The Great Wall of China at Jinshanling running along a mountain ridge under a blazing red and orange sunset sky',
    credit: 'chen zy',
    focus: '50% 45%',
  },
  hero_mobile: {
    src: 'photo-1718027808460-7069cf0ca9ae',
    alt: 'The Great Wall of China at Jinshanling running along a mountain ridge under a blazing red and orange sunset sky',
    credit: 'chen zy',
    focus: '60% 45%',
  },
  numbers_showcase: {
    src: 'photo-1618811308896-d279d72fdf4d',
    alt: 'Victoria Falls pouring into the gorge as the sun sets behind a veil of rising spray',
    credit: 'Sammy Wong',
  },
  proxies_showcase: {
    src: 'photo-1678995760721-03f9ed8bdfd2',
    alt: 'Salar de Uyuni in Bolivia turned into a mirror at sunset, a lone car reflected in the flooded salt flat under a pink and violet sky',
    credit: 'Christian Ruehmer',
  },
  usecase_ecommerce: {
    src: 'photo-1512453979798-5ea266f8880c',
    alt: 'Downtown Dubai at sunrise, with the Burj Khalifa rising above skyscrapers and a sweeping highway interchange',
    credit: 'David Rodrigo',
  },
  usecase_support: {
    src: 'photo-1624138784614-87fd1b6528f8',
    alt: 'Sydney Opera House and the Harbour Bridge on a bright harbour, seen from above',
    credit: 'Caleb',
  },
  usecase_ads: {
    src: 'photo-1577871598838-a543ee47cd79',
    alt: 'A red-sailed junk boat crossing Victoria Harbour in front of the lit Hong Kong skyline at night',
    credit: 'Andres Garcia',
  },
  usecase_seo: {
    src: 'photo-1600520611035-84157ad4084d',
    alt: 'The Pyramids of Giza standing in the desert under a blue sky with white clouds',
    credit: 'Osama Elsayed',
  },
  usecase_research: {
    src: 'photo-1723134084358-20a2dc177ff1',
    alt: 'Machu Picchu catching the first morning sun, with Huayna Picchu and the Andes behind',
    credit: 'Ed Wingate',
  },
  usecase_freelancer: {
    src: 'photo-1580502304784-8985b7eb7260',
    alt: 'The white houses of Oia on Santorini glowing on the cliffside above the Aegean at dusk',
    credit: 'James Ting',
  },
  about_story: {
    src: 'photo-1740928507728-841d214e1b3c',
    alt: 'A herd of elephants crossing the dusty Amboseli plains in Kenya with Mount Kilimanjaro behind',
    credit: 'Simone Dinoia',
    focus: '50% 55%',
  },
  about_team: {
    src: 'photo-1548013146-72479768bada',
    alt: 'The Taj Mahal in Agra framed by a carved red sandstone archway',
    credit: 'Sylwia Bartyzel',
  },
  cta_bg: {
    src: 'photo-1517928260182-5688aead3066',
    alt: 'Vivid green northern lights swirling over a dark glacial lagoon in Iceland',
    credit: 'v2osk',
    focus: '50% 40%',
  },
  auth_login: {
    src: 'photo-1679231926688-ef9cdab5ed2f',
    alt: 'The Eiffel Tower and the Champ de Mars seen from the air as the sun sets over Paris',
    credit: 'Timelab',
  },
  auth_signup: {
    src: 'photo-1578637387939-43c525550085',
    alt: 'The snow-capped peak of Mount Fuji lit warm by the evening sun under a clear sky',
    credit: 'Aditya Anjagi',
  },
  header_numbers: {
    src: 'photo-1580834341580-8c17a3a630ca',
    alt: 'The Treasury of Petra in Jordan, carved into rose-coloured sandstone, seen from the cliffs above the Siq',
    credit: 'Alex Vasey',
    focus: '50% 45%',
  },
  header_proxies: {
    src: 'photo-1641128324972-af3212f0f6bd',
    alt: 'Hot air balloons drifting over the sunlit rock formations of Cappadocia in Turkey',
    credit: 'Ramzi Belaidi',
    focus: '50% 40%',
  },
  header_pricing: {
    src: 'photo-1531694402898-042bd3957f41',
    alt: 'Horseshoe Bend in Arizona, where the Colorado River loops around a red rock outcrop as the sun rises over the canyon',
    credit: 'Tom Gainor',
    focus: '50% 50%',
  },
  header_contact: {
    src: 'photo-1580644906000-6e953181e153',
    alt: 'Table Mountain in Cape Town under drifting cloud, with yellow wildflowers in the foreground',
    credit: 'Tobias Reich',
    focus: '50% 45%',
  },
  header_developers: {
    src: 'photo-1450149632596-3ef25a62011a',
    alt: 'The Golden Gate Bridge in San Francisco under a purple and pink sky at golden hour',
    credit: 'Umer Sayyam',
    focus: '50% 55%',
  },
  not_found: {
    src: 'photo-1617925173097-f7084b2534cc',
    alt: 'A row of moai statues on Rapa Nui (Easter Island) in silhouette against the setting sun',
    credit: 'Thomas Griggs',
  },
} satisfies Record<string, SiteImage>;

export type ImageSlot = keyof typeof images;

/**
 * Company details used across the site. Change them here once.
 * TODO before launch: confirm the domain, email addresses and API base URL.
 */
export const site = {
  name: 'Globyx',
  tagline: 'Connect beyond borders.',
  supportEmail: 'support@globyx.com',
  salesEmail: 'sales@globyx.com',
  apiBase: 'https://api.globyx.com/v1',
  /** Mock exchange rate for the USD/KES toggle. BACKEND: load a live rate. */
  kesPerUsd: 129,
} as const;

export interface NavItem {
  label: string;
  to: string;
}

export const primaryNav: NavItem[] = [
  { label: 'Numbers', to: '/numbers' },
  { label: 'Proxies', to: '/proxies' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Developers', to: '/developers' },
];

export const companyNav: NavItem[] = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/**
 * PLACEHOLDER STATS. These are launch targets, not measured figures.
 * Replace them with real numbers before the site goes public.
 */
export const headlineStats = [
  { value: 190, suffix: '+', label: 'Countries' },
  { value: 5, suffix: 'M+', label: 'IP addresses' },
  { value: 99.9, suffix: '%', decimals: 1, label: 'Uptime' },
  { value: 24, suffix: '/7', label: 'Support' },
] as const;

/**
 * MOCK DATA: proxy rates and subscription plans, in USD.
 * BACKEND: move to Supabase tables so prices can change without a deploy.
 */

export type ProxyKind = 'residential' | 'mobile' | 'isp' | 'datacenter';

export interface VolumeTier {
  /** Tier applies from this many GB upward. */
  minGb: number;
  /** Price per GB in USD. */
  perGb: number;
}

/** Price per GB falls as volume rises. Tiers must be sorted by minGb. */
export const bandwidthTiers: Record<'residential' | 'mobile', VolumeTier[]> = {
  residential: [
    { minGb: 1, perGb: 4.0 },
    { minGb: 5, perGb: 3.6 },
    { minGb: 25, perGb: 3.2 },
    { minGb: 100, perGb: 2.8 },
    { minGb: 250, perGb: 2.4 },
    { minGb: 500, perGb: 2.0 },
  ],
  mobile: [
    { minGb: 1, perGb: 8.0 },
    { minGb: 5, perGb: 7.2 },
    { minGb: 25, perGb: 6.5 },
    { minGb: 100, perGb: 5.8 },
    { minGb: 250, perGb: 5.2 },
    { minGb: 500, perGb: 4.6 },
  ],
};

export interface BandwidthQuote {
  perGb: number;
  total: number;
  /** Fraction saved against the 1 GB rate, from 0 to 1. */
  saving: number;
  tierIndex: number;
}

export function quoteBandwidth(kind: 'residential' | 'mobile', gb: number): BandwidthQuote {
  const tiers = bandwidthTiers[kind];
  let tierIndex = 0;
  tiers.forEach((tier, index) => {
    if (gb >= tier.minGb) tierIndex = index;
  });
  const perGb = tiers[tierIndex].perGb;
  return { perGb, total: perGb * gb, saving: 1 - perGb / tiers[0].perGb, tierIndex };
}

export interface ProxyProduct {
  kind: ProxyKind;
  name: string;
  summary: string;
  billing: string;
  /** Lowest price in USD, with the unit it applies to. */
  from: number;
  unit: 'GB' | 'IP / month';
  source: string;
  rotation: string;
  speed: string;
  bestFor: string;
  points: string[];
}

export const proxyProducts: ProxyProduct[] = [
  {
    kind: 'residential',
    name: 'Residential',
    summary: 'Real home connections for work that needs to look like an everyday visitor.',
    billing: 'Per GB',
    from: 2.0,
    unit: 'GB',
    source: 'Home broadband, with consent',
    rotation: 'Per request or sticky up to 30 min',
    speed: 'Good',
    bestFor: 'Price monitoring, ad verification',
    points: ['Country and city targeting', 'Rotating or sticky sessions', 'Unlimited concurrent connections'],
  },
  {
    kind: 'mobile',
    name: 'Mobile',
    summary: '3G, 4G and 5G carrier connections for testing how mobile users see your product.',
    billing: 'Per GB',
    from: 4.6,
    unit: 'GB',
    source: 'Mobile carriers',
    rotation: 'Per request or sticky up to 30 min',
    speed: 'Moderate',
    bestFor: 'App testing, mobile ad checks',
    points: ['Carrier-level targeting', 'Highest trust on mobile-first sites', 'Rotating or sticky sessions'],
  },
  {
    kind: 'isp',
    name: 'ISP static',
    summary: 'Fixed addresses registered to internet providers. Fast, and yours for the month.',
    billing: 'Per IP, monthly',
    from: 2.8,
    unit: 'IP / month',
    source: 'Internet service providers',
    rotation: 'Static',
    speed: 'Very fast',
    bestFor: 'Account management, long sessions',
    points: ['One address, all month', 'Unmetered bandwidth', 'Pick the city you need'],
  },
  {
    kind: 'datacenter',
    name: 'Datacenter',
    summary: 'The fastest and most affordable option for high-volume work on tolerant sites.',
    billing: 'Per IP, monthly',
    from: 1.2,
    unit: 'IP / month',
    source: 'Cloud data centres',
    rotation: 'Static or rotating pool',
    speed: 'Fastest',
    bestFor: 'SEO tracking, bulk public data',
    points: ['Lowest cost per request', 'Unmetered bandwidth', 'Dedicated or shared pools'],
  },
];

export interface Plan {
  id: 'payg' | 'growth' | 'scale' | 'enterprise';
  name: string;
  /** Monthly price in USD when billed monthly. Null means "talk to us". */
  monthly: number | null;
  blurb: string;
  cta: string;
  featured?: boolean;
  features: string[];
}

/** Paying annually takes two months off the yearly total. */
export const ANNUAL_DISCOUNT = 2 / 12;

export const plans: Plan[] = [
  {
    id: 'payg',
    name: 'Pay as you go',
    monthly: 0,
    blurb: 'Top up your wallet and pay standard rates. No commitment.',
    cta: 'Start free',
    features: ['Numbers in every supported country', 'All four proxy networks', 'M-Pesa, card and crypto top-ups', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 49,
    blurb: 'For teams that use Globyx every week and want lower rates.',
    cta: 'Choose Growth',
    featured: true,
    features: ['10% off all bandwidth', '5 team seats', 'Webhooks and API access', 'Priority chat support'],
  },
  {
    id: 'scale',
    name: 'Scale',
    monthly: 199,
    blurb: 'For high-volume operations that need room and a named contact.',
    cta: 'Choose Scale',
    features: ['20% off all bandwidth', 'Unlimited team seats', 'Usage reports and invoices by email', 'Dedicated account manager'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: null,
    blurb: 'Custom volumes, contracts and compliance reviews.',
    cta: 'Talk to sales',
    features: ['Volume pricing', 'Service-level agreement', 'Single sign-on', 'Security and compliance review'],
  },
];

export interface PlanComparisonRow {
  label: string;
  values: Record<Plan['id'], string>;
}

export const planComparison: PlanComparisonRow[] = [
  { label: 'Bandwidth discount', values: { payg: 'Standard rates', growth: '10%', scale: '20%', enterprise: 'Custom' } },
  { label: 'Team seats', values: { payg: '1', growth: '5', scale: 'Unlimited', enterprise: 'Unlimited' } },
  { label: 'API and webhooks', values: { payg: 'Included', growth: 'Included', scale: 'Included', enterprise: 'Included' } },
  { label: 'Concurrent proxy sessions', values: { payg: '100', growth: '500', scale: 'Unlimited', enterprise: 'Unlimited' } },
  { label: 'Support', values: { payg: 'Email', growth: 'Priority chat', scale: 'Account manager', enterprise: 'Account manager + SLA' } },
  { label: 'Invoicing', values: { payg: 'Receipts', growth: 'Monthly invoice', scale: 'Monthly invoice', enterprise: 'Custom terms' } },
];

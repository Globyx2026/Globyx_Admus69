/**
 * Legal pages.
 *
 * IMPORTANT: these are plain-language starting drafts, not legal advice. Have
 * a lawyer review all three against the laws of the countries you operate in
 * (and the terms of your number and proxy providers) before the site launches.
 */

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: 'acceptable-use' | 'terms' | 'privacy';
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
}

const UPDATED = 'October 2026';

export const legalDocuments: LegalDocument[] = [
  {
    slug: 'acceptable-use',
    title: 'Acceptable Use Policy',
    summary:
      'Globyx exists for legitimate business. This policy says what you may not do with our numbers and proxies, and what happens if you do.',
    updated: UPDATED,
    sections: [
      {
        id: 'who',
        heading: 'Who this applies to',
        paragraphs: [
          'This policy applies to everyone who uses Globyx: account owners, team members, and anyone who reaches our services through your API keys. You are responsible for what is done with your account.',
        ],
      },
      {
        id: 'banned',
        heading: 'What is not allowed',
        paragraphs: ['You may not use Globyx numbers, proxies or APIs for any of the following.'],
        bullets: [
          'Fraud of any kind, including payment fraud, identity fraud, phishing, and impersonating a person or organisation.',
          'Spam: unsolicited bulk messages or calls, or messages sent to people who have not agreed to receive them.',
          'Harassment, threats, stalking, or contacting someone who has asked you to stop.',
          'Account-creation abuse: creating accounts in bulk on other services, or using numbers to pass another service’s phone verification in order to hide who you are or to get around its limits.',
          'Getting around bans, rate limits or access controls that another service has applied to you.',
          'Credential stuffing, password guessing, or any attempt to access accounts or systems that are not yours.',
          'Scraping personal data, or any data you are not legally permitted to collect.',
          'Denial-of-service attacks, malware distribution, or scanning networks you do not own.',
          'Ticket scalping, sneaker bots, and other automated buying that breaks the seller’s terms.',
          'Anything that is illegal where you are, where we are, or where the traffic or call ends up.',
        ],
      },
      {
        id: 'allowed',
        heading: 'What Globyx is for',
        bullets: [
          'Business phone lines and customer support numbers.',
          'Keeping a work number separate from a personal one.',
          'Price monitoring, ad verification, and SEO and search-result tracking.',
          'Market research on publicly available data.',
          'Testing how your own website or app behaves in other countries.',
        ],
      },
      {
        id: 'verification',
        heading: 'Identity checks',
        paragraphs: [
          'Carriers and regulators require us to know who our customers are. We may ask you to verify your identity or your business before we activate certain numbers or raise your limits, and we may ask what you plan to use the service for.',
        ],
      },
      {
        id: 'enforcement',
        heading: 'What happens if you break this policy',
        paragraphs: [
          'We monitor for abuse. If we believe an account is breaking this policy we may limit it, suspend it or close it, with or without notice, and release its numbers. Wallet balances on accounts closed for fraud or abuse are not refunded. Where the law requires it, we report activity to the relevant authorities.',
        ],
      },
      {
        id: 'report',
        heading: 'Reporting abuse',
        paragraphs: [
          'If you have received an unwanted call or message from a Globyx number, or seen abusive traffic from our network, write to abuse@globyx.com with the number or address involved, and the date and time. We investigate every report.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    summary: 'The agreement between you and Globyx when you create an account or use our services.',
    updated: UPDATED,
    sections: [
      {
        id: 'agreement',
        heading: 'The agreement',
        paragraphs: [
          'By creating an account or using Globyx you agree to these terms and to our Acceptable Use Policy and Privacy Policy. If you use Globyx on behalf of a company, you confirm that you are allowed to accept these terms for it.',
        ],
      },
      {
        id: 'account',
        heading: 'Your account',
        paragraphs: [
          'You must give accurate information when you sign up and keep it up to date. Keep your password and API keys secret. Tell us straight away if you think someone else has access to your account.',
        ],
      },
      {
        id: 'services',
        heading: 'Numbers and proxies',
        paragraphs: [
          'Numbers are rented, not sold. A number stays yours for as long as its rental is paid; if a renewal fails we may release it after a grace period. Some numbers come with rules set by the carrier or the local regulator, and we will tell you about these before you buy.',
          'Proxy bandwidth and addresses are provided for your own use and may not be resold without our written agreement.',
        ],
      },
      {
        id: 'payment',
        heading: 'Wallet and payment',
        paragraphs: [
          'You pay by adding funds to a wallet and spending from it. Prices are shown before you confirm a purchase. Unused wallet balance can be refunded to the original payment method within 14 days of a top-up. Purchases that have already been activated are not refundable.',
        ],
      },
      {
        id: 'availability',
        heading: 'Availability',
        paragraphs: [
          'We work to keep Globyx running at all times but we do not promise uninterrupted service. Phone networks and the internet depend on third parties, and planned maintenance is sometimes necessary.',
        ],
      },
      {
        id: 'ending',
        heading: 'Ending the agreement',
        paragraphs: [
          'You may close your account at any time. We may suspend or close an account that breaks these terms or the Acceptable Use Policy.',
        ],
      },
      {
        id: 'liability',
        heading: 'Liability',
        paragraphs: [
          'To the extent the law allows, Globyx is not liable for indirect or consequential losses, and our total liability for any claim is limited to the amount you paid us in the three months before it arose.',
        ],
      },
      {
        id: 'changes',
        heading: 'Changes to these terms',
        paragraphs: [
          'We may update these terms. If a change is significant we will tell you by email or in the dashboard before it takes effect.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary: 'What personal data Globyx collects, why we collect it, and the choices you have.',
    updated: UPDATED,
    sections: [
      {
        id: 'collect',
        heading: 'What we collect',
        bullets: [
          'Account details: your name, email address and, where needed, your company name.',
          'Verification documents, when a carrier or regulator requires an identity check.',
          'Payment records: amounts, dates and the method used. Card numbers are handled by our payment provider and never stored by us.',
          'Usage records: which numbers and proxy plans you use, call and message logs, and bandwidth totals.',
          'Technical data: IP address, browser type and pages visited, to keep the service secure.',
        ],
      },
      {
        id: 'use',
        heading: 'How we use it',
        bullets: [
          'To provide the service and bill you correctly.',
          'To meet legal duties placed on phone and internet providers.',
          'To detect and stop fraud and abuse.',
          'To tell you about changes to the service. Marketing email is sent only if you opt in, and every message has an unsubscribe link.',
        ],
      },
      {
        id: 'share',
        heading: 'Who we share it with',
        paragraphs: [
          'We share data only with the providers that help us run Globyx (carriers, proxy network partners, payment processors and hosting), and with authorities when the law requires it. We do not sell personal data.',
        ],
      },
      {
        id: 'retention',
        heading: 'How long we keep it',
        paragraphs: [
          'We keep account and billing records for as long as your account is open and for the period the law requires afterwards. Message content is kept in your inbox until you delete it or close your account.',
        ],
      },
      {
        id: 'rights',
        heading: 'Your rights',
        paragraphs: [
          'You can ask for a copy of your data, ask us to correct it, or ask us to delete it. Some records must be kept by law even after an account is closed. To make a request, write to privacy@globyx.com.',
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookies',
        paragraphs: [
          'This site stores a few small items in your browser to remember your choices, such as currency. We do not use advertising cookies.',
        ],
      },
    ],
  },
];

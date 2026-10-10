export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Shown on the pricing page as well as the home page. */
  billing?: boolean;
}

export const faqs: FaqItem[] = [
  {
    id: 'virtual-number',
    question: 'What is a virtual number?',
    answer:
      'A real phone number that lives in the cloud instead of on a SIM card. People call and text it as normal, and you answer from the Globyx dashboard, forward calls to any phone, or receive every message through the API.',
  },
  {
    id: 'proxy-types',
    question: 'What is the difference between residential and datacenter proxies?',
    answer:
      'Residential proxies route your requests through home internet connections, so websites see an ordinary visitor from that country or city. Datacenter proxies come from cloud servers: they are faster and cheaper, and work best on sites that do not mind automated traffic.',
  },
  {
    id: 'billing',
    question: 'How does billing work?',
    answer:
      'You add funds to a wallet by M-Pesa, card or crypto, then spend from it. Numbers are charged monthly. Residential and mobile proxies are charged per GB used, and ISP and datacenter proxies per address per month. A paid plan lowers your bandwidth rate.',
    billing: true,
  },
  {
    id: 'refunds',
    question: 'Can I get a refund?',
    answer:
      'Unused wallet balance can be refunded to the original payment method within 14 days of a top-up. Numbers and proxies that have already been activated are not refundable, but you can cancel renewal at any time.',
    billing: true,
  },
  {
    id: 'countries',
    question: 'Which countries do you support?',
    answer:
      'Numbers are available in 60+ countries across Africa, Europe, the Americas and Asia Pacific, and proxies in 190+. The catalogue shows what is in stock right now, with the price for each country.',
  },
  {
    id: 'acceptable-use',
    question: 'What am I not allowed to do with Globyx?',
    answer:
      'Globyx is for legitimate business use. Fraud, spam, harassment, creating accounts in bulk, getting around another service’s verification, and anything illegal are banned and lead to suspension. The full list is in our Acceptable Use Policy.',
  },
  {
    id: 'kyc',
    question: 'Do I need to verify my identity?',
    answer:
      'For some countries and higher spending limits, yes. Carriers and regulators require us to know who is using a number, so we may ask for an ID document or business registration. Most checks finish within one working day.',
  },
  {
    id: 'support',
    question: 'How do I reach support?',
    answer:
      'Use the chat inside the dashboard or send us a message from the contact page. Support is staffed around the clock, and paid plans get priority.',
  },
  {
    id: 'annual',
    question: 'What do I save by paying annually?',
    answer:
      'Annual billing takes two months off the yearly price of a Growth or Scale plan. Wallet top-ups and usage are charged the same way on either schedule.',
    billing: true,
  },
];

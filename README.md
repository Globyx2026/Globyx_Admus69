# Globyx

**Connect beyond borders.** The public website for Globyx: virtual phone numbers and proxies for teams that work across countries.

This is stage 1 of 3: the design system and the full public site. The customer dashboard (stage 2) and the final polish pass (stage 3) build on top of it.

## Run it

```bash
npm install
npm run dev      # local development, http://localhost:5173
npm run build    # type-check and build to dist/
npm run preview  # serve the built site
```

Built with React, TypeScript, Vite, Tailwind CSS v4, Radix UI primitives, Framer Motion, lucide-react, react-router and sonner. It deploys to Vercel with no settings to change (`vercel.json` sends every route to the app).

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: hero, 12 sections, footer |
| `/numbers` | Number catalogue with search, filters and sorting |
| `/proxies` | The four proxy networks, comparison table, use cases |
| `/pricing` | Plans (monthly or annual), bandwidth calculator, number prices, billing FAQ |
| `/developers` | API documentation with code samples |
| `/about` | Story, values, team |
| `/contact` | Contact form with validation |
| `/legal/acceptable-use`, `/legal/terms`, `/legal/privacy` | Legal pages |
| `/login`, `/signup` | Sign-in and sign-up, with "Continue as demo user" |
| `/app` | Holding page until the dashboard is built |
| anything else | 404, "Lost in transit" |

## Where things live

```
src/
  index.css            Design tokens: colours, fonts, gradients, glass, motion
  lib/images.ts        Every photograph on the site, in one list
  data/                Mock data (see below) and site-wide details
  services/            The only code that reads data; swap these for a backend
  context/             Currency (USD / KES) shared across the site
  components/ui/       Buttons, photo, reveal, code panel, selects, fields
  components/layout/   Navbar, footer, page header, logo
  components/home/     The home page sections
  components/pricing/  Bandwidth calculator and number price picker
  pages/               One file per route
```

### Changing the look

- **Fonts.** Headlines, big numbers and lead paragraphs use Playfair Display. Small interface text uses Inter and labels use JetBrains Mono. To set everything in Playfair Display, change `--font-sans` in `src/index.css` to the same value as `--font-serif`.
- **Colours.** All in the `@theme` block at the top of `src/index.css`.
- **Photos.** Change the `src` of any entry in `src/lib/images.ts` to another Unsplash photo id, a full image URL, or a file in `public/`.

## Mock data files

| File | What it holds |
| --- | --- |
| `src/data/countries.ts` | 20 countries with dial codes, cities and monthly prices |
| `src/data/numbers.ts` | About 60 generated phone numbers for the catalogue |
| `src/data/pricing.ts` | Bandwidth tiers, the four proxy products, plans and the plan comparison |
| `src/data/faq.ts` | Questions and answers |
| `src/data/codeSamples.ts` | API examples in cURL, Python and Node.js |
| `src/data/legal.ts` | The three legal documents |
| `src/data/worldMap.ts` | The dotted world map and city positions |
| `src/data/site.ts` | Company name, email addresses, API base URL, headline stats, KES rate |

Sample phone numbers stay inside ranges reserved for fiction where a country has them (US and Canada `555-01xx`, UK `07700 900xxx`), and the public catalogue hides the middle digits.

## Future integration points

Every place a real backend will replace mock data is marked with a `BACKEND:` comment. Search the project for it. The main ones:

| Area | Now | Later |
| --- | --- | --- |
| Number catalogue, `services/catalog.ts` | Filters the mock list after a short delay | Supabase tables, kept in sync with the number provider's API |
| Sign in and sign up, `services/auth.ts` | Keeps a name and email in this browser. The password is never stored or sent | Supabase Auth |
| Contact form and newsletter, `services/contact.ts` | Saved in this browser's localStorage | Supabase tables plus a notification email |
| Prices, `data/pricing.ts` and `data/countries.ts` | Fixed values in code | Supabase tables, so prices change without a deploy |
| Currency, `data/site.ts` | Fixed rate of 129 KES per USD | A live exchange rate |
| Payments | Not built yet | Stripe (cards), M-Pesa (Daraja API), a crypto processor |
| Numbers and proxies themselves | Not built yet | A number provider API and a proxy provider API |
| Footer status dot | Always green | A real status page |

## Before this goes public

These were written as sensible placeholders and need a decision from the business:

1. **Headline stats** in `src/data/site.ts` (190+ countries, 5M+ IPs, 99.9% uptime, 24/7 support) and "60+ countries" in the copy are launch targets, not measured figures.
2. **Prices, plans, the refund window and reply times** are examples. Set the real ones.
3. **Legal pages** are plain-language drafts, not legal advice. Have a lawyer review them.
4. **Domain details** in `src/data/site.ts`: the email addresses and the API base URL assume `globyx.com`.
5. **Customer proof.** The home page shows Globyx's own commitments where testimonials will go, and names the sectors it is built for where customer logos will go. Add real quotes in `src/components/home/Promises.tsx` and real logos in `src/components/home/LogoStrip.tsx` once you have permission to publish them.
6. **API docs** describe the planned API and are labelled as a preview.

## Photography

All photographs are real nature photography from [Unsplash](https://unsplash.com), used under the Unsplash licence. Thank you to the photographers: Junel Mujar, Samuel Myles, Maxim Hopman, Jake Weirick, Samuel Girven, Janan, Christian Weiss, Brendan Beale, Hu Chen, Damian Patkowski, Erik van Dijk, Sebastien Gabriel, Andrey Grinkevich, simon, Tim Arterbury, Brandon Smith, Nguyễn Đức, Andrew Banner and Hannah Reding.

## Accessibility and motion

Keyboard focus is always visible, forms announce their errors, images have alt text, and text meets a 4.5:1 contrast ratio. Visitors who ask their device for reduced motion get the site without the zoom, drift and slide animations.

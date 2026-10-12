# Globyx

**Connect beyond borders.** The website and customer dashboard for Globyx: virtual phone numbers and proxies for teams that work across countries.

Stages 1 and 2 of 3 are built: the public site, the customer dashboard with real accounts and data in Supabase, and an admin dashboard for the business owner. Stage 3 is the final polish pass.

> **Test mode.** Accounts, wallets and purchases are real rows in the database, but no payment is taken and the numbers and proxies are simulated. See [What is simulated](#what-is-simulated).

## Run it

```bash
npm install
npm run dev      # local development, http://localhost:5173
npm run build    # type-check and build to dist/
npm run preview  # serve the built site
```

Built with React, TypeScript, Vite, Tailwind CSS v4, Radix UI primitives, Framer Motion, lucide-react, react-router, sonner and Supabase (database and sign-in). It deploys to Vercel with no settings to change (`vercel.json` sends every route to the app).

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
| `/login`, `/signup` | Log in and create an account (Supabase Auth, with email confirmation) |
| `/forgot-password`, `/reset-password` | Ask for a reset link, then choose a new password |
| `/app` | Dashboard overview: balance, counts, recent activity, getting-started steps |
| `/app/numbers` | Rent numbers from stock, label, renew and release them, read each inbox |
| `/app/proxies` | Buy proxy plans at volume prices and copy the connection details |
| `/app/wallet` | Balance, add funds, transaction history |
| `/app/api-keys` | Create and revoke API keys (the key is shown once) |
| `/app/settings` | Name, company, currency, password, log out |
| `/admin` | Admin overview: money in and out, customers, numbers, proxy plans, a 14-day chart |
| `/admin/transactions` | Every top-up and purchase across all customers, with search, filters and CSV download |
| `/admin/numbers` | Every rented number, who holds it and when it is due |
| `/admin/proxies` | Every proxy plan with what was bought, used and left |
| `/admin/customers` | Every account with its wallet balance, top-ups and spend |
| `/admin/messages` | Contact form messages and newsletter sign-ups |
| anything else | 404, "Lost in transit" |

Everything under `/app` needs a signed-in customer; visitors are sent to `/login` and brought back afterwards. Everything under `/admin` needs an admin account (see [Admin accounts](#admin-accounts)).

## Where things live

```
src/
  index.css            Design tokens: colours, fonts, gradients, glass, motion
  lib/images.ts        Every photograph on the site, in one list
  lib/supabase.ts      The Supabase client (project URL and publishable key)
  lib/errors.ts        Turns database and sign-in errors into plain sentences
  data/                Fixed content (see below) and site-wide details
  services/            The only code that talks to Supabase
  context/             Signed-in customer (AuthContext) and currency (USD / KES)
  components/ui/       Buttons, photo, reveal, code panel, selects, fields
  components/layout/   Navbar, footer, page header, logo
  components/home/     The home page sections
  components/pricing/  Bandwidth calculator and number price picker
  components/app/      Dashboard frame (sidebar, wallet) and shared pieces
  components/admin/    Admin frame, the searchable table and the money chart
  pages/               One file per public route
  pages/app/           One file per dashboard page
  pages/admin/         One file per admin page
supabase/
  migrations/          The database: tables, security rules, functions, sample stock
```

### Changing the look

- **Fonts.** Headlines, big numbers and lead paragraphs use Playfair Display. Small interface text uses Inter and labels use JetBrains Mono. To set everything in Playfair Display, change `--font-sans` in `src/index.css` to the same value as `--font-serif`.
- **Colours.** All in the `@theme` block at the top of `src/index.css`.
- **Photos.** Change the `src` of any entry in `src/lib/images.ts` to another Unsplash photo id, a full image URL, or a file in `public/`.

## The database (Supabase)

The site is connected to the Supabase project in `src/lib/supabase.ts`. The key in that file is the **publishable** key, which is meant to be public: it only identifies the project. What protects the data is row level security, set up in `supabase/migrations`. Never put a secret or `service_role` key in the front end.

| Table | What it holds | Who can read it |
| --- | --- | --- |
| `profiles` | Name, company, currency. Created automatically for each new account | The customer |
| `wallets` | One balance per account, in US cents | The customer (read only) |
| `transactions` | Every top-up and purchase | The customer (read only) |
| `number_catalog` | Numbers for sale | Everyone, available numbers only, never the full number |
| `numbers` | Numbers a customer rents, with the full number | The customer |
| `messages` | Texts received on a rented number | The customer |
| `proxy_rates` | The proxy price list | Everyone |
| `proxy_plans` | Proxy plans bought, with connection details | The customer |
| `api_keys` | Key name and first characters; only a hash of the key is stored | The customer (never the hash) |
| `contact_messages` | Contact form | Admins, on the Messages page |
| `newsletter_subscribers` | Newsletter sign-ups | Admins, on the Messages page |
| `admins` | Which accounts may use `/admin` | Nobody from the website |

Customers cannot write to their wallet, transactions, numbers, plans or keys directly. Money only moves inside database functions (`rent_number`, `renew_number`, `buy_proxy_plan`, `top_up_wallet_test`), which check who is signed in, look the price up on the server and refuse if the balance is too low. Limits: 10 numbers, 20 active proxy plans and 10 API keys per account.

To rebuild the database on a new Supabase project, run the files in `supabase/migrations` in order in the SQL editor, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).

### Admin accounts

The admin dashboard at `/admin` shows every customer's activity, so it is locked twice: the page only opens for admin accounts, and the database refuses the reporting functions to anyone who is not in the `admins` table. Nobody can add themselves from the website. Admins are added by hand in the Supabase SQL editor, after the person has signed up on the site:

```sql
insert into public.admins (user_id)
select id from auth.users where lower(email) = lower('you@example.com');
```

To remove one:

```sql
delete from public.admins
where user_id = (select id from auth.users where lower(email) = lower('you@example.com'));
```

The admin pages are read-only. They never show passwords, proxy passwords, API keys or the text of customers' messages. Money is always shown in US dollars, the currency wallets are held in.

### Supabase settings to check

In the Supabase dashboard, under **Authentication → URL Configuration**:

1. Set **Site URL** to the live address of the site (for example `https://your-site.vercel.app`).
2. Add `https://your-site.vercel.app/**` to **Redirect URLs**.

Until this is done, the links in confirmation and password-reset emails point at `localhost` and will not open the site.

Also worth knowing:

- **Email confirmation is on.** New customers must click a link before they can log in. Supabase's built-in email service only sends a few emails per hour, so connect your own email provider (Authentication → Emails → SMTP) before real customers sign up.
- **Demo accounts are off.** The "Continue as demo user" button appears on the log-in page only when **Allow anonymous sign-ins** is switched on (Authentication → Sign In / Providers).

## Security

Reviewed for script injection (XSS) and database injection (SQL injection) on 12 October 2026.

- **Script injection.** The site never turns stored text into HTML: names, labels, key names, messages and contact form entries are always shown as plain text. On top of that, `vercel.json` sends a Content Security Policy that only allows scripts from the site itself and only lets the page talk to this Supabase project, so even an injected script could neither run nor send data elsewhere. It also stops other sites from showing Globyx inside a frame (clickjacking).
- **Database injection.** The site never writes SQL. Every request goes through Supabase's API, which passes values separately from the query, and no database function builds SQL from text. Row-level security means a customer can only reach their own rows whatever they send.
- **Visitor forms.** The contact form and newsletter accept only ordinary email addresses and the listed contact topics (`0004_input_hardening.sql`).

**When adding a payment provider or any outside service**, add its domains to the Content Security Policy in `vercel.json` (for example `script-src`, `frame-src` and `connect-src` for a payment pop-up), or the browser will block it. If the Supabase project changes, update the address there too.

## What is simulated

| Area | Now | To go live |
| --- | --- | --- |
| Payments | `top_up_wallet_test` adds test funds (up to $2,000 per wallet) without charging anyone. No card or phone details are collected | Replace it with a payment provider (Stripe, M-Pesa Daraja, a crypto processor) whose server-side webhook credits the wallet |
| Number stock | 120 sample numbers in `number_catalog`, in ranges reserved for fiction where a country has them | Sync the table with a number provider's API |
| Calls and texts | Not connected to a phone network. "Send a test message" puts a sample text in the inbox | Have the provider's webhook insert into `messages` |
| Proxies | Host, username and password are placeholders and carry no traffic; usage stays at zero | Create real credentials with a proxy provider and report usage into `proxy_plans.used_mb` |
| Renewals | A customer renews by hand, one month at a time | A scheduled job that renews or releases numbers when they fall due |
| API | Keys can be created and revoked, but there is no public API to call yet | Build the API (for example Supabase Edge Functions) and check keys against `api_keys.key_hash` |
| Currency | Fixed rate of 129 KES per USD in `src/data/site.ts` | A live exchange rate |
| Footer status dot | Always green | A real status page |

## Fixed content files

| File | What it holds |
| --- | --- |
| `src/data/countries.ts` | 20 countries with dial codes, cities and "from" prices shown on the public pages |
| `src/data/pricing.ts` | Proxy product descriptions, plans and the plan comparison. The rates charged come from the `proxy_rates` table; keep the two in step |
| `src/data/faq.ts` | Questions and answers |
| `src/data/codeSamples.ts` | API examples in cURL, Python and Node.js |
| `src/data/legal.ts` | The three legal documents |
| `src/data/worldMap.ts` | The dotted world map and city positions |
| `src/data/site.ts` | Company name, email addresses, API base URL, headline stats, KES rate |

## Before this goes public

These were written as sensible placeholders and need a decision from the business:

1. **Headline stats** in `src/data/site.ts` (190+ countries, 5M+ IPs, 99.9% uptime, 24/7 support) and "60+ countries" in the copy are launch targets, not measured figures.
2. **Prices, plans, the refund window and reply times** are examples. Set the real ones (number prices in `number_catalog`, proxy rates in `proxy_rates`).
3. **Legal pages** are plain-language drafts, not legal advice. Have a lawyer review them.
4. **Domain details** in `src/data/site.ts`: the email addresses and the API base URL assume `globyx.com`.
5. **Customer proof.** The home page shows Globyx's own commitments where testimonials will go, and names the sectors it is built for where customer logos will go. Add real quotes in `src/components/home/Promises.tsx` and real logos in `src/components/home/LogoStrip.tsx` once you have permission to publish them.
6. **API docs** describe the planned API and are labelled as a preview.
7. **Test mode** must end before real customers arrive: see [What is simulated](#what-is-simulated). The dashboard shows a "Test mode" strip until then; remove it in `src/components/app/AppShell.tsx` when payments are real.
8. **Contact form and newsletter** accept entries from anyone. Add a CAPTCHA or rate limit if spam appears.

## Photography

All photographs are real nature photography from [Unsplash](https://unsplash.com), used under the Unsplash licence. Thank you to the photographers: Junel Mujar, Samuel Myles, Maxim Hopman, Jake Weirick, Samuel Girven, Janan, Christian Weiss, Brendan Beale, Hu Chen, Damian Patkowski, Erik van Dijk, Sebastien Gabriel, Andrey Grinkevich, simon, Tim Arterbury, Brandon Smith, Nguyễn Đức, Andrew Banner and Hannah Reding.

## Accessibility and motion

Keyboard focus is always visible, forms announce their errors, images have alt text, and text meets a 4.5:1 contrast ratio. Visitors who ask their device for reduced motion get the site without the zoom, drift and slide animations.

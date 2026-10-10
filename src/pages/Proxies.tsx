import { Link } from 'react-router-dom';
import { Check, House, Server, Smartphone, Waypoints } from 'lucide-react';
import { proxyProducts, type ProxyKind, type ProxyProduct } from '@/data/pricing';
import { images } from '@/lib/images';
import { useCurrency } from '@/context/CurrencyContext';
import { useCases } from '@/components/home/UseCases';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const ICONS: Record<ProxyKind, typeof House> = {
  residential: House,
  mobile: Smartphone,
  isp: Waypoints,
  datacenter: Server,
};

const COMPARISON_ROWS: Array<{ label: string; value: (product: ProxyProduct) => string }> = [
  { label: 'IP source', value: (p) => p.source },
  { label: 'Billing', value: (p) => p.billing },
  { label: 'Rotation', value: (p) => p.rotation },
  { label: 'Speed', value: (p) => p.speed },
  { label: 'Best for', value: (p) => p.bestFor },
];

function ProductCard({ product }: { product: ProxyProduct }) {
  const { format } = useCurrency();
  const Icon = ICONS[product.kind];

  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-30px_rgba(18,16,14,0.45)]">
      <span className="bg-sunset grid h-11 w-11 place-items-center rounded-2xl text-ink">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="type-h3 mt-6 text-char">{product.name}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{product.summary}</p>

      <ul className="mt-6 space-y-2.5">
        {product.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-char">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" strokeWidth={2.5} />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <p className="micro text-muted">From</p>
        <p className="mt-1 font-serif text-[2rem] leading-none tracking-[-0.02em] text-char">
          {format(product.from)}
          <span className="ml-1.5 font-sans text-[13px] tracking-normal text-muted">/ {product.unit}</span>
        </p>
        <ButtonLink to="/signup" variant="dark" className="mt-6 w-full">
          Get {product.kind === 'isp' ? 'ISP static' : product.name.toLowerCase()} proxies
        </ButtonLink>
      </div>
    </article>
  );
}

function ComparisonTable() {
  const { format } = useCurrency();

  return (
    <>
      {/* Wide screens: a real table. */}
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">Comparison of the four proxy networks</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[17%] p-5">
                <span className="sr-only">Feature</span>
              </th>
              {proxyProducts.map((product) => (
                <th key={product.kind} scope="col" className="p-5 font-serif text-xl font-medium tracking-[-0.01em] text-char">
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-line transition-colors last:border-0 hover:bg-paper/70">
                <th scope="row" className="micro p-5 align-top font-medium text-muted">
                  {row.label}
                </th>
                {proxyProducts.map((product) => (
                  <td key={product.kind} className="p-5 align-top text-char">
                    {row.value(product)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-paper/70">
              <th scope="row" className="micro p-5 align-top font-medium text-muted">
                Starting price
              </th>
              {proxyProducts.map((product) => (
                <td key={product.kind} className="p-5 align-top font-medium text-char">
                  {format(product.from)} / {product.unit}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Phones and tablets: one stacked card per network. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {proxyProducts.map((product) => (
          <div key={product.kind} className="rounded-2xl border border-line bg-white p-5">
            <h3 className="font-serif text-xl tracking-[-0.01em] text-char">{product.name}</h3>
            <dl className="mt-4 space-y-3">
              {COMPARISON_ROWS.map((row) => (
                <div key={row.label}>
                  <dt className="micro text-muted">{row.label}</dt>
                  <dd className="mt-0.5 text-sm text-char">{row.value(product)}</dd>
                </div>
              ))}
              <div>
                <dt className="micro text-muted">Starting price</dt>
                <dd className="mt-0.5 text-sm font-medium text-char">
                  {format(product.from)} / {product.unit}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Proxies() {
  const proxyUseCases = useCases.filter((item) => item.product === 'Proxies');

  return (
    <>
      <PageHeader
        label="Proxies"
        title="Four proxy networks. One account."
        intro="Choose the network that fits the job, target the country or city you need, and pay from the same wallet as your numbers."
        image={images.header_proxies}
      />

      <section className="bg-paper py-16 md:py-24">
        <div className="shell">
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {proxyProducts.map((product, index) => (
              <li key={product.kind}>
                <Reveal delay={index * 0.07} className="h-full">
                  <ProductCard product={product} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="shell">
          <SectionHeading
            label="Compare"
            title="Which network fits the job?"
            intro="A rule of thumb: the more a site cares who is visiting, the closer to a real home or phone connection you want to be."
          />
          <Reveal delay={0.1} className="mt-10 md:mt-14">
            <ComparisonTable />
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-24">
        <div className="shell">
          <SectionHeading label="Use cases" title="What teams use Globyx proxies for." />
          <ul className="mt-10 grid gap-x-10 gap-y-8 md:mt-14 md:grid-cols-2">
            {proxyUseCases.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={(index % 2) * 0.08} className="border-t border-line pt-6">
                  <h3 className="type-h3 text-char">{item.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">{item.body}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-12 rounded-2xl border border-line bg-white p-5 text-sm text-muted md:mt-16">
            <strong className="font-medium text-char">Not allowed:</strong> creating accounts in bulk, getting around
            another service’s verification, credential stuffing, spam, or anything illegal. See the{' '}
            <Link to="/legal/acceptable-use" className="font-medium text-char underline decoration-accent decoration-2 underline-offset-4">
              Acceptable Use Policy
            </Link>
            .
          </Reveal>
        </div>
      </section>

      <section className="bg-night py-20 text-cream md:py-28">
        <Reveal className="shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="micro text-glow">Bandwidth pricing</p>
            <h2 className="type-h2 mt-4 max-w-2xl">The more you route, the less each GB costs.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/pricing#calculator" size="lg">
              Open the calculator
            </ButtonLink>
            <ButtonLink to="/signup" variant="ghost" size="lg">
              Create an account
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}

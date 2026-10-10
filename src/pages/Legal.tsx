import { NavLink, useParams } from 'react-router-dom';
import { legalDocuments } from '@/data/legal';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import NotFound from './NotFound';

export default function Legal() {
  const { slug } = useParams();
  const doc = legalDocuments.find((item) => item.slug === slug);

  if (!doc) return <NotFound />;

  return (
    <>
      <PageHeader label={`Legal · Updated ${doc.updated}`} title={doc.title} intro={doc.summary} />

      <div className="bg-paper">
        <div className="shell grid gap-10 py-12 md:py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside>
            <nav aria-label="Legal documents" className="lg:sticky lg:top-28">
              <ul className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-0.5 lg:border-l lg:border-line">
                {legalDocuments.map((item) => (
                  <li key={item.slug} className="shrink-0">
                    <NavLink
                      to={`/legal/${item.slug}`}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-full px-3.5 py-2 text-sm transition-colors lg:-ml-px lg:rounded-none lg:border-l-2 lg:py-1.5 lg:pr-0 lg:pl-4',
                          isActive
                            ? 'bg-char text-cream lg:border-accent lg:bg-transparent lg:font-medium lg:text-char'
                            : 'text-muted hover:text-char lg:border-transparent',
                        )
                      }
                    >
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="max-w-2xl">
            {doc.sections.map((section, index) => (
              <section key={section.id} id={section.id} className={cn(index > 0 && 'mt-12')}>
                <h2 className="font-serif text-[1.625rem] leading-tight tracking-[-0.015em] text-char">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-[1.75] text-char/80">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="relative pl-6 text-base leading-[1.7] text-char/80">
                        <span className="absolute top-[0.7em] left-0 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}

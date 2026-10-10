import * as Accordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import type { FaqItem } from '@/data/faq';

/** Accordion of questions. One answer is open at a time. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible defaultValue={items[0]?.id} className="border-t border-line">
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="border-b border-line">
          <Accordion.Header asChild>
            <h3 className="m-0">
              <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-6 text-left -outline-offset-2">
                <span className="font-serif text-[1.25rem] leading-snug tracking-[-0.01em] text-char md:text-[1.375rem]">
                  {item.question}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-char transition-[transform,background-color,color,border-color] duration-300 group-hover:border-char/30 group-data-[state=open]:rotate-45 group-data-[state=open]:border-accent group-data-[state=open]:bg-accent group-data-[state=open]:text-ink">
                  <Plus className="h-4 w-4" />
                </span>
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="max-w-2xl pr-12 pb-7 text-[15px] leading-relaxed text-muted">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

import { Accordion } from "@/components/ui/Accordion";
import { getFaqs } from "@/lib/cms/service";
import type { FaqItemCMS } from "@/types/cms";

interface FaqAccordionProps {
  faqs?: FaqItemCMS[];
}

export async function FaqAccordion({ faqs: propFaqs }: FaqAccordionProps) {
  const items = propFaqs || (await getFaqs(true));

  return (
    <Accordion
      items={items.map((faq) => ({
        id: faq.id,
        title: faq.question,
        content: faq.answer,
      }))}
    />
  );
}

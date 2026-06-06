import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PricingFAQ() {
  const faqs = [
    {
      question: "Why use credits instead of monthly limits?",
      answer: "Users typically create demos when launching products, features, or updates rather than every day. Pay only for the demos you create.",
    },
    {
      question: "What counts as a credit?",
      answer: "One completed demo generation.",
    },
    {
      question: "Do credits expire?",
      answer: "Not currently.",
    },
    {
      question: "Can I upgrade later?",
      answer: "Yes.",
    },
    {
      question: "Will pricing change in the future?",
      answer: "Current plans may evolve as new capabilities are added.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto my-24">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-4xl text-foreground">Frequently Asked Questions</h2>
      </div>
      <Accordion className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium text-lg">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

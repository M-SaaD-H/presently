import { PricingSection } from "@/components/pricing/pricing-section";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingFAQ } from "@/components/pricing/pricing-faq";

export default function PricingPage() {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <PricingSection
        heading="Simple pricing for product demos"
        description="Create demos when you need them. Pay for usage, not empty subscriptions."
      />
      <div className="container mx-auto px-4 md:px-8 max-w-6xl mb-24">
        <PricingComparisonTable />
        <PricingFAQ />
      </div>
    </div>
  );
}

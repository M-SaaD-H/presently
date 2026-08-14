import { PricingCard } from "./pricing-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PricingSectionProps {
  heading?: string;
  description?: React.ReactNode;
}

export function PricingSection({
  heading = "Simple Pricing",
  description = (
    <>
      Pay only for the demos you create.<br />
      No complicated subscriptions. Generate professional product demos whenever you need them.
    </>
  )
}: PricingSectionProps) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      subtitle: "Try Presently before upgrading.",
      features: [
        "2 demo generations",
        "Watermarked exports",
        "Standard rendering",
        "Community support",
      ],
      cta: "Get Started Free",
      isPopular: false,
    },
    {
      name: "Pro",
      price: "$9",
      subtitle: "Perfect for indie founders and small teams.",
      features: [
        "10 demo generations",
        "No watermark",
        "Faster rendering",
        "HD exports",
        "Priority support",
      ],
      cta: "Start Creating",
      isPopular: true,
    },
    {
      name: "Growth",
      price: "$29",
      subtitle: "For teams creating demos regularly.",
      features: [
        "50 demo generations",
        "No watermark",
        "Fast rendering",
        "HD exports",
        "Priority support",
        "Early access to new features",
      ],
      cta: "Choose Growth",
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className="mt-12 mb-18 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center justify-center px-3 py-1 bg-foreground/10 text-foreground text-sm font-medium rounded-full mb-2">
            Pricing
          </div>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <div className="mt-20 text-center max-w-md mx-auto p-6 bg-surface/30 rounded-xl border border-border/40">
          <h3 className="font-medium text-foreground mb-2">How credits work</h3>
          <p className="text-sm text-muted-foreground">
            Each generated demo consumes one credit. Credits are intended for complete demo generations and can be used whenever needed.
          </p>
        </div>
      </div>
    </section>
  );
}

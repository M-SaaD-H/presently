import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { PricingSection } from "@/components/pricing/pricing-section";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <PricingSection />
      <CTA />
      <Footer />
    </>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">
            Ready to show off your product?
          </h2>
          <p className=" mb-10">
            Generate your first high-quality demo video in seconds.
          </p>
          <Link href="/generate">
            <Button size="lg" className="rounded-full px-10 h-14 text-base font-medium">
              Generate Demo Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

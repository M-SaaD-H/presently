import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background mt-26 mb-16">
      <div className="container mx-auto px-4 md:px-8 flex flex-col items-center text-center">
        <h1 className="max-w-4xl text-5xl font-sans font-semibold tracking-tight md:text-6xl">
          Turn <span className="text-muted-foreground font-serif tracking-light italic font-normal"> websites</span> into <br className="hidden sm:block" />
          polished product<span className="text-muted-foreground font-serif tracking-light italic font-normal"> demos.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
          Sitecast is an automated platform that creates high-quality walkthrough videos from any URL in seconds. No recording, no editing, no stress.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/generate" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base font-medium shadow-sm">
              Generate Demo
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Product Preview */}
      <div className="container mx-auto px-4 md:px-8 mt-20">
        <div className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-surface shadow-sm overflow-hidden aspect-video flex items-center justify-center">
          <div className="absolute inset-0 bg-accent/5 mix-blend-multiply" />
          <p className="text-muted-foreground font-medium">Sample Demo Video Player</p>
        </div>
      </div>
    </section>
  );
}

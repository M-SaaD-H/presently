import { CheckCircle2 } from "lucide-react";

function BehaviorVisualization() {
  return (
    <div className="w-full h-full bg-background rounded-lg border border-border/30 overflow-hidden flex flex-col shadow-sm relative">
      <div className="h-10 border-b border-border/30 bg-surface/50 flex items-center px-4 gap-2 z-20 shrink-0 backdrop-blur-md">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-4 flex-1 h-4 bg-border/20 rounded-sm max-w-[150px]" />
      </div>

      <div className="flex-1 relative overflow-hidden bg-background">
        <div 
          className="absolute inset-x-0 top-0 flex flex-col gap-12 p-6 pb-32 w-full origin-top"
          style={{ animation: 'page-scroll 12s cubic-bezier(0.65, 0, 0.35, 1) infinite' }}
        >
          
          {/* Hero Section */}
          <div className="flex flex-col gap-4 items-center pt-8" style={{ animation: 'focus-hero 12s infinite' }}>
            <div className="w-3/4 h-8 bg-foreground/10 rounded-lg" />
            <div className="w-1/2 h-4 bg-foreground/5 rounded-md mt-2" />
            <div className="w-1/3 h-4 bg-foreground/5 rounded-md" />
            <div className="w-28 h-9 bg-foreground/20 rounded-md mt-6" />
          </div>

          <div className="h-px w-full bg-border/30 mx-auto max-w-[80%]" />

          {/* Features Section */}
          <div className="grid grid-cols-2 gap-4" style={{ animation: 'focus-features 12s infinite' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 border border-border/40 rounded-xl bg-surface/30">
                <div className="w-8 h-8 bg-foreground/10 rounded-lg" />
                <div className="w-full h-3 bg-foreground/5 rounded mt-1" />
                <div className="w-4/5 h-3 bg-foreground/5 rounded" />
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-border/30 mx-auto max-w-[80%]" />

          {/* Product Showcase */}
          <div className="flex flex-col gap-5" style={{ animation: 'focus-product 12s infinite' }}>
            <div className="w-1/3 h-6 bg-foreground/10 rounded-md" />
            <div className="w-full aspect-video bg-surface/50 rounded-xl border border-border/40 overflow-hidden flex flex-col">
               {/* inner fake UI */}
               <div className="h-6 border-b border-border/30 flex items-center px-3 gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-border" />
                 <div className="w-1.5 h-1.5 rounded-full bg-border" />
                 <div className="w-1.5 h-1.5 rounded-full bg-border" />
               </div>
               <div className="flex-1 bg-foreground/5" />
            </div>
          </div>

          <div className="h-px w-full bg-border/30 mx-auto max-w-[80%]" />

          {/* Pricing Section */}
          <div className="flex gap-4" style={{ animation: 'focus-pricing 12s infinite' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className={`flex-1 flex flex-col gap-4 p-5 border rounded-xl ${i === 1 ? 'border-foreground/20 bg-foreground/5 shadow-sm scale-[1.02]' : 'border-border/40 bg-surface/30'}`}>
                <div className="w-1/2 h-5 bg-foreground/10 rounded-md" />
                <div className="w-3/4 h-8 bg-foreground/15 rounded-md mt-1" />
                <div className="w-full h-px bg-border/40 my-1" />
                <div className="w-full h-2.5 bg-foreground/5 rounded" />
                <div className="w-5/6 h-2.5 bg-foreground/5 rounded" />
                <div className="w-4/5 h-2.5 bg-foreground/5 rounded" />
                <div className="w-full h-9 bg-foreground/10 rounded-lg mt-4" />
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-border/30 mx-auto max-w-[80%]" />

          {/* CTA Section */}
          <div className="flex flex-col items-center justify-center py-12 gap-5 rounded-2xl bg-foreground/5 border border-foreground/10" style={{ animation: 'focus-cta 12s infinite' }}>
            <div className="w-2/3 h-7 bg-foreground/15 rounded-md" />
            <div className="w-1/2 h-4 bg-foreground/10 rounded-md" />
            <div className="w-32 h-10 bg-foreground/20 rounded-lg mt-4" />
          </div>

        </div>
      </div>
    </div>
  );
}

export function Features() {
  const features = [
    "Automated recording of any URL",
    "Natural, human-like scrolling behavior",
    "Fast generation under 60 seconds",
    "Export in HD quality",
  ];

  return (
    <section className="my-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-2">
              Built to present, not just record.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Smooth scrolling, deliberate pacing, and focused presentation help viewers understand your product faster and stay engaged longer.
            </p>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-foreground/70" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square md:aspect-auto md:h-[500px] bg-surface rounded-2xl overflow-hidden flex items-center justify-center p-4 sm:p-8">
            <BehaviorVisualization />
          </div>
        </div>
      </div>
    </section>
  );
}

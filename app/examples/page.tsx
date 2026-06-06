export default function ExamplesPage() {
  const examples = [
    { title: "Linear.app", type: "SaaS Dashboard" },
    { title: "Stripe.com", type: "Marketing Website" },
    { title: "Nextjs.org/docs", type: "Documentation" },
    { title: "Vercel.com", type: "Landing Page" },
    { title: "Ramp.com", type: "Fintech Platform" },
    { title: "Notion.so", type: "Productivity App" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-foreground">
            Built for quality.
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore demos generated automatically from top tier applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {examples.map((example, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-video rounded-xl bg-surface border border-border/50 overflow-hidden mb-4 relative flex items-center justify-center transition-all group-hover:border-border">
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-multiply" />
                <span className="text-muted-foreground text-sm font-medium">Video Preview</span>
              </div>
              <h3 className="font-medium text-foreground">{example.title}</h3>
              <p className="text-sm text-muted-foreground">{example.type}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

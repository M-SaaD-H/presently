export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Enter URL",
      description: "Paste the link to the website or application you want to demo.",
    },
    {
      number: "02",
      title: "Generate Demo",
      description: "Our automated engine captures a smooth, human-like recording of the page.",
    },
    {
      number: "03",
      title: "Download Video",
      description: "Export your polished video ready to share with customers or team members.",
    },
  ];

  return (
    <section className="border-t border-border/40 bg-surface/30 my-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16 md:text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">How it works</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to professional product demos.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-sm font-bold text-muted-foreground mb-4 border-b border-border/40 pb-4">
                {step.number}
              </span>
              <h3 className="text-xl font-medium font-sans tracking-tight mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

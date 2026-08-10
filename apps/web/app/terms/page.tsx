export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl space-y-8">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">Terms of Service</h1>
        <div className="prose prose-zinc dark:prose-invert text-muted-foreground space-y-6">
          <p>
            Please read these Terms of Service carefully before using our platform.
          </p>
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our platform, you agree to be bound by these Terms and all applicable laws and regulations.
          </p>
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only.
          </p>
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">3. Disclaimer</h2>
          <p>
            The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied.
          </p>
        </div>
      </div>
    </div>
  );
}

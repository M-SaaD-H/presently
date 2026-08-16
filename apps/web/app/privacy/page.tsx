export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl space-y-8">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-foreground">Privacy Policy</h1>
        <div className="prose prose-zinc dark:prose-invert text-muted-foreground space-y-6">
          <p>
            At Sitecast, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.
          </p>
          <h2 className="text-xl font-medium text-foreground mt-8 mb-4">Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Site includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal Data (e.g. name, email address)</li>
            <li>User Content (e.g. URLs provided for demo generation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

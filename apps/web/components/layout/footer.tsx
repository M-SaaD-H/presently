import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-2">
              <Logo />
              <span className="font-serif text-xl font-bold">Sitecast</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Automatically create polished product demos and walkthrough videos from any website.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {
                footLinks.product.map((l, idx) => (
                  <li key={idx}><Link href={l.href} className="hover:text-foreground transition-colors">{l.name}</Link></li>
                ))
              }
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {
                footLinks.legal.map((l, idx) => (
                  <li key={idx}><Link href={l.href} className="hover:text-foreground transition-colors">{l.name}</Link></li>
                ))
              }
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sitecast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const footLinks = {
  product: [
    {
      name: "Generate",
      href: "/generate"
    },
    {
      name: "Examples",
      href: "/examples"
    },
    {
      name: "Pricing",
      href: "/pricing"
    }
  ],
  legal: [
    {
      name: "Privacy",
      href: "privacy"
    },
    {
      name: "Terms",
      href: "terms"
    }
  ]
}

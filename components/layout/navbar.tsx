import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { auth } from "@/lib/auth";
import { UserNav } from "@/components/layout/user-nav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-serif text-xl font-bold">Presently</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/examples" className="transition-colors hover:text-foreground">Examples</Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!session?.user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium">Log in</Button>
              </Link>
              <Link href="/generate">
                <Button className="text-sm font-medium">Generate Demo</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/generate">
                <Button className="text-sm font-medium">Generate Demo</Button>
              </Link>
              <UserNav user={session.user} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

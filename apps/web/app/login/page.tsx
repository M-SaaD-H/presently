"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-sm my-24">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="font-serif text-3xl">
          Welcome back
        </CardTitle>
        <CardDescription>
          Log in to manage your generated demos.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11 text-base"
          onClick={async () => await authClient.signIn.social({
            provider: "google"
          })}
        >
          Continue with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground sr-only">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="w-full flex h-11 rounded-md border border-border/50 bg-surface/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base">
            Send Magic Link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

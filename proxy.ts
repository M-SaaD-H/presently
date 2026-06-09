import { NextResponse, NextRequest } from "next/server"
import { auth } from "./lib/auth";

export async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const url = req.nextUrl;
  const isAuthPage = url.pathname === "/login"

  // Logged in user should not be allowed on login page
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if ((url.pathname.startsWith("/demo") ||
    url.pathname.startsWith("/generate") ||
    url.pathname.startsWith("/dashboard")) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/demo",
    "/demo/:path*",
    "/generate",
    "/dashboard"
  ]
}

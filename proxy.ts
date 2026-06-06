import { NextResponse, NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl;
  const isAuthPage = url.pathname === "/login"

  // Logged in user should not be allowed on login page
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if ((url.pathname.startsWith("/demo") ||
    url.pathname.startsWith("/generate")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/demo", "/demo/:path*", "/generate"]
}

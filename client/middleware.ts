import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl

  // Allow public + system routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/products")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("accessToken")?.value

  // Not logged in → redirect
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // ✅ DO NOTHING ELSE (no jwt, no decoding)
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
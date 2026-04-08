import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get("accessToken")?.value

  // ✅ PUBLIC ROUTES
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
  // ❌ PROTECT ADMIN
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/account", request.url))
    }
  }

  // ✅ ALLOW
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"], // ✅ ENABLED Security
}
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
  // NOTE: Admin security is handled at the Layout/Page level via useAuth and Backend API enforcement.
  // This middleware should only handle lightweight redirects if necessary.

  // ✅ ALLOW
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"], // ✅ ENABLED Security
}
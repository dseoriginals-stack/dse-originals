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

  // ❌ NOT LOGGED IN → redirect to account page
  if (!token) {
    return NextResponse.redirect(new URL("/account", request.url))
  }

  // ✅ ALLOW (including /admin for now)
  return NextResponse.next()
}

export const config = {
  matcher: [], // ❌ disable middleware for now
}
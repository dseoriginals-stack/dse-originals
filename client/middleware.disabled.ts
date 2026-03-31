import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl
  const token = req.cookies.get("accessToken")?.value

  // Protect account
  if (pathname.startsWith("/account")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Protect admin (ONLY check existence)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*"], // ❌ REMOVE /admin
}
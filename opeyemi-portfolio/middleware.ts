import { NextResponse, type NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const hasCookie = req.cookies.get("admin")?.value === "true"
    if (!hasCookie) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      const nextParam = `${pathname}${search || ""}`
      url.searchParams.set("next", nextParam)
      return NextResponse.redirect(url)
    }
  }

  // If logged in and visiting /login, bounce to next or /admin
  if (pathname === "/login") {
    const hasCookie = req.cookies.get("admin")?.value === "true"
    if (hasCookie) {
      const url = req.nextUrl.clone()
      const nextParam = req.nextUrl.searchParams.get("next") || "/admin"
      url.pathname = nextParam
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
}



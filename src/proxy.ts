import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  else if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    if (!token) return NextResponse.redirect(new URL("/login", request.url))
    if ((token.role as string) !== "admin") {
      return Response.json(
        { error: "You do not have permission to access this resource." },
        { status: 403 }
      )
    }
  }

  else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/connections") ||
    pathname.startsWith("/api/notes") ||
    pathname.startsWith("/api/folders") ||
    pathname.startsWith("/api/activity")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    if (!token) {
      const callbackUrl = encodeURIComponent(
        request.nextUrl.pathname + request.nextUrl.search
      )
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
      )
    }
    if (
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/onboarding") ||
        pathname.startsWith("/notes")) &&
      token.role === "admin"
    ) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

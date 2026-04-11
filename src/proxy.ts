import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin route protection ────────────────────────────────────────────────
  // Check NextAuth JWT before doing any Supabase work.
  // getToken uses jose (Edge-compatible) — no Node.js bcrypt import needed here.
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "admin") {
      // Authenticated but not admin — redirect away, never 404
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // ── Admin API route protection ─────────────────────────────────────────────
  // /api/admin/* returns JSON 403, not a redirect — it's an API route.
  else if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) return NextResponse.redirect(new URL("/login", request.url))
    if ((token.role as string) !== "admin") {
      return Response.json(
        { error: "You do not have permission to access this resource." },
        { status: 403 }
      )
    }
  }

  // ── App route protection (authenticated users only) ────────────────────────
  else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/user")
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token) {
      const callbackUrl = encodeURIComponent(
        request.nextUrl.pathname + request.nextUrl.search
      )
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
      )
    }
  }

  // ── Supabase SSR cookie refresh ───────────────────────────────────────────
  // Required on every request so Supabase session cookies stay fresh.
  // IMPORTANT: Do NOT add any logic between createServerClient and getUser().
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT add any logic between createServerClient and getUser().
  // A simple mistake here can cause users to be randomly logged out.
  // getUser() contacts the Supabase Auth server every time to validate the token.
  // Do NOT use getSession() here — the session is unverified from cookies.
  await supabase.auth.getUser()

  // IMPORTANT: Return supabaseResponse as-is so cookies are forwarded correctly.
  // If you create a new NextResponse, copy the cookies from supabaseResponse.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     * Supabase auth requires the proxy to run on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

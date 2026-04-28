import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  }).catch((err) => {
    console.error("getToken error:", err)
    return null
  })
  console.log("request", request, token)

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    if ((token.role as string) !== "admin") {
      return Response.json(
        { error: "You do not have permission to access this resource." },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }

  const protectedRoutes = [
    "/dashboard",
    "/onboarding",
    "/notes",
    "/api/user",
    "/api/connections",
    "/api/notes",
    "/api/folders",
    "/api/activity",
  ]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!token) {
      const callbackUrl = encodeURIComponent(pathname + search)

      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
      )
    }

    const userPages = [
      "/dashboard",
      "/onboarding",
      "/notes",
    ]

    const isUserPage = userPages.some((route) => pathname.startsWith(route))

    if (isUserPage && (token.role as string) === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// }
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/notes/:path*",
    "/api/user/:path*",
    "/api/connections/:path*",
    "/api/notes/:path*",
    "/api/folders/:path*",
    "/api/activity/:path*",
  ],
}
import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { sessionGuard } from "@/lib/auth/requireSession"
import { isAllowedPlatform, OAUTH_PROVIDERS } from "@/lib/oauth/providers"

interface Params {
  params: Promise<{ platform: string }>
}

const COOKIE_MAX_AGE = 60 * 10 // 10 minutes

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export async function GET(_request: Request, { params }: Params) {
  const result = await sessionGuard()
  if (result instanceof Response) return result

  const { platform } = await params

  if (!isAllowedPlatform(platform)) {
    return Response.json({ error: "Invalid platform." }, { status: 400 })
  }

  const provider = OAUTH_PROVIDERS[platform]
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connections/${platform}/callback`

  // CSRF state
  const state = crypto.randomBytes(16).toString("hex")

  const url = new URL(provider.authUrl)
  url.searchParams.set("client_id", provider.clientId())
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("scope", provider.scope)
  url.searchParams.set("state", state)
  url.searchParams.set("response_type", "code")

  // Gmail needs offline access for refresh token
  if (platform === "gmail") {
    url.searchParams.set("access_type", "offline")
    url.searchParams.set("prompt", "consent")
  }

  const response = NextResponse.redirect(url.toString())

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  }

  response.cookies.set("oauth_state", state, cookieOpts)

  if (provider.pkce) {
    const verifier = base64url(crypto.randomBytes(32))
    const challenge = base64url(
      Buffer.from(crypto.createHash("sha256").update(verifier).digest())
    )
    url.searchParams.set("code_challenge", challenge)
    url.searchParams.set("code_challenge_method", "S256")
    response.cookies.set("oauth_pkce_verifier", verifier, cookieOpts)

    // Rebuild redirect with PKCE params now added
    return NextResponse.redirect(url.toString(), {
      headers: response.headers,
    })
  }

  return response
}

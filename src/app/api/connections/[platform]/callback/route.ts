import { NextRequest, NextResponse } from "next/server"
import { tasks } from "@trigger.dev/sdk/v3"
import { sessionGuard } from "@/lib/auth/requireSession"
import { isAllowedPlatform, OAUTH_PROVIDERS, normalizeProfile } from "@/lib/oauth/providers"
import { encrypt } from "@/lib/encryption"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"
import type { GitHubBackfillPayload, githubBackfill } from "@/trigger/github-backfill"

interface Params {
  params: Promise<{ platform: string }>
}

const ONBOARDING_URL = "/onboarding"
const ERROR_URL = `${ONBOARDING_URL}?error=connection_failed`

function clearOAuthCookies(response: NextResponse): void {
  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" })
  response.cookies.set("oauth_pkce_verifier", "", { maxAge: 0, path: "/" })
}

export async function GET(request: NextRequest, { params }: Params) {
  const result = await sessionGuard()
  if (result instanceof Response) return result
  const session = result

  const { platform } = await params

  if (!isAllowedPlatform(platform)) {
    return NextResponse.redirect(new URL(ERROR_URL, request.url))
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = request.cookies.get("oauth_state")?.value

  // CSRF check
  if (!code || !state || !storedState || state !== storedState) {
    const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
    clearOAuthCookies(res)
    return res
  }

  const provider = OAUTH_PROVIDERS[platform]
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connections/${platform}/callback`

  try {
    // Exchange code for tokens
    const tokenBody: Record<string, string> = {
      client_id: provider.clientId(),
      client_secret: provider.clientSecret(),
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }

    if (provider.pkce) {
      const verifier = request.cookies.get("oauth_pkce_verifier")?.value
      if (!verifier) {
        const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
        clearOAuthCookies(res)
        return res
      }
      tokenBody.code_verifier = verifier
    }

    const tokenRes = await fetch(provider.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(tokenBody).toString(),
    })

    if (!tokenRes.ok) {
      console.error(`[oauth:${platform}] token exchange failed`, tokenRes.status)
      const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
      clearOAuthCookies(res)
      return res
    }

    const tokens = await tokenRes.json()
    const accessToken: string = tokens.access_token
    const refreshToken: string | null = tokens.refresh_token ?? null
    const expiresIn: number | null = tokens.expires_in ?? null

    if (!accessToken) {
      const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
      clearOAuthCookies(res)
      return res
    }

    // Fetch profile
    const profileAuthHeader =
      platform === "github"
        ? `token ${accessToken}`
        : `Bearer ${accessToken}`

    const profileRes = await fetch(provider.profileUrl, {
      headers: { Authorization: profileAuthHeader, Accept: "application/json" },
    })

    if (!profileRes.ok) {
      console.error(`[oauth:${platform}] profile fetch failed`, profileRes.status)
      const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
      clearOAuthCookies(res)
      return res
    }

    const rawProfile = await profileRes.json()
    const profile = normalizeProfile(platform, rawProfile)

    const profileData: Json = {
      ...profile,
      ...(platform === "gmail" ? { gmail_connection_ready: true } : {}),
    }

    // Encrypt tokens
    const encryptedAccess = encrypt(accessToken)
    const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null

    // Upsert connection
    const supabase = createAdminClient()
    const { error } = await supabase.from("platform_connections").upsert(
      {
        user_id: session.user.id,
        platform,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        token_expires_at: tokenExpiresAt,
        profile_data: profileData,
        is_active: true,
      },
      { onConflict: "user_id,platform" }
    )

    if (error) {
      console.error(`[oauth:${platform}] upsert failed`, error.message)
      const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
      clearOAuthCookies(res)
      return res
    }

    // Fire GitHub backfill — non-blocking, never fails the OAuth flow
    if (platform === "github") {
      const backfillPayload: GitHubBackfillPayload = {
        userId: session.user.id,
        encryptedToken: encryptedAccess,
      }
      tasks
        .trigger<typeof githubBackfill>("github-backfill", backfillPayload)
        .catch((err) => console.error("[github-backfill] trigger failed:", err))
    }

    const res = NextResponse.redirect(new URL(ONBOARDING_URL, request.url))
    clearOAuthCookies(res)
    return res
  } catch (err) {
    console.error(`[oauth:${platform}] unexpected error`, err)
    const res = NextResponse.redirect(new URL(ERROR_URL, request.url))
    clearOAuthCookies(res)
    return res
  }
}

import type { Platform } from "@/types/database"

export type OAuthPlatform = Extract<Platform, "github" | "gmail" | "linkedin" | "x" | "medium">

export interface OAuthProvider {
  clientId: () => string
  clientSecret: () => string
  authUrl: string
  tokenUrl: string
  scope: string
  profileUrl: string
  pkce: boolean
}

export const OAUTH_PROVIDERS: Record<OAuthPlatform, OAuthProvider> = {
  github: {
    clientId: () => process.env.GITHUB_CLIENT_ID!,
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET!,
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user repo",
    profileUrl: "https://api.github.com/user",
    pkce: false,
  },
  gmail: {
    clientId: () => process.env.GMAIL_CLIENT_ID!,
    clientSecret: () => process.env.GMAIL_CLIENT_SECRET!,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope:
      "https://www.googleapis.com/auth/gmail.readonly openid email profile",
    profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    pkce: false,
  },
  linkedin: {
    clientId: () => process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: () => process.env.LINKEDIN_CLIENT_SECRET!,
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scope: "openid profile email w_member_social",
    profileUrl: "https://api.linkedin.com/v2/me",
    pkce: true,
  },
  x: {
    clientId: () => process.env.X_CLIENT_ID!,
    clientSecret: () => process.env.X_CLIENT_SECRET!,
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scope: "tweet.read tweet.write users.read offline.access",
    profileUrl: "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
    pkce: true,
  },
  medium: {
    clientId: () => process.env.MEDIUM_CLIENT_ID!,
    clientSecret: () => process.env.MEDIUM_CLIENT_SECRET!,
    authUrl: "https://medium.com/m/oauth/authorize",
    tokenUrl: "https://api.medium.com/v1/tokens",
    scope: "basicProfile publishPost",
    profileUrl: "https://api.medium.com/v1/me",
    pkce: false,
  },
}

export const ALLOWED_PLATFORMS = Object.keys(OAUTH_PROVIDERS) as OAuthPlatform[]

export function isAllowedPlatform(p: string): p is OAuthPlatform {
  return ALLOWED_PLATFORMS.includes(p as OAuthPlatform)
}

/** Normalise raw provider profile responses into a consistent shape. */
export interface PlatformProfile {
  username: string
  display_name: string
  avatar_url: string | null
  profile_url: string | null
}

export function normalizeProfile(
  platform: OAuthPlatform,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any
): PlatformProfile {
  switch (platform) {
    case "github":
      return {
        username: raw.login,
        display_name: raw.name ?? raw.login,
        avatar_url: raw.avatar_url ?? null,
        profile_url: raw.html_url ?? null,
      }
    case "gmail":
      return {
        username: raw.email,
        display_name: raw.name ?? raw.email,
        avatar_url: raw.picture ?? null,
        profile_url: null,
      }
    case "linkedin":
      return {
        username: raw.id,
        display_name:
          `${raw.localizedFirstName ?? ""} ${raw.localizedLastName ?? ""}`.trim() ||
          raw.id,
        avatar_url: null,
        profile_url: null,
      }
    case "x":
      return {
        username: raw.data?.username ?? raw.username ?? raw.id,
        display_name: raw.data?.name ?? raw.name ?? raw.id,
        avatar_url: raw.data?.profile_image_url ?? raw.profile_image_url ?? null,
        profile_url: raw.data?.username
          ? `https://x.com/${raw.data.username}`
          : null,
      }
    case "medium":
      return {
        username: raw.data?.username ?? raw.username ?? raw.id,
        display_name: raw.data?.name ?? raw.name ?? raw.id,
        avatar_url: raw.data?.imageUrl ?? raw.imageUrl ?? null,
        profile_url: raw.data?.url ?? null,
      }
  }
}

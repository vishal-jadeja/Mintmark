import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_PLATFORMS = ["linkedin", "x", "medium"] as const
const ALLOWED_THEMES = ["light", "dark"] as const

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("user_settings")
    .select("active_platforms, timezone, theme, onboarding_step, onboarding_completed")
    .eq("user_id", session.user.id)
    .single()

  if (error) {
    console.error("[settings GET] Supabase error:", error.message)
    return Response.json({ error: "Failed to fetch settings." }, { status: 500 })
  }

  return Response.json({ settings: data })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const update: Record<string, unknown> = {}

  if ("active_platforms" in body) {
    const ap = body.active_platforms
    if (
      !Array.isArray(ap) ||
      !ap.every((p) => ALLOWED_PLATFORMS.includes(p as (typeof ALLOWED_PLATFORMS)[number]))
    ) {
      return Response.json(
        { error: "active_platforms must be an array of: linkedin, x, medium." },
        { status: 400 }
      )
    }
    update.active_platforms = ap
  }

  if ("timezone" in body) {
    const tz = body.timezone
    if (typeof tz !== "string" || tz.length === 0 || tz.length > 64) {
      return Response.json({ error: "timezone must be a non-empty string (max 64 chars)." }, { status: 400 })
    }
    update.timezone = tz
  }

  if ("theme" in body) {
    if (!ALLOWED_THEMES.includes(body.theme as (typeof ALLOWED_THEMES)[number])) {
      return Response.json({ error: "theme must be 'light' or 'dark'." }, { status: 400 })
    }
    update.theme = body.theme
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("user_settings")
    .update(update)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[settings PATCH] Supabase error:", error.message)
    return Response.json({ error: "Failed to update settings." }, { status: 500 })
  }

  return Response.json({ success: true })
}

import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, connectionsLimiter } from "@/lib/rate-limit"
import { isAllowedPlatform } from "@/lib/oauth/providers"

interface Params {
  params: Promise<{ platform: string }>
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await sessionGuard()
  if (result instanceof Response) return result
  const session = result

  const { platform } = await params

  if (!isAllowedPlatform(platform)) {
    return Response.json({ error: "Invalid platform." }, { status: 400 })
  }

  const rl = await checkRateLimit(session.user.id, connectionsLimiter)
  if (!rl.success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("platform_connections")
    .update({
      is_active: false,
      access_token: "",
      refresh_token: null,
    })
    .eq("user_id", session.user.id)
    .eq("platform", platform)

  if (error) {
    return Response.json({ error: "Failed to disconnect platform." }, { status: 500 })
  }

  return Response.json({ success: true })
}

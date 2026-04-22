import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const result = await sessionGuard()
  if (result instanceof Response) return result
  const session = result

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("platform_connections")
    .select("profile_data")
    .eq("user_id", session.user.id)
    .eq("platform", "github")
    .eq("is_active", true)
    .single()

  if (!data) {
    return Response.json({ status: "not_connected", synced_days: 0 })
  }

  const profile = data.profile_data as Record<string, unknown>

  if (profile?.backfill_complete) {
    return Response.json({
      status: "complete",
      synced_days: profile.synced_days ?? 0,
    })
  }

  return Response.json({ status: "pending", synced_days: 0 })
}

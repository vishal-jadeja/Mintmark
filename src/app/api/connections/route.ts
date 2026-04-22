import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const result = await sessionGuard()
  if (result instanceof Response) return result
  const session = result

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("platform_connections")
    .select("platform, profile_data, connected_at, is_active")
    .eq("user_id", session.user.id)
    .eq("is_active", true)

  if (error) {
    return Response.json({ error: "Failed to fetch connections." }, { status: 500 })
  }

  return Response.json({ connections: data ?? [] })
}

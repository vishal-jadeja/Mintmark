import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("provider, is_active, created_at")
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[api-keys GET] Supabase error:", error.message)
    return Response.json({ error: "Failed to fetch API keys." }, { status: 500 })
  }

  return Response.json({ keys: data ?? [] })
}

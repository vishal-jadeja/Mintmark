import { adminGuard } from "@/lib/auth/requireAdmin"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const denied = await adminGuard()
  if (denied) return denied

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10)))
  const status = url.searchParams.get("status") || null
  const search = url.searchParams.get("search") || null

  const supabase = createAdminClient()

  // Use the RPC that does the self-join for referral counts — no N+1
  const { data, error } = await supabase.rpc("get_admin_waitlist", {
    p_page: page,
    p_limit: limit,
    p_status: status,
    p_search: search,
  })

  if (error) {
    console.error("[admin/waitlist] RPC error:", error.message)
    return Response.json(
      { error: "Failed to load waitlist. Please try again." },
      { status: 500 }
    )
  }

  return Response.json(data)
}

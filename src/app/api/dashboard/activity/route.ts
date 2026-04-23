import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { calculateStreaks } from "@/lib/streak"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const url = new URL(request.url)
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "365", 10), 1), 365)
  const sourceFilter = url.searchParams.get("source")

  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split("T")[0]

  const supabase = createAdminClient()
  let query = supabase
    .from("unified_activity")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("activity_date", sinceStr)
    .order("activity_date", { ascending: true })

  if (sourceFilter) {
    query = query.eq("source", sourceFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error("[dashboard/activity GET] Supabase error:", error.message)
    return Response.json({ error: "Failed to fetch activity." }, { status: 500 })
  }

  const activities = data ?? []
  const streak = calculateStreaks(activities)

  return Response.json({ activities, streak })
}

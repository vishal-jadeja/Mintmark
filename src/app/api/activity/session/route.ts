import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

function sessionIntensity(minutes: number): number {
  if (minutes <= 30) return 1
  if (minutes <= 60) return 2
  if (minutes <= 120) return 3
  return 4
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const { topic, duration_minutes, notes } = body

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return Response.json({ error: "topic is required." }, { status: 400 })
  }
  if (topic.trim().length > 120) {
    return Response.json({ error: "topic must be 120 characters or fewer." }, { status: 400 })
  }
  if (typeof duration_minutes !== "number" || !Number.isFinite(duration_minutes) || duration_minutes <= 0) {
    return Response.json({ error: "duration_minutes must be a positive number." }, { status: 400 })
  }

  const userId = session.user.id
  const today = new Date().toISOString().split("T")[0]
  const intensity = sessionIntensity(duration_minutes)
  const normalizedTopic = topic.trim().toLowerCase()
  const now = new Date().toISOString()
  const newMetadata: Json = {
    topic: topic.trim(),
    duration_minutes,
    ...(typeof notes === "string" && notes.trim().length > 0 ? { notes: notes.trim() } : {}),
  }

  const supabase = createAdminClient()

  // Upsert unified_activity
  const { data: existing } = await supabase
    .from("unified_activity")
    .select("id, activity_count, metadata")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .eq("source", "session")
    .maybeSingle()

  let activityId: string

  if (existing) {
    const { error: updateErr } = await supabase
      .from("unified_activity")
      .update({
        activity_count: existing.activity_count + 1,
        metadata: { ...(existing.metadata as object), ...(newMetadata as object) } as Json,
        updated_at: now,
      })
      .eq("id", existing.id)

    if (updateErr) {
      console.error("[activity/session POST] update error:", updateErr.message)
      return Response.json({ error: "Failed to log session." }, { status: 500 })
    }
    activityId = existing.id
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("unified_activity")
      .insert({
        user_id: userId,
        activity_date: today,
        source: "session",
        activity_count: 1,
        intensity,
        metadata: newMetadata,
      })
      .select("id")
      .single()

    if (insertErr || !inserted) {
      console.error("[activity/session POST] insert error:", insertErr?.message)
      return Response.json({ error: "Failed to log session." }, { status: 500 })
    }
    activityId = inserted.id
  }

  // Upsert topic_nodes
  const { data: node } = await supabase
    .from("topic_nodes")
    .select("id, session_count")
    .eq("user_id", userId)
    .eq("topic", normalizedTopic)
    .maybeSingle()

  if (node) {
    await supabase
      .from("topic_nodes")
      .update({ session_count: node.session_count + 1, last_activity_at: now })
      .eq("id", node.id)
  } else {
    await supabase
      .from("topic_nodes")
      .insert({ user_id: userId, topic: normalizedTopic, session_count: 1, last_activity_at: now })
  }

  return Response.json({ success: true, activityId })
}

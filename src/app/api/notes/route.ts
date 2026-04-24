import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

function noteIntensity(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get("folder_id")
  const search = searchParams.get("search")?.trim() ?? ""

  const supabase = createAdminClient()

  let query = supabase
    .from("notes")
    .select("id, title, body, tags, folder_id, created_at, updated_at")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false })
    .limit(200)

  if (folderId === "unfiled") {
    query = query.is("folder_id", null)
  } else if (folderId) {
    query = query.eq("folder_id", folderId)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[api/notes GET]", error.message)
    return Response.json({ error: "Failed to load notes." }, { status: 500 })
  }

  const notes = (data ?? []).map((n) => ({
    ...n,
    body_preview: n.body.slice(0, 200),
  }))

  return Response.json({ notes })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const { title, body: noteBody, folder_id, tags } = body

  if (typeof title !== "string") {
    return Response.json({ error: "title must be a string." }, { status: 400 })
  }
  if (typeof noteBody !== "string") {
    return Response.json({ error: "body must be a string." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const userId = session.user.id

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: title.trim(),
      body: noteBody,
      folder_id: typeof folder_id === "string" ? folder_id : null,
      tags: Array.isArray(tags) ? (tags as string[]) : [],
    })
    .select("id, title, body, tags, folder_id, created_at, updated_at")
    .single()

  if (error || !note) {
    console.error("[api/notes POST]", error?.message)
    return Response.json({ error: "Failed to create note." }, { status: 500 })
  }

  // Update unified_activity (source='notes') so the heatmap reflects note activity
  const today = new Date().toISOString().split("T")[0]
  const { data: existing } = await supabase
    .from("unified_activity")
    .select("id, activity_count")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .eq("source", "notes")
    .maybeSingle()

  if (existing) {
    const newCount = existing.activity_count + 1
    await supabase
      .from("unified_activity")
      .update({ activity_count: newCount, intensity: noteIntensity(newCount) })
      .eq("id", existing.id)
  } else {
    await supabase.from("unified_activity").insert({
      user_id: userId,
      activity_date: today,
      source: "notes",
      activity_count: 1,
      intensity: 1,
      metadata: {} as Json,
    })
  }

  return Response.json({ note }, { status: 201 })
}

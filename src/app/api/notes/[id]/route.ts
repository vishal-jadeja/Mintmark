import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { TablesUpdate } from "@/types/database"

function noteIntensity(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { data: note, error } = await supabase
    .from("notes")
    .select("id, title, body, tags, folder_id, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle()

  if (error) {
    console.error("[api/notes/[id] GET]", error.message)
    return Response.json({ error: "Failed to load note." }, { status: 500 })
  }
  if (!note) {
    return Response.json({ error: "Note not found." }, { status: 404 })
  }

  return Response.json({ note })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const { id } = await params
  const body = (await request.json()) as Record<string, unknown>

  const patch: TablesUpdate<"notes"> = {}
  if (typeof body.title === "string") patch.title = body.title.trim()
  if (typeof body.body === "string") patch.body = body.body
  if ("folder_id" in body) {
    patch.folder_id = typeof body.folder_id === "string" ? body.folder_id : null
  }
  if (Array.isArray(body.tags)) patch.tags = body.tags as string[]

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No fields to update." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const userId = session.user.id

  const { data: note, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, title, body, tags, folder_id, created_at, updated_at")
    .maybeSingle()

  if (error) {
    console.error("[api/notes/[id] PATCH]", error.message)
    return Response.json({ error: "Failed to update note." }, { status: 500 })
  }
  if (!note) {
    return Response.json({ error: "Note not found." }, { status: 404 })
  }

  // Update unified_activity on meaningful body updates
  if ("body" in patch || "title" in patch) {
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
        metadata: {},
      })
    }
  }

  return Response.json({ note })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[api/notes/[id] DELETE]", error.message)
    return Response.json({ error: "Failed to delete note." }, { status: 500 })
  }

  return Response.json({ success: true })
}

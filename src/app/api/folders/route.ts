import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const supabase = createAdminClient()

  const { data: folders, error } = await supabase
    .from("folders")
    .select("id, name, color, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[api/folders GET]", error.message)
    return Response.json({ error: "Failed to load folders." }, { status: 500 })
  }

  // Get note counts per folder in one query
  const { data: counts } = await supabase
    .from("notes")
    .select("folder_id")
    .eq("user_id", session.user.id)
    .not("folder_id", "is", null)

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    if (row.folder_id) {
      countMap[row.folder_id] = (countMap[row.folder_id] ?? 0) + 1
    }
  }

  const result = (folders ?? []).map((f) => ({
    ...f,
    note_count: countMap[f.id] ?? 0,
  }))

  return Response.json({ folders: result })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const { name, color } = body

  if (typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "name is required." }, { status: 400 })
  }
  if (name.trim().length > 100) {
    return Response.json({ error: "name must be 100 characters or fewer." }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: folder, error } = await supabase
    .from("folders")
    .insert({
      user_id: session.user.id,
      name: name.trim(),
      color: typeof color === "string" ? color : null,
    })
    .select("id, name, color, created_at")
    .single()

  if (error || !folder) {
    console.error("[api/folders POST]", error?.message)
    return Response.json({ error: "Failed to create folder." }, { status: 500 })
  }

  return Response.json({ folder: { ...folder, note_count: 0 } }, { status: 201 })
}

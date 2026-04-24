import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

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

  // Notes in this folder have folder_id SET NULL automatically (ON DELETE SET NULL in schema)
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[api/folders/[id] DELETE]", error.message)
    return Response.json({ error: "Failed to delete folder." }, { status: 500 })
  }

  return Response.json({ success: true })
}

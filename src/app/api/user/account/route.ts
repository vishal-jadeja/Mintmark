import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"

// Tables deleted explicitly in reverse-dependency order before the users row.
// This avoids a single large CASCADE transaction on the users FK, which can
// hold locks for too long on accounts with many rows (activity, notes, etc.).
// Each DELETE uses the user_id index — O(k) where k = rows for this user.
//
// Only tables present in the current DB schema are listed here.
// Future tables (ai_messages, generated_content, topic_edges, etc.) will be
// added here when their phases ship. In the meantime, CASCADE on the users
// row handles any tables not listed below.
const USER_DATA_TABLES = [
  "unified_activity",       // one row per source per day — grows steadily
  "topic_nodes",
  "notes",
  "folders",
  "platform_connections",
  "platform_instructions",
  "api_keys",
  "user_settings",
] as const

export async function DELETE(request: Request) {
  const session = await sessionGuard()
  if (session instanceof Response) return session

  const body = (await request.json()) as Record<string, unknown>
  const { confirmation } = body

  if (
    typeof confirmation !== "string" ||
    confirmation.trim().toLowerCase() !== session.user.email?.toLowerCase()
  ) {
    return Response.json(
      { error: "Confirmation does not match your email address." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const userId = session.user.id

  // Delete child table data first — explicit and ordered.
  for (const table of USER_DATA_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId)
    if (error) {
      // Log but continue — some tables may not exist yet (e.g. topic_edges in Phase 2).
      // The users CASCADE will catch anything missed.
      console.warn(`[account DELETE] ${table}:`, error.message)
    }
  }

  // Delete the user row last. Any remaining child rows are caught by CASCADE.
  const { error } = await supabase.from("users").delete().eq("id", userId)
  if (error) {
    console.error("[account DELETE] users row:", error.message)
    return Response.json({ error: "Failed to delete account." }, { status: 500 })
  }

  return Response.json({ success: true })
}

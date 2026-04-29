import bcrypt from "bcrypt"
import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const session = await sessionGuard()
  if (session instanceof Response) return session

  const body = (await request.json()) as Record<string, unknown>
  const { currentPassword, newPassword } = body

  if (typeof currentPassword !== "string" || !currentPassword) {
    return Response.json({ error: "Current password is required." }, { status: 400 })
  }

  if (
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    return Response.json(
      { error: "New password must be 8–128 characters." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", session.user.id)
    .single()

  if (fetchError || !user) {
    console.error("[change-password POST] fetch error:", fetchError?.message)
    return Response.json({ error: "Failed to verify credentials." }, { status: 500 })
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isMatch) {
    return Response.json({ error: "Current password is incorrect." }, { status: 400 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", session.user.id)

  if (updateError) {
    console.error("[change-password POST] update error:", updateError.message)
    return Response.json({ error: "Failed to update password." }, { status: 500 })
  }

  return Response.json({ success: true })
}

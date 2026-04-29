import { sessionGuard } from "@/lib/auth/requireSession"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export async function PATCH(request: Request) {
  const session = await sessionGuard()
  if (session instanceof Response) return session

  const body = (await request.json()) as Record<string, unknown>
  const { name, avatar } = body

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 100) {
      return Response.json({ error: "Name must be 1–100 characters." }, { status: 400 })
    }
  }

  if (avatar !== undefined && avatar !== null && avatar !== "") {
    if (typeof avatar !== "string" || !isValidUrl(avatar)) {
      return Response.json({ error: "Avatar must be a valid URL." }, { status: 400 })
    }
  }

  const patch: UserUpdate = {}
  if (name !== undefined) patch.name = (name as string).trim()
  if (avatar !== undefined) patch.avatar = avatar === "" ? null : (avatar as string)

  if (!patch.name && patch.avatar === undefined) {
    return Response.json({ error: "Nothing to update." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", session.user.id)
    .select("name, avatar")
    .single()

  if (error) {
    console.error("[profile PATCH] Supabase error:", error.message)
    return Response.json({ error: "Failed to update profile." }, { status: 500 })
  }

  return Response.json({ name: data.name, avatar: data.avatar })
}

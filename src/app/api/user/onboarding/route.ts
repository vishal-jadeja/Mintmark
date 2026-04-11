import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const update: { onboarding_step?: number; onboarding_completed?: boolean } = {}

  if ("step" in body) {
    const s = body.step
    if (typeof s !== "number" || !Number.isInteger(s) || s < 1 || s > 4) {
      return Response.json(
        { error: "step must be an integer between 1 and 4." },
        { status: 400 }
      )
    }
    update.onboarding_step = s
  }

  if ("completed" in body) {
    if (typeof body.completed !== "boolean") {
      return Response.json(
        { error: "completed must be a boolean." },
        { status: 400 }
      )
    }
    update.onboarding_completed = body.completed
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No valid fields to update." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("user_settings")
    .update(update)
    .eq("user_id", session.user.id)

  if (error) {
    return Response.json({ error: "Failed to update onboarding." }, { status: 500 })
  }

  return Response.json({ success: true })
}

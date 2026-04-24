import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ApiProvider } from "@/types/database"

const ALLOWED_PROVIDERS: ApiProvider[] = ["anthropic", "openai", "gemini", "groq"]

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const { provider } = await params

  if (!ALLOWED_PROVIDERS.includes(provider as ApiProvider)) {
    return Response.json(
      { error: "provider must be one of: anthropic, openai, gemini, groq." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("user_id", session.user.id)
    .eq("provider", provider)

  if (error) {
    console.error("[api-key DELETE] Supabase error:", error.message)
    return Response.json({ error: "Failed to delete API key." }, { status: 500 })
  }

  return Response.json({ success: true })
}

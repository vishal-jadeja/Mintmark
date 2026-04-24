import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { encrypt } from "@/lib/encryption"
import type { ApiProvider } from "@/types/database"

const ALLOWED_PROVIDERS: ApiProvider[] = ["anthropic", "openai", "gemini", "groq"]

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>
  const { provider, key } = body

  if (!ALLOWED_PROVIDERS.includes(provider as ApiProvider)) {
    return Response.json(
      { error: "provider must be one of: anthropic, openai, gemini, groq." },
      { status: 400 }
    )
  }
  if (typeof key !== "string" || key.trim().length === 0) {
    return Response.json({ error: "key is required." }, { status: 400 })
  }

  const encrypted_key = encrypt(key.trim())
  const supabase = createAdminClient()

  const { error } = await supabase.from("api_keys").upsert(
    {
      user_id: session.user.id,
      provider: provider as ApiProvider,
      encrypted_key,
      is_active: true,
    },
    { onConflict: "user_id,provider" }
  )

  if (error) {
    console.error("[api-key POST] Supabase error:", error.message)
    return Response.json({ error: "Failed to save API key." }, { status: 500 })
  }

  return Response.json({ success: true })
}

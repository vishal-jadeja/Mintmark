import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_PLATFORMS = ["linkedin", "x", "medium"] as const
const ALLOWED_TONES = ["professional", "casual", "educational", "storytelling"] as const

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("platform_instructions")
    .select("platform, instruction_text, tone, format_rules")
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[platform-instructions GET] Supabase error:", error.message)
    return Response.json({ error: "Failed to fetch instructions." }, { status: 500 })
  }

  return Response.json({ instructions: data ?? [] })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const body = (await request.json()) as Record<string, unknown>

  const { platform, instruction_text, tone, format_rules } = body

  if (!ALLOWED_PLATFORMS.includes(platform as (typeof ALLOWED_PLATFORMS)[number])) {
    return Response.json(
      { error: "platform must be one of: linkedin, x, medium." },
      { status: 400 }
    )
  }

  if (tone !== undefined && !ALLOWED_TONES.includes(tone as (typeof ALLOWED_TONES)[number])) {
    return Response.json(
      { error: "tone must be one of: professional, casual, educational, storytelling." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("platform_instructions").upsert(
    {
      user_id: session.user.id,
      platform: platform as string,
      instruction_text: (instruction_text as string | undefined) ?? null,
      tone: (tone as string | undefined) ?? null,
      format_rules: (format_rules as string | undefined) ?? null,
    },
    { onConflict: "user_id,platform" }
  )

  if (error) {
    console.error("[platform-instructions POST] Supabase error:", error.message)
    return Response.json({ error: "Failed to save instructions." }, { status: 500 })
  }

  return Response.json({ success: true })
}

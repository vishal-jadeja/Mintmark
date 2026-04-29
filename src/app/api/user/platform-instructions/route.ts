import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ContentPlatform, PlatformTone } from "@/types/database"
import { PLATFORM_MAX_CHARS } from "@/lib/ai/platform-rules"

const ALLOWED_PLATFORMS = ["linkedin", "x", "medium"] as const
const ALLOWED_TONES: PlatformTone[] = [
  "professional",
  "casual",
  "educational",
  "storytelling",
  "witty",
  "authoritative",
  "inspirational",
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized." }, { status: 403 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("platform_instructions")
    .select("platform, instruction_text, tone, format_rules, max_length")
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
  const { platform, instruction_text, tone, format_rules, max_length } = body

  if (!ALLOWED_PLATFORMS.includes(platform as (typeof ALLOWED_PLATFORMS)[number])) {
    return Response.json(
      { error: "platform must be one of: linkedin, x, medium." },
      { status: 400 }
    )
  }

  if (tone !== undefined && !ALLOWED_TONES.includes(tone as PlatformTone)) {
    return Response.json(
      { error: `tone must be one of: ${ALLOWED_TONES.join(", ")}.` },
      { status: 400 }
    )
  }

  if (max_length !== undefined && max_length !== null) {
    const num = Number(max_length)
    if (!Number.isInteger(num) || num <= 0) {
      return Response.json({ error: "max_length must be a positive integer." }, { status: 400 })
    }
    const platformKey = platform as keyof typeof PLATFORM_MAX_CHARS
    const hardLimit = PLATFORM_MAX_CHARS[platformKey]
    if (hardLimit !== null && num > hardLimit) {
      return Response.json(
        { error: `max_length cannot exceed ${hardLimit} for ${platform}.` },
        { status: 400 }
      )
    }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("platform_instructions").upsert(
    {
      user_id: session.user.id,
      platform: platform as ContentPlatform,
      instruction_text: (instruction_text as string | undefined) ?? null,
      tone: (tone as PlatformTone | undefined) ?? null,
      format_rules: (format_rules as string | undefined) ?? null,
      max_length: max_length != null ? Number(max_length) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform" }
  )

  if (error) {
    console.error("[platform-instructions POST] Supabase error:", error.message)
    return Response.json({ error: "Failed to save instructions." }, { status: 500 })
  }

  return Response.json({ success: true })
}

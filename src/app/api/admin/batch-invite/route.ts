import { randomBytes } from "node:crypto"
import { adminGuard } from "@/lib/auth/requireAdmin"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/send"
import { InviteEmail, INVITE_SUBJECT } from "@/lib/email/templates"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mintmark.app"
const TOKEN_TTL_HOURS = 48

function generateInviteToken(): string {
  return randomBytes(32).toString("hex")
}

export async function POST(request: Request) {
  const denied = await adminGuard()
  if (denied) return denied

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const rawCount = typeof body.count === "number" ? body.count : parseInt(String(body.count), 10)
  if (isNaN(rawCount) || rawCount < 1 || rawCount > 100) {
    return Response.json(
      { error: "Count must be between 1 and 100." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Check remaining capacity
  const [{ data: capRow }, { count: usedCount }] = await Promise.all([
    supabase.from("system_config").select("value").eq("key", "invite_cap").maybeSingle(),
    supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .in("status", ["invited", "joined"]),
  ])

  const cap = parseInt(capRow?.value ?? "100", 10)
  const used = usedCount ?? 0
  const remaining = Math.max(0, cap - used)
  const count = Math.min(rawCount, remaining)

  if (count === 0) {
    return Response.json(
      { error: "No capacity remaining. Increase the invite cap in config first." },
      { status: 400 }
    )
  }

  // Fetch top N waiting users ordered by position
  const { data: candidates } = await supabase
    .from("waitlist")
    .select("id, email, name")
    .eq("status", "waiting")
    .order("position", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .limit(count)

  if (!candidates || candidates.length === 0) {
    return Response.json(
      { error: "No waiting users found on the waitlist." },
      { status: 404 }
    )
  }

  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()
  const expiresFormatted = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Process invites in parallel — allSettled so one failure doesn't stop the batch
  const results = await Promise.allSettled(
    candidates.map(async (candidate) => {
      const token = generateInviteToken()
      const inviteUrl = `${APP_URL}/invite/${token}`

      // Insert token
      const { error: tokenErr } = await supabase
        .from("invite_tokens")
        .insert({ email: candidate.email, token, expires_at: expiresAt })

      if (tokenErr) {
        throw new Error(`Token insert failed for ${candidate.email}`)
      }

      // Update status
      await supabase
        .from("waitlist")
        .update({ status: "invited" })
        .eq("email", candidate.email)

      // Send email
      await sendEmail({
        to: candidate.email,
        subject: INVITE_SUBJECT,
        react: InviteEmail({
          name: candidate.name ?? undefined,
          email: candidate.email,
          inviteUrl,
          expiresAt: expiresFormatted,
        }),
      })

      return candidate.email
    })
  )

  const invited = results.filter((r) => r.status === "fulfilled").length
  const failed = results
    .filter((r) => r.status === "rejected")
    .map((_, i) => candidates[i]?.email ?? "unknown")

  // Invalidate stats cache
  await redis.del("admin:stats")

  return Response.json({ invited, failed })
}

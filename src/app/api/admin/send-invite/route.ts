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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 1. Verify email exists with status = 'waiting'
  const { data: entry } = await supabase
    .from("waitlist")
    .select("id, email, name, status")
    .eq("email", email)
    .maybeSingle()

  if (!entry) {
    return Response.json(
      { error: "This email is not on the waitlist." },
      { status: 404 }
    )
  }
  if (entry.status !== "waiting") {
    return Response.json(
      { error: `This person has already been ${entry.status}.` },
      { status: 409 }
    )
  }

  // 2. Check invite cap
  const [{ data: capRow }, { count: joinedCount }] = await Promise.all([
    supabase.from("system_config").select("value").eq("key", "invite_cap").maybeSingle(),
    supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .in("status", ["invited", "joined"]),
  ])

  const cap = parseInt(capRow?.value ?? "100", 10)
  const used = joinedCount ?? 0

  if (used >= cap) {
    return Response.json(
      { error: "Invite cap reached. Increase the cap in config first." },
      { status: 400 }
    )
  }

  // 3. Generate token
  const token = generateInviteToken()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()

  // 4. Insert invite token
  const { error: tokenError } = await supabase
    .from("invite_tokens")
    .insert({ email, token, expires_at: expiresAt })

  if (tokenError) {
    console.error("[admin/send-invite] Token insert error:", tokenError.message)
    return Response.json(
      { error: "Failed to create invite. Please try again." },
      { status: 500 }
    )
  }

  // 5. Update waitlist status
  await supabase
    .from("waitlist")
    .update({ status: "invited" })
    .eq("email", email)

  // 6. Send invite email
  const inviteUrl = `${APP_URL}/invite/${token}`
  const expiresFormatted = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  await sendEmail({
    to: email,
    subject: INVITE_SUBJECT,
    react: InviteEmail({
      name: entry.name ?? undefined,
      email,
      inviteUrl,
      expiresAt: expiresFormatted,
    }),
  })

  // 7. Invalidate stats cache
  await redis.del("admin:stats")

  return Response.json({ success: true })
}

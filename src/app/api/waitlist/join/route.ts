import { randomBytes } from "node:crypto"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, waitlistLimiter } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email/send"
import {
  WaitlistConfirmationEmail,
  WAITLIST_CONFIRMATION_SUBJECT,
} from "@/lib/email/templates"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function generateToken(length = 6): string {
  const bytes = randomBytes(length)
  let token = ""
  for (const byte of bytes) {
    token += REFERRAL_CHARS[byte % REFERRAL_CHARS.length]
  }
  return token
}

export async function POST(request: Request) {
  // 1. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const url = new URL(request.url)
  const refParam = url.searchParams.get("ref")

  const email =
    typeof body.email === "string" ? body.email.trim().slice(0, 254) : ""
  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 100) || null : null
  const reason =
    typeof body.reason === "string"
      ? body.reason.trim().slice(0, 500) || null
      : null
  const honeypot = typeof body.website === "string" ? body.website : ""
  const referredByRaw =
    typeof body.referred_by === "string" ? body.referred_by : refParam

  // 2. Honeypot — silently succeed so bots think they signed up
  if (honeypot) {
    return Response.json(
      { message: "You've been added to the waitlist!" },
      { status: 200 }
    )
  }

  // 3. Rate limit by IP
  const ip = getIP(request)
  const rl = await checkRateLimit(ip, waitlistLimiter)
  if (!rl.success) {
    return Response.json(
      { error: "Too many signups from this location. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  // 4. Validate email
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 422 }
    )
  }

  const supabase = await createClient()

  // 5. Check if already on waitlist
  const { data: existing } = await supabase
    .from("waitlist")
    .select("referral_code")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    return Response.json(
      { message: "You're already on the list! Check your email." },
      { status: 200 }
    )
  }

  // 6. Generate 6-char alphanumeric verification token
  const verificationToken = generateToken(6)

  // 7. Validate referred_by — must match an existing referral_code
  let validReferredBy: string | null = null
  if (referredByRaw) {
    const { data: referrer } = await supabase
      .from("waitlist")
      .select("id")
      .eq("referral_code", referredByRaw)
      .maybeSingle()
    if (referrer) validReferredBy = referredByRaw
  }

  // 8. Insert — referral_code auto-set by DB trigger
  const { data: newEntry, error: insertError } = await supabase
    .from("waitlist")
    .insert({
      email,
      name,
      reason,
      referred_by: validReferredBy,
      verification_token: verificationToken,
      status: "waiting",
      email_verified: false,
    })
    .select("referral_code")
    .single()

  if (insertError || !newEntry) {
    console.error("[waitlist/join] Insert error:", insertError)
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  // 9. Get effective position (accounts for referral bonuses)
  const { data: position } = await supabase.rpc("get_waitlist_position", {
    p_email: email,
  })

  // 10. Get total count
  const { count: total } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })

  // 11. Send verification email (non-blocking — failure doesn't abort signup)
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://mintmark.app"
  const verificationUrl = `${appUrl}/api/waitlist/verify?token=${verificationToken}`
  const referralUrl = `${appUrl}/ref/${newEntry.referral_code}`

  await sendEmail({
    to: email,
    subject: WAITLIST_CONFIRMATION_SUBJECT,
    react: WaitlistConfirmationEmail({
      name: name ?? undefined,
      email,
      verificationUrl,
      referralCode: newEntry.referral_code,
      referralUrl,
    }),
    text: [
      `Thanks for joining the Mintmark waitlist!`,
      ``,
      `Confirm your spot: ${verificationUrl}`,
      ``,
      `Share your referral link to move up: ${referralUrl}`,
    ].join("\n"),
  })

  return Response.json({
    message: "You've been added to the waitlist!",
    referral_code: newEntry.referral_code,
    position: position ?? null,
    total: total ?? 0,
  })
}

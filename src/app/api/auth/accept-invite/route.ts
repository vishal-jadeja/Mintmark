import bcrypt from "bcrypt"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, acceptInviteLimiter } from "@/lib/rate-limit"

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function POST(request: Request) {
  // 1. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const token = typeof body.token === "string" ? body.token : ""
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (!token) {
    return Response.json({ error: "Missing invite token." }, { status: 400 })
  }

  // 2. Validate inputs
  const fieldErrors: Record<string, string> = {}
  if (!name || name.length < 1) {
    fieldErrors.name = "Name is required."
  } else if (name.length > 100) {
    fieldErrors.name = "Name must be 100 characters or fewer."
  }
  if (!password || password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters."
  } else if (password.length > 128) {
    fieldErrors.password = "Password must be 128 characters or fewer."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return Response.json({ error: "Validation failed.", fields: fieldErrors }, { status: 422 })
  }

  // 3. Rate limit by IP
  const ip = getIP(request)
  const rl = await checkRateLimit(ip, acceptInviteLimiter)
  if (!rl.success) {
    return Response.json(
      { error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  // 4. Hash password (bcrypt, cost 12)
  const hash = await bcrypt.hash(password, 12)

  // 5. Call RPC — atomic account creation in a single transaction
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("accept_invite_account", {
    p_token: token,
    p_name: name,
    p_password_hash: hash,
    p_timezone: "UTC",
  })

  if (error) {
    return Response.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    )
  }

  // 6. Map RPC error codes to HTTP responses
  const result = data as { error?: string; user_id?: string; email?: string; name?: string }

  if (result.error === "invalid_token") {
    return Response.json(
      { error: "This invite link has already been used or has expired." },
      { status: 410 }
    )
  }

  if (result.error === "already_registered") {
    return Response.json(
      { error: "An account already exists for this email address." },
      { status: 409 }
    )
  }

  if (result.error) {
    return Response.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    )
  }

  return Response.json({
    success: true,
    email: result.email,
    name: result.name,
  })
}

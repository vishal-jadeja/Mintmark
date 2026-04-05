import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, verifyTokenLimiter } from "@/lib/rate-limit"

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) {
    return Response.json({ valid: false }, { status: 400 })
  }

  // Rate limit by IP
  const ip = getIP(request)
  const rl = await checkRateLimit(ip, verifyTokenLimiter)
  if (!rl.success) {
    return Response.json(
      { valid: false },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("invite_tokens")
    .select("email")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (!data) {
    return Response.json({ valid: false }, { status: 400 })
  }

  return Response.json({ valid: true, email: data.email })
}

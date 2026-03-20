// Stub — returns a mock referral code until Step 4 wires this to Supabase.
// Honeypot and basic validation are already handled here so the form
// is fully exercisable before the real database layer exists.
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  // Honeypot — silently succeed so bots think they signed up
  if (body.website) {
    return Response.json({ referral_code: "XXXXXXXX" }, { status: 201 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  if (!email) {
    return Response.json({ error: "Email is required." }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 422 })
  }

  // Stub: return a deterministic fake code derived from the email
  // Real logic (Supabase insert + trigger-generated code) added in Step 4.
  return Response.json({ referral_code: "MINTM001" }, { status: 201 })
}

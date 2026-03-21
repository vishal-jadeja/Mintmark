import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")
  const origin = url.origin

  if (!token) {
    return NextResponse.redirect(new URL("/?verified=false", origin))
  }

  const supabase = createAdminClient()

  const { data: entry } = await supabase
    .from("waitlist")
    .select("id")
    .eq("verification_token", token)
    .maybeSingle()

  if (!entry) {
    return NextResponse.redirect(new URL("/?verified=false", origin))
  }

  await supabase
    .from("waitlist")
    .update({ email_verified: true, verification_token: null })
    .eq("id", entry.id)

  return NextResponse.redirect(new URL("/?verified=true", origin))
}

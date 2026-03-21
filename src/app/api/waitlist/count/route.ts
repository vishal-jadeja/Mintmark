import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })

  return Response.json(
    { count: count ?? 0 },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  )
}

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { calculateStreaks } from "@/lib/streak"
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting"
import { HeatmapWidget } from "@/components/dashboard/HeatmapWidget"
import { WeekCalendarWidget } from "@/components/dashboard/WeekCalendarWidget"
import { TopicDistribution } from "@/components/dashboard/TopicDistribution"
import { IntelligenceCards } from "@/components/dashboard/IntelligenceCards"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createAdminClient()

  const { data: settings } = await supabase
    .from("user_settings")
    .select("onboarding_completed")
    .eq("user_id", session.user.id)
    .maybeSingle()

  if (!settings?.onboarding_completed) redirect("/onboarding")

  const since = new Date()
  since.setDate(since.getDate() - 365)

  const { data: activities } = await supabase
    .from("unified_activity")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("activity_date", since.toISOString().split("T")[0])
    .order("activity_date", { ascending: true })

  const activityRows = activities ?? []
  const streak = calculateStreaks(activityRows)
  const hasData = activityRows.length > 0
  const userName = session.user.name ?? null

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <DashboardGreeting name={userName} streak={streak} hasData={hasData} />

      {hasData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <WeekCalendarWidget activities={activityRows} />
            </div>
            <IntelligenceCards />
          </div>

          <HeatmapWidget activities={activityRows} streak={streak} />
          <TopicDistribution activities={activityRows} />
        </>
      ) : (
        <DashboardEmptyState />
      )}

    </div>
  )
}

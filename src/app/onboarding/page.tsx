import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("user_settings")
    .select("onboarding_step, onboarding_completed")
    .eq("user_id", session.user.id)
    .maybeSingle()

  // Already completed onboarding — send to dashboard
  if (settings?.onboarding_completed) redirect("/dashboard")

  return (
    <OnboardingWizard initialStep={settings?.onboarding_step ?? 1} />
  )
}

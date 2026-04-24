import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SettingsClient } from "@/components/settings/SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <SettingsClient />
    </div>
  )
}

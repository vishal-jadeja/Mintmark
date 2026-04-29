import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SettingsClient } from "@/components/settings/SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <SettingsClient
      initialName={session.user.name ?? null}
      initialEmail={session.user.email ?? ""}
      initialAvatar={session.user.image ?? null}
    />
  )
}

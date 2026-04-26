import { auth } from "@/auth"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { AppBottomNav } from "@/components/layout/AppBottomNav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // auth() reads JWT from cookie — fast, no DB hit.
  // Proxy already verified the token; this just extracts user info for the shell.
  const session = await auth()
  const userName = session?.user?.name ?? null
  const userAvatar = session?.user?.image ?? null

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--background)",
        backgroundImage:
          "radial-gradient(circle at 15% 25%, rgba(230,195,100,0.10) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(230,195,100,0.07) 0%, transparent 45%)",
      }}
    >
      <AppSidebar userName={userName} userAvatar={userAvatar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <AppBottomNav />
    </div>
  )
}

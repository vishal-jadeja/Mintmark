import { LogoMark } from "@/components/ui/logo-mark"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <header className="h-16 px-6 border-b border-border flex items-center">
        <LogoMark size={32} />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {children}
      </main>
    </div>
  )
}

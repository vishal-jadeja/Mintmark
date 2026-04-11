"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS } from "./nav-items"

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors"
            style={{
              color: isActive ? "var(--mm-gold-400)" : "var(--muted-foreground)",
            }}
          >
            <Icon size={20} />
            <span className="text-[10px] mt-0.5">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

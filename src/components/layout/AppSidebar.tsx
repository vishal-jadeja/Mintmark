"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { LogoMark } from "@/components/ui/logo-mark"
import { useUIStore } from "@/stores/uiStore"
import { NAV_ITEMS } from "./nav-items"

interface AppSidebarProps {
  userName: string | null
  userAvatar: string | null
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function AppSidebar({ userName, userAvatar }: AppSidebarProps) {
  const pathname = usePathname()
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0 transition-all duration-200"
      style={{
        width: sidebarCollapsed ? "64px" : "220px",
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo + collapse toggle */}
      <div
        className="h-16 flex items-center border-b border-[var(--sidebar-border)]"
        style={{
          padding: sidebarCollapsed ? "0" : "0 16px",
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
        }}
      >
        {!sidebarCollapsed && <LogoMark size={28} />}
        {!sidebarCollapsed && (
          <span className="ml-2.5 font-heading text-sm font-semibold text-foreground truncate flex-1">
            Mintmark
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5 flex-shrink-0"
          style={{ marginLeft: sidebarCollapsed ? "0" : "auto" }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/")

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center transition-colors duration-150 mx-2 rounded-md"
              style={{
                height: "40px",
                paddingLeft: sidebarCollapsed ? "0px" : "10px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                gap: sidebarCollapsed ? "0" : "10px",
                background: isActive ? "rgba(230,195,100,0.08)" : "transparent",
                color: isActive ? "var(--mm-gold-400)" : "var(--muted-foreground)",
                borderLeft: isActive ? "2px solid var(--mm-gold-400)" : "2px solid transparent",
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && (
                <span className="font-body text-sm truncate">{label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + toggle */}
      <div className="border-t border-[var(--sidebar-border)] p-3 space-y-2">
        {/* User info */}
        <div
          className="flex items-center overflow-hidden"
          style={{ gap: sidebarCollapsed ? "0" : "10px" }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0" style={{ width: "32px", height: "32px" }}>
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt={userName ?? "User avatar"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--muted-foreground)",
                }}
              >
                {getInitials(userName)}
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <span
              className="font-body text-sm text-foreground truncate"
              title={userName ?? undefined}
            >
              {userName ?? "User"}
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center w-full h-8 rounded-md transition-colors hover:bg-white/5"
          style={{
            paddingLeft: sidebarCollapsed ? "0px" : "10px",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: sidebarCollapsed ? "0" : "10px",
            color: "var(--muted-foreground)",
          }}
          aria-label="Sign out"
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && (
            <span className="font-body text-sm">Sign out</span>
          )}
        </button>

      </div>
    </aside>
  )
}

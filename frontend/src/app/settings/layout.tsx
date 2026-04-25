"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, CreditCard, Key, Plug, Gift } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const NAV = [
  { href: "/settings/profile",      label: "Profile",                Icon: User       },
  { href: "/settings/team",         label: "My Team",                Icon: Users      },
  { href: "/settings/billing",      label: "Subscription & Billing", Icon: CreditCard },
  { href: "/settings/api",          label: "API Keys",               Icon: Key        },
  { href: "/settings/integrations", label: "Integrations",           Icon: Plug       },
  { href: "/settings/referral",     label: "Referral Program",       Icon: Gift       },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      {/* Title bar */}
      <div style={{
        padding: "16px 24px 12px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-raise)",
        flexShrink: 0,
      }}>
        <h1 style={{ ...S, fontSize: 18, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
          Settings
        </h1>
        <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "2px 0 0" }}>
          Manage your account, team, billing and integrations.
        </p>
      </div>

      {/* Body: sidebar + main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: "var(--bg-raise)",
          borderRight: "1px solid var(--border)",
          padding: "16px 0",
          overflowY: "auto",
        }}>
          <div style={{
            ...M, fontSize: 9, color: "var(--fg-dim)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0 20px 10px",
          }}>
            Workspace
          </div>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 20px",
                    ...S, fontSize: 13,
                    color: active ? "var(--fg)" : "var(--fg-muted)",
                    background: active ? "var(--bg-alt)" : "transparent",
                    fontWeight: active ? 500 : 400,
                    textDecoration: "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: 3, background: "var(--fg)",
                    }} />
                  )}
                  <Icon size={14} style={{ color: active ? "var(--fg)" : "var(--fg-muted)" }} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px 64px", minWidth: 0 }}>
          <div style={{ maxWidth: 880 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

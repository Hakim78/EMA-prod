"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Users, BookMarked, Database, Bell, Moon, Sun, User, Zap, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import NumberTicker from "@/components/ui/NumberTicker";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const NAV = [
  { href: "/",          icon: Search,     label: "Recherche",     badge: null   },
  { href: "/investors", icon: Users,      label: "Investisseurs", badge: "BETA" },
  { href: "/pipeline",  icon: BookMarked, label: "My Lists",      badge: null   },
  { href: "/targets",   icon: Database,   label: "Base données",  badge: null   },
  { href: "/signals",               icon: Bell,     label: "Signaux",       badge: "3"  },
  { href: "/settings/integrations", icon: Settings, label: "Settings",      badge: null },
];

const CREDITS = 47;

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside style={{
      width: 48,
      height: "100%",
      borderRight: "1px solid var(--border)",
      background: "var(--bg-raise)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
      zIndex: 50,
      paddingTop: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 48,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <span style={{ ...M, fontSize: 10, color: "var(--fg)", fontWeight: 700, letterSpacing: "0.04em" }}>
          Ed
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ display: "flex", flexDirection: "column", width: "100%", flex: 1, paddingTop: 4 }}>
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                width: "100%",
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                borderLeft: `2px solid ${active ? "var(--fg)" : "transparent"}`,
                color: active ? "var(--fg)" : "var(--fg-muted)",
                transition: "color 0.1s, border-color 0.1s",
                textDecoration: "none",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? "var(--fg)" : "var(--fg-muted)"; }}
            >
              <Icon size={15} />
              {badge && (
                <span style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  ...M,
                  fontSize: 7,
                  padding: "1px 3px",
                  background: badge === "BETA" ? "var(--bg-alt)" : "var(--signal)",
                  color: badge === "BETA" ? "var(--fg-muted)" : "#fff",
                  border: badge === "BETA" ? "1px solid var(--border)" : "none",
                  letterSpacing: "0.04em",
                  lineHeight: 1.4,
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: credits + theme + user */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingBottom: 10, borderTop: "1px solid var(--border)", paddingTop: 8, width: "100%" }}>
        {/* Credits */}
        <div
          title={`${CREDITS} crédits restants`}
          style={{
            width: "100%",
            height: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            gap: 2,
          }}
        >
          <Zap size={13} style={{ color: CREDITS > 10 ? "var(--up)" : "var(--signal)" }} />
          <NumberTicker
            value={CREDITS}
            style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.04em" }}
          />
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            style={{
              width: 32, height: 32,
              background: "transparent",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-muted)",
              transition: "border-color 0.1s, color 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        )}

        {/* User avatar */}
        <div
          title="Compte"
          style={{
            width: 28, height: 28,
            background: "var(--bg-alt)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--fg-muted)",
          }}
        >
          <User size={13} />
        </div>
      </div>
    </aside>
  );
}

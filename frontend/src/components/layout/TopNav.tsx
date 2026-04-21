"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Users, BookMarked, Database, Bell, Moon, Sun, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const NAV = [
  { href: "/",          icon: Search,     label: "Recherche",    badge: null        },
  { href: "/investors", icon: Users,      label: "Investisseurs", badge: "BETA"     },
  { href: "/pipeline",  icon: BookMarked, label: "My Lists",     badge: null        },
  { href: "/targets",   icon: Database,   label: "Base données", badge: null        },
  { href: "/signals",   icon: Bell,       label: "Signaux",      badge: "3"         },
];

const CREDITS = 47; // TODO: fetch from /api/user/credits

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header style={{
      height: 48,
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-raise)",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <span style={{ ...M, fontSize: 12, color: "var(--fg)", letterSpacing: "0.06em", marginRight: 32, fontWeight: 700 }}>
        EdRCF <span style={{ color: "var(--fg-dim)", fontWeight: 400 }}>6.0</span>
      </span>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", flex: 1, height: "100%" }}>
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 13px", height: "100%",
              borderBottom: `2px solid ${active ? "var(--fg)" : "transparent"}`,
              textDecoration: "none",
              color: active ? "var(--fg)" : "var(--fg-muted)",
              transition: "color 0.1s, border-color 0.1s",
              position: "relative",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--fg-muted)"; }}
            >
              <Icon size={13} />
              <span style={{ ...S, fontSize: 12, fontWeight: active ? 500 : 400 }}>{label}</span>
              {badge && (
                <span style={{
                  ...M, fontSize: 8,
                  padding: "1px 5px",
                  background: badge === "BETA" ? "var(--bg-alt)" : "var(--signal)",
                  color: badge === "BETA" ? "var(--fg-muted)" : "var(--primary-fg)",
                  border: badge === "BETA" ? "1px solid var(--border)" : "none",
                  letterSpacing: "0.06em",
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right side: credits + theme + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Credits counter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px",
          border: "1px solid var(--border)",
          background: "var(--bg-alt)",
          cursor: "pointer",
        }}
          title="Crédits contacts restants"
        >
          <Zap size={11} style={{ color: CREDITS > 10 ? "var(--up)" : "var(--signal)" }} />
          <span style={{ ...M, fontSize: 10, color: "var(--fg)", letterSpacing: "0.04em" }}>
            {CREDITS}
          </span>
          <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>crédits</span>
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              width: 32, height: 32, background: "transparent", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-muted)", transition: "border-color 0.1s, color 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
          >
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        )}

        {/* User avatar */}
        <div style={{
          width: 28, height: 28,
          background: "var(--bg-alt)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--fg-muted)",
        }}>
          <User size={13} />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, GitBranch, Map, Network, Moon, Sun, Target } from "lucide-react";
import { useEffect, useState } from "react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const NAV = [
  { href: "/",         icon: Search,    label: "Recherche" },
  { href: "/targets",  icon: Target,    label: "Cibles"    },
  { href: "/pipeline", icon: GitBranch, label: "Pipeline"  },
  { href: "/map",      icon: Map,       label: "Carte"     },
  { href: "/graph",    icon: Network,   label: "Réseau"    },
];

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
        EdRCF
      </span>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", flex: 1, height: "100%" }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 14px",
              height: "100%",
              borderBottom: `2px solid ${active ? "var(--fg)" : "transparent"}`,
              textDecoration: "none",
              color: active ? "var(--fg)" : "var(--fg-muted)",
              transition: "color 0.1s, border-color 0.1s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--fg-muted)"; }}
            >
              <Icon size={13} />
              <span style={{ ...S, fontSize: 12, fontWeight: active ? 500 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
          style={{
            width: 32, height: 32,
            background: "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--fg-muted)",
            transition: "border-color 0.1s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      )}
    </header>
  );
}

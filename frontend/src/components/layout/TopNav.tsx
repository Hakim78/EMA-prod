"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MagnifyingGlassIcon,
  PersonIcon,
  BookmarkIcon,
  StackIcon,
  BellIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
  LightningBoltIcon,
  TargetIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import NumberTicker from "@/components/ui/NumberTicker";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

const NAV = [
  { href: "/",                      Icon: MagnifyingGlassIcon, label: "Recherche",     badge: null   },
  { href: "/investors",             Icon: PersonIcon,          label: "Investisseurs", badge: "BETA" },
  { href: "/pipeline",              Icon: BookmarkIcon,        label: "My Lists",      badge: null   },
  { href: "/targets",               Icon: StackIcon,           label: "Base données",  badge: null   },
  { href: "/signals",               Icon: BellIcon,            label: "Signaux",       badge: "3"    },
  { href: "/settings/integrations", Icon: GearIcon,            label: "Settings",      badge: null   },
];

const CREDITS = 47;

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside className="w-12 h-full flex flex-col items-center shrink-0 z-50 bg-[var(--bg-raise)] border-r border-[var(--border)] relative">

      {/* Logo */}
      <div className="w-full h-12 flex items-center justify-center shrink-0 border-b border-[var(--border)]">
        <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "var(--fg)", letterSpacing: "0.06em" }}>
          Ed
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col w-full flex-1 pt-2 gap-0.5">
        {NAV.map(({ href, Icon, label, badge }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="group relative flex items-center justify-center w-full h-11 transition-colors"
              style={{ color: active ? "var(--fg)" : "var(--fg-muted)", textDecoration: "none" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--fg)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = active ? "var(--fg)" : "var(--fg-muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {/* Active bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--fg)]" />
              )}

              <Icon width={16} height={16} />

              {/* Badge */}
              {badge && (
                <span
                  style={{
                    position: "absolute", top: 7, right: 7,
                    ...M, fontSize: 7, padding: "1px 3px", lineHeight: 1.4, letterSpacing: "0.04em",
                    background: badge === "BETA" ? "var(--bg-alt)" : "var(--signal)",
                    color: badge === "BETA" ? "var(--fg-muted)" : "#fff",
                    border: badge === "BETA" ? "1px solid var(--border)" : "none",
                    borderRadius: 3,
                  }}
                >
                  {badge}
                </span>
              )}

              {/* Tooltip */}
              <div className="absolute left-14 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
                {label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="w-full flex flex-col items-center pb-4 pt-3 gap-2 border-t border-[var(--border)]">

        {/* Credits */}
        <div className="group relative w-full h-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-alt)] transition-colors gap-0.5">
          <LightningBoltIcon
            width={14} height={14}
            style={{ color: CREDITS > 10 ? "var(--up)" : "var(--signal)" }}
          />
          <NumberTicker
            value={CREDITS}
            style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.04em" }}
          />
          <div className="absolute left-14 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
            {CREDITS} crédits restants
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
          </div>
        </div>

        {/* Getting Started */}
        <Link
          href="/onboarding"
          className="group relative w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-all"
          style={{ textDecoration: "none" }}
        >
          <TargetIcon width={15} height={15} />
          <div className="absolute left-12 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
            Getting Started
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
          </div>
        </Link>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="group relative w-8 h-8 flex items-center justify-center rounded-md border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-alt)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-all"
            style={{ cursor: "pointer", background: "transparent" }}
          >
            {theme === "dark"
              ? <SunIcon width={15} height={15} />
              : <MoonIcon width={15} height={15} />
            }
            <div className="absolute left-12 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
            </div>
          </button>
        )}

        {/* User avatar */}
        <div
          title="Compte"
          className="group relative mt-1 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-dim)] cursor-pointer transition-all"
        >
          <PersonIcon width={13} height={13} />
          <div className="absolute left-12 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
            Mon Compte
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
          </div>
        </div>

      </div>
    </aside>
  );
}

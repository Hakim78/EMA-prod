"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
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
  DotFilledIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import NumberTicker from "@/components/ui/NumberTicker";
import { useSignals } from "@/lib/queries/useSignals";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const SEV_COLORS: Record<string, string> = {
  high: "#FF4500", medium: "#F59E0B", low: "var(--fg-muted)",
};

const NAV = [
  { href: "/",                      Icon: MagnifyingGlassIcon, label: "Recherche",     badge: null   },
  { href: "/investors",             Icon: PersonIcon,          label: "Investisseurs", badge: "BETA" },
  { href: "/pipeline",              Icon: BookmarkIcon,        label: "My Lists",      badge: null   },
  { href: "/targets",               Icon: StackIcon,           label: "Base données",  badge: null   },
  { href: "/settings/integrations", Icon: GearIcon,            label: "Settings",      badge: null   },
];

const CREDITS = 47;

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

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
        <SignalsBell active={pathname === "/signals" || pathname.startsWith("/signals")} />
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

// ── Signals Bell ───────────────────────────────────────────────────────────────

function SignalsBell({ active }: { active: boolean }) {
  const router = useRouter();
  const { data } = useSignals();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const signals = Array.isArray(data) ? data : (data as { data?: unknown[] } | undefined)?.data ?? [];
  const count = Math.min(signals.length, 99);
  const recent = [...signals]
    .sort((a: { severity?: string }, b: { severity?: string }) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (order[a.severity ?? "low"] ?? 2) - (order[b.severity ?? "low"] ?? 2);
    })
    .slice(0, 8) as Array<{ id?: string; target_name?: string; label?: string; severity?: string; source?: string }>;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener("mousedown", close), 0);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setOpen(p => !p)}
        className="group relative flex items-center justify-center w-full h-11 transition-colors"
        style={{
          background: open ? "var(--bg-alt)" : "transparent",
          border: "none", cursor: "pointer",
          color: active || open ? "var(--fg)" : "var(--fg-muted)",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.color = "var(--fg)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? "var(--bg-alt)" : "transparent"; e.currentTarget.style.color = active || open ? "var(--fg)" : "var(--fg-muted)"; }}
      >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--fg)]" />}
        <BellIcon width={16} height={16} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: 7, right: 7,
            ...M, fontSize: 7, padding: "1px 3px", lineHeight: 1.4, letterSpacing: "0.04em",
            background: "var(--signal)", color: "#fff", borderRadius: 3,
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
        {!open && (
          <div className="absolute left-14 px-2.5 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg z-50">
            Signaux
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-[var(--fg)]" />
          </div>
        )}
      </button>

      {open && (
        <div style={{
          position: "fixed", left: 52, top: "auto",
          width: 300, zIndex: 200,
          background: "var(--bg-raise)", border: "1px solid var(--border)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--bg-alt)",
          }}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
              SIGNAUX RÉCENTS
            </span>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)" }}>{count} total</span>
          </div>

          {recent.length === 0 ? (
            <div style={{ padding: "16px 12px", ...S, fontSize: 12, color: "var(--fg-muted)", textAlign: "center" }}>
              Aucun signal disponible
            </div>
          ) : (
            recent.map((sig, i) => (
              <div key={sig.id ?? i} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "8px 12px", borderBottom: "1px solid var(--border)",
                cursor: "pointer",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => { router.push("/signals"); setOpen(false); }}
              >
                <DotFilledIcon
                  width={12} height={12}
                  style={{ color: SEV_COLORS[sig.severity ?? "low"] ?? "var(--fg-dim)", flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...S, fontSize: 11, fontWeight: 600, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sig.target_name ?? "—"}
                  </div>
                  <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                    {sig.label ?? "—"}
                  </div>
                </div>
                <span style={{ ...M, fontSize: 8, color: SEV_COLORS[sig.severity ?? "low"] ?? "var(--fg-dim)", flexShrink: 0, letterSpacing: "0.06em" }}>
                  {(sig.severity ?? "low").toUpperCase()}
                </span>
              </div>
            ))
          )}

          <button
            onClick={() => { router.push("/signals"); setOpen(false); }}
            style={{
              width: "100%", padding: "8px 12px", background: "transparent",
              border: "none", cursor: "pointer", borderTop: "1px solid var(--border)",
              ...S, fontSize: 12, color: "#2563EB", textAlign: "center",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Voir tous les signaux →
          </button>
        </div>
      )}
    </div>
  );
}

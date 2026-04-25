"use client";

import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import CommandPalette from "@/components/layout/CommandPalette";
import ListSwitcher from "@/components/layout/ListSwitcher";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const PAGE_TITLES: Record<string, string> = {
  "/": "Search",
  "/investors": "Investors",
  "/pipeline": "My Lists",
  "/targets": "Database",
  "/imports": "Import & Enrich",
  "/signals": "Signals",
  "/analytics": "Analytics",
  "/graph": "Graph",
  "/map": "Map",
  "/settings": "Settings",
  "/settings/profile": "Settings · Profile",
  "/settings/team": "Settings · My Team",
  "/settings/billing": "Settings · Billing",
  "/settings/api": "Settings · API",
  "/settings/integrations": "Settings · Integrations",
  "/settings/referral": "Settings · Referral",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // longest matching prefix
  const matches = Object.keys(PAGE_TITLES)
    .filter((k) => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length);
  return matches[0] ? PAGE_TITLES[matches[0]] : "";
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Onboarding has its own full-screen layout — no sidebar
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  // Auth routes (sign in / register / reset) — full-screen, no TopNav / CommandPalette
  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  // Marketing landing — full-screen, no TopNav / CommandPalette
  if (pathname.startsWith("/marketing")) {
    return <>{children}</>;
  }

  const title = getTitle(pathname);

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      height: "100dvh",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      <TopNav />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        {/* Header bar */}
        <header style={{
          height: 40, flexShrink: 0,
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-raise)",
          borderBottom: "1px solid var(--border)",
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              EdRCF
            </span>
            {title && (
              <>
                <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>/</span>
                <span style={{ ...S, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>{title}</span>
              </>
            )}
          </div>
          {/* Right cluster */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ListSwitcher />
          </div>
        </header>

        <main style={{ flex: 1, overflow: "hidden", position: "relative", minWidth: 0, minHeight: 0 }}>
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

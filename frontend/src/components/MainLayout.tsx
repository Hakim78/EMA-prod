"use client";

import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Onboarding has its own full-screen layout — no sidebar
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      height: "100dvh",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      <TopNav />
      <main style={{ flex: 1, overflow: "hidden", position: "relative", minWidth: 0, minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}

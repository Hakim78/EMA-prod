"use client";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

function Shimmer({ width, height, style }: { width?: string | number; height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: width ?? "100%",
      height: height ?? 12,
      background: "var(--bg-alt)",
      animation: "skeleton-shimmer 1.4s ease-in-out infinite",
      flexShrink: 0,
      ...style,
    }} />
  );
}

/** Skeleton for analytics-style pages: header + KPI row + charts */
export function AnalyticsSkeleton() {
  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, background: "var(--bg-raise)" }}>
        <Shimmer width={220} height={10} />
        <div style={{ flex: 1 }} />
        <Shimmer width={80} height={10} />
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: "24px 20px", borderRight: i < 3 ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", gap: 14 }}>
            <Shimmer width={100} height={9} />
            <Shimmer width={70} height={28} />
            <Shimmer width={50} height={9} />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, padding: 1, background: "var(--border)", overflow: "hidden" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: "var(--bg)", display: "flex", flexDirection: "column", gap: 12, padding: "20px 20px" }}>
            <Shimmer width={120} height={9} />
            <Shimmer width="100%" height="100%" style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for map/graph pages: header + full-canvas area */
export function CanvasSkeleton({ label }: { label?: string }) {
  return (
    <div style={{ height: "100dvh", overflow: "hidden", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, background: "var(--bg-raise)" }}>
        <Shimmer width={180} height={10} />
        <div style={{ flex: 1 }} />
        <Shimmer width={60} height={10} />
      </div>

      {/* Canvas placeholder */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <Shimmer width="100%" height={undefined} style={{ position: "absolute", inset: 0, height: "100%" }} />
        {label && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.15em" }}>
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

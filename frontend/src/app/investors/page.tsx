"use client";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export default function InvestorsPage() {
  return (
    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>BIENTÔT DISPONIBLE</div>
      <div style={{ ...S, fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>Recherche Investisseurs & Acheteurs</div>
      <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)", maxWidth: 400, textAlign: "center", lineHeight: 1.7 }}>
        Trouvez des fonds de Private Equity, Family Offices et Industriels acheteurs pour vos mandats de cession.
      </div>
      <div style={{
        marginTop: 8, padding: "6px 16px",
        border: "1px solid var(--border)", ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.06em",
      }}>
        BETA — Q3 2026
      </div>
    </div>
  );
}

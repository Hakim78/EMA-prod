"use client";

import { Sparkles } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      height: "100dvh",
      width: "100%",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      {/* Left panel — form */}
      <div style={{
        flex: "1 1 50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        overflowY: "auto",
        minWidth: 0,
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {children}
        </div>
      </div>

      {/* Right panel — visual */}
      <div
        className="auth-right-panel"
        style={{
          flex: "1 1 50%",
          background: "linear-gradient(135deg, var(--bg-raise) 0%, var(--bg-alt) 100%)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{
          position: "absolute", top: 32, left: 48,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 28, height: 28,
            background: "var(--fg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4,
          }}>
            <span style={{ ...M, fontSize: 13, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.04em" }}>Ed</span>
          </div>
          <span style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>EdRCF</span>
        </div>

        <div style={{ maxWidth: 460, textAlign: "left" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            background: "var(--bg-raise)",
            border: "1px solid var(--border)",
            marginBottom: 20,
            ...M, fontSize: 9, color: "var(--fg-muted)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <Sparkles size={11} /> AI-NATIVE M&amp;A INTELLIGENCE
          </div>

          <h1 style={{
            ...S, fontSize: 32, fontWeight: 600, color: "var(--fg)",
            lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.01em",
          }}>
            Find M&amp;A targets others miss
          </h1>

          <p style={{
            ...S, fontSize: 14, color: "var(--fg-muted)",
            lineHeight: 1.6, marginBottom: 32,
          }}>
            AI-native deal sourcing for private equity, M&amp;A advisors, and corporate development teams. Search 16M+ companies, surface intent-to-sell signals, and enrich contacts on demand.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24, paddingTop: 24,
            borderTop: "1px solid var(--border)",
          }}>
            {[
              { val: "16M+", lab: "Companies" },
              { val: "430M+", lab: "Contacts" },
              { val: "93%", lab: "Accuracy" },
            ].map((s) => (
              <div key={s.lab}>
                <div style={{ ...S, fontSize: 22, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
                  {s.val}
                </div>
                <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
                  {s.lab}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer credit */}
        <div style={{
          position: "absolute", bottom: 24, left: 48, right: 48,
          display: "flex", justifyContent: "space-between",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.06em",
        }}>
          <span>© 2026 EdRCF</span>
          <span>Trusted by 1,000+ M&amp;A teams</span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .auth-right-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}

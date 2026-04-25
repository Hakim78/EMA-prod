"use client";

import { Download, CreditCard as CardIcon, Zap } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const INVOICES = [
  { date: "Apr 15, 2026", desc: "Professional plan — Annual",        amount: "$50,000.00" },
  { date: "Apr 15, 2026", desc: "Contact credits pack (1,000)",      amount: "$250.00"    },
  { date: "Mar 28, 2026", desc: "Contact credits pack (1,000)",      amount: "$250.00"    },
  { date: "Feb 10, 2026", desc: "Export credits top-up (5,000)",     amount: "$0.00"      },
];

export default function BillingPage() {
  return (
    <>
      <SectionHeader title="Current plan" subtitle="Your active subscription." />

      <div style={{
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        padding: "20px 22px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", background: "var(--fg)", color: "var(--bg)", marginBottom: 10, ...M, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Professional
            </div>
            <div style={{ ...S, fontSize: 28, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
              $10,000<span style={{ ...S, fontSize: 13, fontWeight: 400, color: "var(--fg-muted)" }}> / user / year</span>
            </div>
            <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 8 }}>
              Billed annually · 5 of 10 seats used · Next renewal Apr 15, 2027
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={primary}>Upgrade plan</button>
            <button style={secondary}>Cancel subscription</button>
          </div>
        </div>
      </div>

      <SectionHeader title="Credits" subtitle="Used to unlock contacts and bulk-export companies." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <CreditCard
          title="Contact credits"
          icon={Zap}
          used={47}
          total={1000}
          info="$0.25 each, packs of 1,000 ($250)"
          cta="Buy more contact credits"
        />
        <CreditCard
          title="Export credits"
          icon={Download}
          used={12500}
          total={20000}
          info="Used for bulk exports (CSV, .xlsx, CRM sync)"
          cta="Buy more export credits"
        />
      </div>

      <SectionHeader title="Payment method" subtitle="Card on file for renewals and credit top-ups." />

      <div style={{
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        padding: "16px 18px", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 28,
            background: "linear-gradient(135deg, #1a1f71 0%, #4860a3 100%)",
            borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            ...M, fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.08em",
          }}>
            VISA
          </div>
          <div>
            <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>Visa ending in 4242</div>
            <div style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>Expires 12/2027</div>
          </div>
        </div>
        <button style={secondary}><CardIcon size={11} /> Update</button>
      </div>

      <SectionHeader title="Billing history" subtitle="Download invoices for the last 12 months." />

      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", marginBottom: 12 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "120px 1fr 120px 60px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span>Date</span>
          <span>Description</span>
          <span style={{ textAlign: "right" }}>Amount</span>
          <span />
        </div>
        {INVOICES.map((inv, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "120px 1fr 120px 60px",
            gap: 12, padding: "10px 16px", alignItems: "center",
            borderBottom: i === INVOICES.length - 1 ? "none" : "1px solid var(--border)",
            ...S, fontSize: 12, color: "var(--fg)",
          }}>
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{inv.date}</span>
            <span>{inv.desc}</span>
            <span style={{ textAlign: "right", ...M, fontSize: 12 }}>{inv.amount}</span>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 4, display: "flex", justifyContent: "center" }} title="Download invoice">
              <Download size={13} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginTop: 24, marginBottom: 12 }}>
      <h2 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
  );
}

function CreditCard({
  title, icon: Icon, used, total, info, cta,
}: {
  title: string;
  icon: React.ElementType;
  used: number;
  total: number;
  info: string;
  cta: string;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={14} style={{ color: "var(--fg-muted)" }} />
        <span style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{title}</span>
      </div>
      <div style={{ ...S, fontSize: 22, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
        {used.toLocaleString("en-US")}<span style={{ ...S, fontSize: 13, fontWeight: 400, color: "var(--fg-muted)" }}> / {total.toLocaleString("en-US")}</span>
      </div>
      <div style={{ height: 4, background: "var(--bg-alt)", marginTop: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--down)" : "var(--fg)" }} />
      </div>
      <p style={{ ...S, fontSize: 11, color: "var(--fg-muted)", marginTop: 10, fontStyle: "italic" }}>
        {info}
      </p>
      <button style={{ ...secondary, marginTop: 10, width: "100%" }}>{cta}</button>
    </div>
  );
}

const primary: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 32, padding: "0 14px",
  background: "var(--fg)", color: "var(--bg)",
  border: "none", cursor: "pointer",
};

const secondary: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 32, padding: "0 14px",
  background: "transparent", color: "var(--fg-muted)",
  border: "1px solid var(--border)", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};

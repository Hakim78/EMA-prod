"use client";

import { useState } from "react";
import { Copy, Check, Gift, Send, Sparkles } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const REFERRAL_LINK = "https://app.edrcf.com/r/hakim-djaalal-7f3a9c";

const REFERRALS = [
  { name: "Marc Dupont",      status: "Earned",  reward: "+1 seat · +5,000 credits", date: "Mar 22, 2026" },
  { name: "Sarah Lefevre",    status: "Active",  reward: "Trial in progress",        date: "Apr 02, 2026" },
  { name: "Pierre Bernard",   status: "Active",  reward: "Trial in progress",        date: "Apr 11, 2026" },
  { name: "Amélie Roux",      status: "Earned",  reward: "+1 seat · +5,000 credits", date: "Feb 18, 2026" },
  { name: "Julien Moreau",    status: "Pending", reward: "Awaiting signup",          date: "Apr 23, 2026" },
  { name: "Camille Faure",    status: "Earned",  reward: "+1 seat · +5,000 credits", date: "Jan 30, 2026" },
];

const STATUS_COLOR: Record<string, string> = {
  Earned: "var(--up)",
  Active: "var(--fg)",
  Pending: "var(--fg-muted)",
};

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(REFERRAL_LINK);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const earnedSeats = REFERRALS.filter((r) => r.status === "Earned").length;
  const earnedCredits = earnedSeats * 5000;

  return (
    <>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-raise) 0%, var(--bg-alt) 100%)",
        border: "1px solid var(--border)",
        padding: "32px 28px",
        marginBottom: 20,
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, margin: "0 auto 14px",
          borderRadius: 26,
          background: "var(--fg)", color: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Gift size={22} />
        </div>
        <h2 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
          Refer a friend, earn rewards
        </h2>
        <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", margin: "8px auto 0", maxWidth: 520, lineHeight: 1.6 }}>
          When someone you refer becomes a customer, you get{" "}
          <strong style={{ color: "var(--fg)", fontWeight: 500 }}>+1 seat license</strong> and{" "}
          <strong style={{ color: "var(--fg)", fontWeight: 500 }}>+5,000 export credits</strong>.
        </p>
      </div>

      {/* Earned KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <KPI label="Seats earned"   value={earnedSeats.toString()} suffix="" />
        <KPI label="Credits earned" value={earnedCredits.toLocaleString("en-US")} suffix=" credits" />
      </div>

      {/* Referral link */}
      <SectionHeader title="Your referral link" />
      <div style={{
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        padding: "10px 12px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Sparkles size={13} style={{ color: "var(--fg-muted)" }} />
        <code style={{ ...M, flex: 1, fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {REFERRAL_LINK}
        </code>
        <button
          onClick={copy}
          style={{
            ...S, fontSize: 12, fontWeight: 500,
            height: 28, padding: "0 12px",
            background: copied ? "var(--up)" : "var(--fg)",
            color: copied ? "#fff" : "var(--bg)",
            border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>

      {/* Email invite */}
      <SectionHeader title="Or invite by email" />
      <div style={{
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        padding: 16, marginBottom: 24,
      }}>
        <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Their email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@company.com"
          style={{
            ...S, width: "100%", height: 34, padding: "0 10px",
            background: "var(--bg)", border: "1px solid var(--border)",
            color: "var(--fg)", fontSize: 13, outline: "none",
          }}
        />
        <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: 12, marginBottom: 6 }}>
          Personal message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I think you'd love this for deal sourcing..."
          rows={3}
          style={{
            ...S, width: "100%", padding: "8px 10px",
            background: "var(--bg)", border: "1px solid var(--border)",
            color: "var(--fg)", fontSize: 13, outline: "none", resize: "vertical",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            disabled={!email}
            style={{
              ...S, fontSize: 12, fontWeight: 500,
              height: 32, padding: "0 14px",
              background: email ? "var(--fg)" : "var(--bg-alt)",
              color: email ? "var(--bg)" : "var(--fg-dim)",
              border: "none", cursor: email ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <Send size={11} /> Send invite
          </button>
        </div>
      </div>

      {/* Referrals table */}
      <SectionHeader title="Your referrals" />
      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.5fr 110px 1.5fr 120px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span>Name</span>
          <span>Status</span>
          <span>Reward</span>
          <span>Date</span>
        </div>
        {REFERRALS.map((r, i) => (
          <div key={r.name} style={{
            display: "grid", gridTemplateColumns: "1.5fr 110px 1.5fr 120px",
            gap: 12, padding: "10px 16px", alignItems: "center",
            borderBottom: i === REFERRALS.length - 1 ? "none" : "1px solid var(--border)",
            ...S, fontSize: 12, color: "var(--fg)",
          }}>
            <span style={{ fontWeight: 500 }}>{r.name}</span>
            <span style={{ ...M, fontSize: 10, color: STATUS_COLOR[r.status], letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {r.status}
            </span>
            <span style={{ color: "var(--fg-muted)" }}>{r.reward}</span>
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{r.date}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: "0 0 10px" }}>{title}</h3>
  );
}

function KPI({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", padding: "16px 18px", textAlign: "center" }}>
      <div style={{ ...S, fontSize: 32, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
        {value}<span style={{ ...S, fontSize: 14, fontWeight: 400, color: "var(--fg-muted)" }}>{suffix}</span>
      </div>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

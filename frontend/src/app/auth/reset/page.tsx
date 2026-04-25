"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSent(true);
    } catch {
      setError("Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56,
          margin: "0 auto 18px",
          borderRadius: 28,
          background: "rgba(34,197,94,0.08)",
          border: "1px solid var(--up)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CheckCircle2 size={26} style={{ color: "var(--up)" }} />
        </div>
        <h2 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
          Check your email
        </h2>
        <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
          We&apos;ve sent a password reset link to <strong style={{ color: "var(--fg)", fontWeight: 500 }}>{email}</strong>. The link expires in 30 minutes.
        </p>
        <Link
          href="/auth/login"
          style={{
            ...S, fontSize: 13, color: "var(--fg-muted)",
            textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          <ArrowLeft size={13} /> Back to sign in
        </Link>

        <button
          onClick={() => { setSent(false); setEmail(""); }}
          style={{
            display: "block", margin: "16px auto 0",
            background: "transparent", border: "none",
            ...S, fontSize: 12, color: "var(--fg-dim)",
            textDecoration: "underline", cursor: "pointer",
          }}
        >
          Didn&apos;t get it? Send again
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{
        width: 44, height: 44, marginBottom: 18,
        borderRadius: 22,
        background: "var(--bg-raise)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Mail size={20} style={{ color: "var(--fg-muted)" }} />
      </div>

      <h2 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>
        Reset your password
      </h2>
      <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginBottom: 28, lineHeight: 1.5 }}>
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              ...S,
              width: "100%",
              height: 38,
              padding: "0 12px",
              background: "var(--bg-raise)",
              border: `1px solid ${error ? "var(--down)" : "var(--border)"}`,
              color: "var(--fg)",
              fontSize: 13,
              outline: "none",
            }}
            disabled={loading}
          />
          {error && <p style={{ ...S, fontSize: 11, color: "var(--down)", marginTop: 4 }}>{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...S, fontSize: 13, fontWeight: 500,
            height: 40, marginTop: 4,
            background: "var(--fg)", color: "var(--bg)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Loader2 size={14} className="auth-spin" /> : null}
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <Link
        href="/auth/login"
        style={{
          ...S, fontSize: 12, color: "var(--fg-muted)",
          textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 6,
          marginTop: 24,
        }}
      >
        <ArrowLeft size={12} /> Back to sign in
      </Link>

      <style jsx>{`
        .auth-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

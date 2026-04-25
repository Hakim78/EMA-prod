"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const inputStyle: React.CSSProperties = {
  ...S,
  width: "100%",
  height: 38,
  padding: "0 12px",
  background: "var(--bg-raise)",
  border: "1px solid var(--border)",
  color: "var(--fg)",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.15s",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 800));
      router.push("/");
    } catch {
      setErrors({ form: "Sign-in failed. Please try again." });
      setLoading(false);
    }
  }

  return (
    <>
      <h2 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>
        Welcome back
      </h2>
      <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginBottom: 28 }}>
        Sign in to your account
      </p>

      {/* SSO buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <SSOButton provider="Google" />
        <SSOButton provider="Microsoft" />
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 16, ...M, fontSize: 9, color: "var(--fg-dim)",
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span>or continue with email</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Email */}
        <div>
          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              ...inputStyle,
              borderColor: errors.email ? "var(--down)" : "var(--border)",
            }}
            disabled={loading}
          />
          {errors.email && <p style={{ ...S, fontSize: 11, color: "var(--down)", marginTop: 4 }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Password
            </label>
            <Link href="/auth/reset" style={{ ...S, fontSize: 11, color: "var(--fg-muted)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                ...inputStyle,
                paddingRight: 38,
                borderColor: errors.password ? "var(--down)" : "var(--border)",
              }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              style={{
                position: "absolute", right: 0, top: 0,
                width: 38, height: 38,
                background: "transparent", border: "none",
                color: "var(--fg-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p style={{ ...S, fontSize: 11, color: "var(--down)", marginTop: 4 }}>{errors.password}</p>}
        </div>

        {/* Remember me */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ width: 14, height: 14, accentColor: "var(--fg)" }}
          />
          <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>Remember me</span>
        </label>

        {errors.form && (
          <p style={{ ...S, fontSize: 12, color: "var(--down)", padding: "8px 10px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.3)" }}>
            {errors.form}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...S, fontSize: 13, fontWeight: 500,
            height: 40, marginTop: 4,
            background: "var(--fg)", color: "var(--bg)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
          }}
        >
          {loading ? <Loader2 size={14} className="auth-spin" /> : null}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", textAlign: "center", marginTop: 24 }}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" style={{ color: "var(--fg)", fontWeight: 500, textDecoration: "none" }}>
          Sign up
        </Link>
      </p>

      <style jsx>{`
        .auth-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function SSOButton({ provider }: { provider: "Google" | "Microsoft" }) {
  return (
    <button
      type="button"
      style={{
        ...S, fontSize: 13, fontWeight: 500,
        height: 38, padding: "0 14px",
        background: "var(--bg-raise)", color: "var(--fg)",
        border: "1px solid var(--border)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-raise)")}
    >
      {provider === "Google" ? (
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
          <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
        </svg>
      )}
      Continue with {provider}
    </button>
  );
}

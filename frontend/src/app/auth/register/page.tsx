"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";

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
};

type Strength = "empty" | "weak" | "medium" | "strong";

function getStrength(pwd: string): Strength {
  if (pwd.length === 0) return "empty";
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return "weak";
  if (score === 3) return "medium";
  return "strong";
}

const STRENGTH_COLOR: Record<Strength, string> = {
  empty: "var(--border)",
  weak: "var(--down)",
  medium: "#F59E0B",
  strong: "var(--up)",
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const strength = useMemo(() => getStrength(password), [password]);

  function validate() {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid work email.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!agree) e.agree = "You must accept the Terms of Service and Privacy Policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;
    setLoading(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 900));
      router.push("/onboarding");
    } catch {
      setErrors({ form: "Sign-up failed. Please try again." });
      setLoading(false);
    }
  }

  return (
    <>
      <h2 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>
        Create your account
      </h2>
      <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginBottom: 24 }}>
        Get started with EdRCF
      </p>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Full name" error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            style={{ ...inputStyle, borderColor: errors.name ? "var(--down)" : "var(--border)" }}
            disabled={loading}
          />
        </Field>

        <Field label="Work email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            style={{ ...inputStyle, borderColor: errors.email ? "var(--down)" : "var(--border)" }}
            disabled={loading}
          />
        </Field>

        <Field label="Company (optional)">
          <input
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Capital Partners"
            style={inputStyle}
            disabled={loading}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={{ ...inputStyle, borderColor: errors.password ? "var(--down)" : "var(--border)" }}
            disabled={loading}
          />
          {/* Strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{
                display: "flex", gap: 3, marginBottom: 4,
              }}>
                {(["weak", "medium", "strong"] as const).map((tier, i) => {
                  const idx = ["weak", "medium", "strong"].indexOf(strength);
                  const filled = i <= idx;
                  return (
                    <div key={tier} style={{
                      flex: 1, height: 3,
                      background: filled ? STRENGTH_COLOR[strength] : "var(--border)",
                      transition: "background 0.2s",
                    }} />
                  );
                })}
              </div>
              <span style={{ ...M, fontSize: 9, color: STRENGTH_COLOR[strength], letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {strength === "weak" && "Weak password"}
                {strength === "medium" && "Medium strength"}
                {strength === "strong" && "Strong password"}
              </span>
            </div>
          )}
        </Field>

        {/* Agreement */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", userSelect: "none", marginTop: 4 }}>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            style={{ marginTop: 2, width: 14, height: 14, accentColor: "var(--fg)" }}
          />
          <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            I agree to the{" "}
            <Link href="/terms" style={{ color: "var(--fg)", textDecoration: "underline" }}>Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" style={{ color: "var(--fg)", textDecoration: "underline" }}>Privacy Policy</Link>
            .
          </span>
        </label>
        {errors.agree && <p style={{ ...S, fontSize: 11, color: "var(--down)", marginTop: -4 }}>{errors.agree}</p>}

        {errors.form && (
          <p style={{ ...S, fontSize: 12, color: "var(--down)", padding: "8px 10px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.3)" }}>
            {errors.form}
          </p>
        )}

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
          {loading ? <Loader2 size={14} className="auth-spin" /> : <Check size={14} />}
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", textAlign: "center", marginTop: 24 }}>
        Already have an account?{" "}
        <Link href="/auth/login" style={{ color: "var(--fg)", fontWeight: 500, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>

      <style jsx>{`
        .auth-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        ...M, fontSize: 9, color: "var(--fg-muted)",
        letterSpacing: "0.1em", textTransform: "uppercase",
        display: "block", marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && <p style={{ ...S, fontSize: 11, color: "var(--down)", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

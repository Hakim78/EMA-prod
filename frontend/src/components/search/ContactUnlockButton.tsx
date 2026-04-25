"use client";

import { useState } from "react";
import { Lock, Loader2, CheckCircle2, Mail, Phone, Zap } from "lucide-react";
import Link from "next/link";
import { useCredits } from "@/hooks/useCredits";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export interface UnlockedContact {
  email: string;
  phone?: string;
}

interface Props {
  contactId: string;
  verified: boolean;
  onUnlock: () => Promise<UnlockedContact>;
}

export default function ContactUnlockButton({ contactId, verified, onUnlock }: Props) {
  const { credits, deduct, refund } = useCredits();
  const [state, setState] = useState<"locked" | "unlocking" | "unlocked" | "error">("locked");
  const [data, setData] = useState<UnlockedContact | null>(null);

  const trigger = async () => {
    if (state !== "locked") return;
    if (credits <= 0) return;

    if (!deduct()) return;
    setState("unlocking");
    try {
      const result = await onUnlock();
      setData(result);
      setState("unlocked");
    } catch {
      refund(1);
      setState("error");
      setTimeout(() => setState("locked"), 1500);
    }
  };

  if (state === "unlocked" && data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Mail size={11} style={{ color: "var(--fg-muted)" }} />
          <code style={{ ...M, fontSize: 11, color: "var(--fg)" }}>{data.email}</code>
          {verified ? (
            <CheckCircle2 size={11} style={{ color: "var(--up)" }} aria-label="Verified" />
          ) : (
            <span style={{ ...M, fontSize: 8, color: "var(--fg-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Unverified
            </span>
          )}
        </div>
        {data.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={11} style={{ color: "var(--fg-muted)" }} />
            <code style={{ ...M, fontSize: 11, color: "var(--fg)" }}>{data.phone}</code>
          </div>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <span style={{ ...M, fontSize: 10, color: "var(--down)", letterSpacing: "0.06em" }}>
        ERROR · RETRYING
      </span>
    );
  }

  const noCredits = credits <= 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={trigger}
        disabled={state === "unlocking" || noCredits}
        title={noCredits ? "No credits left. Buy more in Settings → Billing." : "Unlock email and phone (1 credit)"}
        style={{
          ...S, fontSize: 11, fontWeight: 500,
          height: 26, padding: "0 9px",
          background: noCredits ? "var(--bg-alt)" : "var(--bg-raise)",
          border: `1px solid ${noCredits ? "var(--border)" : "var(--fg-muted)"}`,
          color: noCredits ? "var(--fg-dim)" : "var(--fg)",
          cursor: noCredits ? "not-allowed" : state === "unlocking" ? "wait" : "pointer",
          display: "inline-flex", alignItems: "center", gap: 5,
          opacity: state === "unlocking" ? 0.7 : 1,
        }}
      >
        {state === "unlocking" ? (
          <>
            <Loader2 size={10} className="cuc-spin" /> Unlocking…
          </>
        ) : (
          <>
            <Lock size={10} /> Unlock <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>· 1</span>
            <Zap size={9} style={{ color: noCredits ? "var(--down)" : "var(--up)" }} />
          </>
        )}
      </button>
      {noCredits && (
        <Link
          href="/settings/billing"
          style={{ display: "block", marginTop: 4, ...S, fontSize: 10, color: "var(--down)", textDecoration: "underline", textAlign: "right" }}
        >
          Buy more credits
        </Link>
      )}
      <style jsx>{`
        .cuc-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

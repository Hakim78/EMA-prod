"use client";

import { useState } from "react";
import { Copy, Check, Trash2, Plus, ExternalLink, X } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "1", name: "Production",   key: "ema_pk_live_8f3a9c2b1e4d5f6a", created: "Mar 12, 2026", lastUsed: "2 minutes ago" },
  { id: "2", name: "Staging",      key: "ema_pk_test_2c5e7a8b9d1f3e4c", created: "Feb 28, 2026", lastUsed: "3 hours ago"  },
  { id: "3", name: "Local dev",    key: "ema_pk_test_a1b2c3d4e5f6a7b8", created: "Jan 15, 2026", lastUsed: "5 days ago"   },
];

const RATE_LIMITS = [
  { endpoint: "GET /companies",         limit: "10,000 / day",  remaining: "8,247"  },
  { endpoint: "POST /companies/search", limit: "5,000 / day",   remaining: "4,612"  },
  { endpoint: "GET /companies/{id}",    limit: "50,000 / day",  remaining: "47,938" },
  { endpoint: "POST /enrich",           limit: "1,000 / day",   remaining: "743"    },
  { endpoint: "GET /signals",           limit: "10,000 / day",  remaining: "9,612"  },
];

export default function ApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => {
    setRevealed((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copy = (id: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const revoke = (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    setKeys((p) => p.filter((k) => k.id !== id));
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>
        <div>
          <h2 style={{ ...S, fontSize: 16, fontWeight: 600, color: "var(--fg)", margin: 0 }}>API Keys</h2>
          <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "4px 0 0" }}>
            Programmatic access to your company database, signals and enrichment pipeline.
          </p>
        </div>
        <a
          href="https://api.inven.ai/public-swagger-ui/"
          target="_blank" rel="noreferrer"
          style={{
            ...S, fontSize: 12,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", background: "transparent",
            border: "1px solid var(--border)", color: "var(--fg-muted)",
            textDecoration: "none",
          }}
        >
          API documentation <ExternalLink size={11} />
        </a>
      </div>

      {/* Usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            API calls — last 30 days
          </div>
          <div style={{ ...S, fontSize: 28, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
            12,847
          </div>
          <div style={{ marginTop: 12 }}>
            <UsageBars />
          </div>
        </div>
        <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Average latency
          </div>
          <div style={{ ...S, fontSize: 28, fontWeight: 700, color: "var(--fg)", lineHeight: 1 }}>
            142<span style={{ ...S, fontSize: 14, fontWeight: 400, color: "var(--fg-muted)" }}>ms</span>
          </div>
          <div style={{ ...S, fontSize: 11, color: "var(--up)", marginTop: 8 }}>
            ↓ 23ms vs last week
          </div>
        </div>
      </div>

      {/* Keys table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h3 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: 0 }}>Active keys</h3>
        <button
          onClick={() => setCreating(true)}
          style={{
            ...S, fontSize: 12, fontWeight: 500,
            height: 30, padding: "0 12px",
            background: "var(--fg)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={11} /> Create new API key
        </button>
      </div>

      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)", marginBottom: 24 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 2fr 130px 130px 50px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span>Name</span>
          <span>Key</span>
          <span>Created</span>
          <span>Last used</span>
          <span />
        </div>
        {keys.map((k, i) => (
          <div key={k.id} style={{
            display: "grid", gridTemplateColumns: "1fr 2fr 130px 130px 50px",
            gap: 12, padding: "10px 16px", alignItems: "center",
            borderBottom: i === keys.length - 1 ? "none" : "1px solid var(--border)",
          }}>
            <span style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{k.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <code style={{ ...M, fontSize: 11, color: "var(--fg)", background: "var(--bg)", padding: "3px 6px", border: "1px solid var(--border)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {revealed.has(k.id) ? k.key : k.key.slice(0, 10) + "•".repeat(16)}
              </code>
              <button
                onClick={() => toggle(k.id)}
                style={{ ...M, fontSize: 9, padding: "3px 6px", background: "transparent", border: "1px solid var(--border)", color: "var(--fg-muted)", cursor: "pointer" }}
              >
                {revealed.has(k.id) ? "HIDE" : "REVEAL"}
              </button>
              <button
                onClick={() => copy(k.id, k.key)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: copied === k.id ? "var(--up)" : "var(--fg-muted)", padding: 2, display: "flex" }}
              >
                {copied === k.id ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{k.created}</span>
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{k.lastUsed}</span>
            <button
              onClick={() => revoke(k.id)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-dim)", padding: 4, display: "flex" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--down)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Rate limits */}
      <h3 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: "0 0 10px" }}>Rate limits</h3>
      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 200px 200px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span>Endpoint</span>
          <span>Limit</span>
          <span>Remaining today</span>
        </div>
        {RATE_LIMITS.map((r, i) => (
          <div key={r.endpoint} style={{
            display: "grid", gridTemplateColumns: "1fr 200px 200px",
            gap: 12, padding: "10px 16px",
            borderBottom: i === RATE_LIMITS.length - 1 ? "none" : "1px solid var(--border)",
            ...M, fontSize: 12, color: "var(--fg)",
          }}>
            <code>{r.endpoint}</code>
            <span style={{ color: "var(--fg-muted)" }}>{r.limit}</span>
            <span style={{ color: "var(--fg)" }}>{r.remaining}</span>
          </div>
        ))}
      </div>

      {creating && <CreateKeyModal onCancel={() => setCreating(false)} onCreate={(name) => {
        const id = String(Date.now());
        const key = "ema_pk_live_" + Math.random().toString(16).slice(2, 18);
        setKeys((p) => [{ id, name, key, created: "Just now", lastUsed: "Never" }, ...p]);
        setCreating(false);
      }} />}
    </>
  );
}

function UsageBars() {
  // 14 last days mock
  const data = [42, 51, 38, 60, 45, 73, 80, 65, 90, 72, 95, 110, 88, 102];
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`,
          background: i === data.length - 1 ? "var(--fg)" : "var(--fg-muted)",
          opacity: i === data.length - 1 ? 1 : 0.5,
          minWidth: 2,
        }} />
      ))}
    </div>
  );
}

function CreateKeyModal({
  onCancel, onCreate,
}: {
  onCancel: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [perms, setPerms] = useState({
    readCompanies: true, writeLists: true, readContacts: true, readSignals: true,
  });

  return (
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 480, zIndex: 1000,
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ ...S, fontSize: 14, fontWeight: 600, margin: 0, color: "var(--fg)" }}>Create new API key</h3>
          <button onClick={onCancel} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 4, display: "flex" }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 16 }}>
          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production"
            style={{
              ...S, width: "100%", height: 34, padding: "0 10px",
              background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--fg)", fontSize: 13, outline: "none",
            }}
          />

          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: 14, marginBottom: 8 }}>
            Permissions
          </label>
          {[
            { key: "readCompanies", label: "Read companies and search" },
            { key: "writeLists",    label: "Read/write lists and projects" },
            { key: "readContacts",  label: "Read verified contact data (consumes credits)" },
            { key: "readSignals",   label: "Read intent-to-sell signals" },
          ].map((p) => {
            const active = perms[p.key as keyof typeof perms];
            return (
              <label key={p.key} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 0", cursor: "pointer", userSelect: "none",
              }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))}
                  style={{ width: 14, height: 14, accentColor: "var(--fg)" }}
                />
                <span style={{ ...S, fontSize: 12, color: "var(--fg)" }}>{p.label}</span>
              </label>
            );
          })}
        </div>
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onCancel} style={{ ...S, fontSize: 12, padding: "6px 14px", background: "transparent", border: "1px solid var(--border)", color: "var(--fg-muted)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name.trim())}
            disabled={!name.trim()}
            style={{
              ...S, fontSize: 12, fontWeight: 500, padding: "6px 14px",
              background: name.trim() ? "var(--fg)" : "var(--bg-alt)",
              color: name.trim() ? "var(--bg)" : "var(--fg-dim)",
              border: "none", cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            Create key
          </button>
        </div>
      </div>
    </>
  );
}

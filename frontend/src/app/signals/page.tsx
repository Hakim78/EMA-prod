"use client";

import { useState, useMemo } from "react";
import { useSignals } from "@/lib/queries/useSignals";
import type { Signal } from "@/types";
import { Activity, ArrowUpRight } from "lucide-react";

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

const SEVERITIES = ["high", "medium", "low"] as const;
const SEV_COLORS: Record<string, string> = { high: "#FF4500", medium: "var(--fg-muted)", low: "var(--fg-dim)" };

export default function SignalsPage() {
  const { data, isLoading } = useSignals();
  const [sevFilter, setSevFilter] = useState("");
  const [srcFilter, setSrcFilter] = useState("");

  const signals: Signal[] = useMemo(() => {
    let list = (Array.isArray(data) ? data : []) as Signal[];
    if (sevFilter) list = list.filter(s => s.severity === sevFilter);
    if (srcFilter) list = list.filter(s => s.source === srcFilter);
    return list;
  }, [data, sevFilter, srcFilter]);

  const sources = useMemo(() => {
    const all = (Array.isArray(data) ? data : []) as Signal[];
    return [...new Set(all.map(s => s.source))].filter(Boolean);
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{
        height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        background: "var(--bg-raise)",
      }}>
        <Activity size={11} style={{ color: "#FF4500" }} />
        <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.15em" }}>SIGNAL_NETWORK_A24</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...M, fontSize: 9, color: "#4A9A5A" }}>● {signals.length} ÉVÉNEMENTS</span>
      </div>

      {/* Filters */}
      <div style={{
        height: 36, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>FILTER:</span>
        {SEVERITIES.map(s => (
          <button key={s} onClick={() => setSevFilter(p => p === s ? "" : s)} style={{
            ...M, fontSize: 9, padding: "3px 8px",
            background: sevFilter === s ? "rgba(255,69,0,0.1)" : "transparent",
            border: `1px solid ${sevFilter === s ? "#FF4500" : "var(--border)"}`,
            color: sevFilter === s ? "#FF4500" : SEV_COLORS[s],
            cursor: "pointer", letterSpacing: "0.08em",
          }}>
            {s.toUpperCase()}
          </button>
        ))}
        <select
          value={srcFilter}
          onChange={e => setSrcFilter(e.target.value)}
          style={{ ...M, fontSize: 9, color: "var(--fg-dim)", background: "var(--bg)", border: "1px solid var(--border)", padding: "3px 8px", outline: "none", cursor: "pointer" }}
        >
          <option value="">TOUTES SOURCES</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="thin-scrollbar">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
              <div style={{ width: 48, height: 8, background: "var(--bg-alt)", borderRadius: 2 }} />
              <div style={{ flex: 1, height: 8, background: "var(--bg-alt)", borderRadius: 2 }} />
            </div>
          ))
          : signals.map((sig, i) => {
            const hot = sig.severity === "high";
            return (
              <div key={sig.id ?? i} style={{
                display: "flex", alignItems: "flex-start",
                padding: "12px 16px", borderBottom: "1px solid var(--border)",
                gap: 12, transition: "background 0.1s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Severity indicator */}
                <div style={{ width: 2, alignSelf: "stretch", background: SEV_COLORS[sig.severity] ?? "var(--fg-dim)", flexShrink: 0 }} />

                {/* Source + time */}
                <div style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", marginBottom: 2 }}>
                    {sig.source?.toUpperCase().slice(0, 8)}
                  </div>
                  <div style={{ ...M, fontSize: 8, color: "var(--fg-dim)" }}>
                    SIG_{sig.severity?.toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ ...M, fontSize: 10, color: "var(--fg)", marginBottom: 3, letterSpacing: "0.04em" }}>
                    {sig.label?.toUpperCase().slice(0, 60) ?? "SIGNAL DÉTECTÉ"}
                  </div>
                  {sig.dimension && (
                    <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
                      Dimension: {sig.dimension}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)" }}>
                      +{sig.points ?? 0} PTS
                    </span>
                    {sig.source_url && (
                      <a href={sig.source_url} target="_blank" rel="noreferrer" style={{ ...M, fontSize: 8, color: "var(--fg-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                        SOURCE <ArrowUpRight size={8} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Hot indicator */}
                {hot && (
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#FF4500", flexShrink: 0, marginTop: 4,
                    boxShadow: "0 0 6px rgba(255,69,0,0.6)",
                  }} />
                )}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

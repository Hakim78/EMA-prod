"use client";

import { useState, useMemo } from "react";
import { useTargets } from "@/lib/queries/useTargets";
import type { Target } from "@/types";
import { Search, ChevronUp, ChevronDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

type SortKey = "globalScore" | "name" | "sector" | "region";

function Sparkline({ score }: { score: number }) {
  const data = [score - 15, score - 8, score - 12, score - 4, score - 6, score - 2, score];
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 40},${12 - ((v - min) / range) * 12}`).join(" ");
  const hot = score >= 75;
  return (
    <svg width={40} height={12} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={hot ? "#FF4500" : "var(--fg-dim)"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function VaultPage() {
  const { data, isLoading } = useTargets();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("globalScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sectorFilter, setSectorFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const targets = useMemo(() => {
    let list = (data?.data ?? []) as Target[];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.sector?.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q) ||
        t.topSignals?.[0]?.label?.toLowerCase().includes(q)
      );
    }
    if (sectorFilter) list = list.filter(t => t.sector === sectorFilter);
    if (regionFilter) list = list.filter(t => t.region === regionFilter);
    list = [...list].sort((a, b) => {
      const av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      return sortDir === "desc"
        ? (av < bv ? 1 : -1)
        : (av > bv ? 1 : -1);
    });
    return list;
  }, [data, query, sortKey, sortDir, sectorFilter, regionFilter]);

  const sectors = useMemo(() => data?.filters?.sectors ?? [], [data]);
  const regions = useMemo(() => data?.filters?.regions ?? [], [data]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "var(--fg-dim)" }}>↕</span>;
    return sortDir === "desc"
      ? <ChevronDown size={10} style={{ color: "#FF4500" }} />
      : <ChevronUp size={10} style={{ color: "#FF4500" }} />;
  }

  const cols: { label: string; key?: SortKey; style?: React.CSSProperties }[] = [
    { label: "IDENTITÉ",    key: "name",        style: { flex: 1 } },
    { label: "SCORE",       key: "globalScore", style: { width: 56, textAlign: "center" } },
    { label: "CA",          style: { width: 80, textAlign: "right" } },
    { label: "ÉVO.",        style: { width: 52 } },
    { label: "SECTEUR",     key: "sector",      style: { width: 140 } },
    { label: "RÉGION",      key: "region",      style: { width: 120 } },
    { label: "SIGNAL",      style: { width: 160 } },
    { label: "",            style: { width: 24 } },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg)" }}>

      {/* Filter bar */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8, padding: "0 16px",
        background: "var(--bg-raise)",
      }}>
        <Search size={13} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="FILTER_IDENTITY OR SIGNAL..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "var(--fg)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
            letterSpacing: "0.04em",
          }}
        />
        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          style={{ ...M, fontSize: 9, color: "var(--fg-dim)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 8px", outline: "none", cursor: "pointer" }}
        >
          <option value="">TOUS SECTEURS</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={regionFilter}
          onChange={e => setRegionFilter(e.target.value)}
          style={{ ...M, fontSize: 9, color: "var(--fg-dim)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 8px", outline: "none", cursor: "pointer" }}
        >
          <option value="">TOUTES RÉGIONS</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", whiteSpace: "nowrap" }}>
          {targets.length.toLocaleString("fr")} RÉSULTATS
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "flex", alignItems: "center", height: 28,
        padding: "0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        gap: 0,
      }}>
        {cols.map(c => (
          <div key={c.label} style={{
            ...c.style,
            display: "flex", alignItems: "center", gap: 3,
            cursor: c.key ? "pointer" : "default",
          }}
            onClick={() => c.key && toggleSort(c.key)}
          >
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>{c.label}</span>
            {c.key && <SortIcon k={c.key} />}
          </div>
        ))}
      </div>

      {/* Table rows */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="thin-scrollbar">
        {isLoading
          ? Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ height: 44, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
              <div style={{ flex: 1, height: 8, background: "var(--bg-alt)", borderRadius: 2 }} />
              <div style={{ width: 32, height: 8, background: "var(--bg-alt)", borderRadius: 2 }} />
            </div>
          ))
          : targets.map(t => {
            const hot = t.bodacc_recent || t.topSignals?.[0]?.severity === "high";
            const signal = t.topSignals?.[0]?.label ?? "—";
            return (
              <Link key={t.id} href={`/targets/${t.id}`} style={{
                display: "flex", alignItems: "center", height: 44,
                padding: "0 16px", borderBottom: "1px solid var(--border)",
                textDecoration: "none", color: "inherit",
                borderLeft: "2px solid transparent",
                transition: "background 0.1s, border-color 0.1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderLeftColor = "var(--fg)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; }}
              >
                {/* Identité */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <span style={{ ...S, fontSize: 12, color: "var(--fg)" }}>{t.name}</span>
                  <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", marginLeft: 8 }}>{t.city}</span>
                </div>
                {/* Score */}
                <div style={{ width: 56, textAlign: "center" }}>
                  <span style={{ ...M, fontSize: 12, color: t.globalScore >= 75 ? "var(--fg)" : "var(--fg-muted)", fontWeight: 500 }}>
                    {t.globalScore}
                  </span>
                </div>
                {/* CA */}
                <div style={{ width: 80, textAlign: "right" }}>
                  <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{t.financials?.revenue ?? "—"}</span>
                </div>
                {/* Sparkline */}
                <div style={{ width: 52, paddingLeft: 6 }}>
                  <Sparkline score={t.globalScore} />
                </div>
                {/* Secteur */}
                <div style={{ width: 140, overflow: "hidden" }}>
                  <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
                    {t.sector?.toUpperCase().slice(0, 18) ?? "—"}
                  </span>
                </div>
                {/* Région */}
                <div style={{ width: 120, overflow: "hidden" }}>
                  <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>{t.region?.slice(0, 16) ?? "—"}</span>
                </div>
                {/* Signal */}
                <div style={{ width: 160, overflow: "hidden" }}>
                  <span style={{ ...M, fontSize: 9, color: hot ? "#FF4500" : "var(--fg-muted)", letterSpacing: "0.04em" }}>
                    {signal.toUpperCase().slice(0, 22)}
                  </span>
                </div>
                {/* Arrow */}
                <div style={{ width: 24, display: "flex", justifyContent: "flex-end" }}>
                  <ArrowUpRight size={12} style={{ color: "var(--fg-dim)" }} />
                </div>
              </Link>
            );
          })
        }
      </div>

      {/* Status */}
      <div style={{
        height: 28, borderTop: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>
          GOLD_LAYER — {(data?.total ?? 0).toLocaleString("fr")} CIBLES M&A SCORÉES
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ ...M, fontSize: 9, color: "#4A9A5A" }}>● LIVE</span>
      </div>
    </div>
  );
}

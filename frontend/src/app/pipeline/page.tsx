"use client";

import { useState } from "react";
import { useTargets } from "@/lib/queries/useTargets";
import type { Target } from "@/types";
import { Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

const STAGES = [
  { id: "sourcing",       label: "SOURCING",       color: "#333333" },
  { id: "qualification",  label: "QUALIFICATION",  color: "#444444" },
  { id: "loi",            label: "LOI",            color: "#FF4500" },
  { id: "due_diligence",  label: "DUE_DILIGENCE",  color: "#FF4500" },
  { id: "closing",        label: "CLOSING",        color: "#4A9A5A" },
];

function ScoreMeter({ score }: { score: number }) {
  return (
    <div style={{ height: 2, background: "#1A1A1A", overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${score}%`, background: "#FF4500", boxShadow: "0 0 6px rgba(255,69,0,0.4)" }} />
    </div>
  );
}

function DealCard({ t }: { t: Target }) {
  const signal = t.topSignals?.[0]?.label ?? "—";
  const hot = t.bodacc_recent;
  return (
    <Link href={`/targets/${t.id}`} style={{
      display: "block", padding: "12px 14px",
      borderBottom: "1px solid #111111", textDecoration: "none",
      borderLeft: "2px solid transparent",
      transition: "background 0.1s, border-color 0.1s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#111111"; e.currentTarget.style.borderLeftColor = hot ? "#FF4500" : "#FAFAFA"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <span style={{ ...S, fontSize: 12, color: "#FAFAFA", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
          {t.name}
        </span>
        <ArrowUpRight size={10} style={{ color: "#333333", flexShrink: 0, marginTop: 2 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...M, fontSize: 9, color: "#444444" }}>{t.sector?.toUpperCase().slice(0, 14)}</span>
        <span style={{ ...M, fontSize: 10, color: hot ? "#FF4500" : "#666666" }}>{t.globalScore}</span>
      </div>
      <ScoreMeter score={t.globalScore} />
      <div style={{ marginTop: 6 }}>
        <span style={{ ...M, fontSize: 8, color: hot ? "#FF4500" : "#333333", letterSpacing: "0.06em" }}>
          {signal.toUpperCase().slice(0, 24)}
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ ...M, fontSize: 8, color: "#2A2A2A" }}>{t.financials?.revenue ?? "—"}</span>
        <span style={{ ...M, fontSize: 8, color: "#2A2A2A" }}>{t.city}</span>
      </div>
    </Link>
  );
}

export default function PipelinePage() {
  const { data, isLoading } = useTargets();
  const [toast, setToast] = useState<string | null>(null);

  const targets = data?.data ?? [];
  const chunkSize = Math.ceil(targets.length / 5);
  const columns = STAGES.map((s, i) => ({
    ...s,
    cards: targets.slice(i * chunkSize, (i + 1) * chunkSize) as Target[],
  }));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "#0A0A0A" }}>
      {/* Header */}
      <div style={{
        height: 40, borderBottom: "1px solid #1F1F1F", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
        background: "#050505",
      }}>
        <span style={{ ...M, fontSize: 10, color: "#444444", letterSpacing: "0.15em" }}>PIPELINE_M&A</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...M, fontSize: 9, color: "#4A9A5A" }}>● LIVE</span>
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, display: "flex", overflowX: "auto", overflowY: "hidden" }} className="thin-scrollbar">
        {columns.map(col => (
          <div key={col.id} style={{
            width: 240, flexShrink: 0,
            display: "flex", flexDirection: "column",
            borderRight: "1px solid #1F1F1F",
          }}>
            {/* Column header */}
            <div style={{
              height: 40, borderBottom: "1px solid #1F1F1F",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 12px", flexShrink: 0,
              background: "#050505",
            }}>
              <span style={{ ...M, fontSize: 9, color: col.color, letterSpacing: "0.15em" }}>{col.label}</span>
              <span style={{ ...M, fontSize: 9, color: "#FF4500", padding: "2px 6px", background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.2)" }}>
                {isLoading ? "—" : col.cards.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: "auto" }} className="thin-scrollbar">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid #111111" }}>
                    <div style={{ height: 10, background: "#111111", borderRadius: 2, marginBottom: 6, width: "80%" }} />
                    <div style={{ height: 6, background: "#111111", borderRadius: 2, width: "50%" }} />
                  </div>
                ))
                : col.cards.map(t => <DealCard key={t.id} t={t} />)
              }
              {/* Add button */}
              <button
                onClick={() => showToast("NEW_TARGET_INITIATED")}
                style={{
                  width: "100%", height: 40,
                  border: "1px dashed #1A1A1A", background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, cursor: "pointer",
                  color: "#333333", margin: "8px 0",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#FF4500"; e.currentTarget.style.borderColor = "#FF4500"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#333333"; e.currentTarget.style.borderColor = "#1A1A1A"; }}
              >
                <Plus size={12} />
                <span style={{ ...M, fontSize: 9, letterSpacing: "0.1em" }}>NEW_TARGET</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "#FAFAFA", color: "#0A0A0A",
          padding: "10px 20px", zIndex: 200,
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.1em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4500" }} />
          {toast}
        </div>
      )}
    </div>
  );
}

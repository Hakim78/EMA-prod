"use client";

import { useState, useMemo } from "react";
import { useTargets } from "@/lib/queries/useTargets";
import type { Target } from "@/types";
import { Network, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CanvasSkeleton } from "@/components/ui/PageSkeleton";
import ErrorState from "@/components/ui/ErrorState";

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

const REGION_POS: Record<string, { x: number; y: number }> = {
  "Île-de-France":                 { x: 52, y: 28 },
  "Bretagne":                      { x: 14, y: 33 },
  "Pays de la Loire":              { x: 22, y: 42 },
  "Normandie":                     { x: 30, y: 20 },
  "Hauts-de-France":               { x: 48, y: 12 },
  "Grand Est":                     { x: 68, y: 22 },
  "Bourgogne-Franche-Comté":       { x: 62, y: 40 },
  "Centre-Val de Loire":           { x: 42, y: 40 },
  "Nouvelle-Aquitaine":            { x: 28, y: 62 },
  "Occitanie":                     { x: 46, y: 76 },
  "Auvergne-Rhône-Alpes":          { x: 64, y: 58 },
  "Provence-Alpes-Côte d'Azur":    { x: 72, y: 78 },
  "Normandy":                      { x: 30, y: 20 },
};

function getPos(t: Target): { x: number; y: number } {
  const base = REGION_POS[t.region] ?? { x: 50, y: 50 };
  const ox = ((t.id?.charCodeAt(0) ?? 0) % 10 - 5) * 1.5;
  const oy = ((t.id?.charCodeAt(1) ?? 0) % 10 - 5) * 1.5;
  return { x: base.x + ox, y: base.y + oy };
}

function scoreToColor(score: number): string {
  if (score >= 80) return "#FF4500";
  if (score >= 60) return "#884422";
  if (score >= 40) return "#442211";
  return "#2A2A2A";
}

export default function MapPage() {
  const { data, isLoading, isError, refetch } = useTargets();
  const [selected, setSelected] = useState<Target | null>(null);
  const [sectorFilter, setSectorFilter] = useState("");
  const router = useRouter();

  const targets = useMemo(() => {
    let list = (data?.data ?? []) as Target[];
    if (sectorFilter) list = list.filter((t: Target) => t.sector === sectorFilter);
    return list;
  }, [data, sectorFilter]);

  const sectors = data?.filters?.sectors ?? [];

  if (isLoading) return <CanvasSkeleton label="CHARGEMENT_CARTE…" />;
  if (isError)   return <div style={{ height: "100dvh", display: "flex" }}><ErrorState onRetry={() => refetch()} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{
        height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...M, fontSize: 10, color: "var(--fg)", letterSpacing: "0.15em" }}>Carte_Tactique</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, padding: "3px 8px", border: "1px solid var(--border)" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4500", animation: "pulse 2s infinite" }} />
          <span style={{ ...M, fontSize: 8, color: "var(--fg)", letterSpacing: "0.12em" }}>ACTIVE_SCAN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", border: "1px solid var(--border)" }}>
          <span style={{ width: 4, height: 4, background: "var(--fg-dim)" }} />
          <span style={{ ...M, fontSize: 8, color: "var(--fg-muted)", letterSpacing: "0.12em" }}>PASSIVE</span>
        </div>
        <div style={{ flex: 1 }} />
        <select
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
          style={{ ...M, fontSize: 9, color: "var(--fg-muted)", background: "var(--bg)", border: "1px solid var(--border)", padding: "3px 8px", outline: "none", cursor: "pointer" }}
        >
          <option value="">TOUS SECTEURS</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ ...M, fontSize: 8, color: "var(--fg-muted)" }}>{targets.length} NODES</span>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Map — intentionally dark (tactical radar aesthetic) */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "radial-gradient(ellipse at center, #0E0E0E 0%, #050505 100%)",
        }}>
          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          {/* Accent grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,69,0,0.04) 1px, transparent 1px), linear-gradient(90deg,rgba(255,69,0,0.04) 1px,transparent 1px)",
            backgroundSize: "200px 200px",
          }} />

          {/* Scanning line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1,
            background: "rgba(255,69,0,0.2)",
            boxShadow: "0 0 20px rgba(255,69,0,0.3)",
            animation: "scanLine 4s linear infinite",
            pointerEvents: "none", zIndex: 1,
          }} />

          {/* Radar rings */}
          {[80, 40].map(size => (
            <div key={size} style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: `${size}vmin`, height: `${size}vmin`,
              border: "1px solid rgba(255,69,0,0.06)",
              borderRadius: "50%", pointerEvents: "none",
            }} />
          ))}

          {/* Data nodes */}
          {!isLoading && targets.map(t => {
            const pos = getPos(t);
            const isActive = selected?.id === t.id;
            const hot = t.globalScore >= 70 || t.bodacc_recent;
            const size = Math.max(6, Math.min(14, 6 + t.globalScore / 10));
            return (
              <button
                key={t.id}
                onClick={() => setSelected(isActive ? null : t)}
                title={t.name}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`, top: `${pos.y}%`,
                  transform: "translate(-50%,-50%)",
                  width: size, height: size,
                  background: isActive ? "#FF4500" : scoreToColor(t.globalScore),
                  border: "none", cursor: "crosshair", padding: 0,
                  zIndex: isActive ? 20 : 10,
                  transition: "transform 0.15s, background 0.15s",
                  borderRadius: 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translate(-50%,-50%) scale(1.8)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translate(-50%,-50%) scale(1)")}
              >
                {hot && (
                  <span style={{
                    position: "absolute", inset: -2,
                    background: "rgba(255,69,0,0.3)",
                    borderRadius: 2, animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                  }} />
                )}
              </button>
            );
          })}

          {/* Title overlay */}
          <div style={{
            position: "absolute", top: 16, left: 16, pointerEvents: "none",
          }}>
            <div style={{ ...M, fontSize: 22, color: "#FAFAFA", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              Carte_Tactique
            </div>
          </div>
        </div>

        {/* HUD Panel */}
        <div style={{
          width: selected ? 280 : 200, flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          transition: "width 0.2s",
          background: "var(--bg)",
        }}>
          {/* HUD header */}
          <div style={{
            height: 40, borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 12px", flexShrink: 0, background: "var(--bg-raise)",
          }}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>
              {selected ? "HUD_SECURE_ANALYSIS" : "TOP_CIBLES_ZONE"}
            </span>
            {selected && (
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-muted)", display: "flex" }}>
                <X size={12} />
              </button>
            )}
          </div>

          {selected ? (
            /* Selected target detail */
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }} className="thin-scrollbar">
              <div style={{ ...S, fontSize: 18, color: "var(--fg)", fontStyle: "italic", borderBottom: "1px solid rgba(255,69,0,0.2)", paddingBottom: 8, marginBottom: 12, lineHeight: 1.2 }}>
                {selected.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                <span style={{ ...M, fontSize: 32, color: "#FF4500", letterSpacing: "-0.03em" }}>{selected.globalScore}</span>
                <span style={{ ...M, fontSize: 8, color: "var(--fg-muted)", letterSpacing: "0.1em" }}>M&A_INDEX_SCORE</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {[
                  { k: "REVENUE_A23",  v: selected.financials?.revenue ?? "—" },
                  { k: "SECTEUR",      v: selected.sector?.slice(0, 12) ?? "—" },
                  { k: "VILLE",        v: selected.city ?? "—" },
                  { k: "STRUCTURE",    v: selected.structure ?? "—" },
                ].map(row => (
                  <div key={row.k} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "8px 10px" }}>
                    <div style={{ ...M, fontSize: 8, color: "var(--fg-muted)", marginBottom: 3 }}>{row.k}</div>
                    <div style={{ ...M, fontSize: 11, color: "var(--fg)" }}>{row.v}</div>
                  </div>
                ))}
              </div>

              {/* Liens détectés */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.15em", borderBottom: "1px solid var(--border)", paddingBottom: 4, marginBottom: 8 }}>LIENS_DÉTECTÉS</div>
                {[
                  { n: selected.group?.parent ?? "HOLDING MÈRE", r: "PARENT_ENTITY", c: "CONFIRMED" },
                  { n: selected.dirigeants?.[0]?.name ?? "DIRIGEANT", r: selected.dirigeants?.[0]?.role ?? "PDG", c: "ACTIVE" },
                ].map((l, i) => (
                  <div key={i} style={{
                    borderLeft: "2px solid var(--border)", paddingLeft: 8, paddingBottom: 6,
                    marginBottom: 4, transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderLeftColor = "#FF4500")}
                    onMouseLeave={e => (e.currentTarget.style.borderLeftColor = "var(--border)")}
                  >
                    <div style={{ ...M, fontSize: 10, color: "var(--fg)" }}>{l.n?.slice(0, 16)}</div>
                    <div style={{ ...M, fontSize: 8, color: "var(--fg-muted)" }}>{l.r} // {l.c}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  onClick={() => router.push(`/graph?siren=${selected.siren}`)}
                  style={{
                    width: "100%", height: 40,
                    border: "1px solid var(--border)", background: "var(--bg-alt)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    cursor: "pointer", color: "var(--fg)",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4500"; e.currentTarget.style.background = "rgba(255,69,0,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-alt)"; }}
                >
                  <Network size={13} style={{ color: "#FF4500" }} />
                  <span style={{ ...M, fontSize: 9, letterSpacing: "0.12em" }}>ISOLER_LE_RÉSEAU</span>
                </button>
                <button
                  onClick={() => router.push(`/targets/${selected.id}`)}
                  style={{ ...M, fontSize: 8, color: "var(--fg-dim)", background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.1em", padding: "6px 0" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-dim)")}
                >
                  EXPORT_TACTICAL_DATA
                </button>
              </div>
            </div>
          ) : (
            /* Top targets when nothing selected */
            <div style={{ flex: 1, overflowY: "auto" }} className="thin-scrollbar">
              {[...(data?.data ?? [])].sort((a, b) => b.globalScore - a.globalScore).slice(0, 12).map((t, i) => (
                <button key={t.id} onClick={() => setSelected(t)} style={{
                  width: "100%", display: "flex", alignItems: "center",
                  padding: "8px 12px",
                  background: "transparent", border: "none", borderBottom: "1px solid var(--border)",
                  cursor: "pointer", textAlign: "left",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ ...S, fontSize: 11, color: "var(--fg)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  <span style={{ ...M, fontSize: 10, color: t.globalScore >= 75 ? "#FF4500" : "var(--fg-muted)" }}>{t.globalScore}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanLine { from { top: -2% } to { top: 102% } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  );
}

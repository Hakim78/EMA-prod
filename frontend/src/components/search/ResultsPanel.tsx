"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Sparkles, Radio, Columns, Check } from "lucide-react";
import CompanyRow, { COL_DEFS, DEFAULT_COLS, buildGridTemplate } from "./CompanyRow";
import type { ColKey } from "./CompanyRow";
import FilterPill from "./FilterPill";
import EnrichModal from "./EnrichModal";
import type { SearchCompany, SearchFilter } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const ALL_OPTIONAL_COLS: ColKey[] = ["description", "siren", "country", "score", "revenue", "signal", "city"];

interface Props {
  companies: SearchCompany[];
  filters: SearchFilter[];
  loading: boolean;
  savedIds: Set<string>;
  aiInsights: Record<string, string | "loading">;
  onRemoveFilter: (id: string) => void;
  onToggleFilterMode: (id: string, mode: "include" | "must" | "exclude") => void;
  onSave: (id: string) => void;
  onHide: (id: string) => void;
  onRowClick: (company: SearchCompany) => void;
  onEnrich: (ids: string[]) => void;
}

export default function ResultsPanel({
  companies, filters, loading, savedIds, aiInsights,
  onRemoveFilter, onToggleFilterMode, onSave, onHide, onRowClick, onEnrich,
}: Props) {
  const [focusMode, setFocusMode]   = useState(false);
  const [signalFilter, setSignalFilter] = useState(false);
  const [enrichOpen, setEnrichOpen] = useState(false);
  const [colEditorOpen, setColEditorOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  const colEditorRef = useRef<HTMLDivElement>(null);

  const showAI = Object.keys(aiInsights).length > 0;

  // Close col editor on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colEditorRef.current && !colEditorRef.current.contains(e.target as Node)) {
        setColEditorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter by focus mode
  let displayed = focusMode ? companies.filter(c => (c.score ?? 0) >= 75) : companies;

  // Filter by signal
  if (signalFilter) displayed = displayed.filter(c => c.signal);

  // Filter by must/exclude pills
  const mustPills    = filters.filter(f => f.mode === "must");
  const excludePills = filters.filter(f => f.mode === "exclude");

  if (mustPills.length > 0) {
    displayed = displayed.filter(c => {
      const haystack = `${c.sector ?? ""} ${c.description ?? ""} ${c.city ?? ""}`.toLowerCase();
      return mustPills.some(p => haystack.includes(p.value.toLowerCase()));
    });
  }
  if (excludePills.length > 0) {
    displayed = displayed.filter(c => {
      const haystack = `${c.sector ?? ""} ${c.description ?? ""} ${c.city ?? ""}`.toLowerCase();
      return !excludePills.some(p => haystack.includes(p.value.toLowerCase()));
    });
  }

  const hasData = companies.length > 0 || loading;
  const COLUMNS = ["#", "Actions", "Company", ...visibleCols.map(k => COL_DEFS[k].label), ...(showAI ? ["AI Insight"] : [])];
  const COL_WIDTHS = buildGridTemplate(visibleCols, showAI);

  function toggleCol(key: ColKey) {
    setVisibleCols(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", flexShrink: 0 }}>Companies</span>

        {/* Enrich with AI */}
        <button
          onClick={() => companies.length > 0 && setEnrichOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            padding: "5px 12px",
            background: companies.length > 0 ? (showAI ? "var(--bg-alt)" : "transparent") : "transparent",
            border: `1px solid ${showAI ? "var(--fg-muted)" : "var(--border)"}`,
            color: companies.length > 0 ? "var(--fg)" : "var(--fg-dim)",
            cursor: companies.length > 0 ? "pointer" : "not-allowed",
            ...S, fontSize: 12, transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { if (companies.length > 0) e.currentTarget.style.borderColor = "var(--fg)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = showAI ? "var(--fg-muted)" : "var(--border)"; }}
        >
          <Sparkles size={12} style={{ color: showAI ? "#2563EB" : "inherit" }} />
          {showAI ? "AI actif" : "Enrich with AI"}
        </button>

        {/* Signaux BODACC / Retraite */}
        <button
          onClick={() => setSignalFilter(p => !p)}
          style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            padding: "5px 12px",
            background: signalFilter ? "rgba(234,88,12,0.08)" : "transparent",
            border: `1px solid ${signalFilter ? "var(--signal)" : "var(--border)"}`,
            color: signalFilter ? "var(--signal)" : "var(--fg-muted)",
            cursor: "pointer", ...S, fontSize: 12,
            transition: "all 0.15s",
          }}
          title="Filtrer: dirigeants vieillissants, mouvements BODACC"
        >
          <Radio size={12} />
          Signaux
        </button>

        {/* Edit Columns */}
        <div ref={colEditorRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setColEditorOpen(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px",
              background: colEditorOpen ? "var(--bg-alt)" : "transparent",
              border: `1px solid ${colEditorOpen ? "var(--fg-muted)" : "var(--border)"}`,
              color: "var(--fg-muted)", cursor: "pointer", ...S, fontSize: 12,
              transition: "all 0.15s",
            }}
          >
            <Columns size={12} />
            Colonnes
          </button>

          {colEditorOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 30,
              background: "var(--bg-raise)", border: "1px solid var(--border)",
              padding: "8px 0", minWidth: 180, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>
              <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", padding: "4px 14px 8px" }}>
                COLONNES VISIBLES
              </div>
              {ALL_OPTIONAL_COLS.map(key => {
                const active = visibleCols.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleCol(key)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "7px 14px", background: "transparent", border: "none",
                      cursor: "pointer", ...S, fontSize: 12,
                      color: active ? "var(--fg)" : "var(--fg-muted)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: 14, height: 14, flexShrink: 0,
                      border: `1px solid ${active ? "var(--fg)" : "var(--border)"}`,
                      background: active ? "var(--fg)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && <Check size={9} style={{ color: "var(--bg)" }} />}
                    </div>
                    {COL_DEFS[key].label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Focus mode */}
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
          <div style={{ position: "relative", width: 32, height: 18 }}>
            <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
            <div style={{ position: "absolute", inset: 0, background: focusMode ? "var(--primary)" : "var(--bg-alt)", border: "1px solid var(--border)", transition: "background 0.2s" }} />
            <div style={{ position: "absolute", top: 2, left: focusMode ? 14 : 2, width: 12, height: 12, background: "var(--bg-raise)", border: "1px solid var(--border)", transition: "left 0.2s" }} />
          </div>
          <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>Focus</span>
        </label>

        {/* Filter pills */}
        {filters.length > 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
            {filters.map(f => (
              <FilterPill
                key={f.id}
                filter={f}
                onRemove={() => onRemoveFilter(f.id)}
                onToggleMode={onToggleFilterMode}
              />
            ))}
          </div>
        ) : <div style={{ flex: 1 }} />}

        {/* Count + export */}
        {companies.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {loading && <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>Génération…</span>}
            {signalFilter && (
              <span style={{ ...M, fontSize: 10, color: "var(--signal)", padding: "2px 6px", border: "1px solid var(--signal)" }}>
                ⚡ {displayed.length} signaux
              </span>
            )}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>
              {displayed.length.toLocaleString("fr")} résultats
            </span>
            <button style={{
              display: "flex", alignItems: "center", gap: 4,
              ...S, fontSize: 11, color: "var(--fg-muted)", background: "transparent",
              border: "1px solid var(--border)", padding: "4px 10px", cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
            >
              <Download size={11} /> Export
            </button>
          </div>
        )}
      </div>

      {/* Table header */}
      {hasData && (
        <div style={{
          display: "grid", gridTemplateColumns: COL_WIDTHS,
          padding: "0 16px", height: 32, alignItems: "center",
          borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-alt)",
        }}>
          {COLUMNS.map(h => (
            <span key={h} style={{
              ...M, fontSize: 9,
              color: h === "AI Insight" ? "#2563EB" : "var(--fg-dim)",
              letterSpacing: "0.1em",
            }}>
              {h.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && companies.length === 0
          ? Array.from({ length: 10 }).map((_, i) => (
              <SkeletonRow key={i} index={i} cols={visibleCols} showAI={showAI} />
            ))
          : displayed.length === 0
            ? <EmptyState signalFilter={signalFilter} />
            : displayed.map((c, i) => (
                <CompanyRow
                  key={c.id}
                  company={c}
                  rank={i + 1}
                  saved={savedIds.has(c.id)}
                  cols={visibleCols}
                  aiInsight={aiInsights[c.id]}
                  onSave={() => onSave(c.id)}
                  onHide={() => onHide(c.id)}
                  onClick={() => onRowClick(c)}
                />
              ))
        }
      </div>

      {/* Footer */}
      <div style={{
        height: 28, borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px", flexShrink: 0, background: "var(--bg-alt)",
      }}>
        {["[S] Sauvegarder", "[H] Masquer", "[↵] Fiche détaillée", "[L] Lookalike", "[E] Export CSV"].map((tip, i) => (
          <span key={i} style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.05em" }}>{tip}</span>
        ))}
      </div>

      {/* Enrich Modal */}
      {enrichOpen && (
        <EnrichModal
          companyCount={displayed.length}
          onEnrich={question => { onEnrich(displayed.map(c => c.id)); }}
          onClose={() => setEnrichOpen(false)}
        />
      )}
    </div>
  );
}

function SkeletonRow({ index, cols, showAI }: { index: number; cols: ColKey[]; showAI: boolean }) {
  const colCount = 3 + cols.length + (showAI ? 1 : 0);
  const widths = [20, 70, 130, ...cols.map(() => 160), ...(showAI ? [160] : [])].slice(0, colCount);
  const colWidths = buildGridTemplate(cols, showAI);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: colWidths,
      padding: "0 16px", height: 56, alignItems: "center",
      borderBottom: "1px solid var(--border)",
    }}>
      {widths.map((w, i) => (
        <div key={i} style={{
          height: 9, width: w, background: "var(--bg-alt)",
          animation: "skeleton-shimmer 1.5s ease-in-out infinite",
          animationDelay: `${index * 0.05 + i * 0.03}s`,
        }} />
      ))}
    </div>
  );
}

function EmptyState({ signalFilter }: { signalFilter: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%", gap: 12, padding: 40,
    }}>
      {signalFilter ? (
        <>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span style={{ ...S, fontSize: 14, color: "var(--fg-muted)", textAlign: "center" }}>
            Aucun signal BODACC ou cession détecté dans les résultats
          </span>
          <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
            DÉSACTIVEZ LE FILTRE SIGNAL POUR VOIR TOUT
          </span>
        </>
      ) : (
        <>
          <span style={{ ...S, fontSize: 14, color: "var(--fg-muted)", textAlign: "center" }}>
            Lancez une recherche pour découvrir vos cibles
          </span>
          <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
            16M+ ENTREPRISES INDEXÉES
          </span>
        </>
      )}
    </div>
  );
}

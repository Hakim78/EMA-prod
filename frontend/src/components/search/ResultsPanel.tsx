"use client";

import { useState } from "react";
import { Download, Sparkles } from "lucide-react";
import CompanyRow, { COL_WIDTHS_BASE, COL_WIDTHS_AI } from "./CompanyRow";
import FilterPill from "./FilterPill";
import EnrichModal from "./EnrichModal";
import type { SearchCompany, SearchFilter } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const COLUMNS_BASE = ["#", "Actions", "Company", "Description", "Website", "Country"];
const COLUMNS_AI   = ["#", "Actions", "Company", "Description", "Website", "Country", "AI Insight"];

interface Props {
  companies: SearchCompany[];
  filters: SearchFilter[];
  loading: boolean;
  savedIds: Set<string>;
  aiInsights: Record<string, string | "loading">;
  onRemoveFilter: (id: string) => void;
  onSave: (id: string) => void;
  onHide: (id: string) => void;
  onRowClick: (company: SearchCompany) => void;
  onEnrich: (ids: string[]) => void;
}

export default function ResultsPanel({
  companies, filters, loading, savedIds, aiInsights,
  onRemoveFilter, onSave, onHide, onRowClick, onEnrich,
}: Props) {
  const [focusMode, setFocusMode]     = useState(false);
  const [enrichOpen, setEnrichOpen]   = useState(false);

  const showAI = Object.keys(aiInsights).length > 0;

  const displayed = focusMode
    ? companies.filter(c => (c.score ?? 0) >= 75)
    : companies;

  const hasData = companies.length > 0 || loading;
  const COLUMNS = showAI ? COLUMNS_AI : COLUMNS_BASE;
  const COL_WIDTHS = showAI ? COL_WIDTHS_AI : COL_WIDTHS_BASE;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", flexShrink: 0 }}>Companies</span>

        {/* Enrich with AI button */}
        <button
          onClick={() => companies.length > 0 && setEnrichOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            padding: "5px 12px",
            background: companies.length > 0 ? (showAI ? "var(--bg-alt)" : "transparent") : "transparent",
            border: `1px solid ${showAI ? "var(--fg-muted)" : "var(--border)"}`,
            color: companies.length > 0 ? "var(--fg)" : "var(--fg-dim)",
            cursor: companies.length > 0 ? "pointer" : "not-allowed",
            ...S, fontSize: 12,
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e => { if (companies.length > 0) e.currentTarget.style.borderColor = "var(--fg)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = showAI ? "var(--fg-muted)" : "var(--border)"; }}
        >
          <Sparkles size={12} style={{ color: showAI ? "#2563EB" : "inherit" }} />
          {showAI ? "AI Insight actif" : "Enrich with AI"}
        </button>

        {/* Focus mode toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
          <div style={{ position: "relative", width: 32, height: 18 }}>
            <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
            <div style={{ position: "absolute", inset: 0, background: focusMode ? "var(--primary)" : "var(--bg-alt)", border: "1px solid var(--border)", transition: "background 0.2s" }} />
            <div style={{ position: "absolute", top: 2, left: focusMode ? 14 : 2, width: 12, height: 12, background: "var(--bg-raise)", border: "1px solid var(--border)", transition: "left 0.2s" }} />
          </div>
          <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>Focus mode</span>
        </label>

        {/* Filter pills */}
        {filters.length > 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
            {filters.map(f => <FilterPill key={f.id} filter={f} onRemove={() => onRemoveFilter(f.id)} />)}
          </div>
        ) : <div style={{ flex: 1 }} />}

        {/* Count + export */}
        {companies.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {loading && <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>Génération…</span>}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>{displayed.length.toLocaleString("fr")} résultats</span>
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
        <div style={{ display: "grid", gridTemplateColumns: COL_WIDTHS, padding: "0 16px", height: 32, alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-alt)" }}>
          {COLUMNS.map(h => (
            <span key={h} style={{ ...M, fontSize: 9, color: h === "AI Insight" ? "#2563EB" : "var(--fg-dim)", letterSpacing: "0.1em" }}>{h}</span>
          ))}
        </div>
      )}

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && companies.length === 0
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} index={i} showAI={showAI} />)
          : displayed.length === 0
            ? <EmptyState />
            : displayed.map((c, i) => (
                <CompanyRow
                  key={c.id}
                  company={c}
                  rank={i + 1}
                  saved={savedIds.has(c.id)}
                  aiInsight={aiInsights[c.id]}
                  onSave={() => onSave(c.id)}
                  onHide={() => onHide(c.id)}
                  onClick={() => onRowClick(c)}
                />
              ))
        }
      </div>

      {/* Footer */}
      <div style={{ height: 28, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0, background: "var(--bg-alt)" }}>
        {["[S] Sauvegarder", "[H] Masquer", "[↵] Fiche détaillée", "[L] Lookalike", "[E] Export CSV"].map((tip, i) => (
          <span key={i} style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.05em" }}>{tip}</span>
        ))}
      </div>

      {/* Enrich Modal */}
      {enrichOpen && (
        <EnrichModal
          companyCount={displayed.length}
          onEnrich={question => onEnrich(displayed.map(c => c.id))}
          onClose={() => setEnrichOpen(false)}
        />
      )}
    </div>
  );
}

function SkeletonRow({ index, showAI }: { index: number; showAI: boolean }) {
  const widths = showAI ? [20, 70, 130, 200, 80, 60, 160] : [20, 70, 130, 200, 80, 60];
  const COL_WIDTHS = showAI ? COL_WIDTHS_AI : COL_WIDTHS_BASE;
  return (
    <div style={{ display: "grid", gridTemplateColumns: COL_WIDTHS, padding: "0 16px", height: 56, alignItems: "center", borderBottom: "1px solid var(--border)" }}>
      {widths.map((w, i) => (
        <div key={i} style={{ height: 9, width: w, background: "var(--bg-alt)", animation: "skeleton-shimmer 1.5s ease-in-out infinite", animationDelay: `${index * 0.05 + i * 0.03}s` }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: 40 }}>
      <span style={{ ...S, fontSize: 14, color: "var(--fg-muted)", textAlign: "center" }}>Lancez une recherche pour découvrir vos cibles</span>
      <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>16M+ ENTREPRISES INDEXÉES</span>
    </div>
  );
}

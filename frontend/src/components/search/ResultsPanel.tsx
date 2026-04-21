"use client";

import { Search, Download } from "lucide-react";
import CompanyRow from "./CompanyRow";
import FilterPill from "./FilterPill";
import type { SearchCompany, SearchFilter } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface Props {
  companies: SearchCompany[];
  filters: SearchFilter[];
  loading: boolean;
  savedIds: Set<string>;
  onRemoveFilter: (id: string) => void;
  onSave: (id: string) => void;
  onHide: (id: string) => void;
  onRowClick: (company: SearchCompany) => void;
}

const COLUMNS = ["#", "Entreprise", "Description", "Match", "CA", "Localisation"];
const COL_WIDTHS = "40px minmax(180px, 1fr) minmax(160px, 2fr) 70px 90px 90px";

export default function ResultsPanel({
  companies, filters, loading, savedIds,
  onRemoveFilter, onSave, onHide, onRowClick,
}: Props) {
  const hasData = companies.length > 0 || loading;

  return (
    <div style={{
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* Top bar: title + pills + count */}
      <div style={{
        height: 48,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 8,
        flexShrink: 0,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)", flexShrink: 0 }}>
          Entreprises
        </span>

        {/* Active filter pills */}
        {filters.length > 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
            {filters.map(f => (
              <FilterPill key={f.id} filter={f} onRemove={() => onRemoveFilter(f.id)} />
            ))}
          </div>
        )}
        {filters.length === 0 && <div style={{ flex: 1 }} />}

        {/* Count + export */}
        {companies.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {loading && (
              <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>
                Génération…
              </span>
            )}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>
              {companies.length.toLocaleString("fr")} résultats
            </span>
            <button style={{
              display: "flex", alignItems: "center", gap: 4,
              ...S, fontSize: 11, color: "var(--fg-muted)",
              background: "transparent",
              border: "1px solid var(--border)",
              padding: "4px 10px",
              cursor: "pointer",
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
          display: "grid",
          gridTemplateColumns: COL_WIDTHS,
          padding: "0 16px",
          height: 32,
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--bg-alt)",
        }}>
          {COLUMNS.map(h => (
            <span key={h} style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && companies.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} index={i} />)
        ) : companies.length === 0 ? (
          <EmptyState />
        ) : (
          companies.map((c, i) => (
            <CompanyRow
              key={c.id}
              company={c}
              rank={i + 1}
              saved={savedIds.has(c.id)}
              onSave={() => onSave(c.id)}
              onHide={() => onHide(c.id)}
              onClick={() => onRowClick(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: COL_WIDTHS,
      padding: "0 16px",
      height: 48,
      alignItems: "center",
      borderBottom: "1px solid var(--border)",
      gap: 0,
    }}>
      {[20, 120, 200, 30, 50, 60].map((w, i) => (
        <div key={i} style={{
          height: 9,
          width: w,
          background: "var(--bg-alt)",
          animation: "skeleton-shimmer 1.5s ease-in-out infinite",
          animationDelay: `${index * 0.05 + i * 0.03}s`,
        }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      gap: 12,
      padding: 40,
    }}>
      <Search size={28} style={{ color: "var(--fg-dim)" }} />
      <span style={{ ...S, fontSize: 14, color: "var(--fg-muted)", textAlign: "center" }}>
        Lancez une recherche pour découvrir vos cibles
      </span>
      <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
        16M+ ENTREPRISES INDEXÉES
      </span>
    </div>
  );
}

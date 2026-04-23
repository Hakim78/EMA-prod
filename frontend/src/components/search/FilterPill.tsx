"use client";

import { X } from "lucide-react";
import type { SearchFilter } from "@/types/search";

const M = { fontFamily: "'Space Mono', monospace" } as const;
const S = { fontFamily: "Inter, sans-serif" } as const;

interface Props {
  filter: SearchFilter;
  onRemove: () => void;
  onToggleMode?: (id: string, mode: "include" | "must" | "exclude") => void;
}

const MODE: Record<string, { bg: string; border: string; label: string; labelStrong: string }> = {
  include: {
    bg: "var(--bg-raise)",
    border: "var(--border)",
    label: "var(--fg-muted)",
    labelStrong: "var(--fg)",
  },
  must: {
    bg: "rgba(37,99,235,0.06)",
    border: "#BFDBFE",
    label: "#1D4ED8",
    labelStrong: "#1E3A8A",
  },
  exclude: {
    bg: "rgba(220,38,38,0.05)",
    border: "#FECACA",
    label: "#DC2626",
    labelStrong: "#991B1B",
  },
};

export default function FilterPill({ filter, onRemove, onToggleMode }: Props) {
  const mode = filter.mode ?? "include";
  const c = MODE[mode] ?? MODE.include;

  const handleClick = (e: { target: EventTarget; stopPropagation: () => void }) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (!onToggleMode) return;
    if (mode === "exclude") { onToggleMode(filter.id, "include"); return; }
    onToggleMode(filter.id, mode === "include" ? "must" : "include");
  };

  const handleContextMenu = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!onToggleMode) return;
    onToggleMode(filter.id, mode === "exclude" ? "include" : "exclude");
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={
        mode === "include" ? "Clic: Must-have · Clic droit: Exclure" :
        mode === "must"    ? "Must-have — Clic: Normal · Clic droit: Exclure" :
        "Exclure — Clic: Normal"
      }
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px 3px 7px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        cursor: "pointer",
        userSelect: "none",
        transition: "border-color 0.15s, background 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e: { currentTarget: HTMLDivElement }) => { if (mode === "include") e.currentTarget.style.borderColor = "var(--fg-muted)"; }}
      onMouseLeave={(e: { currentTarget: HTMLDivElement }) => { if (mode === "include") e.currentTarget.style.borderColor = c.border; }}
    >
      {/* Mode indicator */}
      {mode === "must"    && <span style={{ ...M, fontSize: 10, color: c.label, fontWeight: 700, lineHeight: 1 }}>+</span>}
      {mode === "exclude" && <span style={{ ...M, fontSize: 10, color: c.label, fontWeight: 700, lineHeight: 1 }}>−</span>}

      {/* Emoji icon */}
      {filter.icon && <span style={{ fontSize: 11, lineHeight: 1, opacity: 0.7 }}>{filter.icon}</span>}

      {/* Type label */}
      <span style={{ ...M, fontSize: 9, color: c.label, letterSpacing: "0.1em", opacity: 0.75 }}>
        {filter.type}
      </span>

      {/* Value */}
      <span style={{
        ...S, fontSize: 11,
        color: c.labelStrong,
        fontWeight: mode === "must" ? 600 : 500,
        textDecoration: mode === "exclude" ? "line-through" : "none",
      }}>
        {filter.label}
      </span>

      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 14, height: 14, marginLeft: 2,
          background: "transparent", border: "none", cursor: "pointer",
          color: c.label, opacity: 0.45, padding: 0,
          transition: "opacity 0.1s",
          flexShrink: 0,
        }}
        onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "0.45")}
        aria-label="Supprimer le filtre"
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </div>
  );
}

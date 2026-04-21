"use client";

import { X } from "lucide-react";
import type { SearchFilter } from "@/types/search";

const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface Props {
  filter: SearchFilter;
  onRemove: () => void;
  onToggleMode?: (id: string, mode: "include" | "must" | "exclude") => void;
}

export default function FilterPill({ filter, onRemove, onToggleMode }: Props) {
  const mode = filter.mode ?? "include";

  const handleClick = () => {
    if (!onToggleMode) return;
    if (mode === "exclude") { onToggleMode(filter.id, "include"); return; }
    onToggleMode(filter.id, mode === "include" ? "must" : "include");
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onToggleMode) return;
    onToggleMode(filter.id, mode === "exclude" ? "include" : "exclude");
  };

  const borderColor = mode === "must" ? "#2563EB" : mode === "exclude" ? "#DC2626" : "var(--border)";
  const bg          = mode === "must" ? "rgba(37,99,235,0.10)" : mode === "exclude" ? "rgba(220,38,38,0.08)" : "var(--bg-alt)";
  const textColor   = mode === "must" ? "#2563EB" : mode === "exclude" ? "#DC2626" : "var(--fg)";
  const decoration  = mode === "exclude" ? "line-through" : "none";

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={mode === "include" ? "Clic: must-have · Clic droit: exclure" : mode === "must" ? "Must-have — clic: normal · clic droit: exclure" : "Exclusion — clic: normal"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px",
        border: `1px solid ${borderColor}`,
        background: bg,
        ...S, fontSize: 11, color: textColor,
        whiteSpace: "nowrap", flexShrink: 0,
        cursor: onToggleMode ? "pointer" : "default",
        transition: "all 0.15s",
        userSelect: "none",
      }}
    >
      {filter.icon && <span style={{ fontSize: 12 }}>{filter.icon}</span>}
      {mode === "must" && <span style={{ fontSize: 10, fontWeight: 700 }}>★</span>}
      {mode === "exclude" && <span style={{ fontSize: 10 }}>✕</span>}
      <span style={{ color: mode === "include" ? "var(--fg-muted)" : textColor, fontSize: 10 }}>
        {filter.type}:
      </span>
      <span style={{ textDecoration: decoration, fontWeight: mode === "must" ? 600 : 400 }}>
        {filter.label}
      </span>
      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          color: textColor, display: "flex", padding: 0, marginLeft: 2, opacity: 0.7,
        }}
      >
        <X size={10} />
      </button>
    </div>
  );
}

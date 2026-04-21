"use client";

import { X } from "lucide-react";
import type { SearchFilter } from "@/types/search";

const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export default function FilterPill({ filter, onRemove }: { filter: SearchFilter; onRemove: () => void }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px",
      border: "1px solid var(--border)",
      background: "var(--bg-alt)",
      ...S, fontSize: 11, color: "var(--fg)",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {filter.icon && <span style={{ fontSize: 12 }}>{filter.icon}</span>}
      <span style={{ color: "var(--fg-muted)", fontSize: 10 }}>{filter.type}:</span>
      <span>{filter.label}</span>
      <button onClick={onRemove} style={{
        background: "transparent", border: "none", cursor: "pointer",
        color: "var(--fg-muted)", display: "flex", padding: 0, marginLeft: 2,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-muted)")}
      >
        <X size={10} />
      </button>
    </div>
  );
}

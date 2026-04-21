"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, EyeOff } from "lucide-react";
import type { SearchCompany } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export type ColKey = "description" | "siren" | "country" | "score" | "revenue" | "signal" | "city";

export const COL_DEFS: Record<ColKey, { label: string; width: string }> = {
  description: { label: "Description",  width: "minmax(170px,1.8fr)" },
  siren:       { label: "SIREN",        width: "110px" },
  country:     { label: "Country",      width: "90px" },
  score:       { label: "Score",        width: "80px" },
  revenue:     { label: "CA",           width: "110px" },
  signal:      { label: "Signal",       width: "minmax(120px,1fr)" },
  city:        { label: "Ville",        width: "90px" },
};

export const DEFAULT_COLS: ColKey[] = ["description", "siren", "country"];

export function buildGridTemplate(cols: ColKey[], showAI: boolean): string {
  const colWidths = cols.map(k => COL_DEFS[k].width).join(" ");
  const base = `36px 76px minmax(150px,1.2fr) ${colWidths}`;
  return showAI ? `${base} minmax(160px,1.5fr)` : base;
}

const COUNTRY_FLAGS: Record<string, string> = {
  France: "🇫🇷", Germany: "🇩🇪", UK: "🇬🇧", Spain: "🇪🇸", Italy: "🇮🇹",
};

interface Props {
  company: SearchCompany;
  rank: number;
  saved: boolean;
  cols: ColKey[];
  aiInsight?: string | "loading";
  onSave: () => void;
  onHide: () => void;
  onClick: () => void;
}

export default function CompanyRow({ company, rank, saved, cols, aiInsight, onSave, onHide, onClick }: Props) {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  const showAI = aiInsight !== undefined;
  const gridTemplateColumns = buildGridTemplate(cols, showAI);
  const flag = COUNTRY_FLAGS[company.country ?? "France"] ?? "🇫🇷";

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onHide, 260);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!saved) {
      setVisible(false);
      setTimeout(onSave, 200);
    }
  };

  function renderCol(key: ColKey) {
    switch (key) {
      case "description":
        return (
          <div key={key} style={{ paddingRight: 8 }}>
            <span style={{
              ...S, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const, overflow: "hidden",
            }}>
              {company.description}
            </span>
          </div>
        );
      case "siren":
        return (
          <span key={key} style={{ ...M, fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
            {company.siren ?? "—"}
          </span>
        );
      case "country":
        return (
          <span key={key} style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
            {flag} {company.country ?? "France"}
          </span>
        );
      case "score":
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 32, height: 4, background: "var(--bg-alt)", overflow: "hidden", flexShrink: 0 }}>
              <div style={{
                height: "100%", width: `${company.score ?? 0}%`,
                background: (company.score ?? 0) >= 75 ? "var(--up)" : "var(--fg-muted)",
              }} />
            </div>
            <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>{company.score ?? "—"}</span>
          </div>
        );
      case "revenue":
        return (
          <span key={key} style={{ ...M, fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
            {company.revenue ?? "—"}
          </span>
        );
      case "signal":
        return (
          <span key={key} style={{
            ...M, fontSize: 9, padding: "2px 6px",
            border: company.signal ? "1px solid var(--signal)" : "1px solid var(--border)",
            color: company.signal ? "var(--signal)" : "var(--fg-dim)",
            letterSpacing: "0.06em", maxWidth: "100%",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            display: "inline-block",
          }}>
            {company.signal ?? "—"}
          </span>
        );
      case "city":
        return (
          <span key={key} style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
            {company.city ?? "—"}
          </span>
        );
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: "grid",
              gridTemplateColumns,
              padding: "0 16px",
              minHeight: 56,
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              background: hovered ? "var(--bg-hover)" : "transparent",
              transition: "background 0.1s",
              cursor: "pointer",
            }}
          >
            {/* Rank */}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)" }}>
              {String(rank).padStart(2, "0")}
            </span>

            {/* Save + Hide */}
            <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
              <button onClick={handleSave} style={{
                ...M, fontSize: 9, padding: "3px 6px",
                background: saved ? "var(--up)" : "transparent",
                border: `1px solid ${saved ? "var(--up)" : "var(--border)"}`,
                color: saved ? "#fff" : "var(--fg-muted)",
                cursor: saved ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                {saved ? <><Check size={9} />saved</> : "save"}
              </button>
              <button onClick={handleHide} style={{
                ...M, fontSize: 9, padding: "3px 6px",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--fg-muted)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <EyeOff size={9} />
              </button>
            </div>

            {/* Company */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, paddingRight: 8 }}>
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                background: "var(--bg-alt)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                ...M, fontSize: 10, color: "var(--fg-muted)",
              }}>
                {company.name.charAt(0).toUpperCase()}
              </div>
              <span style={{
                ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {company.name}
              </span>
            </div>

            {/* Dynamic columns */}
            {cols.map(renderCol)}

            {/* AI Insight */}
            {showAI && (
              <div style={{ paddingRight: 8 }}>
                {aiInsight === "loading" ? (
                  <div style={{ height: 9, width: 140, background: "var(--bg-alt)", animation: "skeleton-shimmer 1.2s ease-in-out infinite" }} />
                ) : (
                  <span style={{
                    ...S, fontSize: 11, color: "#2563EB", lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                  }}>
                    {aiInsight}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

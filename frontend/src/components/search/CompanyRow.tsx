"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, EyeOff } from "lucide-react";
import type { SearchCompany } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export const COL_WIDTHS_BASE = "36px 76px minmax(150px,1.2fr) minmax(170px,1.8fr) 110px 90px";
export const COL_WIDTHS_AI   = "36px 76px minmax(130px,1fr) minmax(150px,1.5fr) 100px 80px minmax(160px,1.5fr)";

const COUNTRY_FLAGS: Record<string, string> = {
  France: "🇫🇷", Germany: "🇩🇪", UK: "🇬🇧", Spain: "🇪🇸", Italy: "🇮🇹",
};

interface Props {
  company: SearchCompany;
  rank: number;
  saved: boolean;
  aiInsight?: string | "loading";
  onSave: () => void;
  onHide: () => void;
  onClick: () => void;
}

export default function CompanyRow({ company, rank, saved, aiInsight, onSave, onHide, onClick }: Props) {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  const showAI = aiInsight !== undefined;
  const COL_WIDTHS = showAI ? COL_WIDTHS_AI : COL_WIDTHS_BASE;

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onHide, 260);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!saved) onSave();
  };

  const flag = COUNTRY_FLAGS[company.country ?? "France"] ?? "🇫🇷";

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
              gridTemplateColumns: COL_WIDTHS,
              padding: "0 16px",
              minHeight: 56,
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              background: hovered ? "var(--bg-hover)" : "transparent",
              transition: "background 0.1s",
              cursor: "pointer",
            }}
          >
            {/* # */}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)" }}>
              {String(rank).padStart(2, "0")}
            </span>

            {/* Save + Hide — always visible */}
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

            {/* Company: logo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, paddingRight: 8 }}>
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                background: "var(--bg-alt)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                ...M, fontSize: 10, color: "var(--fg-muted)",
              }}>
                {company.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {company.name}
              </span>
            </div>

            {/* Description — 2 lines */}
            <div style={{ paddingRight: 8 }}>
              <span style={{
                ...S, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}>
                {company.description}
              </span>
            </div>

            {/* SIREN */}
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>
              {company.siren ?? "—"}
            </span>

            {/* Country */}
            <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
              {flag} {company.country ?? "France"}
            </span>

            {/* AI Insight — only when column is active */}
            {showAI && (
              <div style={{ paddingRight: 8 }}>
                {aiInsight === "loading" ? (
                  <div style={{ height: 9, width: 140, background: "var(--bg-alt)", animation: "skeleton-shimmer 1.2s ease-in-out infinite" }} />
                ) : (
                  <span style={{
                    ...S, fontSize: 11, color: "#2563EB", lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
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

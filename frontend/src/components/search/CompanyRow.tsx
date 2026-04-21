"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, EyeOff, ChevronRight } from "lucide-react";
import type { SearchCompany } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const COL_WIDTHS = "36px minmax(160px,1fr) 80px 90px 70px minmax(200px,2fr) 80px";

interface Props {
  company: SearchCompany;
  rank: number;
  saved: boolean;
  onSave: () => void;
  onHide: () => void;
  onClick: () => void;
}

function Sparkline() {
  return (
    <svg width="52" height="18" viewBox="0 0 52 18" style={{ opacity: 0.55 }}>
      <polyline
        fill="none"
        stroke="var(--fg-dim)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        points="0,13 9,10 18,14 27,4 36,7 45,2 52,8"
      />
    </svg>
  );
}

export default function CompanyRow({ company, rank, saved, onSave, onHide, onClick }: Props) {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onHide, 260);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!saved) onSave();
  };

  const scoreColor = (s?: number) => {
    if (!s) return "var(--fg-muted)";
    if (s >= 80) return "var(--up)";
    if (s >= 60) return "var(--fg)";
    return "var(--fg-muted)";
  };

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
              height: 52,
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

            {/* Company name + location */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{
                ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {company.name}
              </span>
              <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
                {company.city ?? company.sector ?? "—"}
              </span>
            </div>

            {/* Score */}
            <span style={{ ...M, fontSize: 13, fontWeight: 700, color: scoreColor(company.score) }}>
              {company.score != null ? `${company.score}` : "—"}
            </span>

            {/* Revenue */}
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>
              {company.revenue ?? "—"}
            </span>

            {/* Sparkline */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Sparkline />
            </div>

            {/* Signal badge + description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              {company.signal && (
                <span style={{
                  ...M, fontSize: 10,
                  background: "var(--signal)",
                  color: "var(--primary-fg)",
                  padding: "2px 8px",
                  width: "fit-content",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {company.signal}
                </span>
              )}
              <span style={{
                ...S, fontSize: 11, color: "var(--fg-muted)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                lineHeight: 1.4, opacity: 0.75,
              }}>
                {company.description}
              </span>
            </div>

            {/* Actions — visible on hover */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              justifyContent: "flex-end",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.1s",
            }}>
              <button
                onClick={handleSave}
                title="Sauvegarder"
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: saved ? "var(--up)" : "transparent",
                  border: `1px solid ${saved ? "var(--up)" : "var(--border)"}`,
                  color: saved ? "#fff" : "var(--fg-muted)",
                  cursor: saved ? "default" : "pointer",
                }}
              >
                <Check size={11} />
              </button>
              <button
                onClick={handleHide}
                title="Masquer"
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                }}
              >
                <EyeOff size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onClick(); }}
                title="Fiche détaillée"
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink } from "lucide-react";
import type { SearchCompany } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface Props {
  company: SearchCompany;
  rank: number;
  saved: boolean;
  onSave: () => void;
  onHide: () => void;
  onClick: () => void;
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
              gridTemplateColumns: "40px minmax(180px, 1fr) minmax(160px, 2fr) 70px 90px 90px",
              padding: "0 16px",
              height: 48,
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

            {/* Company name + actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                background: "var(--bg-alt)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                ...M, fontSize: 10, color: "var(--fg-muted)",
              }}>
                {company.name.charAt(0).toUpperCase()}
              </div>

              <span style={{
                ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {company.name}
              </span>

              {/* Save / Hide — visible on hover */}
              <div style={{
                display: "flex", gap: 4, flexShrink: 0,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.1s",
              }}>
                <button
                  onClick={handleSave}
                  style={{
                    ...M, fontSize: 9,
                    padding: "2px 8px",
                    background: saved ? "var(--up)" : "transparent",
                    border: `1px solid ${saved ? "var(--up)" : "var(--border)"}`,
                    color: saved ? "#fff" : "var(--fg-muted)",
                    cursor: saved ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 3,
                  }}
                >
                  {saved ? <><Check size={9} /> Saved</> : "save"}
                </button>
                <button
                  onClick={handleHide}
                  style={{
                    ...M, fontSize: 9,
                    padding: "2px 8px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--fg-muted)",
                    cursor: "pointer",
                  }}
                >
                  hide
                </button>
              </div>
            </div>

            {/* Description */}
            <span style={{
              ...S, fontSize: 12, color: "var(--fg-muted)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              lineHeight: 1.5,
            }}>
              {company.description}
            </span>

            {/* Score */}
            <span style={{ ...M, fontSize: 12, color: scoreColor(company.score), fontWeight: 700 }}>
              {company.score != null ? `${company.score}%` : "—"}
            </span>

            {/* Revenue */}
            <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>
              {company.revenue ?? "—"}
            </span>

            {/* City / Country */}
            <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {company.city ?? company.country ?? "—"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

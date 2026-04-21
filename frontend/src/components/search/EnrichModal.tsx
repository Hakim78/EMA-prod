"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const SUGGESTIONS = [
  "Build me the 'story' for why this business could be sold",
  "What are their core products?",
  "Return the estimated EBITDA margin as a % number",
];

interface Props {
  companyCount: number;
  onEnrich: (question: string) => void;
  onClose: () => void;
}

export default function EnrichModal({ companyCount, onEnrich, onClose }: Props) {
  const [tab, setTab]       = useState<"Advanced" | "Standard">("Advanced");
  const [question, setQuestion] = useState("");

  const handleEnrich = () => {
    if (!question.trim()) return;
    onEnrich(question.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="enrich-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <motion.div
          key="enrich-panel"
          initial={{ scale: 0.94, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 8 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{ width: 540, background: "var(--bg-raise)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* Header */}
          <div style={{ padding: "18px 20px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={15} style={{ color: "var(--signal)" }} />
                <span style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>Enrich with AI</span>
                <span style={{ ...M, fontSize: 9, padding: "2px 7px", border: "1px solid var(--border)", color: "var(--fg-dim)", letterSpacing: "0.06em" }}>
                  {companyCount} entreprises
                </span>
              </div>
              <button onClick={onClose} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)" }}>
                <X size={13} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex" }}>
              {(["Advanced", "Standard"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  ...S, fontSize: 12, padding: "7px 16px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${tab === t ? "var(--fg)" : "transparent"}`,
                  color: tab === t ? "var(--fg)" : "var(--fg-muted)", cursor: "pointer",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                VOTRE QUESTION
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEnrich(); }}
                placeholder="Ex: Quel est leur produit principal ? Quelle est leur dernière levée de fonds ?"
                rows={3}
                autoFocus
                style={{
                  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
                  color: "var(--fg)", ...S, fontSize: 13, padding: "10px 12px",
                  outline: "none", resize: "none", lineHeight: 1.6,
                  boxSizing: "border-box",
                  transition: "border-color 0.1s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--fg)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Suggestions */}
            <div>
              <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>SUGGESTIONS RAPIDES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuestion(s)}
                    style={{
                      textAlign: "left", padding: "8px 12px",
                      background: question === s ? "var(--bg-alt)" : "transparent",
                      border: `1px solid ${question === s ? "var(--fg)" : "var(--border)"}`,
                      cursor: "pointer", ...S, fontSize: 12, color: "var(--fg-muted)",
                      lineHeight: 1.5, transition: "border-color 0.1s, background 0.1s, color 0.1s",
                    }}
                    onMouseEnter={e => { if (question !== s) { e.currentTarget.style.borderColor = "var(--fg-muted)"; e.currentTarget.style.color = "var(--fg)"; } }}
                    onMouseLeave={e => { if (question !== s) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; } }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-alt)" }}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.06em" }}>
              ⌘+ENTRÉE — LANCER
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onClose} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", cursor: "pointer", ...S, fontSize: 12, color: "var(--fg-muted)" }}>
                Annuler
              </button>
              <button
                onClick={handleEnrich}
                disabled={!question.trim()}
                style={{
                  padding: "8px 20px", border: "none", cursor: question.trim() ? "pointer" : "not-allowed",
                  background: question.trim() ? "#2563EB" : "var(--bg-alt)",
                  color: question.trim() ? "#fff" : "var(--fg-dim)",
                  ...S, fontSize: 12, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "background 0.15s",
                }}
              >
                <Sparkles size={12} /> Enrich
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

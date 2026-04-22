"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown, Trash2 } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const CREDITS_TOTAL    = 47;
const CREDITS_PER_CALL = 10;

const SUGGESTIONS = [
  "Build me the 'story' for why this business could be sold",
  "What are their core products?",
  "Return the estimated EBITDA margin as a % number",
];

const STANDARD_TEMPLATES = [
  { label: "Proposition de valeur", q: "Résume-moi leur proposition de valeur exacte en 2 phrases." },
  { label: "Thèse cession",         q: "Pourquoi ce business pourrait-il être vendu dans les 3 prochaines années ?" },
  { label: "Marge EBITDA estimée",  q: "Retourne la marge EBITDA estimée sous forme de % entier uniquement." },
  { label: "Actionnaire / cédant",  q: "Y a-t-il un dirigeant fondateur vieillissant ou un profil probable de cédant ?" },
];

type Tab         = "Advanced" | "Standard";
type ResponseType = "open-ended" | "structured";

interface Props {
  companyCount: number;
  onEnrich: (question: string) => void;
  onDeleteInsights?: () => void;
  onClose: () => void;
}

export default function EnrichModal({ companyCount, onEnrich, onDeleteInsights, onClose }: Props) {
  const [tab, setTab]               = useState<Tab>("Advanced");
  const [question, setQuestion]     = useState("");
  const [responseType, setResponseType] = useState<ResponseType>("open-ended");
  const [typeOpen, setTypeOpen]     = useState(false);
  const [stdSelected, setStdSelected] = useState<string | null>(null);

  const effectiveQuestion = tab === "Standard" ? (stdSelected ?? "") : question;
  const canEnrich = effectiveQuestion.trim().length > 0;

  const handleEnrich = () => {
    if (!canEnrich) return;
    onEnrich(effectiveQuestion.trim());
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
          style={{ width: 560, background: "var(--bg-raise)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div style={{ padding: "18px 20px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={15} style={{ color: "#2563EB" }} />
                <span style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>Enrich with AI</span>
                <span style={{ ...M, fontSize: 9, padding: "2px 7px", border: "1px solid var(--border)", color: "var(--fg-dim)", letterSpacing: "0.06em" }}>
                  {companyCount} entreprise{companyCount > 1 ? "s" : ""}
                </span>
              </div>
              <button onClick={onClose} style={{ width: 28, height: 28, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)" }}>
                <X size={13} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex" }}>
              {(["Advanced", "Standard"] as Tab[]).map(t => (
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

          {/* ── Body ───────────────────────────────────────────────────────── */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

            {tab === "Advanced" && (
              <>
                {/* Response type selector */}
                <div>
                  <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                    TYPE DE RÉPONSE
                  </label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setTypeOpen(p => !p)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--border)",
                        cursor: "pointer", ...S, fontSize: 13, color: "var(--fg)",
                      }}
                    >
                      {responseType === "open-ended" ? "Open-ended question" : "Structured response"}
                      <ChevronDown size={12} style={{ color: "var(--fg-muted)", transform: typeOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </button>
                    {typeOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 10,
                        background: "var(--bg-raise)", border: "1px solid var(--border)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}>
                        {(["open-ended", "structured"] as ResponseType[]).map(rt => (
                          <button
                            key={rt}
                            onClick={() => { setResponseType(rt); setTypeOpen(false); }}
                            style={{
                              width: "100%", textAlign: "left", padding: "9px 12px",
                              background: responseType === rt ? "var(--bg-hover)" : "transparent",
                              border: "none", cursor: "pointer", ...S, fontSize: 13, color: "var(--fg)",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                            }}
                          >
                            {rt === "open-ended" ? "Open-ended question" : "Structured response"}
                            {responseType === rt && <Check size={12} style={{ color: "var(--fg)" }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question textarea */}
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
                      outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box",
                      transition: "border-color 0.1s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--fg)")}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>

                {/* Suggestions */}
                <div>
                  <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>SUGGESTIONS RAPIDES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setQuestion(s)}
                        style={{
                          textAlign: "left", padding: "8px 12px",
                          background: question === s ? "var(--bg-alt)" : "transparent",
                          border: `1px solid ${question === s ? "var(--fg)" : "var(--border)"}`,
                          cursor: "pointer", ...S, fontSize: 12, color: question === s ? "var(--fg)" : "var(--fg-muted)",
                          lineHeight: 1.5, transition: "all 0.1s",
                        }}
                        onMouseEnter={e => { if (question !== s) { e.currentTarget.style.borderColor = "var(--fg-muted)"; e.currentTarget.style.color = "var(--fg)"; } }}
                        onMouseLeave={e => { if (question !== s) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; } }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === "Standard" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 4 }}>TEMPLATES PRÉDÉFINIS</div>
                {STANDARD_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.label}
                    onClick={() => setStdSelected(tmpl.q)}
                    style={{
                      textAlign: "left", padding: "12px 14px",
                      background: stdSelected === tmpl.q ? "rgba(37,99,235,0.06)" : "transparent",
                      border: `1px solid ${stdSelected === tmpl.q ? "#2563EB" : "var(--border)"}`,
                      cursor: "pointer", transition: "all 0.1s",
                    }}
                  >
                    <div style={{ ...S, fontSize: 12, fontWeight: 600, color: stdSelected === tmpl.q ? "#2563EB" : "var(--fg)", marginBottom: 3 }}>
                      {tmpl.label}
                    </div>
                    <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                      {tmpl.q}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <div style={{
            padding: "12px 20px", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--bg-alt)", gap: 12,
          }}>
            {/* Left: Delete column — only shown when there are insights to delete */}
            {onDeleteInsights && (
              <button
                onClick={() => { onDeleteInsights(); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", background: "transparent",
                  border: "1px solid #DC2626", cursor: "pointer",
                  ...S, fontSize: 12, color: "#DC2626",
                  transition: "background 0.1s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={12} /> Supprimer colonne IA
              </button>
            )}

            {/* Right: credits + enrich */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                AI Enrichment credits: Up to {CREDITS_PER_CALL} required · <span style={{ color: CREDITS_TOTAL > 10 ? "var(--up)" : "var(--signal)" }}>{CREDITS_TOTAL} Remaining</span>
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onClose} style={{
                  padding: "8px 16px", background: "transparent", border: "1px solid var(--border)",
                  cursor: "pointer", ...S, fontSize: 12, color: "var(--fg-muted)",
                }}>
                  Annuler
                </button>
                <button
                  onClick={handleEnrich}
                  disabled={!canEnrich}
                  style={{
                    padding: "8px 24px", border: "none",
                    cursor: canEnrich ? "pointer" : "not-allowed",
                    background: canEnrich ? "#111827" : "var(--bg-alt)",
                    color: canEnrich ? "#F9FAFB" : "var(--fg-dim)",
                    ...S, fontSize: 12, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (canEnrich) e.currentTarget.style.background = "#1F2937"; }}
                  onMouseLeave={e => { if (canEnrich) e.currentTarget.style.background = "#111827"; }}
                >
                  <Sparkles size={12} /> Enrich
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Re-export Check for internal use
function Check({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

"use client";

import { useRef, useEffect, useState, Fragment } from "react";
import { motion } from "framer-motion";
import { Send, ArrowRight, ChevronDown, Clock, RotateCcw } from "lucide-react";
import type { SearchMessage } from "@/types/search";

// ─── UTILS & PARSING ─────────────────────────────────────────────────────────

const HISTORY_KEY = "ema_search_history";

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); }
  catch { return []; }
}

function pushHistory(query: string) {
  const hist = getHistory().filter(h => h !== query);
  hist.unshift(query);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 8)));
}

function TextGenerateEffect({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.22, delay: Math.min(Math.floor(i / 2) * 0.014, 1.4), ease: "easeOut" }}
        >
          {part}
        </motion.span>
      ))}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 700, color: "var(--fg)" }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("*") && p.endsWith("*"))
      return <em key={i} style={{ fontStyle: "italic" }}>{p.slice(1, -1)}</em>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.9em", background: "var(--bg-alt)", padding: "0 4px" }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

function renderText(text: string, isStreaming?: boolean): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderInline(line)}
      {isStreaming && i === lines.length - 1 && (
        <span style={{ display: "inline-block", width: 2, height: 13, background: "var(--fg)", marginLeft: 2, verticalAlign: "middle", animation: "pulse-soft 1s infinite" }} />
      )}
    </Fragment>
  ));
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const EXAMPLES = [
  "PME agroalimentaire en Normandie, CA > 5M€",
  "Fabricants emballages Bretagne, fondateur > 60 ans",
  "Logiciels industriels Île-de-France, signaux BODACC",
  "ETI familiale Nouvelle-Aquitaine, secteur bois",
];

type InputMode = "natural" | "lookalike";

interface Props {
  messages: SearchMessage[];
  loading: boolean;
  onSend: (query: string) => void;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ChatPanel({ messages, loading, onSend }: Props) {
  const [input, setInput]     = useState("");
  const [mode, setMode]       = useState<InputMode>("natural");
  const [history, setHistory] = useState<string[]>([]);

  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setHistory(getHistory()); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const q = mode === "lookalike" ? `lookalike:${input.trim()}` : input.trim();
    pushHistory(input.trim());
    setHistory(getHistory());
    onSend(q);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleHistoryClick = (q: string) => {
    setInput(q);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--bg-raise)" }}>

      {/* Scrollable Chat Area */}
      <div ref={scrollRef} className="thin-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {messages.length === 0
          ? <EmptyState onSend={onSend} />
          : messages.map(msg => (
              <MessageBlock
                key={msg.id}
                msg={msg}
                isStreaming={loading && msg === messages[messages.length - 1] && msg.role === "assistant"}
              />
            ))
        }
      </div>

      {/* Recent Searches (only on empty state) */}
      {history.length > 0 && messages.length === 0 && (
        <div style={{ borderTop: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-raise)", paddingBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 4px" }}>
            <Clock size={10} style={{ color: "var(--fg-dim)" }} />
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>RECHERCHES RÉCENTES</span>
          </div>
          <div style={{ padding: "0 4px" }}>
            {history.slice(0, 3).map((q, i) => (
              <button key={i} onClick={() => handleHistoryClick(q)} style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px", background: "transparent", border: "none",
                cursor: "pointer", transition: "background 0.1s", borderRadius: 6,
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <RotateCcw size={10} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
                <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {q}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 12px", background: "var(--bg-raise)", flexShrink: 0 }}>

        {/* Mode Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
          {(["natural", "lookalike"] as InputMode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              ...M, fontSize: 9, padding: "3px 10px", letterSpacing: "0.06em", cursor: "pointer",
              background: mode === m ? "var(--bg-alt)" : "transparent",
              border: `1px solid ${mode === m ? "var(--border)" : "transparent"}`,
              color: mode === m ? "var(--fg)" : "var(--fg-dim)",
            }}>
              {m === "natural" ? "LANGAGE NATUREL" : "LOOKALIKE"}
            </button>
          ))}
        </div>

        {/* Textarea Form */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg)", border: "1px solid var(--border)",
            padding: "6px 10px", transition: "border-color 0.1s",
          }}>
            <span style={{ ...M, fontSize: 12, color: "var(--fg-dim)", flexShrink: 0 }}>{">"}</span>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === "natural" ? "Décrivez votre cible idéale…" : "Collez un domaine (ex: acme.fr)…"}
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none",
                color: "var(--fg)", ...S, fontSize: 13, outline: "none",
                resize: "none", lineHeight: 1.5, minHeight: 24, maxHeight: 120,
              }}
              onFocus={e => { (e.target.parentElement as HTMLElement).style.borderColor = "var(--fg)"; }}
              onBlur={e  => { (e.target.parentElement as HTMLElement).style.borderColor = "var(--border)"; }}
            />
          </div>
          <button type="submit" disabled={!input.trim() || loading} style={{
            width: 34, height: 34, border: "none", flexShrink: 0,
            cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
            background: input.trim() && !loading ? "var(--primary)" : "var(--bg-alt)",
            color: input.trim() && !loading ? "var(--primary-fg)" : "var(--fg-dim)",
          }}>
            {mode === "natural" ? <Send size={12} /> : <ArrowRight size={12} />}
          </button>
        </form>

        {/* Hint */}
        <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", marginTop: 6, letterSpacing: "0.05em", textAlign: "center", opacity: 0.7 }}>
          ENTRÉE ↵ ENVOYER · MAJ+ENTRÉE ↵ LIGNE
        </div>
      </div>
    </div>
  );
}

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function EmptyState({ onSend }: { onSend: (q: string) => void }) {
  return (
    <div style={{ padding: "28px 16px" }}>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>EdRCF_6.0</div>
      <div style={{ ...S, fontSize: 16, fontWeight: 600, color: "var(--fg)", marginBottom: 6, lineHeight: 1.3 }}>Copilot M&A</div>
      <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginBottom: 28, lineHeight: 1.6 }}>
        Décrivez votre cible idéale en langage naturel. L'IA analyse les critères sémantiques et financiers de 16M+ entreprises.
      </div>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", marginBottom: 10 }}>EXEMPLES DE REQUÊTES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {EXAMPLES.map((ex, idx) => (
          <button key={ex} onClick={() => onSend(ex)} style={{
            width: "100%", textAlign: "left", padding: "10px 12px", background: "transparent",
            border: "none", borderLeft: "2px solid transparent", borderBottom: "1px solid var(--border)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            transition: "background 0.1s, border-color 0.1s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderLeftColor = "var(--signal)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", flexShrink: 0 }}>{String(idx + 1).padStart(2, "0")}</span>
            <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)", flex: 1, lineHeight: 1.5 }}>{ex}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBlock({ msg, isStreaming }: { msg: SearchMessage; isStreaming: boolean }) {
  const [actionsOpen, setActionsOpen] = useState(true);
  const prevStreamingRef = useRef(isStreaming);
  const [blurReveal, setBlurReveal] = useState(false);

  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && msg.content) setBlurReveal(true);
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, msg.content]);

  // ── USER MESSAGE ──
  if (msg.role === "user") {
    return (
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          background: "rgba(239,246,255,0.85)",
          border: "1px solid #BFDBFE",
          padding: "10px 14px",
        }}>
          <div style={{ ...M, fontSize: 9, color: "#3B82F6", letterSpacing: "0.1em", marginBottom: 5 }}>
            VOTRE REQUÊTE
          </div>
          <p style={{ ...S, fontSize: 13, color: "#1E3A5F", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  // ── ASSISTANT MESSAGE ──
  const lines    = msg.content.split("\n");
  const bullets  = lines.filter(l => l.trim().startsWith("-") || l.trim().startsWith("•"));
  const overview = lines.filter(l => !l.trim().startsWith("-") && !l.trim().startsWith("•")).join("\n").trim();

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>

      {/* Actions (Tool calls) */}
      {(msg.actions && msg.actions.length > 0 || isStreaming) && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setActionsOpen(p => !p)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
            cursor: "pointer", padding: 0, ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em",
          }}>
            <span style={{ color: isStreaming ? "#3B82F6" : "#10B981", fontSize: 8 }}>●</span>
            {isStreaming && !msg.actions?.length ? "Analyse en cours…" : "Processus IA terminé"}
            {!isStreaming && <ChevronDown size={11} style={{ transform: actionsOpen ? "none" : "rotate(-90deg)", transition: "transform 0.15s" }} />}
          </button>

          {actionsOpen && msg.actions && msg.actions.length > 0 && (
            <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: "2px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
              {msg.actions.map((a, i) => (
                <div key={i} style={{ ...M, fontSize: 10, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  <span style={{ color: "#10B981", marginRight: 6 }}>✓</span>{a}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {msg.content ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Search Overview */}
          {overview && (
            <div>
              {bullets.length > 0 && (
                <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  SEARCH OVERVIEW
                </div>
              )}
              <div style={{ ...S, fontSize: 13, color: "var(--fg)", lineHeight: 1.7 }}>
                {blurReveal && !isStreaming
                  ? <TextGenerateEffect key={`${msg.id}-overview`} text={overview} />
                  : renderText(overview, isStreaming && bullets.length === 0)
                }
              </div>
            </div>
          )}

          {/* Key Findings (Bullets) */}
          {bullets.length > 0 && (
            <div>
              <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>
                KEY FINDINGS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bullets.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={blurReveal && !isStreaming ? { opacity: 0, x: -4 } : false}
                    animate={blurReveal && !isStreaming ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.2, delay: i * 0.06, ease: "easeOut" }}
                    style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
                  >
                    <span style={{ color: "var(--up)", marginTop: 2, flexShrink: 0, ...M, fontSize: 10 }}>▸</span>
                    <span style={{ ...S, fontSize: 12, color: "var(--fg)", lineHeight: 1.6 }}>
                      {renderInline(b.replace(/^[-•]\s*/, ""))}
                    </span>
                  </motion.div>
                ))}
                {isStreaming && (
                  <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--fg)", marginLeft: 2, animation: "pulse-soft 1s infinite" }} />
                )}
              </div>
            </div>
          )}
        </div>
      ) : isStreaming ? (
        <div style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>…</div>
      ) : null}
    </div>
  );
}

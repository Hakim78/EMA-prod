"use client";

import { useRef, useEffect, useState } from "react";
import { Send, ArrowRight, ChevronDown } from "lucide-react";
import type { SearchMessage } from "@/types/search";

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

export default function ChatPanel({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const [mode, setMode]   = useState<InputMode>("natural");
  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const q = mode === "lookalike" ? `lookalike:${input.trim()}` : input.trim();
    onSend(q);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--bg-raise)" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto" }}>
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

      {/* Input area */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 12px", background: "var(--bg-raise)", flexShrink: 0 }}>
        {/* Mode tabs */}
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

        <form onSubmit={handleSend} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "var(--bg)", border: "1px solid var(--border)", padding: "6px 10px", transition: "border-color 0.1s" }}>
            <span style={{ ...M, fontSize: 12, color: "var(--fg-dim)", flexShrink: 0 }}>{">"}</span>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={mode === "natural" ? "Décrivez votre cible idéale…" : "Collez un domaine (ex: acme.fr)…"}
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--fg)", ...S, fontSize: 13, outline: "none", resize: "none", lineHeight: 1.5, minHeight: 24, maxHeight: 100 }}
              onFocus={e => { (e.target.parentElement as HTMLElement).style.borderColor = "var(--fg)"; }}
              onBlur={e  => { (e.target.parentElement as HTMLElement).style.borderColor = "var(--border)"; }}
            />
          </div>
          <button type="submit" disabled={!input.trim() || loading} style={{
            width: 34, height: 34, border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s",
            background: input.trim() && !loading ? "var(--primary)" : "var(--bg-alt)",
            color: input.trim() && !loading ? "var(--primary-fg)" : "var(--fg-dim)",
          }}>
            {mode === "natural" ? <Send size={12} /> : <ArrowRight size={12} />}
          </button>
        </form>
        <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", marginTop: 6, letterSpacing: "0.05em" }}>
          ENTRÉE — ENVOYER · MAJ+ENTRÉE — NOUVELLE LIGNE
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSend }: { onSend: (q: string) => void }) {
  return (
    <div style={{ padding: "28px 16px" }}>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>EdRCF_6.0</div>
      <div style={{ ...S, fontSize: 16, fontWeight: 600, color: "var(--fg)", marginBottom: 6, lineHeight: 1.3 }}>Copilot M&A</div>
      <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginBottom: 28, lineHeight: 1.6 }}>
        Décrivez votre cible idéale en langage naturel. L'IA analyse 16M+ entreprises.
      </div>
      <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", marginBottom: 10 }}>EXEMPLES</div>
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
  );
}

function MessageBlock({ msg, isStreaming }: { msg: SearchMessage; isStreaming: boolean }) {
  const [actionsOpen, setActionsOpen] = useState(true);

  if (msg.role === "user") {
    return (
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-sub)" }}>
        {/* Blue user bubble */}
        <div style={{
          background: "#1D4ED8",
          padding: "10px 14px",
          borderRadius: 2,
          ...S, fontSize: 13, color: "#fff", lineHeight: 1.5,
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  const lines    = msg.content.split("\n");
  const bullets  = lines.filter(l => l.trim().startsWith("-") || l.trim().startsWith("•"));
  const overview = lines.filter(l => !l.trim().startsWith("-") && !l.trim().startsWith("•")).join("\n").trim();

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-sub)" }}>
      {/* Actions */}
      {(msg.actions && msg.actions.length > 0 || isStreaming) && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setActionsOpen(p => !p)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
            cursor: "pointer", padding: 0, ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.04em",
          }}>
            <span style={{ color: isStreaming ? "var(--up)" : "var(--fg-dim)", fontSize: 8 }}>●</span>
            {isStreaming && !msg.actions?.length ? "Analyse en cours…" : "Finished actions"}
            {!isStreaming && <ChevronDown size={11} style={{ transform: actionsOpen ? "none" : "rotate(-90deg)", transition: "transform 0.15s" }} />}
          </button>
          {actionsOpen && msg.actions && msg.actions.length > 0 && (
            <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: "1px solid var(--border)" }}>
              {msg.actions.map((a, i) => (
                <div key={i} style={{ ...M, fontSize: 10, color: "var(--fg-muted)", marginBottom: 3, lineHeight: 1.6 }}>
                  <span style={{ color: "var(--up)", marginRight: 6 }}>✓</span>{a}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Response content */}
      {msg.content ? (
        <div>
          {/* Search Overview */}
          {overview && (
            <div style={{ marginBottom: bullets.length > 0 ? 12 : 0 }}>
              {bullets.length > 0 && (
                <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  SEARCH OVERVIEW
                </div>
              )}
              <div style={{ ...S, fontSize: 13, color: "var(--fg)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {overview}
                {isStreaming && bullets.length === 0 && (
                  <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--fg)", marginLeft: 2, animation: "pulse-soft 1s infinite" }} />
                )}
              </div>
            </div>
          )}

          {/* Key Findings */}
          {bullets.length > 0 && (
            <div>
              <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", marginBottom: 8 }}>
                KEY FINDINGS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--up)", marginTop: 2, flexShrink: 0, ...M, fontSize: 10 }}>▸</span>
                    <span style={{ ...S, fontSize: 12, color: "var(--fg)", lineHeight: 1.6 }}>
                      {b.replace(/^[-•]\s*/, "")}
                    </span>
                  </div>
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

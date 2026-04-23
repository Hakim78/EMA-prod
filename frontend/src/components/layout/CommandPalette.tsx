"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  StackIcon,
  BellIcon,
  GearIcon,
  PersonIcon,
  TargetIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface Command {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef            = useRef<HTMLInputElement>(null);
  const listRef             = useRef<HTMLDivElement>(null);

  const COMMANDS: Command[] = [
    {
      id: "search",
      label: "Recherche M&A",
      sublabel: "Lancer une nouvelle recherche",
      icon: <MagnifyingGlassIcon width={14} height={14} />,
      action: () => router.push("/"),
      keywords: "recherche search cibles companies",
    },
    {
      id: "pipeline",
      label: "My Lists — Pipeline",
      sublabel: "Gérer votre pipeline M&A",
      icon: <BookmarkIcon width={14} height={14} />,
      action: () => router.push("/pipeline"),
      keywords: "pipeline lists saved kanban deal",
    },
    {
      id: "targets",
      label: "Base de données",
      sublabel: "Explorer toutes les cibles",
      icon: <StackIcon width={14} height={14} />,
      action: () => router.push("/targets"),
      keywords: "targets base donnees cibles database",
    },
    {
      id: "signals",
      label: "Signaux BODACC",
      sublabel: "Derniers signaux d'intention",
      icon: <BellIcon width={14} height={14} />,
      action: () => router.push("/signals"),
      keywords: "signaux bodacc alertes notifications",
    },
    {
      id: "investors",
      label: "Investisseurs",
      sublabel: "Annuaire des fonds",
      icon: <PersonIcon width={14} height={14} />,
      action: () => router.push("/investors"),
      keywords: "investisseurs fonds vc pe",
    },
    {
      id: "settings",
      label: "Intégrations & Paramètres",
      sublabel: "CRM, exports, API",
      icon: <GearIcon width={14} height={14} />,
      action: () => router.push("/settings/integrations"),
      keywords: "settings integrations crm salesforce hubspot",
    },
    {
      id: "onboarding",
      label: "Getting Started",
      sublabel: "Guide de prise en main",
      icon: <TargetIcon width={14} height={14} />,
      action: () => router.push("/onboarding"),
      keywords: "onboarding guide start help",
    },
    {
      id: "credits",
      label: "Crédits restants",
      sublabel: "47 crédits contacts disponibles",
      icon: <LightningBoltIcon width={14} height={14} />,
      action: () => router.push("/settings/integrations"),
      keywords: "credits contacts unlock",
    },
  ];

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        [c.label, c.sublabel ?? "", c.keywords ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : COMMANDS;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  // Open on ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(p => !p);
      }
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  // Arrow navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor(p => Math.min(p + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor(p => Math.max(p - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[cursor]) { filtered[cursor].action(); close(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, cursor, filtered, close]);

  // Focus input when opened
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setCursor(0); }
  }, [open]);

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="cmd-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={close}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200 }}
            />
            <motion.div
              key="cmd-panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: "20%", left: "50%", transform: "translateX(-50%)",
                width: 520, zIndex: 201,
                background: "var(--bg-raise)", border: "1px solid var(--border)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
                overflow: "hidden",
              }}
            >
              {/* Input */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderBottom: "1px solid var(--border)",
              }}>
                <MagnifyingGlassIcon width={15} height={15} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(0); }}
                  placeholder="Rechercher une page, action…"
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    ...S, fontSize: 14, color: "var(--fg)",
                  }}
                />
                <span style={{
                  ...M, fontSize: 9, color: "var(--fg-dim)", padding: "2px 5px",
                  border: "1px solid var(--border)", letterSpacing: "0.06em",
                }}>
                  ESC
                </span>
              </div>

              {/* Results */}
              <div ref={listRef} style={{ maxHeight: 340, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "20px 16px", textAlign: "center", ...S, fontSize: 13, color: "var(--fg-dim)" }}>
                    Aucun résultat
                  </div>
                ) : (
                  filtered.map((cmd, i) => (
                    <div
                      key={cmd.id}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => { cmd.action(); close(); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 16px", cursor: "pointer",
                        background: i === cursor ? "var(--bg-hover)" : "transparent",
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.08s",
                      }}
                    >
                      <div style={{ flexShrink: 0, color: i === cursor ? "var(--fg)" : "var(--fg-muted)" }}>
                        {cmd.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
                          {cmd.label}
                        </div>
                        {cmd.sublabel && (
                          <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", marginTop: 1 }}>
                            {cmd.sublabel}
                          </div>
                        )}
                      </div>
                      {i === cursor && (
                        <span style={{
                          ...M, fontSize: 9, color: "var(--fg-dim)", padding: "2px 5px",
                          border: "1px solid var(--border)", letterSpacing: "0.06em",
                          flexShrink: 0,
                        }}>
                          ↵
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div style={{
                padding: "6px 16px", borderTop: "1px solid var(--border)",
                display: "flex", gap: 16, background: "var(--bg-alt)",
              }}>
                {[["↑↓", "Naviguer"], ["↵", "Ouvrir"], ["Esc", "Fermer"]].map(([key, label]) => (
                  <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", padding: "1px 4px", border: "1px solid var(--border)", letterSpacing: "0.04em" }}>
                      {key}
                    </span>
                    <span style={{ ...S, fontSize: 10, color: "var(--fg-dim)" }}>{label}</span>
                  </span>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.08em" }}>⌘K</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, EyeOff, Search, Plus, FolderOpen, Cloud, Trash2 } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { getLists, createList, deleteList } from "@/lib/lists";
import type { WorkList } from "@/lib/lists";
import type { SearchCompany } from "@/types/search";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export type ColKey = "description" | "siren" | "country" | "score" | "revenue" | "signal" | "city";

export const COL_DEFS: Record<ColKey, { label: string; width: string }> = {
  description: { label: "AI Match",     width: "minmax(150px,1.6fr)" },
  siren:       { label: "SIREN",        width: "100px" },
  country:     { label: "Country",      width: "80px" },
  score:       { label: "Score",        width: "76px" },
  revenue:     { label: "CA",           width: "100px" },
  signal:      { label: "Signal",       width: "minmax(110px,1fr)" },
  city:        { label: "Ville",        width: "80px" },
};

export const DEFAULT_COLS: ColKey[] = ["description", "siren", "country"];

/** 24px checkbox · 36px rank · 76px actions · 1.2fr company · dynamic cols · AI? */
export function buildGridTemplate(cols: ColKey[], showAI: boolean): string {
  const colWidths = cols.map(k => COL_DEFS[k].width).join(" ");
  const base = `24px 36px 76px minmax(150px,1.2fr) ${colWidths}`;
  return showAI ? `${base} minmax(160px,1.5fr)` : base;
}


const COUNTRY_ISO: Record<string, string> = {
  France: "FR", Germany: "DE", "United Kingdom": "GB", UK: "GB",
  Spain: "ES", Italy: "IT", Belgium: "BE", Switzerland: "CH",
  Netherlands: "NL", Luxembourg: "LU", Portugal: "PT", Austria: "AT",
  Sweden: "SE", Denmark: "DK", Norway: "NO", Finland: "FI",
  Poland: "PL", "Czech Republic": "CZ", Romania: "RO", Hungary: "HU",
  "United States": "US", USA: "US", Canada: "CA",
};

interface Props {
  company: SearchCompany;
  rank: number;
  saved: boolean;
  cols: ColKey[];
  selected?: boolean;
  crmStatus?: { source: string; lastContact: string };
  aiInsight?: string | "loading";
  onSave: () => void;
  onHide: () => void;
  onClick: () => void;
  onToggleSelect?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function CompanyRow({
  company, rank, saved, cols, selected, crmStatus, aiInsight,
  onSave, onHide, onClick, onToggleSelect, onMouseEnter: onRowMouseEnter, onMouseLeave: onRowMouseLeave,
}: Props) {
  const [visible, setVisible]           = useState(true);
  const [hovered, setHovered]           = useState(false);
  const [saveOpen, setSaveOpen]         = useState(false);
  const [savePos, setSavePos]           = useState({ top: 0, left: 0 });
  const [listSearch, setListSearch]     = useState("");
  const [lists, setLists]               = useState<WorkList[]>(() => getLists());
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName]   = useState("");
  const [crmTooltip, setCrmTooltip]     = useState(false);
  const saveButtonRef                   = useRef<HTMLButtonElement>(null);

  const showAI = aiInsight !== undefined;
  const gridTemplateColumns = buildGridTemplate(cols, showAI);
  const countryCode = COUNTRY_ISO[company.country ?? "France"] ?? "FR";

  // Close popover on outside click
  useEffect(() => {
    if (!saveOpen) return;
    const close = () => setSaveOpen(false);
    setTimeout(() => document.addEventListener("mousedown", close), 0);
    return () => document.removeEventListener("mousedown", close);
  }, [saveOpen]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) return;
    const rect = saveButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setSavePos({ top: rect.bottom + 4, left: rect.left });
      setSaveOpen(true);
    }
  };

  const handleSaveToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveOpen(false);
    setVisible(false);
    setTimeout(onSave, 200);
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onHide, 260);
  };

  const filteredLists = lists.filter(l =>
    l.name.toLowerCase().includes(listSearch.toLowerCase())
  );

  const handleCreateList = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newListName.trim()) return;
    const created = createList(newListName);
    setLists(getLists());
    setNewListName("");
    setCreatingList(false);
    // Auto-save to this new list
    setSaveOpen(false);
    setVisible(false);
    setTimeout(onSave, 200);
    void created;
  };

  const handleDeleteList = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteList(id);
    setLists(getLists());
  };

  function renderCol(key: ColKey) {
    switch (key) {
      case "description": {
        const words = [company.sector, company.city, company.signal, company.description]
          .filter(Boolean)
          .join(" ")
          .split(/[\s·,.\-/()]+/)
          .map(w => w.toLowerCase().replace(/[^a-zàâéèêëîïôùûüç]/g, ""))
          .filter(w => w.length >= 4);
        const kws = [...new Set(words)].slice(0, 5);
        return (
          <div key={key} style={{ display: "flex", flexWrap: "wrap", gap: 3, paddingRight: 8, alignContent: "center" }}>
            {kws.length > 0 ? kws.map(kw => (
              <span key={kw} style={{
                ...M, fontSize: 8, padding: "1px 4px",
                background: "var(--bg-alt)", border: "1px solid var(--border)",
                color: "var(--fg-muted)", letterSpacing: "0.04em",
                textTransform: "uppercase" as const, lineHeight: 1.5,
              }}>
                {kw}
              </span>
            )) : <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>—</span>}
          </div>
        );
      }
      case "siren":
        return <span key={key} style={{ ...M, fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>{company.siren ?? "—"}</span>;
      case "country":
        return (
          <span key={key} style={{ ...S, fontSize: 11, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 5 }}>
            <ReactCountryFlag countryCode={countryCode} svg style={{ width: 16, height: 12, flexShrink: 0 }} />
            {company.country ?? "France"}
          </span>
        );
      case "score":
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 32, height: 4, background: "var(--bg-alt)", overflow: "hidden", flexShrink: 0 }}>
              <div style={{ height: "100%", width: `${company.score ?? 0}%`, background: (company.score ?? 0) >= 75 ? "var(--up)" : "var(--fg-muted)" }} />
            </div>
            <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>{company.score ?? "—"}</span>
          </div>
        );
      case "revenue":
        return <span key={key} style={{ ...M, fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.04em" }}>{company.revenue ?? "—"}</span>;
      case "signal":
        return (
          <span key={key} style={{
            ...M, fontSize: 9, padding: "2px 6px",
            border: company.signal ? "1px solid var(--signal)" : "1px solid var(--border)",
            color: company.signal ? "var(--signal)" : "var(--fg-dim)",
            letterSpacing: "0.06em", display: "inline-block",
            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {company.signal ?? "—"}
          </span>
        );
      case "city":
        return <span key={key} style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>{company.city ?? "—"}</span>;
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
            onMouseEnter={() => { setHovered(true); onRowMouseEnter?.(); }}
            onMouseLeave={() => { setHovered(false); onRowMouseLeave?.(); }}
            style={{
              display: "grid",
              gridTemplateColumns,
              padding: "0 16px",
              height: 36,
              minHeight: 36,
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              background: selected ? "rgba(37,99,235,0.04)" : hovered ? "var(--bg-hover)" : "transparent",
              transition: "background 0.1s",
              cursor: "pointer",
            }}
          >
            {/* Checkbox */}
            <div
              onClick={e => { e.stopPropagation(); onToggleSelect?.(); }}
              style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <div style={{
                width: 14, height: 14,
                border: `1px solid ${selected ? "#2563EB" : "var(--border)"}`,
                background: selected ? "#2563EB" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.1s", flexShrink: 0,
              }}>
                {selected && <Check size={9} style={{ color: "#fff" }} />}
              </div>
            </div>

            {/* Rank */}
            <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)" }}>
              {String(rank).padStart(2, "0")}
            </span>

            {/* Actions: Save (popover) + Hide */}
            <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
              <button
                ref={saveButtonRef}
                onClick={handleSaveClick}
                style={{
                  ...M, fontSize: 9, padding: "3px 6px",
                  background: saved ? "var(--fg)" : "transparent",
                  border: `1px solid ${saved ? "var(--fg)" : "var(--border)"}`,
                  color: saved ? "var(--bg)" : "var(--fg-muted)",
                  cursor: saved ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 3,
                }}
              >
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
                width: 22, height: 22, flexShrink: 0,
                background: "var(--bg-alt)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                ...M, fontSize: 9, color: "var(--fg-muted)",
              }}>
                {company.name.charAt(0).toUpperCase()}
              </div>
              <span style={{
                ...S, fontSize: 12, fontWeight: 600, color: "var(--fg)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                flex: 1,
              }}>
                {company.name}
              </span>
              {/* CRM badge */}
              {crmStatus && (
                <div
                  onMouseEnter={() => setCrmTooltip(true)}
                  onMouseLeave={() => setCrmTooltip(false)}
                  style={{ position: "relative", flexShrink: 0 }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: 3,
                    padding: "2px 5px",
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid #DC2626",
                    cursor: "default",
                  }}>
                    <Cloud size={9} style={{ color: "#DC2626" }} />
                    <span style={{ ...M, fontSize: 8, color: "#DC2626", letterSpacing: "0.05em" }}>
                      {crmStatus.source.toUpperCase()}
                    </span>
                  </div>
                  {crmTooltip && (
                    <div style={{
                      position: "fixed",
                      transform: "translateY(-100%) translateY(-8px)",
                      left: "auto",
                      zIndex: 500,
                      background: "#111827",
                      border: "1px solid #374151",
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}>
                      <span style={{ ...S, fontSize: 11, color: "#F9FAFB" }}>
                        Already in {crmStatus.source} · Last contact: {crmStatus.lastContact}
                      </span>
                    </div>
                  )}
                </div>
              )}
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

          {/* Save workspace popover — fixed to escape overflow clipping */}
          {saveOpen && (
            <div
              onMouseDown={e => e.stopPropagation()}
              style={{
                position: "fixed",
                top: savePos.top,
                left: savePos.left,
                zIndex: 1000,
                width: 220,
                background: "var(--bg-raise)",
                border: "1px solid var(--border)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
              }}
            >
              {/* Search input */}
              <div style={{
                padding: "8px 10px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Search size={11} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
                <input
                  autoFocus
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  placeholder="Search lists…"
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    ...S, fontSize: 12, color: "var(--fg)", outline: "none",
                  }}
                />
              </div>

              {/* List items */}
              <div style={{ padding: "4px 0", maxHeight: 180, overflowY: "auto" }}>
                {filteredLists.map(list => (
                  <div
                    key={list.id}
                    style={{ display: "flex", alignItems: "center", gap: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <button
                      onClick={handleSaveToList}
                      style={{
                        flex: 1, textAlign: "left",
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", background: "transparent", border: "none",
                        cursor: "pointer", ...S, fontSize: 12, color: "var(--fg)",
                      }}
                    >
                      <FolderOpen size={12} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                      {list.name}
                    </button>
                    {list.createdAt > 0 && (
                      <button
                        onClick={e => handleDeleteList(e, list.id)}
                        style={{ padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-dim)", display: "flex", alignItems: "center" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-dim)")}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
                {filteredLists.length === 0 && (
                  <div style={{ padding: "8px 12px", ...S, fontSize: 12, color: "var(--fg-dim)" }}>
                    Aucune liste trouvée
                  </div>
                )}
              </div>

              {/* Create new list */}
              <div style={{ borderTop: "1px solid var(--border)", padding: "4px 0" }}>
                {creatingList ? (
                  <form onSubmit={handleCreateList} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}>
                    <input
                      autoFocus
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      placeholder="Nom de la liste…"
                      style={{ flex: 1, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", ...S, fontSize: 12, padding: "4px 8px", outline: "none" }}
                      onKeyDown={e => { if (e.key === "Escape") { setCreatingList(false); setNewListName(""); } }}
                    />
                    <button type="submit" disabled={!newListName.trim()} style={{ padding: "4px 10px", background: newListName.trim() ? "#2563EB" : "var(--bg-alt)", border: "none", color: newListName.trim() ? "#fff" : "var(--fg-dim)", cursor: newListName.trim() ? "pointer" : "default", ...S, fontSize: 11 }}>
                      OK
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); setCreatingList(true); }}
                    style={{
                      width: "100%", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", background: "transparent", border: "none",
                      cursor: "pointer", ...S, fontSize: 12, color: "#2563EB",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <Plus size={12} style={{ flexShrink: 0 }} />
                    Créer une nouvelle liste
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

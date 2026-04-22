"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Linkedin, MapPin, Users, Calendar, Building2, Tag, Zap, Lock, Mail, Phone } from "lucide-react";
import type { SearchCompany } from "@/types/search";
import type { Target } from "@/types/index";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const TABS = ["Summary", "Funding", "Portfolio", "People", "Financials"] as const;
type Tab = typeof TABS[number];

interface Props {
  company: SearchCompany;
  onClose: () => void;
}

export default function CompanyHUD({ company, onClose }: Props) {
  const [tab, setTab]         = useState<Tab>("Summary");
  const [target, setTarget]   = useState<Target | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setFetching(true);
    setTarget(null);
    fetch(`/api/targets/${company.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setTarget(d))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [company.id]);

  const employees  = target?.financials?.effectif ?? company.employees;
  const revenue    = target?.financials?.revenue   ?? company.revenue;
  const signals    = target?.topSignals  ?? [];
  const dirigeants = target?.dirigeants  ?? [];
  const financials = target?.financials  ?? null;

  return (
    <AnimatePresence>
      <motion.div
        key="hud-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }}
      />
      <motion.div
        key="hud-panel"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 440,
          background: "var(--bg-raise)", borderLeft: "1px solid var(--border)",
          zIndex: 50, display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 0", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: "var(--bg-alt)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              ...M, fontSize: 16, color: "var(--fg)",
            }}>
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ ...S, fontSize: 16, fontWeight: 700, color: "var(--fg)", margin: 0, lineHeight: 1.2 }}>
                {company.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                {company.siren && (
                  <a
                    href={`https://www.societe.com/cgi-bin/search?champs=${company.siren}`}
                    target="_blank" rel="noreferrer"
                    style={{ ...S, fontSize: 11, color: "var(--primary)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >
                    <Globe size={11} /> Societe.com
                  </a>
                )}
                <a href="#" style={{ ...S, fontSize: 11, color: "var(--primary)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                  <Linkedin size={11} /> LinkedIn
                </a>
                {company.city && (
                  <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={11} /> {company.city}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, flexShrink: 0, background: "transparent",
              border: "1px solid var(--border)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)",
            }}>
              <X size={13} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                ...S, fontSize: 12, padding: "8px 14px", background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--fg)" : "transparent"}`,
                color: tab === t ? "var(--fg)" : "var(--fg-muted)",
                cursor: "pointer", transition: "color 0.1s",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {fetching && <div style={{ ...M, fontSize: 10, color: "var(--fg-dim)", marginBottom: 16 }}>Chargement…</div>}

          {tab === "Summary"    && <SummaryTab    company={company} employees={employees} revenue={revenue} signals={signals} />}
          {tab === "People"     && <PeopleTab     dirigeants={dirigeants} />}
          {tab === "Financials" && <FinancialsTab financials={financials} revenue={revenue} />}
          {(tab === "Funding" || tab === "Portfolio") && (
            <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.7 }}>
              Données non disponibles pour cette entreprise.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Summary Tab ────────────────────────────────────────────────────────────────

function SummaryTab({ company, employees, revenue, signals }: {
  company: SearchCompany;
  employees?: string | number;
  revenue?: string;
  signals: Array<{ label: string }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ ...S, fontSize: 13, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>
        {company.description || "Aucune description disponible."}
      </p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid var(--border)" }}>
        {[
          { icon: <Users size={12} />,     label: "Effectif",   value: employees ? String(employees) : "—" },
          { icon: <Calendar size={12} />,  label: "Création",   value: company.founded ? new Date(company.founded).getFullYear().toString() : "—" },
          { icon: <Building2 size={12} />, label: "Structure",  value: company.structure ?? "—" },
          { icon: <Tag size={12} />,       label: "Secteur",    value: company.sector ?? "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ padding: "12px 14px", background: "var(--bg-alt)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--fg-muted)" }}>
              {icon}
              <span style={{ ...M, fontSize: 9, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
            </div>
            <span style={{ ...M, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Revenue */}
      {revenue && (
        <div style={{ padding: "12px 14px", border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
          <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>CHIFFRE D'AFFAIRES</div>
          <span style={{ ...M, fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>{revenue}</span>
        </div>
      )}

      {/* Match Score + Keywords block */}
      {company.score != null && (
        <MatchScoreBlock company={company} />
      )}

      {/* Signal keywords */}
      {signals.length > 0 && (
        <div>
          <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>SIGNAUX DÉTECTÉS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {signals.map((s, i) => (
              <span key={i} style={{ ...M, fontSize: 10, padding: "3px 10px", background: "var(--signal)", color: "var(--primary-fg)" }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SIREN */}
      {company.siren && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
          <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em" }}>SIREN</span>
          <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{company.siren}</span>
        </div>
      )}
    </div>
  );
}

// ── People Tab ─────────────────────────────────────────────────────────────────

function PeopleTab({ dirigeants }: {
  dirigeants: Array<{ name: string; role: string; age?: number; since?: string }>;
}) {
  const [unlockedIdx, setUnlockedIdx] = useState<Set<number>>(new Set());
  const [pendingIdx, setPendingIdx]   = useState<number | null>(null);
  const [credits, setCredits]         = useState(47); // TODO: fetch from API

  const handleUnlock = (i: number) => setPendingIdx(i);

  const confirmUnlock = () => {
    if (pendingIdx === null || credits <= 0) return;
    setUnlockedIdx(prev => new Set([...prev, pendingIdx]));
    setCredits(c => c - 1);
    setPendingIdx(null);
  };

  if (!dirigeants.length) return (
    <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)" }}>Aucun dirigeant disponible.</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Credits indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 12px", border: "1px solid var(--border)", background: "var(--bg-alt)",
      }}>
        <Zap size={12} style={{ color: credits > 10 ? "var(--up)" : "var(--signal)" }} />
        <span style={{ ...M, fontSize: 10, color: "var(--fg)", letterSpacing: "0.04em" }}>
          {credits} crédits contacts restants
        </span>
      </div>

      {dirigeants.map((d, i) => (
        <div key={i} style={{
          border: "1px solid var(--border)", background: "var(--bg-alt)",
          overflow: "hidden",
        }}>
          {/* Dirigeant header */}
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              background: "var(--bg)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              ...M, fontSize: 13, color: "var(--fg)",
            }}>
              {d.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{d.name}</div>
              <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
                {d.role}{d.age ? ` · ${d.age} ans` : ""}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {unlockedIdx.has(i) ? (
              /* Unlocked state */
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, ...S, fontSize: 12, color: "var(--fg)" }}>
                  <Mail size={12} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                  <span style={{ color: "#2563EB" }}>
                    {d.name.toLowerCase().replace(/\s+/g, ".")}@{/* placeholder */}entreprise.fr
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, ...S, fontSize: 12, color: "var(--fg)" }}>
                  <Phone size={12} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                  <span>+33 6 •• •• •• ••</span>
                </div>
              </>
            ) : (
              /* Locked state */
              <button
                onClick={() => handleUnlock(i)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "8px 16px", width: "100%",
                  background: "var(--primary)", border: "none", cursor: "pointer",
                  color: "var(--primary-fg)",
                  ...S, fontSize: 12, fontWeight: 500,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <Lock size={12} />
                Unlock Contact — 1 crédit
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Confirm modal */}
      <AnimatePresence>
        {pendingIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
            }}
            onClick={() => setPendingIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--bg-raise)", border: "1px solid var(--border)",
                padding: "28px 32px", width: 340,
                display: "flex", flexDirection: "column", gap: 20,
              }}
            >
              <div>
                <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>
                  UNLOCK CONTACT
                </div>
                <div style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
                  Révéler les coordonnées
                </div>
                <div style={{ ...S, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  Cela va consommer <strong style={{ color: "var(--fg)" }}>1 Contact Credit</strong>.
                  Il vous restera <strong style={{ color: credits > 10 ? "var(--up)" : "var(--signal)" }}>{credits - 1} crédits</strong>.
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPendingIdx(null)}
                  style={{
                    flex: 1, padding: "9px 0", background: "transparent",
                    border: "1px solid var(--border)", cursor: "pointer",
                    ...S, fontSize: 13, color: "var(--fg-muted)",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmUnlock}
                  disabled={credits <= 0}
                  style={{
                    flex: 2, padding: "9px 0", background: "var(--primary)",
                    border: "none", cursor: credits > 0 ? "pointer" : "not-allowed",
                    ...S, fontSize: 13, fontWeight: 500, color: "var(--primary-fg)",
                    opacity: credits <= 0 ? 0.5 : 1,
                  }}
                >
                  Continuer · 1 crédit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Financials Tab ─────────────────────────────────────────────────────────────

function FinancialsTab({ financials, revenue }: {
  financials?: { revenue?: string; ebitda?: string; ebitda_margin?: string; revenue_growth?: string; effectif?: number; last_published_year?: number } | null;
  revenue?: string;
}) {
  const rows = [
    { label: "Chiffre d'affaires", value: financials?.revenue ?? revenue ?? "—" },
    { label: "EBITDA",             value: financials?.ebitda ?? "—" },
    { label: "Marge EBITDA",       value: financials?.ebitda_margin ?? "—" },
    { label: "Croissance CA",      value: financials?.revenue_growth ?? "—" },
    { label: "Effectif",           value: financials?.effectif ? String(financials.effectif) : "—" },
    { label: "Dernière publi.",    value: financials?.last_published_year ? String(financials.last_published_year) : "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid var(--border)" }}>
      {rows.map(({ label, value }) => (
        <div key={label} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
            {label.toUpperCase()}
          </span>
          <span style={{ ...M, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Match Score Block ──────────────────────────────────────────────────────────

function extractKeywords(company: SearchCompany): string[] {
  const raw = [company.sector, company.description, company.signal, company.city]
    .filter(Boolean).join(" ");
  const stopWords = new Set(["pour", "dans", "avec", "les", "des", "par", "sur", "une", "and", "the", "that", "this", "from"]);
  return [...new Set(
    raw.split(/[\s·,.\-/()]+/)
      .map(w => w.toLowerCase().replace(/[^a-zàâéèêëîïôùûüç]/g, ""))
      .filter(w => w.length >= 4 && !stopWords.has(w))
  )].slice(0, 6);
}

function MatchScoreBlock({ company }: { company: SearchCompany }) {
  const score    = company.score ?? 0;
  const level    = score >= 75 ? 3 : score >= 50 ? 2 : 1;
  const label    = level === 3 ? "HIGH" : level === 2 ? "MEDIUM" : "LOW";
  const barColor = level === 3 ? "#2563EB" : level === 2 ? "var(--fg-muted)" : "var(--signal)";
  const keywords = extractKeywords(company);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Matching keywords */}
      {keywords.length > 0 && (
        <div>
          <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>
            MATCHING KEYWORDS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {keywords.map(kw => (
              <span key={kw} style={{
                ...S, fontSize: 11, padding: "3px 9px",
                background: "var(--bg-alt)",
                border: "1px solid var(--border)",
                color: "var(--fg)", letterSpacing: "0.02em",
              }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match score bars */}
      <div>
        <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 10 }}>
          MATCH SCORE
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          {/* 3 vertical bars — height grows with score */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
            {[{ h: 10, idx: 1 }, { h: 14, idx: 2 }, { h: 18, idx: 3 }].map(({ h, idx }) => (
              <div key={idx} style={{
                width: 5, height: h,
                background: idx <= level ? barColor : "var(--bg-alt)",
                border: `1px solid ${idx <= level ? barColor : "var(--border)"}`,
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <span style={{
            ...M, fontSize: 11, fontWeight: 700,
            color: barColor, letterSpacing: "0.08em",
          }}>
            {label}
          </span>
          <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", marginLeft: 4 }}>
            {score}/100
          </span>
        </div>
      </div>
    </div>
  );
}

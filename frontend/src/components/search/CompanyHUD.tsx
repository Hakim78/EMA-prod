"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Linkedin, MapPin, Users, Calendar, Building2, Tag } from "lucide-react";
import type { SearchCompany } from "@/types/search";
import type { Target } from "@/types/index";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const TABS = ["Summary", "Funding", "Portfolio", "People", "Financials"] as const;
type Tab = typeof TABS[number];

const COUNTRY_FLAGS: Record<string, string> = { France: "🇫🇷", Germany: "🇩🇪", UK: "🇬🇧", Spain: "🇪🇸", Italy: "🇮🇹" };

interface Props {
  company: SearchCompany;
  onClose: () => void;
}

export default function CompanyHUD({ company, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("Summary");
  const [target, setTarget] = useState<Target | null>(null);
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

  const data = target ?? company;
  const employees = target?.financials?.effectif ?? company.employees;
  const revenue   = target?.financials?.revenue   ?? company.revenue;
  const signals   = target?.topSignals ?? [];
  const dirigeants = target?.dirigeants ?? [];
  const financials = target?.financials;

  return (
    <AnimatePresence>
      <motion.div
        key="hud-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 40,
        }}
      />
      <motion.div
        key="hud-panel"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 420,
          background: "var(--bg-raise)",
          borderLeft: "1px solid var(--border)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 0",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            {/* Logo */}
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
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
                {company.website && (
                  <a href={`https://${company.website}`} target="_blank" rel="noreferrer"
                    style={{ ...S, fontSize: 11, color: "var(--primary)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                    <Globe size={11} /> {company.website}
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
              width: 28, height: 28, flexShrink: 0,
              background: "transparent", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-muted)",
            }}>
              <X size={13} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                ...S, fontSize: 12,
                padding: "8px 14px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${tab === t ? "var(--fg)" : "transparent"}`,
                color: tab === t ? "var(--fg)" : "var(--fg-muted)",
                cursor: "pointer",
                transition: "color 0.1s",
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {fetching && (
            <div style={{ ...M, fontSize: 10, color: "var(--fg-dim)", marginBottom: 16 }}>Chargement…</div>
          )}

          {tab === "Summary" && (
            <SummaryTab company={company} employees={employees} revenue={revenue} signals={signals} />
          )}
          {tab === "People" && (
            <PeopleTab dirigeants={dirigeants} />
          )}
          {tab === "Financials" && (
            <FinancialsTab financials={financials} revenue={revenue} />
          )}
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

function SummaryTab({ company, employees, revenue, signals }: {
  company: SearchCompany;
  employees?: string | number;
  revenue?: string;
  signals: Array<{ label: string; dimension?: string }>;
}) {
  const S2: React.CSSProperties = { fontFamily: "Inter, sans-serif" };
  const M2: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  const COUNTRY_FLAGS2: Record<string, string> = { France: "🇫🇷", Germany: "🇩🇪", UK: "🇬🇧" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Description */}
      <p style={{ ...S2, fontSize: 13, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>
        {company.description || "Aucune description disponible."}
      </p>

      {/* Stats grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 1, border: "1px solid var(--border)",
      }}>
        {[
          { icon: <Users size={12} />, label: "Effectif",   value: employees ? String(employees) : "—" },
          { icon: <Calendar size={12} />, label: "Création", value: company.founded ? new Date(company.founded).getFullYear().toString() : "—" },
          { icon: <Building2 size={12} />, label: "Structure", value: company.structure ?? "—" },
          { icon: <Tag size={12} />, label: "Secteur",    value: company.sector ?? "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{
            padding: "12px 14px",
            background: "var(--bg-alt)",
            borderRight: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--fg-muted)" }}>
              {icon}
              <span style={{ ...M2, fontSize: 9, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
            </div>
            <span style={{ ...S2, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Revenue */}
      {revenue && (
        <div style={{ padding: "12px 14px", border: "1px solid var(--border)", background: "var(--bg-alt)" }}>
          <div style={{ ...M2, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>CHIFFRE D'AFFAIRES</div>
          <span style={{ ...S2, fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{revenue}</span>
        </div>
      )}

      {/* Score */}
      {company.score != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...M2, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em" }}>SCORE M&A</span>
          <div style={{
            height: 6, flex: 1,
            background: "var(--bg-alt)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${company.score}%`,
              background: company.score >= 80 ? "var(--up)" : company.score >= 60 ? "var(--fg)" : "var(--fg-muted)",
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{ ...M2, fontSize: 12, fontWeight: 700, color: "var(--fg)" }}>{company.score}</span>
        </div>
      )}

      {/* Matching keywords (signals) */}
      {signals.length > 0 && (
        <div>
          <div style={{ ...M2, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.08em", marginBottom: 8 }}>
            SIGNAUX DÉTECTÉS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {signals.map((s, i) => (
              <span key={i} style={{
                ...M2, fontSize: 10,
                padding: "3px 10px",
                background: "var(--signal)",
                color: "var(--primary-fg)",
              }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Country */}
      {company.country && (
        <div style={{ ...S2, fontSize: 12, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={11} />
          {COUNTRY_FLAGS2[company.country] ?? ""} {company.country}
          {company.city ? ` · ${company.city}` : ""}
        </div>
      )}
    </div>
  );
}

function PeopleTab({ dirigeants }: { dirigeants: Array<{ name: string; role: string; age?: number; since?: string }> }) {
  const S2: React.CSSProperties = { fontFamily: "Inter, sans-serif" };
  const M2: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

  if (!dirigeants.length) return (
    <div style={{ ...S2, fontSize: 13, color: "var(--fg-muted)" }}>Aucun dirigeant disponible.</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {dirigeants.map((d, i) => (
        <div key={i} style={{
          padding: "12px 14px",
          border: "1px solid var(--border)",
          background: "var(--bg-alt)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: "var(--bg)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            ...M2, fontSize: 13, color: "var(--fg)",
          }}>
            {d.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ ...S2, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{d.name}</div>
            <div style={{ ...S2, fontSize: 11, color: "var(--fg-muted)" }}>
              {d.role}{d.age ? ` · ${d.age} ans` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialsTab({ financials, revenue }: {
  financials?: { revenue?: string; ebitda?: string; ebitda_margin?: string; revenue_growth?: string; effectif?: number; last_published_year?: number } | null;
  revenue?: string;
}) {
  const S2: React.CSSProperties = { fontFamily: "Inter, sans-serif" };
  const M2: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

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
          padding: "10px 14px",
          background: "var(--bg-alt)",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ ...M2, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
            {label.toUpperCase()}
          </span>
          <span style={{ ...S2, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

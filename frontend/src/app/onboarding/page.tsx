"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Target, List, Check, ChevronRight, ArrowRight,
  Database, Zap, TrendingUp, Chrome,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const CHECKLIST = [
  { id: "thesis", label: "Définir votre thèse",  sub: "Active le scoring IA",        href: "/settings/thesis"       },
  { id: "crm",    label: "Connecter votre CRM",   sub: "Évite les doublons pipeline", href: "/settings/integrations" },
  { id: "li",     label: "Sync LinkedIn",          sub: "Active le warm sourcing",     href: "/settings/integrations" },
  { id: "team",   label: "Inviter l'équipe",       sub: "Collaboration & alertes",     href: "/settings/team"         },
];

const STATS = [
  { Icon: Database,   value: "16.2M", label: "entreprises indexées"     },
  { Icon: Zap,        value: "24K+",  label: "signaux BODACC / mois"    },
  { Icon: TrendingUp, value: "Actif", label: "scoring IA en temps réel" },
];

export default function GettingStartedHub() {
  const router = useRouter();
  const [query, setQuery]   = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(CHECKLIST.map(c => [c.id, false]))
  );

  const done  = Object.values(checked).filter(Boolean).length;
  const total = CHECKLIST.length;
  const pct   = Math.round((done / total) * 100);

  const goTo = (href: string) => {
    if (typeof window !== "undefined") localStorage.setItem("ema_onboarding_done", "1");
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("ema_onboarding_done", "1");
      if (query.trim()) sessionStorage.setItem("ema_prefill_query", query.trim());
    }
    router.push("/");
  };

  return (
    <>
      {/* ─── Global responsive + animation styles ─── */}
      <style>{`
        /* ── Bento grid ─────────────────────────────── */
        .hub-bento {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 768px) {
          .hub-bento {
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: 272px 232px;
          }
          .bc-lookalike  { grid-column: span 2; grid-row: 1; }
          .bc-linkedin   { grid-column: span 1; grid-row: 1; }
          .bc-pipeline   { grid-column: span 1; grid-row: 2; }
          .bc-checklist  { grid-column: span 2; grid-row: 2; }

          .checklist-items { grid-template-columns: 1fr 1fr !important; }
        }

        /* ── Bento card hover ───────────────────────── */
        .bento-card { position: relative; overflow: hidden; cursor: pointer; min-height: 220px; }
        .bc-bg      { position: absolute; inset: 0; transition: transform 1000ms ease; }
        .bento-card:hover .bc-bg { transform: scale(1.06); }

        /* ── Animated gradient (Lookalike card) ──────── */
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ── Floating orbs ───────────────────────────── */
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0)      scale(1);    opacity: 0.45; }
          33%       { transform: translate(28px,-36px) scale(1.1); opacity: 0.65; }
          66%       { transform: translate(-18px,18px) scale(0.94); opacity: 0.38; }
        }

        /* ── Shimmer sweep ───────────────────────────── */
        @keyframes shimmerSweep {
          0%   { left: -80%; }
          100% { left: 180%; }
        }

        /* ── Progress bar ────────────────────────────── */
        .pb-fill { transition: width 0.5s cubic-bezier(.4,0,.2,1); }

        /* ── Mobile tweaks ───────────────────────────── */
        @media (max-width: 767px) {
          .hub-hero h1           { font-size: 21px !important; }
          .hub-search            { max-width: 100% !important; }
          .hub-footer            { flex-direction: column; gap: 14px; }
          .hub-footer-stats      { flex-wrap: wrap; gap: 12px 20px; }
        }
      `}</style>

      <div style={{ minHeight: "100dvh", background: "#F7F7F7", display: "flex", flexDirection: "column", ...S }}>

        {/* ══════════ HEADER ══════════ */}
        <header style={{
          height: 48, background: "#fff", borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", flexShrink: 0,
        }}>
          <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
            EdRCF <span style={{ color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
          </span>
          <button
            onClick={() => goTo("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "#9CA3AF",
              background: "transparent", border: "none", cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
          >
            Passer au Dashboard <ArrowRight size={12} />
          </button>
        </header>

        {/* ══════════ MAIN ══════════ */}
        <main style={{ flex: 1, padding: "40px 20px 0", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

          {/* ── ZONE 1 : HERO SEARCH ── */}
          <section className="hub-hero" style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.16em", marginBottom: 12 }}>
              BIENVENUE SUR EdRCF 6.0
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: "#111827",
              margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.2,
            }}>
              Que souhaitez-vous sourcer aujourd'hui ?
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 24px", lineHeight: 1.6 }}>
              Décrivez votre cible idéale — secteur, taille, région, signal.
            </p>

            <form
              className="hub-search"
              onSubmit={handleSearch}
              style={{
                maxWidth: 620, margin: "0 auto",
                display: "flex",
                border: "1px solid #E5E7EB", background: "#fff",
                transition: "border-color .15s, box-shadow .15s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(17,24,39,.06)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, flexShrink: 0 }}>
                <Search size={15} style={{ color: "#9CA3AF" }} />
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="PME industrielle Bretagne, CA > 5M€, fondateur cédant…"
                style={{
                  flex: 1, padding: "13px 12px", fontSize: 13,
                  color: "#111827", background: "transparent",
                  border: "none", outline: "none", ...S,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 20px", background: "#111827",
                  border: "none", color: "#fff",
                  fontSize: 12, fontWeight: 600,
                  cursor: "pointer", flexShrink: 0,
                  transition: "opacity .1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Rechercher
              </button>
            </form>
            <p style={{ ...M, fontSize: 9, color: "#D1D5DB", marginTop: 9, letterSpacing: "0.08em" }}>
              ENTRÉE · SHIFT+ENTRÉE POUR MULTILIGNE DANS LE COPILOT
            </p>
          </section>

          {/* ── ZONES 2+3 : BENTO GRID ── */}
          <div className="hub-bento">

            {/* ── CARD 1 : LOOKALIKE (large, 2 cols) ─────────────────────────── */}
            <div className="bento-card bc-lookalike" onClick={() => goTo("/?mode=lookalike")}>

              {/* Animated dark gradient bg */}
              <div className="bc-bg" style={{
                background: "linear-gradient(135deg, #060612 0%, #0d1b2a 45%, #0a0a18 100%)",
                backgroundSize: "200% 200%",
                animation: "gradShift 9s ease infinite",
              }} />

              {/* Dot grid overlay */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
              }} />

              {/* Orbs */}
              <div style={{
                position: "absolute", top: "12%", right: "14%",
                width: 210, height: 210,
                background: "radial-gradient(circle, rgba(99,102,241,.22) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 8s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", bottom: "8%", left: "6%",
                width: 130, height: 130,
                background: "radial-gradient(circle, rgba(59,130,246,.18) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 11s ease-in-out infinite reverse",
              }} />

              {/* Bottom gradient */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.38) 55%, transparent 100%)",
              }} />

              {/* Content */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 26px 24px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36,
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.06)",
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Target size={15} style={{ color: "#E5E7EB" }} />
                </div>

                <div>
                  <div style={{ ...M, fontSize: 9, color: "rgba(255,255,255,.4)", letterSpacing: "0.12em", marginBottom: 7 }}>
                    INTELLIGENCE ARTIFICIELLE · 16M+ SOCIÉTÉS
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>
                    Lookalike Search
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.52)", lineHeight: 1.65, maxWidth: 420 }}>
                    Entrez l'URL ou le nom d'une entreprise cible.
                    L'IA trouve des clones structurels parmi 16 millions de sociétés en temps réel.
                  </div>
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  ...M, fontSize: 10, color: "rgba(255,255,255,.65)", letterSpacing: "0.05em",
                  marginTop: 2,
                }}>
                  LANCER UN LOOKALIKE <ChevronRight size={11} />
                </div>
              </div>
            </div>

            {/* ── CARD 2 : LINKEDIN WARM SOURCING (1 col) ─────────────────────── */}
            <div
              className="bento-card bc-linkedin"
              onClick={() => typeof window !== "undefined" && window.open("https://chrome.google.com/webstore", "_blank")}
            >
              {/* LinkedIn blue gradient */}
              <div className="bc-bg" style={{
                background: "linear-gradient(160deg, #0077b5 0%, #00538a 38%, #001e3c 100%)",
              }} />

              {/* Dot pattern */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,.09) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />

              {/* Shimmer bar (top edge) */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, width: "60%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)",
                  animation: "shimmerSweep 3.2s ease-in-out infinite",
                }} />
              </div>

              {/* Recommended badge */}
              <div style={{
                position: "absolute", top: 14, right: 14,
                background: "#F59E0B", color: "#1a0800",
                ...M, fontSize: 8, letterSpacing: "0.1em", fontWeight: 700,
                padding: "3px 9px",
              }}>
                RECOMMANDÉ
              </div>

              {/* Bottom overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,10,28,.88) 0%, transparent 58%)",
              }} />

              {/* Content */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>
                  LinkedIn<br />Warm Sourcing
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.58)", lineHeight: 1.65, marginBottom: 14 }}>
                  Révélez vos connexions communes avec les dirigeants des cibles.
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (typeof window !== "undefined") window.open("https://chrome.google.com/webstore", "_blank");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "rgba(255,255,255,.12)",
                    border: "1px solid rgba(255,255,255,.28)",
                    backdropFilter: "blur(10px)",
                    color: "#fff", fontSize: 11, fontWeight: 600,
                    padding: "7px 13px", cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.12)")}
                >
                  <Chrome size={12} /> Installer l'extension Chrome
                </button>
              </div>
            </div>

            {/* ── CARD 3 : PIPELINE (1 col, row 2) ────────────────────────────── */}
            <div className="bento-card bc-pipeline" onClick={() => goTo("/pipeline")}>

              {/* Dark charcoal bg */}
              <div className="bc-bg" style={{
                background: "linear-gradient(135deg, #111827 0%, #1c2535 55%, #111827 100%)",
              }} />

              {/* Grid lines */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: [
                  "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)",
                  "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
                ].join(", "),
                backgroundSize: "32px 32px",
              }} />

              {/* Green orb */}
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 160, height: 160,
                background: "radial-gradient(circle, rgba(16,185,129,.16) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 10s ease-in-out infinite",
              }} />

              {/* Overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)",
              }} />

              {/* "Saved" badge */}
              <div style={{
                position: "absolute", top: 14, left: 14,
                background: "rgba(16,185,129,.14)",
                border: "1px solid rgba(16,185,129,.3)",
                ...M, fontSize: 8, color: "#34D399", letterSpacing: "0.08em",
                padding: "3px 9px",
              }}>
                14 CIBLES SAUVEGARDÉES
              </div>

              {/* Content */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
                <div style={{
                  width: 30, height: 30, marginBottom: 10,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <List size={13} style={{ color: "#D1D5DB" }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Mon Pipeline</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
                  Gérez vos listes et exportez vers votre CRM.
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  ...M, fontSize: 10, color: "rgba(255,255,255,.48)", letterSpacing: "0.05em",
                  marginTop: 10,
                }}>
                  VOIR LE PIPELINE <ChevronRight size={10} />
                </div>
              </div>
            </div>

            {/* ── CARD 4 : SETUP CHECKLIST (2 cols, row 2) ────────────────────── */}
            <div className="bc-checklist" style={{
              background: "#fff", border: "1px solid #E5E7EB",
              padding: "20px 24px", display: "flex", flexDirection: "column",
            }}>
              {/* Header + progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8,
                }}>
                  <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em" }}>
                    DÉBLOQUEZ TOUT LE POTENTIEL
                  </div>
                  <span style={{ ...M, fontSize: 10, color: pct === 100 ? "#10B981" : "#9CA3AF" }}>
                    {done}/{total} · {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: "#F3F4F6", overflow: "hidden" }}>
                  <div
                    className="pb-fill"
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct === 100
                        ? "#10B981"
                        : "linear-gradient(90deg, #111827 0%, #374151 100%)",
                    }}
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div
                className="checklist-items"
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2px 28px", flex: 1 }}
              >
                {CHECKLIST.map((item, i) => {
                  const isDone = checked[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 11,
                        padding: "9px 0",
                        borderBottom: "1px solid #F9FAFB",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Circle tick */}
                      <div style={{
                        width: 20, height: 20, flexShrink: 0, borderRadius: "50%",
                        border: `1.5px solid ${isDone ? "#10B981" : "#D1D5DB"}`,
                        background: isDone ? "#10B981" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .2s",
                      }}>
                        {isDone && <Check size={10} style={{ color: "#fff" }} />}
                      </div>

                      {/* Label */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 500,
                          color: isDone ? "#9CA3AF" : "#374151",
                          textDecoration: isDone ? "line-through" : "none",
                        }}>
                          {item.label}
                        </div>
                        {!isDone && (
                          <div style={{ ...M, fontSize: 9, color: "#9CA3AF", marginTop: 2, letterSpacing: "0.04em" }}>
                            {item.sub}
                          </div>
                        )}
                      </div>

                      {/* Config button */}
                      {!isDone && (
                        <button
                          onClick={e => { e.stopPropagation(); goTo(item.href); }}
                          style={{
                            ...M, fontSize: 9, color: "#374151", padding: "2px 8px",
                            border: "1px solid #E5E7EB", background: "transparent",
                            cursor: "pointer", letterSpacing: "0.04em", flexShrink: 0,
                            transition: "all .1s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "#374151")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
                        >
                          Config
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── ZONE 4 : FOOTER STATS ── */}
          <footer
            className="hub-footer"
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderTop: "1px solid #E5E7EB", padding: "18px 0 28px", marginTop: 20,
            }}
          >
            <div className="hub-footer-stats" style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {STATS.map(({ Icon, value, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ ...M, fontSize: 13, fontWeight: 700, color: "#111827" }}>{value}</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => goTo("/")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#9CA3AF", background: "transparent",
                border: "1px solid #E5E7EB", padding: "6px 14px",
                cursor: "pointer", transition: "all .1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#9CA3AF"; }}
            >
              Accéder au Dashboard <ArrowRight size={12} />
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Target, Check, ChevronRight, ArrowRight,
  Database, Zap, TrendingUp, Chrome,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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

/* ─── Shared radius token ─── */
const R = 20;

export default function GettingStartedHub() {
  const router = useRouter();
  const [query, setQuery]     = useState("");
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
      <style>{`
        /* ─── Page background mesh (makes glass visible) ─── */
        html, body { height: auto; overflow-y: auto; }
        .hub-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse at 15% 40%, rgba(139,92,246,.10) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(59,130,246,.09) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 85%, rgba(16,185,129,.07) 0%, transparent 48%),
            #dfe3ec;
        }

        /* ─── Glassmorphism header ─── */
        .hub-header {
          height: 52px;
          background: rgba(255,255,255,0.58);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        /* ─── Bento grid ─── */
        .hub-bento {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 640px) {
          .hub-bento {
            grid-template-columns: 1fr 1fr;
          }
          .bc-lookalike  { grid-column: span 2; }
          .bc-checklist  { grid-column: span 2; }
        }
        @media (min-width: 960px) {
          .hub-bento {
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: 280px 230px;
          }
          .bc-lookalike  { grid-column: span 2; grid-row: 1; }
          .bc-linkedin   { grid-column: span 1; grid-row: 1; }
          .bc-pipeline   { grid-column: span 1; grid-row: 2; }
          .bc-checklist  { grid-column: span 2; grid-row: 2; }
          .checklist-items { grid-template-columns: 1fr 1fr !important; }
        }

        /* ─── Dark bento card base ─── */
        .bento-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          min-height: 200px;
          border-radius: ${R}px;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow:
            0 20px 48px rgba(0,0,0,0.22),
            0 4px 12px rgba(0,0,0,0.12),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform 0.32s cubic-bezier(.22,.68,0,1.2), box-shadow 0.32s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px) scale(1.005);
          box-shadow:
            0 32px 72px rgba(0,0,0,0.30),
            0 8px 20px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .bc-bg {
          position: absolute; inset: 0;
          transition: transform 1100ms ease;
        }
        .bento-card:hover .bc-bg { transform: scale(1.07); }

        /* ─── Glass checklist card ─── */
        .bc-checklist {
          border-radius: ${R}px;
          background: rgba(255,255,255,0.60);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.82);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.07),
            0 2px 8px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.95);
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
        }

        /* ─── Floating orbs ─── */
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); opacity:.45; }
          33%      { transform: translate(26px,-34px) scale(1.08); opacity:.62; }
          66%      { transform: translate(-16px,18px) scale(.94); opacity:.36; }
        }

        /* ─── Animated gradient ─── */
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ─── Shimmer sweep ─── */
        @keyframes shimmerSweep {
          0%   { left: -80%; }
          100% { left: 200%; }
        }

        /* ─── Progress bar ─── */
        .pb-fill { transition: width .55s cubic-bezier(.4,0,.2,1); }

        /* ─── Search bar ─── */
        .hub-search {
          max-width: 620px;
          margin: 0 auto;
          display: flex;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.88);
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
          transition: box-shadow .2s, border-color .2s;
        }
        .hub-search:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 0 0 3px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        /* ─── Mobile tweaks ─── */
        @media (max-width: 639px) {
          .hub-main     { padding: 28px 14px 0 !important; }
          .hub-hero h1  { font-size: 20px !important; }
          .hub-search   { max-width: 100% !important; }
          .hub-footer   { flex-direction: column !important; gap: 14px !important; }
          .hub-footer-stats { flex-wrap: wrap; gap: 10px 18px; }
          .bento-card   { min-height: 190px; }
        }
      `}</style>

      <div className="hub-page" style={{ ...S }}>

        {/* ══ HEADER ══ */}
        <header className="hub-header">
          <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
            EdRCF <span style={{ color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
          </span>
          <button
            onClick={() => goTo("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "#6B7280",
              background: "transparent", border: "none", cursor: "pointer",
              transition: "color .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}
          >
            Passer au Dashboard <ArrowRight size={12} />
          </button>
        </header>

        {/* ══ MAIN ══ */}
        <main className="hub-main" style={{ flex: 1, padding: "44px 24px 0", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

          {/* ── ZONE 1 : HERO SEARCH ── */}
          <section className="hub-hero" style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.18em", marginBottom: 14 }}>
              BIENVENUE SUR EdRCF 6.0
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 700, color: "#111827",
              margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              Que souhaitez-vous sourcer aujourd'hui ?
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 28px", lineHeight: 1.6 }}>
              Décrivez votre cible idéale — secteur, taille, région, signal.
            </p>

            <form className="hub-search" onSubmit={handleSearch}>
              <div style={{ display: "flex", alignItems: "center", paddingLeft: 16, flexShrink: 0 }}>
                <Search size={15} style={{ color: "#9CA3AF" }} />
              </div>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="PME industrielle Bretagne, CA > 5M€, fondateur cédant…"
                style={{
                  flex: 1, padding: "14px 12px", fontSize: 13,
                  color: "#111827", background: "transparent",
                  border: "none", outline: "none", ...S,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 22px", background: "#111827",
                  border: "none", color: "#fff",
                  fontSize: 12, fontWeight: 600,
                  cursor: "pointer", flexShrink: 0,
                  transition: "opacity .12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.80")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Rechercher
              </button>
            </form>

            <p style={{ ...M, fontSize: 9, color: "#C4C9D4", marginTop: 10, letterSpacing: "0.08em" }}>
              ENTRÉE · SHIFT+ENTRÉE POUR MULTILIGNE DANS LE COPILOT
            </p>
          </section>

          {/* ── ZONES 2+3 : BENTO GRID ── */}
          <div className="hub-bento">

            {/* ── CARD 1 : LOOKALIKE (2 cols) ── */}
            <div className="bento-card bc-lookalike" onClick={() => goTo("/?mode=lookalike")}>
              {/* Animated dark gradient */}
              <div className="bc-bg" style={{
                background: "linear-gradient(135deg, #06061a 0%, #0d1b2e 45%, #08081c 100%)",
                backgroundSize: "200% 200%",
                animation: "gradShift 10s ease infinite",
              }} />

              {/* Dot grid */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }} />

              {/* Orbs */}
              <div style={{
                position: "absolute", top: "10%", right: "12%",
                width: 220, height: 220,
                background: "radial-gradient(circle, rgba(99,102,241,.24) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 8s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute", bottom: "5%", left: "5%",
                width: 140, height: 140,
                background: "radial-gradient(circle, rgba(59,130,246,.18) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 12s ease-in-out infinite reverse",
              }} />

              {/* Glass top bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              }} />

              {/* Bottom scrim */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,.94) 0%, rgba(0,0,0,.35) 55%, transparent 100%)",
              }} />

              {/* Content */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "0 26px 26px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Icon chip — glassmorphism */}
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.08)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Target size={17} style={{ color: "#E0E7FF" }} />
                </div>

                <div>
                  <div style={{ ...M, fontSize: 9, color: "rgba(255,255,255,.38)", letterSpacing: "0.14em", marginBottom: 7 }}>
                    INTELLIGENCE ARTIFICIELLE · 16M+ SOCIÉTÉS
                  </div>
                  <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", marginBottom: 7, lineHeight: 1.2 }}>
                    Lookalike Search
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.50)", lineHeight: 1.7, maxWidth: 440 }}>
                    Entrez l'URL ou le nom d'une entreprise cible.
                    L'IA trouve des clones structurels parmi 16 millions de sociétés en temps réel.
                  </div>
                </div>

                {/* CTA chip */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,.08)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,.14)",
                  borderRadius: 8, padding: "5px 12px",
                  ...M, fontSize: 10, color: "rgba(255,255,255,.72)", letterSpacing: "0.05em",
                  marginTop: 4, width: "fit-content",
                  transition: "background .15s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
                >
                  LANCER UN LOOKALIKE <ChevronRight size={11} />
                </div>
              </div>
            </div>

            {/* ── CARD 2 : LINKEDIN (1 col) ── */}
            <div
              className="bento-card bc-linkedin"
              onClick={() => typeof window !== "undefined" && window.open("https://chrome.google.com/webstore", "_blank")}
            >
              {/* LinkedIn gradient */}
              <div className="bc-bg" style={{
                background: "linear-gradient(155deg, #006097 0%, #004780 38%, #001830 100%)",
              }} />

              {/* Mesh dots */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }} />

              {/* Shimmer top edge */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, overflow: "hidden", borderRadius: `${R}px ${R}px 0 0` }}>
                <div style={{
                  position: "absolute", top: 0, width: "55%", height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)",
                  animation: "shimmerSweep 3.4s ease-in-out infinite",
                }} />
              </div>

              {/* Recommended badge — glass pill */}
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(245,158,11,.9)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "#1a0800",
                ...M, fontSize: 8, letterSpacing: "0.10em", fontWeight: 700,
                padding: "4px 10px", borderRadius: 6,
              }}>
                RECOMMANDÉ
              </div>

              {/* Bottom scrim */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,8,24,.90) 0%, transparent 60%)",
              }} />

              {/* Content */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 7, lineHeight: 1.3 }}>
                  LinkedIn<br />Warm Sourcing
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", lineHeight: 1.65, marginBottom: 16 }}>
                  Révélez vos connexions communes avec les dirigeants des cibles.
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (typeof window !== "undefined") window.open("https://chrome.google.com/webstore", "_blank");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,.11)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,.26)",
                    borderRadius: 10,
                    color: "#fff", fontSize: 11, fontWeight: 600,
                    padding: "8px 14px", cursor: "pointer",
                    transition: "background .15s, border-color .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.20)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.40)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.11)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.26)"; }}
                >
                  <Chrome size={13} /> Installer l'extension Chrome
                </button>
              </div>
            </div>

            {/* ── CARD 3 : PIPELINE (1 col, row 2) ── */}
            <div className="bento-card bc-pipeline" onClick={() => goTo("/pipeline")}>
              {/* Charcoal bg */}
              <div className="bc-bg" style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)",
              }} />

              {/* Grid lines */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: [
                  "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)",
                  "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
                ].join(", "),
                backgroundSize: "30px 30px",
              }} />

              {/* Emerald orb */}
              <div style={{
                position: "absolute", top: -50, right: -50,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(16,185,129,.18) 0%, transparent 70%)",
                borderRadius: "50%", animation: "orbFloat 11s ease-in-out infinite",
              }} />

              {/* Saved badge */}
              <div style={{
                position: "absolute", top: 16, left: 16,
                background: "rgba(16,185,129,.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(16,185,129,.28)",
                borderRadius: 7,
                ...M, fontSize: 8, color: "#34D399", letterSpacing: "0.08em",
                padding: "4px 10px",
              }}>
                14 CIBLES SAUVEGARDÉES
              </div>

              {/* Scrim */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,.78) 0%, transparent 55%)",
              }} />

              {/* Content */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 22px" }}>
                <div style={{ width: 64, height: 64, marginBottom: 4, flexShrink: 0 }}>
                  <DotLottieReact
                    src="https://lottie.host/5d2b20c9-2741-4270-af29-7c669d5878c5/VHODzIsBRa.lottie"
                    loop
                    autoplay
                  />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Mon Pipeline</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.48)", lineHeight: 1.65 }}>
                  Gérez vos listes et exportez vers votre CRM.
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  ...M, fontSize: 10, color: "rgba(255,255,255,.45)", letterSpacing: "0.05em",
                  marginTop: 10,
                }}>
                  VOIR LE PIPELINE <ChevronRight size={10} />
                </div>
              </div>
            </div>

            {/* ── CARD 4 : CHECKLIST — Glassmorphism (2 cols, row 2) ── */}
            <div className="bc-checklist">
              {/* Header + progress */}
              <div style={{ marginBottom: 14 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10,
                }}>
                  <div style={{ ...M, fontSize: 9, color: "#6B7280", letterSpacing: "0.12em" }}>
                    DÉBLOQUEZ TOUT LE POTENTIEL
                  </div>
                  <span style={{ ...M, fontSize: 10, color: pct === 100 ? "#10B981" : "#9CA3AF" }}>
                    {done}/{total} · {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: "rgba(0,0,0,.08)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    className="pb-fill"
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 4,
                      background: pct === 100
                        ? "#10B981"
                        : "linear-gradient(90deg, #1e293b 0%, #374151 100%)",
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div
                className="checklist-items"
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0 28px", flex: 1 }}
              >
                {CHECKLIST.map((item) => {
                  const isDone = checked[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 8px",
                        borderBottom: "1px solid rgba(0,0,0,.06)",
                        cursor: "pointer", borderRadius: 8,
                        transition: "background .12s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.55)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Circle tick */}
                      <div style={{
                        width: 20, height: 20, flexShrink: 0, borderRadius: "50%",
                        border: `1.5px solid ${isDone ? "#10B981" : "#D1D5DB"}`,
                        background: isDone ? "#10B981" : "rgba(255,255,255,.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all .2s",
                        boxShadow: isDone ? "0 2px 8px rgba(16,185,129,.3)" : "none",
                      }}>
                        {isDone && <Check size={10} style={{ color: "#fff" }} />}
                      </div>

                      {/* Label */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 500,
                          color: isDone ? "#9CA3AF" : "#1f2937",
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

                      {!isDone && (
                        <button
                          onClick={e => { e.stopPropagation(); goTo(item.href); }}
                          style={{
                            ...M, fontSize: 9, color: "#374151", padding: "3px 9px",
                            border: "1px solid rgba(0,0,0,.15)",
                            background: "rgba(255,255,255,.6)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            borderRadius: 6,
                            cursor: "pointer", letterSpacing: "0.04em", flexShrink: 0,
                            transition: "all .12s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.95)"; e.currentTarget.style.borderColor = "#374151"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.6)"; e.currentTarget.style.borderColor = "rgba(0,0,0,.15)"; }}
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
              padding: "20px 0 32px", marginTop: 20,
              borderTop: "1px solid rgba(0,0,0,.10)",
            }}
          >
            <div className="hub-footer-stats" style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {STATS.map(({ Icon, value, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ ...M, fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{value}</span>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>{label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => goTo("/")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#6B7280",
                background: "rgba(255,255,255,.58)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,.80)",
                borderRadius: 10, padding: "7px 16px",
                cursor: "pointer", transition: "all .15s",
                boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.88)"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.58)"; e.currentTarget.style.color = "#6B7280"; }}
            >
              Accéder au Dashboard <ArrowRight size={12} />
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}

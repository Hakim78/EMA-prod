"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, List, Target, Check, ChevronRight, ArrowRight, Database, Zap, TrendingUp } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const CHECKLIST = [
  { id: "thesis", label: "Définir votre thèse",          sub: "Active le scoring IA",           done: false, href: "/settings/thesis" },
  { id: "crm",    label: "Connecter votre CRM",          sub: "Évite les doublons pipeline",    done: false, href: "/settings/integrations" },
  { id: "li",     label: "Sync LinkedIn",                sub: "Active le warm sourcing",         done: false, href: "/settings/integrations" },
  { id: "team",   label: "Inviter l'équipe",             sub: "Collaboration & alertes",         done: false, href: "/settings/team" },
];

const TOOL_CARDS = [
  {
    Icon: Target,
    title: "Lookalike Search",
    desc: "Entrez l'URL ou le nom d'une entreprise cible. L'IA trouve des clones parmi 16M+ sociétés.",
    cta: "Lancer un Lookalike",
    href: "/?mode=lookalike",
  },
  {
    Icon: List,
    title: "Mon Pipeline",
    desc: "Retrouvez vos 14 cibles sauvegardées, gérez vos listes et exportez vers votre CRM.",
    cta: "Voir le Pipeline",
    href: "/pipeline",
  },
];

const STATS = [
  { Icon: Database,   value: "16.2M",   label: "entreprises indexées"    },
  { Icon: Zap,        value: "24K+",    label: "signaux BODACC / mois"   },
  { Icon: TrendingUp, value: "Actif",   label: "scoring IA en temps réel" },
];

export default function GettingStartedHub() {
  const router  = useRouter();
  const [query, setQuery]         = useState("");
  const [checked, setChecked]     = useState<Record<string, boolean>>(
    Object.fromEntries(CHECKLIST.map(c => [c.id, c.done]))
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
    <div style={{ minHeight: "100dvh", background: "#FAFAFA", display: "flex", flexDirection: "column", ...S }}>

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <header style={{
        height: 48, background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", flexShrink: 0,
      }}>
        <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
          EdRCF <span style={{ color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
        </span>
        <button
          onClick={() => goTo("/")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#9CA3AF",
            background: "transparent", border: "none",
            cursor: "pointer", transition: "color 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
        >
          Passer au Dashboard <ArrowRight size={12} />
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          BODY
      ══════════════════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, padding: "48px 40px 0", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* ── ZONE 1 : HERO SEARCH ──────────────────────────────────────────── */}
        <section style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.16em", marginBottom: 14 }}>
            BIENVENUE SUR EdRCF 6.0
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 700, color: "#111827",
            margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.2,
          }}>
            Que souhaitez-vous sourcer aujourd'hui ?
          </h1>
          <p style={{ fontSize: 14, color: "#9CA3AF", margin: "0 0 32px", lineHeight: 1.6 }}>
            Décrivez votre cible idéale — secteur, taille, région, signal.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            style={{
              maxWidth: 620, margin: "0 auto",
              display: "flex", gap: 0,
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={e => {
              const el = e.currentTarget as HTMLFormElement;
              el.style.borderColor = "#111827";
              el.style.boxShadow = "0 0 0 3px rgba(17,24,39,0.06)";
            }}
            onBlur={e => {
              const el = e.currentTarget as HTMLFormElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 16, flexShrink: 0 }}>
              <Search size={16} style={{ color: "#9CA3AF" }} />
            </div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="PME industrielle Bretagne, CA > 5M€, fondateur cédant…"
              style={{
                flex: 1, padding: "14px 14px", fontSize: 14,
                color: "#111827", background: "transparent",
                border: "none", outline: "none",
                ...S,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0 22px", background: "#111827",
                border: "none", color: "#FFFFFF",
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", flexShrink: 0,
                transition: "opacity 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Rechercher
            </button>
          </form>
          <p style={{ ...M, fontSize: 9, color: "#D1D5DB", marginTop: 12, letterSpacing: "0.08em" }}>
            ENTRÉE · SHIFT+ENTRÉE POUR MULTILIGNE DANS LE COPILOT
          </p>
        </section>

        {/* ── ZONES 2 + 3 : SPLIT SCREEN ────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)",
          gap: 24,
          alignItems: "start",
        }}>

          {/* ZONE 2 : OUTILS D'INTELLIGENCE */}
          <section>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 14 }}>
              OUTILS D'INTELLIGENCE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#E5E7EB" }}>
              {TOOL_CARDS.map(({ Icon, title, desc, cta, href }) => (
                <div
                  key={title}
                  onClick={() => goTo(href)}
                  style={{
                    background: "#FFFFFF", padding: "24px",
                    cursor: "pointer", transition: "background 0.1s",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36,
                    background: "#F9FAFB", border: "1px solid #F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={17} style={{ color: "#374151" }} />
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>
                      {title}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>
                      {desc}
                    </div>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    ...M, fontSize: 10, color: "#374151", letterSpacing: "0.04em",
                    marginTop: "auto",
                  }}>
                    {cta} <ChevronRight size={11} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ZONE 3 : SETUP CHECKLIST */}
          <section>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 14 }}>
              DÉBLOQUEZ TOUT LE POTENTIEL
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
              {/* Progress */}
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 8,
                }}>
                  <span style={{ fontSize: 12, color: "#374151" }}>
                    {done} <span style={{ color: "#9CA3AF" }}>/ {total} complétés</span>
                  </span>
                  <span style={{ ...M, fontSize: 10, color: "#9CA3AF" }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: "#F3F4F6" }}>
                  <div style={{
                    height: "100%", background: "#111827",
                    width: `${pct}%`, transition: "width 0.4s ease",
                  }} />
                </div>
              </div>

              {/* Items */}
              {CHECKLIST.map((item, i) => {
                const isDone = checked[item.id];
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 18px",
                      borderBottom: i < CHECKLIST.length - 1 ? "1px solid #F9FAFB" : "none",
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      setChecked(p => ({ ...p, [item.id]: !p[item.id] }));
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, flexShrink: 0,
                      border: `1px solid ${isDone ? "#111827" : "#D1D5DB"}`,
                      background: isDone ? "#111827" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {isDone && <Check size={9} style={{ color: "#fff" }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, color: isDone ? "#9CA3AF" : "#374151",
                        textDecoration: isDone ? "line-through" : "none",
                        fontWeight: 500,
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
                          ...M, fontSize: 9, color: "#374151", padding: "3px 8px",
                          border: "1px solid #E5E7EB", background: "transparent",
                          cursor: "pointer", letterSpacing: "0.04em", flexShrink: 0,
                          transition: "all 0.1s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
                      >
                        Config
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── ZONE 4 : FOOTER STATS ─────────────────────────────────────────── */}
        <footer style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid #E5E7EB",
          padding: "20px 0 32px",
          marginTop: 40,
        }}>
          {STATS.map(({ Icon, value, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon size={13} style={{ color: "#9CA3AF" }} />
              <span style={{ ...M, fontSize: 14, fontWeight: 700, color: "#111827" }}>{value}</span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
          <button
            onClick={() => goTo("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "#9CA3AF", background: "transparent",
              border: "1px solid #E5E7EB", padding: "6px 14px",
              cursor: "pointer", transition: "all 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#111827"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#9CA3AF"; }}
          >
            Accéder au Dashboard <ArrowRight size={12} />
          </button>
        </footer>
      </main>
    </div>
  );
}

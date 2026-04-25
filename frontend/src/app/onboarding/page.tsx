"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Target, Building2, Search as SearchIcon, Briefcase,
  Plug, Users, Chrome, Bookmark, BookmarkCheck,
  Check, ArrowRight, X, Loader2, ChevronDown,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

type UseCase = "pe" | "ma" | "corpdev" | "search" | "other";

interface UseCaseDef {
  id: UseCase;
  Icon: React.ElementType;
  label: string;
}

const USE_CASES: UseCaseDef[] = [
  { id: "pe",      Icon: Briefcase,  label: "Private Equity"        },
  { id: "ma",      Icon: Target,     label: "M&A Advisor"           },
  { id: "corpdev", Icon: Building2,  label: "Corporate Development" },
  { id: "search",  Icon: SearchIcon, label: "Search Fund"           },
  { id: "other",   Icon: Sparkles,   label: "Other"                 },
];

const TEMPLATES: Record<UseCase, { id: string; title: string; query: string }[]> = {
  pe: [
    { id: "1", title: "Industrials FR, founder 60+",  query: "PME industrielle France, fondateur 60+, EBITDA 1-5M€, structure familiale" },
    { id: "2", title: "B2B SaaS EU, PE-backed",       query: "B2B SaaS Europe, ARR 1-10M€, PE-backed, croissance organique" },
    { id: "3", title: "Healthcare, family-owned",     query: "Services santé, familiale, headcount 50-500, France" },
  ],
  ma: [
    { id: "1", title: "Strategic buyers · industrial", query: "Industriels EU, CA > 50M€, croissance externe active" },
    { id: "2", title: "PE acquirers · SaaS",           query: "PE funds, ticket 5-50M€, focus B2B SaaS" },
    { id: "3", title: "Roll-up consolidators",         query: "Consolidateurs sectoriels, multiples acquisitions récentes" },
  ],
  corpdev: [
    { id: "1", title: "Adjacent verticals mapping",    query: "Sociétés adjacentes secteur, France & Benelux" },
    { id: "2", title: "Tech tuck-ins < $50M",          query: "Tech tuck-ins, ARR < $50M, US & EU" },
    { id: "3", title: "Geographic expansion",          query: "Cibles d'expansion géographique, secteur similaire" },
  ],
  search: [
    { id: "1", title: "Niche industrial, retiring",    query: "Industriel niche, fondateur en retraite, EBITDA 1-3M€" },
    { id: "2", title: "Recurring service businesses",  query: "Services B2B récurrents, marges > 20%, succession" },
    { id: "3", title: "Family-owned, no successor",    query: "Familiale sans successeur identifié, < 10 ans existence" },
  ],
  other: [
    { id: "1", title: "Industrials FR, founder 60+",   query: "PME industrielle France, fondateur 60+, EBITDA 1-5M€" },
    { id: "2", title: "B2B SaaS EU",                   query: "B2B SaaS Europe, ARR 1-10M€, PE-backed" },
    { id: "3", title: "Healthcare services",           query: "Services santé France, familiale, headcount 50-500" },
  ],
};

interface MockResult {
  id: string;
  name: string;
  sector: string;
  city: string;
  score: number;
  signal: string | null;
  revenue: string;
}

const MOCK_RESULTS: MockResult[] = [
  { id: "r1", name: "Polymer Tech SAS",      sector: "Industrie · Plasturgie",       city: "Lyon",          score: 92, signal: "BODACC procédure",  revenue: "€8.4M"  },
  { id: "r2", name: "Atlas Composants",      sector: "Industrie · Mécanique",        city: "Saint-Étienne", score: 88, signal: "Fondateur 67 ans",  revenue: "€12.1M" },
  { id: "r3", name: "Bordeaux Logistics",    sector: "Transport · Frigorifique",     city: "Bordeaux",      score: 85, signal: null,                revenue: "€5.6M"  },
  { id: "r4", name: "Régale Foods",          sector: "Agroalimentaire",              city: "Nantes",        score: 82, signal: "Pas de successeur", revenue: "€18.0M" },
  { id: "r5", name: "Nordique Marine",       sector: "Construction navale",          city: "Brest",         score: 78, signal: null,                revenue: "€4.2M"  },
  { id: "r6", name: "Thermal Group",         sector: "Industrie · Chaud/froid",      city: "Strasbourg",    score: 76, signal: "M&A signal",        revenue: "€9.8M"  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("there");
  const [useCase, setUseCase] = useState<UseCase>("pe");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MockResult[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [optDone, setOptDone] = useState<Record<string, boolean>>({});
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("ema_user_name") || "";
    if (stored) setName(stored.split(/\s+/)[0]);
  }, []);

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ema_onboarding_done", "1");
    }
    router.push("/");
  };

  const launchSearch = (q: string) => {
    setQuery(q);
    setSearching(true);
    setResults([]);
    setSaved(new Set());
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setSearching(false);
    }, 900);
  };

  const toggleSave = (id: string) => {
    setSaved((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const templates = TEMPLATES[useCase];
  const hasResults = results.length > 0;

  return (
    <div className="onb-page" style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* ─── Top bar ───────────────────────────────────────────────────────── */}
      <header className="onb-header" style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={logoBox}>
            <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.04em" }}>Ed</span>
          </div>
          <span style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>EdRCF</span>
          <span className="onb-tag" style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", marginLeft: 8 }}>
            ONBOARDING · {name.toUpperCase()}
          </span>
        </div>
        <button onClick={finish} style={skipBtn}>
          Skip <X size={11} />
        </button>
      </header>

      <main className="onb-main" style={mainStyle}>

        {/* ─── BLOCK 1 · Use case (compact chip row) ─────────────────────── */}
        <section className="onb-block" style={blockStyle}>
          <div className="onb-block-head" style={blockHeadStyle}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              01 · Profile
            </span>
            <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>
              Pick what fits — adjusts templates &amp; defaults.
            </span>
          </div>
          <div className="onb-usecase-row" style={useCaseRow}>
            {USE_CASES.map(({ id, Icon, label }) => {
              const active = useCase === id;
              return (
                <button
                  key={id}
                  onClick={() => setUseCase(id)}
                  style={{
                    ...S, fontSize: 12, fontWeight: 500,
                    height: 32, padding: "0 12px",
                    background: active ? "var(--fg)" : "var(--bg-raise)",
                    color: active ? "var(--bg)" : "var(--fg)",
                    border: `1px solid ${active ? "var(--fg)" : "var(--border)"}`,
                    cursor: "pointer", whiteSpace: "nowrap",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--fg-muted)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <Icon size={12} /> {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── BLOCK 2 · Search ──────────────────────────────────────────── */}
        <section className="onb-block" style={blockStyle}>
          <div className="onb-block-head" style={blockHeadStyle}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              02 · First search
            </span>
            <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>
              Describe a target or pick a template.
            </span>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); if (query.trim()) launchSearch(query.trim()); }}
            style={searchFormStyle}
          >
            <SearchIcon size={14} style={{ color: "var(--fg-muted)", flexShrink: 0, marginLeft: 12 }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Industrial PMEs France, founder 60+, EBITDA 1-5M€"
              style={searchInputStyle}
            />
            <button
              type="submit"
              disabled={!query.trim() || searching}
              style={{
                ...S, fontSize: 12, fontWeight: 500,
                height: 36, padding: "0 16px", margin: 2,
                background: query.trim() && !searching ? "var(--fg)" : "var(--bg-alt)",
                color: query.trim() && !searching ? "var(--bg)" : "var(--fg-dim)",
                border: "none",
                cursor: query.trim() && !searching ? "pointer" : "not-allowed",
                display: "inline-flex", alignItems: "center", gap: 6,
                flexShrink: 0,
              }}
            >
              {searching ? <Loader2 size={11} className="onb-spin" /> : <SearchIcon size={11} />}
              Run
            </button>
          </form>

          <div className="onb-tpl-row" style={tplRow}>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => launchSearch(t.query)}
                disabled={searching}
                style={tplBtn}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--fg)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-raise)"; }}
              >
                <Sparkles size={10} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                <span style={{ ...S, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>{t.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ─── BLOCK 3 · Results ─────────────────────────────────────────── */}
        <section ref={resultsRef} className="onb-block" style={blockStyle}>
          <div className="onb-block-head" style={blockHeadStyle}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              03 · Results
            </span>
            <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>
              {searching
                ? "Scanning 16M+ companies…"
                : hasResults
                  ? <>{results.length} matched · click row to save{saved.size > 0 ? ` · ${saved.size} saved` : ""}</>
                  : "Run a search to see results."}
            </span>
          </div>

          {searching && (
            <div style={loadingBox}>
              <Loader2 size={20} style={{ color: "var(--fg)" }} className="onb-spin" />
            </div>
          )}

          {!searching && !hasResults && (
            <div style={emptyBox}>
              <span style={{ ...S, fontSize: 12, color: "var(--fg-dim)", fontStyle: "italic" }}>
                Pick a template above or type a description.
              </span>
            </div>
          )}

          {hasResults && (
            <div style={resultsBox} className="onb-results">
              {/* Header (desktop only) */}
              <div className="onb-results-head" style={resultsHead}>
                <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>SCORE</span>
                <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>COMPANY</span>
                <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>SIGNAL</span>
                <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em", textAlign: "right" }}>REVENUE</span>
                <span />
              </div>
              {results.map((r) => {
                const isSaved = saved.has(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => toggleSave(r.id)}
                    className="onb-row"
                    style={{
                      ...resultRow,
                      background: isSaved ? "rgba(34,197,94,0.04)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      ...M, fontSize: 11, fontWeight: 700,
                      width: 32, height: 24,
                      background: r.score >= 85 ? "var(--up)" : "var(--bg-alt)",
                      color: r.score >= 85 ? "#fff" : "var(--fg)",
                      border: r.score >= 85 ? "none" : "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {r.score}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </div>
                      <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.sector} · {r.city}
                      </div>
                    </div>
                    <span className="onb-signal" style={{
                      ...M, fontSize: 9,
                      padding: "2px 6px",
                      background: r.signal ? "rgba(234,88,12,0.08)" : "transparent",
                      border: r.signal ? "1px solid #EA580C" : "1px solid transparent",
                      color: r.signal ? "#EA580C" : "var(--fg-dim)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}>
                      {r.signal ?? "—"}
                    </span>
                    <span className="onb-revenue" style={{ ...M, fontSize: 11, color: "var(--fg-muted)", textAlign: "right" }}>
                      {r.revenue}
                    </span>
                    <div style={{
                      width: 26, height: 26, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${isSaved ? "var(--up)" : "var(--border)"}`,
                      background: isSaved ? "var(--up)" : "transparent",
                      color: isSaved ? "#fff" : "var(--fg-muted)",
                    }}>
                      {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── BLOCK 4 · Optional setup (footer) ─────────────────────────── */}
        <section className="onb-block" style={{ ...blockStyle, paddingBottom: 24 }}>
          <div className="onb-block-head" style={blockHeadStyle}>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              04 · Setup (optional)
            </span>
            <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>
              Skip — configure later from Settings.
            </span>
          </div>

          <div className="onb-opt-row" style={optRow}>
            <OptItem id="crm"    Icon={Plug}   title="Connect CRM"      desc="HubSpot · Salesforce · Affinity · DealCloud"   done={!!optDone.crm}    onClick={() => setOptDone((p) => ({ ...p, crm: !p.crm }))} />
            <OptItem id="team"   Icon={Users}  title="Invite team"      desc="Bulk paste emails · Admin/Member roles"        done={!!optDone.team}   onClick={() => setOptDone((p) => ({ ...p, team: !p.team }))} />
            <OptItem id="chrome" Icon={Chrome} title="Chrome extension" desc="LinkedIn warm intros · push to CRM"            done={!!optDone.chrome} onClick={() => setOptDone((p) => ({ ...p, chrome: !p.chrome }))} />
          </div>
        </section>

      </main>

      {/* ─── Sticky footer with finish CTA ───────────────────────────────── */}
      <footer className="onb-footer" style={footerStyle}>
        <span className="onb-footer-meta" style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.06em" }}>
          {hasResults
            ? <>{saved.size} saved · {results.length - saved.size} hidden</>
            : "No search yet"}
        </span>
        <button onClick={finish} style={finishBtn}>
          {hasResults && saved.size > 0 ? `Save ${saved.size} & go to dashboard` : "Go to dashboard"}
          <ArrowRight size={13} />
        </button>
      </footer>

      <style jsx>{`
        .onb-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ─── Default desktop layout ─── */
        .onb-results-head, .onb-row {
          display: grid !important;
          grid-template-columns: 32px 1fr 180px 90px 26px;
          gap: 12px;
          align-items: center;
        }

        /* ─── Mobile (< 720px) ─── */
        @media (max-width: 720px) {
          .onb-tag { display: none; }
          .onb-block-head { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
          .onb-block-head > span:last-child { font-size: 11px !important; }
          .onb-usecase-row { overflow-x: auto; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .onb-usecase-row::-webkit-scrollbar { display: none; }
          .onb-tpl-row { grid-template-columns: 1fr !important; }
          .onb-opt-row { grid-template-columns: 1fr !important; }
          .onb-results-head { display: none !important; }
          .onb-row {
            grid-template-columns: 32px 1fr 26px !important;
            grid-template-areas: "score body save";
            row-gap: 6px !important;
          }
          .onb-row > :nth-child(1) { grid-area: score; }
          .onb-row > :nth-child(2) { grid-area: body; }
          .onb-row > :nth-child(5) { grid-area: save; }
          .onb-row > :nth-child(3),
          .onb-row > :nth-child(4) {
            grid-column: 2 / -1;
            justify-self: start;
            font-size: 10px !important;
          }
          .onb-revenue { text-align: left !important; }
          .onb-footer-meta { display: none; }
        }

        /* ─── Tablet (720-1024px) ─── */
        @media (min-width: 721px) and (max-width: 1024px) {
          .onb-tpl-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// ─── OPT ITEM ────────────────────────────────────────────────────────────────

function OptItem({
  Icon, title, desc, done, onClick,
}: {
  id: string;
  Icon: React.ElementType;
  title: string;
  desc: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "10px 12px",
        background: done ? "rgba(34,197,94,0.04)" : "var(--bg-raise)",
        border: `1px solid ${done ? "var(--up)" : "var(--border)"}`,
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10,
        transition: "all 0.1s",
        minWidth: 0,
      }}
      onMouseEnter={(e) => { if (!done) e.currentTarget.style.borderColor = "var(--fg-muted)"; }}
      onMouseLeave={(e) => { if (!done) e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{
        width: 26, height: 26, flexShrink: 0,
        background: done ? "var(--up)" : "var(--bg)",
        border: `1px solid ${done ? "var(--up)" : "var(--border)"}`,
        color: done ? "#fff" : "var(--fg-muted)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {done ? <Check size={12} /> : <Icon size={13} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...S, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>
          {title}
        </div>
        <div style={{ ...S, fontSize: 10, color: "var(--fg-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {desc}
        </div>
      </div>
      <span style={{
        ...M, fontSize: 8,
        padding: "2px 5px",
        background: done ? "var(--up)" : "var(--bg-alt)",
        color: done ? "#fff" : "var(--fg-dim)",
        letterSpacing: "0.08em",
        flexShrink: 0,
      }}>
        {done ? "DONE" : "OFF"}
      </span>
    </button>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const headerStyle: React.CSSProperties = {
  height: 44, padding: "0 20px", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "space-between",
  borderBottom: "1px solid var(--border)",
  background: "var(--bg-raise)",
};

const logoBox: React.CSSProperties = {
  width: 22, height: 22, background: "var(--fg)",
  display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 3,
};

const skipBtn: React.CSSProperties = {
  ...S, fontSize: 11, color: "var(--fg-muted)",
  background: "transparent", border: "1px solid var(--border)",
  padding: "4px 10px",
  cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 5,
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
  maxWidth: 1080,
  margin: "0 auto",
  padding: "20px 20px 80px",
};

const blockStyle: React.CSSProperties = {
  marginBottom: 20,
};

const blockHeadStyle: React.CSSProperties = {
  display: "flex", alignItems: "baseline", gap: 12,
  marginBottom: 10,
  paddingBottom: 6,
  borderBottom: "1px solid var(--border)",
  flexWrap: "wrap",
};

const useCaseRow: React.CSSProperties = {
  display: "flex", flexWrap: "wrap", gap: 6,
};

const searchFormStyle: React.CSSProperties = {
  display: "flex", alignItems: "center",
  background: "var(--bg-raise)",
  border: "1px solid var(--border)",
  marginBottom: 10,
};

const searchInputStyle: React.CSSProperties = {
  ...S, flex: 1,
  height: 40, padding: "0 12px",
  fontSize: 13, color: "var(--fg)",
  background: "transparent",
  border: "none", outline: "none",
  minWidth: 0,
};

const tplRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 6,
};

const tplBtn: React.CSSProperties = {
  ...S, textAlign: "left",
  padding: "8px 10px",
  background: "var(--bg-raise)",
  border: "1px solid var(--border)",
  cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
  transition: "all 0.1s",
  minWidth: 0,
};

const loadingBox: React.CSSProperties = {
  height: 120,
  background: "var(--bg-raise)",
  border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const emptyBox: React.CSSProperties = {
  padding: "24px 16px",
  background: "var(--bg-raise)",
  border: "1px dashed var(--border)",
  textAlign: "center",
};

const resultsBox: React.CSSProperties = {
  background: "var(--bg-raise)",
  border: "1px solid var(--border)",
};

const resultsHead: React.CSSProperties = {
  padding: "8px 14px",
  background: "var(--bg-alt)",
  borderBottom: "1px solid var(--border)",
};

const resultRow: React.CSSProperties = {
  padding: "10px 14px",
  borderBottom: "1px solid var(--border)",
  cursor: "pointer",
  transition: "background 0.1s",
};

const optRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};

const footerStyle: React.CSSProperties = {
  position: "sticky", bottom: 0,
  height: 52, padding: "0 20px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  borderTop: "1px solid var(--border)",
  background: "var(--bg-raise)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const finishBtn: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 34, padding: "0 14px",
  background: "var(--fg)", color: "var(--bg)",
  border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, Building2, Search as SearchIcon, Briefcase,
  Plug, Users, Chrome, Bookmark, BookmarkCheck,
  Check, ArrowRight, ArrowLeft, X, Loader2,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

type StepId = 0 | 1 | 2 | 3;
type UseCase = "pe" | "ma" | "corpdev" | "search" | "other";

interface UseCaseDef {
  id: UseCase;
  Icon: React.ElementType;
  title: string;
  desc: string;
}

const USE_CASES: UseCaseDef[] = [
  { id: "pe",      Icon: Briefcase,  title: "Private Equity",        desc: "Source add-ons and platform investments." },
  { id: "ma",      Icon: Target,     title: "M&A Advisor",           desc: "Find buyers and acquisition targets." },
  { id: "corpdev", Icon: Building2,  title: "Corporate Development", desc: "Map strategic targets in your verticals." },
  { id: "search",  Icon: SearchIcon, title: "Search Fund",           desc: "Find your first acquisition." },
];

interface SearchTemplate {
  id: string;
  title: string;
  query: string;
}

const TEMPLATES: Record<UseCase, SearchTemplate[]> = {
  pe: [
    { id: "1", title: "Industrials in France, founder 60+",  query: "PME industrielle France, fondateur 60+, EBITDA 1-5M€, structure familiale" },
    { id: "2", title: "B2B SaaS in EU, PE-backed",           query: "B2B SaaS Europe, ARR 1-10M€, PE-backed, croissance organique" },
    { id: "3", title: "Healthcare services, family-owned",   query: "Services santé, familiale, headcount 50-500, France" },
  ],
  ma: [
    { id: "1", title: "Strategic buyers for industrial",     query: "Industriels EU, CA > 50M€, croissance externe active" },
    { id: "2", title: "PE acquirers for SaaS",               query: "PE funds, ticket 5-50M€, focus B2B SaaS" },
    { id: "3", title: "Roll-up consolidators",               query: "Consolidateurs sectoriels, multiples acquisitions récentes" },
  ],
  corpdev: [
    { id: "1", title: "Sector mapping — adjacent verticals", query: "Sociétés adjacentes secteur, France & Benelux" },
    { id: "2", title: "Tech tuck-ins under $50M",            query: "Tech tuck-ins, ARR < $50M, US & EU" },
    { id: "3", title: "Geographic expansion targets",        query: "Cibles d'expansion géographique, secteur similaire" },
  ],
  search: [
    { id: "1", title: "Niche industrial, founder retiring",  query: "Industriel niche, fondateur en retraite, EBITDA 1-3M€" },
    { id: "2", title: "Service businesses with recurring",   query: "Services B2B récurrents, marges > 20%, succession" },
    { id: "3", title: "Family-owned, no successor",          query: "Familiale sans successeur identifié, < 10 ans existence" },
  ],
  other: [
    { id: "1", title: "Industrials in France, founder 60+",  query: "PME industrielle France, fondateur 60+, EBITDA 1-5M€" },
    { id: "2", title: "B2B SaaS in EU",                      query: "B2B SaaS Europe, ARR 1-10M€, PE-backed" },
    { id: "3", title: "Healthcare services",                 query: "Services santé France, familiale, headcount 50-500" },
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
  { id: "r1", name: "Polymer Tech SAS",      sector: "Industrie · Plasturgie",       city: "Lyon",       score: 92, signal: "BODACC procédure",       revenue: "€8.4M" },
  { id: "r2", name: "Atlas Composants",      sector: "Industrie · Mécanique",        city: "Saint-Étienne", score: 88, signal: "Fondateur 67 ans",   revenue: "€12.1M" },
  { id: "r3", name: "Bordeaux Logistics",    sector: "Transport · Frigorifique",     city: "Bordeaux",   score: 85, signal: null,                     revenue: "€5.6M" },
  { id: "r4", name: "Régale Foods",          sector: "Agroalimentaire",              city: "Nantes",     score: 82, signal: "Pas de successeur",       revenue: "€18.0M" },
  { id: "r5", name: "Nordique Marine",       sector: "Construction navale",          city: "Brest",      score: 78, signal: null,                     revenue: "€4.2M" },
  { id: "r6", name: "Thermal Group",         sector: "Industrie · Chaud/froid",      city: "Strasbourg", score: 76, signal: "M&A signal",              revenue: "€9.8M" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>(0);
  const [name, setName] = useState("there");
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MockResult[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Derive a friendly first-name from any localStorage hint, else "there"
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

  const skip = () => finish();

  const goNext = () => setStep((s) => (s + 1) as StepId);
  const goBack = () => setStep((s) => Math.max(0, s - 1) as StepId);

  const launchSearch = (q: string) => {
    setQuery(q);
    setSearching(true);
    setResults([]);
    setStep(2);
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setSearching(false);
    }, 1100);
  };

  const toggleSave = (id: string) => {
    setSaved((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* ─── Top bar ─── */}
      <header style={{
        height: 52, padding: "0 28px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, background: "var(--fg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4,
          }}>
            <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.04em" }}>Ed</span>
          </div>
          <span style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>EdRCF</span>
          <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", marginLeft: 8 }}>
            ONBOARDING
          </span>
        </div>
        <button
          onClick={skip}
          style={{
            ...S, fontSize: 12, color: "var(--fg-muted)",
            background: "transparent", border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
        >
          Skip onboarding <X size={12} />
        </button>
      </header>

      {/* ─── Progress ─── */}
      <div style={{ padding: "16px 28px 0", maxWidth: 920, margin: "0 auto", width: "100%" }}>
        <ProgressBar step={step} />
      </div>

      {/* ─── Body ─── */}
      <main style={{
        flex: 1, padding: "32px 28px 60px",
        maxWidth: 920, margin: "0 auto", width: "100%",
        display: "flex", flexDirection: "column",
      }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <StepWelcome name={name} useCase={useCase} onPick={(uc) => { setUseCase(uc); goNext(); }} />
            </motion.div>
          )}
          {step === 1 && useCase && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <StepSearch
                useCase={useCase}
                query={query}
                onQueryChange={setQuery}
                onLaunch={launchSearch}
                onBack={goBack}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <StepResults
                searching={searching}
                results={results}
                saved={saved}
                onToggleSave={toggleSave}
                onContinue={goNext}
                onBack={() => setStep(1)}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <StepDone savedCount={saved.size} onFinish={finish} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Welcome", "First search", "Results", "Done"];

function ProgressBar({ step }: { step: StepId }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        const last = i === STEP_LABELS.length - 1;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: last ? 0 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "var(--fg)" : active ? "var(--bg-raise)" : "var(--bg-alt)",
                border: `1px solid ${done || active ? "var(--fg)" : "var(--border)"}`,
                color: done ? "var(--bg)" : active ? "var(--fg)" : "var(--fg-muted)",
                ...M, fontSize: 9, fontWeight: 700,
                flexShrink: 0,
                transition: "all 0.2s",
              }}>
                {done ? <Check size={11} /> : i + 1}
              </div>
              <span style={{
                ...S, fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: done || active ? "var(--fg)" : "var(--fg-muted)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {!last && (
              <div style={{
                flex: 1, height: 1, margin: "0 12px",
                background: done ? "var(--fg)" : "var(--border)",
                minWidth: 20,
                transition: "background 0.2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 0 — WELCOME / USE CASE ────────────────────────────────────────────

function StepWelcome({
  name, useCase, onPick,
}: {
  name: string;
  useCase: UseCase | null;
  onPick: (uc: UseCase) => void;
}) {
  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", marginBottom: 16,
        background: "var(--bg-raise)",
        border: "1px solid var(--border)",
        ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <Sparkles size={11} /> Welcome
      </div>

      <h1 style={{
        ...S, fontSize: 30, fontWeight: 700, color: "var(--fg)",
        margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15,
      }}>
        Hi {name}, what brings you to EdRCF?
      </h1>
      <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", margin: "10px 0 32px", lineHeight: 1.6 }}>
        Pick the option that fits best. We&apos;ll tailor your first search around it. You can change this later.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
      }}>
        {USE_CASES.map(({ id, Icon, title, desc }) => {
          const active = useCase === id;
          return (
            <button
              key={id}
              onClick={() => onPick(id)}
              style={{
                textAlign: "left",
                padding: "18px 20px",
                background: active ? "var(--bg-alt)" : "var(--bg-raise)",
                border: `1px solid ${active ? "var(--fg)" : "var(--border)"}`,
                cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 8,
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--fg-muted)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{
                width: 32, height: 32,
                background: "var(--bg)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} style={{ color: "var(--fg)" }} />
              </div>
              <div style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>{title}</div>
              <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>{desc}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPick("other")}
        style={{
          ...S, fontSize: 13, color: "var(--fg-muted)",
          background: "transparent", border: "none", cursor: "pointer",
          marginTop: 18, padding: 6, alignSelf: "flex-start",
          textDecoration: "underline",
        }}
      >
        Something else
      </button>
    </>
  );
}

// ─── STEP 1 — FIRST SEARCH ──────────────────────────────────────────────────

function StepSearch({
  useCase, query, onQueryChange, onLaunch, onBack,
}: {
  useCase: UseCase;
  query: string;
  onQueryChange: (q: string) => void;
  onLaunch: (q: string) => void;
  onBack: () => void;
}) {
  const templates = TEMPLATES[useCase];

  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", marginBottom: 16,
        background: "var(--bg-raise)",
        border: "1px solid var(--border)",
        ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <SearchIcon size={11} /> Step 2 of 4
      </div>

      <h1 style={{
        ...S, fontSize: 28, fontWeight: 700, color: "var(--fg)",
        margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2,
      }}>
        Let&apos;s find your first targets
      </h1>
      <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", margin: "10px 0 28px", lineHeight: 1.6 }}>
        Describe what you&apos;re looking for in plain English, or pick a template below to get started in one click.
      </p>

      {/* Big NL search */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) onLaunch(query.trim()); }}
        style={{
          display: "flex",
          background: "var(--bg-raise)",
          border: "1px solid var(--border)",
          marginBottom: 18,
          transition: "border-color 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, flexShrink: 0 }}>
          <SearchIcon size={15} style={{ color: "var(--fg-muted)" }} />
        </div>
        <input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. Industrial PMEs in France with founders aged 60+, EBITDA 1-5M€"
          style={{
            ...S, flex: 1,
            padding: "14px 12px", fontSize: 14,
            color: "var(--fg)", background: "transparent",
            border: "none", outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          style={{
            ...S, fontSize: 13, fontWeight: 500,
            padding: "0 22px",
            background: query.trim() ? "var(--fg)" : "var(--bg-alt)",
            color: query.trim() ? "var(--bg)" : "var(--fg-dim)",
            border: "none", cursor: query.trim() ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}
        >
          Run search <ArrowRight size={13} />
        </button>
      </form>

      {/* Template pills */}
      <div style={{
        ...M, fontSize: 9, color: "var(--fg-dim)",
        letterSpacing: "0.12em", textTransform: "uppercase",
        marginBottom: 10,
      }}>
        Or try one of these
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
      }}>
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onLaunch(t.query)}
            style={{
              textAlign: "left",
              padding: "14px 16px",
              background: "var(--bg-raise)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--fg)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-raise)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Sparkles size={11} style={{ color: "var(--fg-muted)" }} />
              <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Template
              </span>
            </div>
            <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)", lineHeight: 1.4 }}>
              {t.title}
            </div>
            <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>
              {t.query}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
}

// ─── STEP 2 — RESULTS ───────────────────────────────────────────────────────

function StepResults({
  searching, results, saved, onToggleSave, onContinue, onBack,
}: {
  searching: boolean;
  results: MockResult[];
  saved: Set<string>;
  onToggleSave: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  if (searching) {
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <Loader2 size={28} style={{ color: "var(--fg)" }} className="onb-spin" />
        <p style={{ ...S, fontSize: 14, color: "var(--fg)", marginTop: 18, fontWeight: 500 }}>
          Scanning 16M+ companies…
        </p>
        <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
          Matching firmographics, signals, and intent indicators.
        </p>
        <style jsx>{`
          .onb-spin { animation: spin 0.8s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", marginBottom: 16,
        background: "var(--bg-raise)",
        border: "1px solid var(--border)",
        ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <Target size={11} /> Step 3 of 4
      </div>

      <h1 style={{
        ...S, fontSize: 26, fontWeight: 700, color: "var(--fg)",
        margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2,
      }}>
        {results.length} companies matched.
      </h1>
      <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", margin: "10px 0 24px", lineHeight: 1.6 }}>
        Save the ones you want to follow up on. We&apos;ll create your first list automatically.
      </p>

      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
        {results.map((r, i) => {
          const isSaved = saved.has(r.id);
          return (
            <div
              key={r.id}
              onClick={() => onToggleSave(r.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr 110px 90px 32px",
                gap: 14, padding: "12px 16px",
                alignItems: "center",
                borderBottom: i === results.length - 1 ? "none" : "1px solid var(--border)",
                cursor: "pointer",
                background: isSaved ? "rgba(34,197,94,0.04)" : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (!isSaved) e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={(e) => { if (!isSaved) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Score circle */}
              <div style={{
                width: 36, height: 36, borderRadius: 18,
                background: r.score >= 85 ? "var(--up)" : "var(--bg-alt)",
                color: r.score >= 85 ? "#fff" : "var(--fg)",
                border: r.score >= 85 ? "none" : "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                ...M, fontSize: 11, fontWeight: 700,
                flexShrink: 0,
              }}>
                {r.score}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)" }}>
                  {r.name}
                </div>
                <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                  {r.sector} · {r.city}
                </div>
              </div>

              {r.signal ? (
                <span style={{
                  ...M, fontSize: 9,
                  padding: "2px 6px",
                  background: "rgba(234,88,12,0.08)",
                  border: "1px solid #EA580C",
                  color: "#EA580C",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {r.signal}
                </span>
              ) : (
                <span />
              )}

              <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)", textAlign: "right" }}>
                {r.revenue}
              </span>

              {/* Save */}
              <div
                style={{
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${isSaved ? "var(--up)" : "var(--border)"}`,
                  background: isSaved ? "var(--up)" : "transparent",
                  color: isSaved ? "#fff" : "var(--fg-muted)",
                  transition: "all 0.12s",
                }}
              >
                {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 24,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <BackButton onClick={onBack} />
        <button
          onClick={onContinue}
          style={{
            ...S, fontSize: 13, fontWeight: 500,
            padding: "10px 18px",
            background: "var(--fg)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          {saved.size > 0 ? `Save ${saved.size} and continue` : "Continue"} <ArrowRight size={13} />
        </button>
      </div>
    </>
  );
}

// ─── STEP 3 — DONE / OPTIONAL SETUP ─────────────────────────────────────────

function StepDone({ savedCount, onFinish }: { savedCount: number; onFinish: () => void }) {
  const [doneItems, setDoneItems] = useState<Record<string, boolean>>({});

  const optionals: { id: string; Icon: React.ElementType; title: string; desc: string; cta: string }[] = [
    { id: "crm",      Icon: Plug,   title: "Connect your CRM",        desc: "HubSpot, Salesforce, Affinity, DealCloud. Avoid duplicates and sync deals.", cta: "Connect" },
    { id: "team",     Icon: Users,  title: "Invite your team",        desc: "Share lists, get alerts together. Admins can invite by email in one click.",   cta: "Invite"  },
    { id: "chrome",   Icon: Chrome, title: "Install Chrome extension", desc: "Surface mutual LinkedIn connections and push companies to your CRM.",         cta: "Install" },
  ];

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, margin: "0 auto 18px",
          borderRadius: 28,
          background: "var(--up)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={26} />
        </div>
        <h1 style={{
          ...S, fontSize: 28, fontWeight: 700, color: "var(--fg)",
          margin: 0, letterSpacing: "-0.02em",
        }}>
          You&apos;re all set.
        </h1>
        <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", margin: "10px 0 0", lineHeight: 1.6 }}>
          {savedCount > 0
            ? <>We saved {savedCount} {savedCount === 1 ? "company" : "companies"} to your first list.</>
            : <>Your account is ready. Jump in and start sourcing.</>}
        </p>
      </div>

      {/* Optional setup */}
      <div style={{
        ...M, fontSize: 9, color: "var(--fg-dim)",
        letterSpacing: "0.12em", textTransform: "uppercase",
        marginBottom: 10,
      }}>
        Optional · 30 seconds each
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {optionals.map(({ id, Icon, title, desc, cta }) => {
          const isDone = doneItems[id];
          return (
            <div
              key={id}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                background: "var(--bg-raise)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                background: "var(--bg)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={15} style={{ color: "var(--fg)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{title}</div>
                <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
              </div>
              {isDone ? (
                <span style={{
                  ...M, fontSize: 9, padding: "4px 8px",
                  background: "var(--up)", color: "#fff",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Check size={9} /> Done
                </span>
              ) : (
                <button
                  onClick={() => setDoneItems((p) => ({ ...p, [id]: true }))}
                  style={{
                    ...S, fontSize: 12, fontWeight: 500,
                    padding: "6px 14px",
                    background: "transparent",
                    color: "var(--fg)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--fg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onFinish}
        style={{
          ...S, fontSize: 14, fontWeight: 500,
          padding: "12px 22px",
          background: "var(--fg)", color: "var(--bg)",
          border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 8,
          alignSelf: "center", margin: "0 auto",
        }}
      >
        Go to dashboard <ArrowRight size={14} />
      </button>
    </>
  );
}

// ─── BACK BUTTON ────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...S, fontSize: 12, color: "var(--fg-muted)",
        background: "transparent", border: "none", cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: 4,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
    >
      <ArrowLeft size={12} /> Back
    </button>
  );
}

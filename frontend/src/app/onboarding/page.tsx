"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, ArrowRight, Linkedin, Cloud, Mail } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

// ── Data ─────────────────────────────────────────────────────────────────────

const SOURCES = [
  {
    id: "linkedin",
    Icon: Linkedin,
    color: "#0A66C2",
    title: "LinkedIn",
    subtitle: "Réseau professionnel",
    description: "Révélez les connexions sémantiques de votre équipe et activez le warm sourcing sur 16M+ cibles.",
  },
  {
    id: "salesforce",
    Icon: Cloud,
    color: "#00A1E0",
    title: "Salesforce",
    subtitle: "CRM",
    description: "Synchronisez vos deals actifs et évitez les doublons de prospection entre originateurs.",
  },
  {
    id: "outlook",
    Icon: Mail,
    color: "#0078D4",
    title: "Outlook / Exchange",
    subtitle: "Messagerie",
    description: "Détectez les relations existantes via l'historique email pour scorer la proximité dirigeants.",
  },
];

const SECTORS = [
  "Industrie & Manufacturing",
  "Logiciel B2B / SaaS",
  "Santé / Medtech",
  "Agroalimentaire",
  "Services B2B",
  "Distribution & Retail",
  "Construction & Immobilier",
  "Énergie / Cleantech",
  "Fintech",
  "Médias / Édition",
  "Transport & Logistique",
  "Chimie & Matériaux",
];

const STRUCTURES = [
  "ETI familiale",
  "PME indépendante",
  "Filiale cédée",
  "LBO secondaire",
  "Groupe coté – spin-off",
];

const REVENUE_MAX = 500;

function fmtRevenue(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}Md€` : `${v}M€`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [connState, setConnState] = useState<Record<string, "idle" | "loading" | "done">>({
    linkedin: "idle", salesforce: "idle", outlook: "idle",
  });

  // Step 2
  const [sectors, setSectors]       = useState<string[]>([]);
  const [structures, setStructures] = useState<string[]>([]);
  const [revMin, setRevMin]         = useState(5);
  const [revMax, setRevMax]         = useState(100);
  const [scoring, setScoring]       = useState(false);
  const [scored, setScored]         = useState(false);

  const connectedCount  = Object.values(connState).filter(v => v === "done").length;
  const thesisComplete  = sectors.length > 0;

  const handleConnect = useCallback((id: string) => {
    if (connState[id] !== "idle") return;
    setConnState(p => ({ ...p, [id]: "loading" }));
    setTimeout(() => setConnState(p => ({ ...p, [id]: "done" })), 1800 + Math.random() * 600);
  }, [connState]);

  const toggleSector    = (s: string) => setSectors(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleStructure = (s: string) => setStructures(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleScore = () => {
    if (!thesisComplete || scoring) return;
    setScoring(true);
    setTimeout(() => { setScoring(false); setScored(true); }, 2400);
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") localStorage.setItem("ema_onboarding_done", "1");
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#FFFFFF", display: "flex", flexDirection: "column", ...S }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: 56, borderBottom: "1px solid #E5E7EB", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <span style={{ ...M, fontSize: 12, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
          EdRCF <span style={{ ...M, color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
        </span>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {([1, 2] as const).map((n, idx) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              {idx > 0 && (
                <div style={{ width: 32, height: 1, background: step > 1 ? "#111827" : "#E5E7EB" }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 26, height: 26, flexShrink: 0,
                  border: `1px solid ${step >= n ? "#111827" : "#E5E7EB"}`,
                  background: step > n ? "#111827" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...M, fontSize: 9,
                  color: step > n ? "#fff" : step === n ? "#111827" : "#9CA3AF",
                  transition: "all 0.2s",
                }}>
                  {step > n ? <Check size={11} /> : n}
                </div>
                <span style={{
                  ...S, fontSize: 11,
                  color: step >= n ? "#111827" : "#9CA3AF",
                  whiteSpace: "nowrap",
                }}>
                  {n === 1 ? "Sources de données" : "Thèse d'investissement"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: 160 }} />
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "52px 24px 80px" }}>
        <div style={{ width: "100%", maxWidth: 740 }}>
          {step === 1 ? (
            <DataSyncStep
              connState={connState}
              onConnect={handleConnect}
              connectedCount={connectedCount}
              onNext={() => setStep(2)}
            />
          ) : (
            <ThesisStep
              sectors={sectors}
              onToggleSector={toggleSector}
              structures={structures}
              onToggleStructure={toggleStructure}
              revMin={revMin}
              revMax={revMax}
              onRevMin={setRevMin}
              onRevMax={setRevMax}
              scoring={scoring}
              scored={scored}
              thesisComplete={thesisComplete}
              onScore={handleScore}
              onBack={() => setStep(1)}
              onFinish={handleFinish}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Step 1 ───────────────────────────────────────────────────────────────────

function DataSyncStep({
  connState, onConnect, connectedCount, onNext,
}: {
  connState: Record<string, "idle" | "loading" | "done">;
  onConnect: (id: string) => void;
  connectedCount: number;
  onNext: () => void;
}) {
  return (
    <>
      <div style={{ marginBottom: 44 }}>
        <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.14em", marginBottom: 12 }}>ÉTAPE 1 / 2</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 12px", lineHeight: 1.2 }}>
          Connecter vos sources de données
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8, maxWidth: 540, margin: 0 }}>
          Synchronisez vos outils pour enrichir automatiquement votre base de cibles avec du contexte relationnel et CRM.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 44 }}>
        {SOURCES.map(({ id, Icon, color, title, subtitle, description }) => {
          const state = connState[id];
          return (
            <div key={id} style={{
              border: `1px solid ${state === "done" ? "#111827" : "#E5E7EB"}`,
              padding: "24px 22px 20px",
              display: "flex", flexDirection: "column", gap: 14,
              background: state === "done" ? "#F9FAFB" : "#fff",
              transition: "border-color 0.2s",
            }}>
              {/* Logo */}
              <div style={{
                width: 40, height: 40,
                border: "1px solid #E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fff", flexShrink: 0,
              }}>
                <Icon size={20} style={{ color }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 3 }}>{title}</div>
                <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 10 }}>{subtitle.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7 }}>{description}</div>
              </div>

              {/* Button */}
              <button
                onClick={() => onConnect(id)}
                disabled={state !== "idle"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "9px 14px",
                  border: "1px solid #111827",
                  background: state === "done" ? "#111827" : "transparent",
                  color: state === "done" ? "#fff" : "#111827",
                  fontSize: 12, fontWeight: 500,
                  cursor: state === "idle" ? "pointer" : "default",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (state === "idle") { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { if (state === "idle") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111827"; } }}
              >
                {state === "loading" ? (
                  <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Connexion…</>
                ) : state === "done" ? (
                  <><Check size={12} /> Connected</>
                ) : (
                  "Connect & Sync"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>
          {connectedCount > 0
            ? `${connectedCount} source${connectedCount > 1 ? "s" : ""} connectée${connectedCount > 1 ? "s" : ""}`
            : "OPTIONNEL — vous pouvez ignorer cette étape"}
        </span>
        <button
          onClick={onNext}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 28px",
            background: "#111827", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "opacity 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Continuer <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

// ── Step 2 ───────────────────────────────────────────────────────────────────

function ThesisStep({
  sectors, onToggleSector, structures, onToggleStructure,
  revMin, revMax, onRevMin, onRevMax,
  scoring, scored, thesisComplete, onScore, onBack, onFinish,
}: {
  sectors: string[]; onToggleSector: (s: string) => void;
  structures: string[]; onToggleStructure: (s: string) => void;
  revMin: number; revMax: number;
  onRevMin: (v: number) => void; onRevMax: (v: number) => void;
  scoring: boolean; scored: boolean; thesisComplete: boolean;
  onScore: () => void; onBack: () => void; onFinish: () => void;
}) {
  const minPct = (revMin / REVENUE_MAX) * 100;
  const maxPct = (revMax / REVENUE_MAX) * 100;

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.14em", marginBottom: 12 }}>ÉTAPE 2 / 2</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 12px", lineHeight: 1.2 }}>
          Définir votre thèse d'investissement
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8, maxWidth: 540, margin: 0 }}>
          Ces paramètres seront utilisés pour pré-scorer automatiquement les 16M+ entreprises de notre base.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Sectors */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 14 }}>
            SECTEURS CIBLES <span style={{ color: "#DC2626" }}>*</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SECTORS.map(s => {
              const active = sectors.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => onToggleSector(s)}
                  style={{
                    padding: "6px 14px",
                    border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
                    background: active ? "#111827" : "transparent",
                    color: active ? "#fff" : "#374151",
                    fontSize: 12, cursor: "pointer", transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#111827"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; } }}
                >
                  {active && <Check size={10} style={{ marginRight: 5, verticalAlign: "middle" }} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Structure */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 14 }}>
            TYPE DE STRUCTURE
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STRUCTURES.map(s => {
              const active = structures.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => onToggleStructure(s)}
                  style={{
                    padding: "6px 14px",
                    border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
                    background: active ? "#111827" : "transparent",
                    color: active ? "#fff" : "#374151",
                    fontSize: 12, cursor: "pointer", transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#111827"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; } }}
                >
                  {active && <Check size={10} style={{ marginRight: 5, verticalAlign: "middle" }} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Revenue range slider */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 18 }}>
            CHIFFRE D'AFFAIRES CIBLE
          </div>

          {/* Values */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.08em" }}>MINIMUM</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", ...M }}>{fmtRevenue(revMin)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 24, height: 1, background: "#E5E7EB" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
              <span style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.08em" }}>MAXIMUM</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", ...M }}>{fmtRevenue(revMax)}</span>
            </div>
          </div>

          {/* Slider track */}
          <div style={{ position: "relative", height: 28, userSelect: "none" }}>
            {/* Background track */}
            <div style={{
              position: "absolute", top: "50%", left: 0, right: 0,
              height: 2, background: "#E5E7EB", transform: "translateY(-50%)",
            }} />
            {/* Active track */}
            <div style={{
              position: "absolute", top: "50%", height: 2, background: "#111827",
              transform: "translateY(-50%)",
              left: `${minPct}%`, right: `${100 - maxPct}%`,
              transition: "left 0.02s, right 0.02s",
            }} />
            {/* Min thumb */}
            <div style={{
              position: "absolute", top: "50%", left: `${minPct}%`,
              transform: "translate(-50%, -50%)",
              width: 16, height: 16, border: "2px solid #111827", background: "#fff",
              pointerEvents: "none", zIndex: 1,
            }} />
            {/* Max thumb */}
            <div style={{
              position: "absolute", top: "50%", left: `${maxPct}%`,
              transform: "translate(-50%, -50%)",
              width: 16, height: 16, border: "2px solid #111827", background: "#fff",
              pointerEvents: "none", zIndex: 1,
            }} />
            {/* Invisible range inputs */}
            <input type="range" min={0} max={REVENUE_MAX} step={1} value={revMin}
              onChange={e => { const v = +e.target.value; if (v <= revMax - 5) onRevMin(v); }}
              style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: revMin > REVENUE_MAX * 0.9 ? 3 : 2, margin: 0, padding: 0 }}
            />
            <input type="range" min={0} max={REVENUE_MAX} step={1} value={revMax}
              onChange={e => { const v = +e.target.value; if (v >= revMin + 5) onRevMax(v); }}
              style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: revMin > REVENUE_MAX * 0.9 ? 2 : 3, margin: 0, padding: 0 }}
            />
          </div>

          {/* Scale */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {["0", "100M€", "200M€", "300M€", "400M€", "500M€"].map(l => (
              <span key={l} style={{ ...M, fontSize: 8, color: "#D1D5DB" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-score CTA */}
      <div style={{ marginTop: 44, paddingTop: 32, borderTop: "1px solid #E5E7EB" }}>
        <button
          onClick={onScore}
          disabled={!thesisComplete || scoring || scored}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "15px 24px", marginBottom: 20,
            background: scored ? "#16A34A" : thesisComplete ? "#2563EB" : "#F3F4F6",
            color: thesisComplete || scored ? "#fff" : "#9CA3AF",
            border: "none",
            cursor: thesisComplete && !scoring && !scored ? "pointer" : "default",
            fontSize: 14, fontWeight: 600, transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { if (thesisComplete && !scoring && !scored) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {scoring ? (
            <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Pré-scoring en cours…</>
          ) : scored ? (
            <><Check size={15} /> Base pré-scorée — {sectors.length} secteur{sectors.length > 1 ? "s" : ""} configuré{sectors.length > 1 ? "s" : ""}</>
          ) : (
            <><Sparkles size={15} /> Pré-scorer ma base de données</>
          )}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={onBack}
            style={{ fontSize: 12, color: "#9CA3AF", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
          >
            ← Retour
          </button>
          <button
            onClick={onFinish}
            disabled={!thesisComplete}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 32px",
              background: thesisComplete ? "#111827" : "#F3F4F6",
              color: thesisComplete ? "#fff" : "#9CA3AF",
              border: "none",
              cursor: thesisComplete ? "pointer" : "not-allowed",
              fontSize: 13, fontWeight: 500, transition: "opacity 0.1s",
            }}
            onMouseEnter={e => { if (thesisComplete) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Accéder au Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

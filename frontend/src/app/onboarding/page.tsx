"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Loader2, Sparkles, ArrowRight, ArrowLeft,
  Linkedin, Cloud, Mail, Plus, X, Bell, Users, Zap,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES    = ["Associate", "Vice-President", "Director", "Partner / MD", "Fondateur", "Autre"];
const STRATS   = ["LBO / Buyout", "Growth Equity", "M&A Conseil", "Dette Privée", "Minoritaire", "Venture Capital"];
const AUM_OPTS = ["< 100M€", "100–500M€", "500M€–1Md€", "1–5Md€", "> 5Md€"];

const SOURCES = [
  { id: "linkedin",    Icon: Linkedin, color: "#0A66C2", title: "LinkedIn",        sub: "Réseau professionnel",  desc: "Warm sourcing via les connexions de votre équipe." },
  { id: "dealcloud",   Icon: Cloud,    color: "#1E3A5F", title: "DealCloud",        sub: "CRM M&A",               desc: "Synchronisez vos deals et évitez les doublons." },
  { id: "salesforce",  Icon: Cloud,    color: "#00A1E0", title: "Salesforce",       sub: "CRM",                   desc: "Pipeline commercial et historique des contacts." },
  { id: "affinity",    Icon: Cloud,    color: "#6C47FF", title: "Affinity",         sub: "Relationship CRM",      desc: "Scoring relationnel automatique sur vos cibles." },
  { id: "hubspot",     Icon: Cloud,    color: "#FF7A59", title: "HubSpot",          sub: "CRM",                   desc: "Suivi marketing et séquences de prospection." },
  { id: "pipedrive",   Icon: Cloud,    color: "#00C851", title: "Pipedrive",        sub: "CRM",                   desc: "Pipeline visuel pour les boutiques M&A." },
  { id: "outlook",     Icon: Mail,     color: "#0078D4", title: "Outlook / Exchange", sub: "Messagerie",          desc: "Détectez les relations via l'historique email." },
];

const SECTORS = [
  "Industrie & Manufacturing", "Logiciel B2B / SaaS", "Santé / Medtech",
  "Agroalimentaire", "Services B2B", "Distribution & Retail",
  "Construction & Immobilier", "Énergie / Cleantech", "Fintech",
  "Médias / Édition", "Transport & Logistique", "Chimie & Matériaux",
];

const EXCLUDED_SECTORS = ["Armement / Défense", "Tabac", "Jeux d'argent", "Alcool", "Charbon / Pétrole"];

const STRUCTURES = ["ETI familiale", "PME indépendante", "Filiale cédée", "LBO secondaire", "Groupe coté – spin-off"];

const REGIONS = [
  "Île-de-France", "Grand Ouest", "Auvergne-Rhône-Alpes", "Occitanie",
  "Nouvelle-Aquitaine", "Hauts-de-France", "Provence-PACA", "Grand Est",
  "Normandie", "Pays de la Loire", "Bourgogne-Franche-Comté",
];

const SIGNALS = [
  "Cession / Transmission", "Rapprochement BODACC", "Redressement judiciaire",
  "Changement dirigeant", "Croissance externe", "Ouverture de capital",
  "Dépôt de brevet", "Appel d'offres public",
];

const NOTIF_FREQ  = ["Temps réel", "Quotidien (digest)", "Hebdomadaire"];
const NOTIF_CHAN  = ["Email", "Slack", "In-app uniquement"];

const REVENUE_MAX = 500;
const EV_MAX      = 200;

function fmt(v: number, max: number) {
  const unit = max > 500 ? "Md€" : "M€";
  return max > 500 ? `${(v / 1000).toFixed(1)}${unit}` : `${v}M€`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 — Profil
  const [firm, setFirm]       = useState("");
  const [role, setRole]       = useState("");
  const [aum, setAum]         = useState("");
  const [strat, setStrat]     = useState("");

  // Step 2 — CRM
  const [conn, setConn] = useState<Record<string, "idle" | "loading" | "done">>(
    Object.fromEntries(SOURCES.map(s => [s.id, "idle"]))
  );

  // Step 3 — Thèse
  const [sectors, setSectors]       = useState<string[]>([]);
  const [excluded, setExcluded]     = useState<string[]>([]);
  const [structures, setStructures] = useState<string[]>([]);
  const [regions, setRegions]       = useState<string[]>([]);
  const [signals, setSignals]       = useState<string[]>([]);
  const [revMin, setRevMin]         = useState(5);
  const [revMax, setRevMax]         = useState(100);
  const [evMin, setEvMin]           = useState(5);
  const [evMax, setEvMax]           = useState(50);
  const [scoring, setScoring]       = useState(false);
  const [scored, setScored]         = useState(false);

  // Step 4 — Équipe & Notifs
  const [emailInput, setEmailInput] = useState("");
  const [invites, setInvites]       = useState<{ email: string; role: string }[]>([]);
  const [notifFreq, setNotifFreq]   = useState("Quotidien (digest)");
  const [notifChan, setNotifChan]   = useState("Email");

  const STEPS = ["Profil du fonds", "CRM & Sources", "Thèse d'investissement", "Équipe & Alertes"];
  const step1Ok = !!firm.trim() && !!role && !!strat;
  const step3Ok = sectors.length > 0;

  const handleConnect = (id: string) => {
    if (conn[id] !== "idle") return;
    setConn(p => ({ ...p, [id]: "loading" }));
    setTimeout(() => setConn(p => ({ ...p, [id]: "done" })), 1600 + Math.random() * 800);
  };

  const toggle = (arr: string[], setArr: (a: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const addInvite = () => {
    const e = emailInput.trim();
    if (!e || !e.includes("@") || invites.find(i => i.email === e)) return;
    setInvites(p => [...p, { email: e, role: "Viewer" }]);
    setEmailInput("");
  };

  const handleFinish = () => {
    if (typeof window !== "undefined") localStorage.setItem("ema_onboarding_done", "1");
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#FFFFFF", display: "flex", flexDirection: "column", ...S }}>

      {/* Header */}
      <header style={{
        height: 56, borderBottom: "1px solid #E5E7EB", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <span style={{ ...M, fontSize: 12, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
          EdRCF <span style={{ color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
        </span>

        {/* Step pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEPS.map((label, idx) => {
            const n = idx + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center" }}>
                {idx > 0 && <div style={{ width: 28, height: 1, background: done ? "#111827" : "#E5E7EB" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 24, height: 24, flexShrink: 0,
                    border: `1px solid ${active || done ? "#111827" : "#E5E7EB"}`,
                    background: done ? "#111827" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    ...M, fontSize: 9,
                    color: done ? "#fff" : active ? "#111827" : "#9CA3AF",
                    transition: "all 0.2s",
                  }}>
                    {done ? <Check size={10} /> : n}
                  </div>
                  <span style={{ ...S, fontSize: 11, color: active || done ? "#111827" : "#9CA3AF", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ width: 140 }} />
      </header>

      {/* Body */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "48px 24px 80px" }}>
        <div style={{ width: "100%", maxWidth: 760 }}>
          {step === 1 && <ProfileStep firm={firm} setFirm={setFirm} role={role} setRole={setRole} aum={aum} setAum={setAum} strat={strat} setStrat={setStrat} ok={step1Ok} onNext={() => setStep(2)} />}
          {step === 2 && <CrmStep conn={conn} onConnect={handleConnect} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && (
            <ThesisStep
              sectors={sectors} onToggleSector={v => toggle(sectors, setSectors, v)}
              excluded={excluded} onToggleExcluded={v => toggle(excluded, setExcluded, v)}
              structures={structures} onToggleStructure={v => toggle(structures, setStructures, v)}
              regions={regions} onToggleRegion={v => toggle(regions, setRegions, v)}
              signals={signals} onToggleSignal={v => toggle(signals, setSignals, v)}
              revMin={revMin} revMax={revMax} onRevMin={setRevMin} onRevMax={setRevMax}
              evMin={evMin} evMax={evMax} onEvMin={setEvMin} onEvMax={setEvMax}
              scoring={scoring} scored={scored}
              onScore={() => { setScoring(true); setTimeout(() => { setScoring(false); setScored(true); }, 2400); }}
              ok={step3Ok} onBack={() => setStep(2)} onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <TeamStep
              emailInput={emailInput} setEmailInput={setEmailInput}
              invites={invites} onAddInvite={addInvite}
              onRemoveInvite={e => setInvites(p => p.filter(i => i.email !== e))}
              onChangeRole={(e, r) => setInvites(p => p.map(i => i.email === e ? { ...i, role: r } : i))}
              notifFreq={notifFreq} setNotifFreq={setNotifFreq}
              notifChan={notifChan} setNotifChan={setNotifChan}
              onBack={() => setStep(3)} onFinish={handleFinish}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StepHeader({ n, total, title, sub }: { n: number; total: number; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.14em", marginBottom: 12 }}>
        ÉTAPE {n} / {total}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 10px", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8, maxWidth: 540, margin: 0 }}>{sub}</p>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Continuer", nextDisabled = false, nextIcon = <ArrowRight size={14} /> }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; nextIcon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 44, paddingTop: 28, borderTop: "1px solid #E5E7EB" }}>
      {onBack ? (
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF", background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
        >
          <ArrowLeft size={13} /> Retour
        </button>
      ) : <div />}
      <button onClick={onNext} disabled={nextDisabled}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "11px 32px",
          background: nextDisabled ? "#F3F4F6" : "#111827",
          color: nextDisabled ? "#9CA3AF" : "#fff",
          border: "none", fontSize: 13, fontWeight: 500,
          cursor: nextDisabled ? "not-allowed" : "pointer", transition: "opacity 0.1s",
        }}
        onMouseEnter={e => { if (!nextDisabled) e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        {nextLabel} {nextIcon}
      </button>
    </div>
  );
}

function TagGroup({ label, items, selected, onToggle, required }: {
  label: string; items: string[]; selected: string[]; onToggle: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 12 }}>
        {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {items.map(s => {
          const active = selected.includes(s);
          return (
            <button key={s} onClick={() => onToggle(s)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 13px",
              border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
              background: active ? "#111827" : "transparent",
              color: active ? "#fff" : "#374151",
              fontSize: 12, cursor: "pointer", transition: "all 0.1s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "#374151"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "#E5E7EB"; }}
            >
              {active && <Check size={9} />}{s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DualSlider({ label, min, max, valMin, valMax, onMin, onMax }: {
  label: string; min: number; max: number; valMin: number; valMax: number;
  onMin: (v: number) => void; onMax: (v: number) => void;
}) {
  const minPct = ((valMin - min) / (max - min)) * 100;
  const maxPct = ((valMax - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 14 }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ ...M, fontSize: 7, color: "#9CA3AF", letterSpacing: "0.08em" }}>MIN</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", ...M }}>{fmt(valMin, max)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...M, fontSize: 7, color: "#9CA3AF", letterSpacing: "0.08em" }}>MAX</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", ...M }}>{fmt(valMax, max)}</div>
        </div>
      </div>
      <div style={{ position: "relative", height: 24, userSelect: "none" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: "#E5E7EB", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", top: "50%", height: 2, background: "#111827", transform: "translateY(-50%)", left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        <div style={{ position: "absolute", top: "50%", left: `${minPct}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, border: "2px solid #111827", background: "#fff", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", left: `${maxPct}%`, transform: "translate(-50%,-50%)", width: 14, height: 14, border: "2px solid #111827", background: "#fff", pointerEvents: "none" }} />
        <input type="range" min={min} max={max} step={1} value={valMin}
          onChange={e => { const v = +e.target.value; if (v <= valMax - 5) onMin(v); }}
          style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: valMin > max * 0.9 ? 3 : 2, margin: 0, padding: 0 }}
        />
        <input type="range" min={min} max={max} step={1} value={valMax}
          onChange={e => { const v = +e.target.value; if (v >= valMin + 5) onMax(v); }}
          style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: valMin > max * 0.9 ? 2 : 3, margin: 0, padding: 0 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ ...M, fontSize: 8, color: "#D1D5DB" }}>{min}M€</span>
        <span style={{ ...M, fontSize: 8, color: "#D1D5DB" }}>{max}M€</span>
      </div>
    </div>
  );
}

// ── Step 1 — Profil ───────────────────────────────────────────────────────────

function ProfileStep({ firm, setFirm, role, setRole, aum, setAum, strat, setStrat, ok, onNext }: {
  firm: string; setFirm: (v: string) => void;
  role: string; setRole: (v: string) => void;
  aum: string; setAum: (v: string) => void;
  strat: string; setStrat: (v: string) => void;
  ok: boolean; onNext: () => void;
}) {
  return (
    <>
      <StepHeader n={1} total={4} title="Profil de votre fonds" sub="Ces informations permettent de personnaliser les recommandations et les seuils de scoring pour votre stratégie." />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Nom du fonds */}
        <div>
          <label style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>
            NOM DU FONDS / CABINET <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input value={firm} onChange={e => setFirm(e.target.value)}
            placeholder="ex: Edmond de Rothschild Corporate Finance"
            style={{ width: "100%", border: "1px solid #E5E7EB", padding: "10px 14px", fontSize: 13, color: "#111827", outline: "none", transition: "border-color 0.1s", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = "#111827")}
            onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
          />
        </div>

        {/* Rôle */}
        <TagGroup label="VOTRE RÔLE" items={ROLES} selected={role ? [role] : []} onToggle={v => setRole(v === role ? "" : v)} required />

        {/* Stratégie */}
        <TagGroup label="TYPE DE STRATÉGIE" items={STRATS} selected={strat ? [strat] : []} onToggle={v => setStrat(v === strat ? "" : v)} required />

        {/* AUM */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 12 }}>AUM GÉRÉ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {AUM_OPTS.map(o => {
              const active = aum === o;
              return (
                <button key={o} onClick={() => setAum(o === aum ? "" : o)} style={{
                  padding: "6px 16px",
                  border: `1px solid ${active ? "#111827" : "#E5E7EB"}`,
                  background: active ? "#111827" : "transparent",
                  color: active ? "#fff" : "#374151",
                  fontSize: 12, cursor: "pointer", transition: "all 0.1s",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "#374151"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "#E5E7EB"; }}
                >
                  {active && <Check size={9} style={{ marginRight: 5 }} />}{o}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <NavRow onNext={onNext} nextDisabled={!ok} />
    </>
  );
}

// ── Step 2 — CRM ──────────────────────────────────────────────────────────────

function CrmStep({ conn, onConnect, onBack, onNext }: {
  conn: Record<string, "idle" | "loading" | "done">;
  onConnect: (id: string) => void;
  onBack: () => void; onNext: () => void;
}) {
  const connectedCount = Object.values(conn).filter(v => v === "done").length;
  return (
    <>
      <StepHeader n={2} total={4} title="CRM & Sources de données" sub="Connectez vos outils pour détecter les doublons, activer le warm sourcing et enrichir automatiquement vos cibles." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
        {SOURCES.map(({ id, Icon, color, title, sub, desc }) => {
          const state = conn[id];
          return (
            <div key={id} style={{
              border: `1px solid ${state === "done" ? "#111827" : "#E5E7EB"}`,
              padding: "20px 20px 18px",
              display: "flex", alignItems: "flex-start", gap: 14,
              background: state === "done" ? "#F9FAFB" : "#fff",
              transition: "border-color 0.2s",
            }}>
              <div style={{ width: 36, height: 36, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
                  <span style={{ ...M, fontSize: 7, color: "#9CA3AF", letterSpacing: "0.08em" }}>{sub.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.6, marginBottom: 12 }}>{desc}</div>
                <button onClick={() => onConnect(id)} disabled={state !== "idle"}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px",
                    border: "1px solid #111827",
                    background: state === "done" ? "#111827" : "transparent",
                    color: state === "done" ? "#fff" : "#111827",
                    fontSize: 11, fontWeight: 500,
                    cursor: state === "idle" ? "pointer" : "default", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (state === "idle") { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={e => { if (state === "idle") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111827"; } }}
                >
                  {state === "loading" ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Connexion…</>
                    : state === "done" ? <><Check size={11} /> Connecté</>
                    : "Connect & Sync"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <NavRow
        onBack={onBack} onNext={onNext}
        nextLabel="Continuer"
        nextIcon={<ArrowRight size={14} />}
      />
      {connectedCount === 0 && (
        <p style={{ ...M, fontSize: 9, color: "#9CA3AF", textAlign: "center", marginTop: 10, letterSpacing: "0.06em" }}>
          OPTIONNEL — vous pouvez ignorer cette étape
        </p>
      )}
    </>
  );
}

// ── Step 3 — Thèse ────────────────────────────────────────────────────────────

function ThesisStep(p: {
  sectors: string[]; onToggleSector: (v: string) => void;
  excluded: string[]; onToggleExcluded: (v: string) => void;
  structures: string[]; onToggleStructure: (v: string) => void;
  regions: string[]; onToggleRegion: (v: string) => void;
  signals: string[]; onToggleSignal: (v: string) => void;
  revMin: number; revMax: number; onRevMin: (v: number) => void; onRevMax: (v: number) => void;
  evMin: number; evMax: number; onEvMin: (v: number) => void; onEvMax: (v: number) => void;
  scoring: boolean; scored: boolean; onScore: () => void;
  ok: boolean; onBack: () => void; onNext: () => void;
}) {
  return (
    <>
      <StepHeader n={3} total={4} title="Thèse d'investissement" sub="Paramétrez vos critères pour pré-scorer les 16M+ entreprises et recevoir des alertes pertinentes." />
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <TagGroup label="SECTEURS CIBLES" items={SECTORS} selected={p.sectors} onToggle={p.onToggleSector} required />
        <TagGroup label="SECTEURS EXCLUS" items={EXCLUDED_SECTORS} selected={p.excluded} onToggle={p.onToggleExcluded} />
        <TagGroup label="TYPE DE STRUCTURE" items={STRUCTURES} selected={p.structures} onToggle={p.onToggleStructure} />
        <TagGroup label="GÉOGRAPHIES CIBLES" items={REGIONS} selected={p.regions} onToggle={p.onToggleRegion} />
        <TagGroup label="SIGNAUX BODACC PRIORITAIRES" items={SIGNALS} selected={p.signals} onToggle={p.onToggleSignal} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <DualSlider label="CHIFFRE D'AFFAIRES CIBLE" min={0} max={REVENUE_MAX} valMin={p.revMin} valMax={p.revMax} onMin={p.onRevMin} onMax={p.onRevMax} />
          <DualSlider label="TICKET D'ACQUISITION (EV)" min={0} max={EV_MAX} valMin={p.evMin} valMax={p.evMax} onMin={p.onEvMin} onMax={p.onEvMax} />
        </div>

        {/* Pre-score CTA */}
        <button onClick={p.onScore} disabled={!p.ok || p.scoring || p.scored}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "14px 24px",
            background: p.scored ? "#16A34A" : p.ok ? "#2563EB" : "#F3F4F6",
            color: p.ok || p.scored ? "#fff" : "#9CA3AF",
            border: "none", fontSize: 13, fontWeight: 600,
            cursor: p.ok && !p.scoring && !p.scored ? "pointer" : "default", transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { if (p.ok && !p.scoring && !p.scored) e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          {p.scoring ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Pré-scoring en cours…</>
            : p.scored ? <><Check size={14} /> Base pré-scorée — {p.sectors.length} secteur{p.sectors.length > 1 ? "s" : ""} configuré{p.sectors.length > 1 ? "s" : ""}</>
            : <><Sparkles size={14} /> Pré-scorer ma base de données</>}
        </button>
      </div>
      <NavRow onBack={p.onBack} onNext={p.onNext} nextDisabled={!p.ok} />
    </>
  );
}

// ── Step 4 — Équipe & Alertes ─────────────────────────────────────────────────

function TeamStep(p: {
  emailInput: string; setEmailInput: (v: string) => void;
  invites: { email: string; role: string }[]; onAddInvite: () => void;
  onRemoveInvite: (e: string) => void; onChangeRole: (e: string, r: string) => void;
  notifFreq: string; setNotifFreq: (v: string) => void;
  notifChan: string; setNotifChan: (v: string) => void;
  onBack: () => void; onFinish: () => void;
}) {
  return (
    <>
      <StepHeader n={4} total={4} title="Équipe & Alertes" sub="Invitez vos collègues et configurez vos préférences de notifications." />
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

        {/* Invitations */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={11} /> INVITER DES COLLÈGUES
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={p.emailInput}
              onChange={e => p.setEmailInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && p.onAddInvite()}
              placeholder="prénom.nom@cabinet.com"
              style={{ flex: 1, border: "1px solid #E5E7EB", padding: "9px 14px", fontSize: 13, color: "#111827", outline: "none", transition: "border-color 0.1s" }}
              onFocus={e => (e.target.style.borderColor = "#111827")}
              onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
            />
            <button onClick={p.onAddInvite} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
              border: "1px solid #111827", background: "transparent", color: "#111827",
              fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111827"; }}
            >
              <Plus size={13} /> Inviter
            </button>
          </div>

          {p.invites.length > 0 && (
            <div style={{ border: "1px solid #E5E7EB" }}>
              {p.invites.map(({ email, role }, i) => (
                <div key={email} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderBottom: i < p.invites.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <div style={{ width: 28, height: 28, background: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", ...M, fontSize: 10, color: "#374151", flexShrink: 0 }}>
                    {email[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{email}</span>
                  <select value={role} onChange={e => p.onChangeRole(email, e.target.value)}
                    style={{ ...M, fontSize: 9, border: "1px solid #E5E7EB", padding: "4px 8px", color: "#374151", background: "#fff", cursor: "pointer", letterSpacing: "0.06em" }}
                  >
                    {["Viewer", "Editor", "Admin"].map(r => <option key={r}>{r}</option>)}
                  </select>
                  <button onClick={() => p.onRemoveInvite(email)} style={{ color: "#9CA3AF", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {p.invites.length === 0 && (
            <p style={{ ...M, fontSize: 9, color: "#D1D5DB", letterSpacing: "0.06em" }}>OPTIONNEL — vous pourrez inviter l'équipe plus tard</p>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div style={{ ...M, fontSize: 8, color: "#6B7280", letterSpacing: "0.12em", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Bell size={11} /> PRÉFÉRENCES D'ALERTES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 10 }}>FRÉQUENCE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {NOTIF_FREQ.map(f => (
                  <label key={f} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div style={{ width: 16, height: 16, border: `1px solid ${p.notifFreq === f ? "#111827" : "#E5E7EB"}`, background: p.notifFreq === f ? "#111827" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }} onClick={() => p.setNotifFreq(f)}>
                      {p.notifFreq === f && <Check size={9} style={{ color: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 13, color: p.notifFreq === f ? "#111827" : "#6B7280" }} onClick={() => p.setNotifFreq(f)}>{f}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 10 }}>CANAL</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {NOTIF_CHAN.map(c => (
                  <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div style={{ width: 16, height: 16, border: `1px solid ${p.notifChan === c ? "#111827" : "#E5E7EB"}`, background: p.notifChan === c ? "#111827" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.1s" }} onClick={() => p.setNotifChan(c)}>
                      {p.notifChan === c && <Check size={9} style={{ color: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 13, color: p.notifChan === c ? "#111827" : "#6B7280" }} onClick={() => p.setNotifChan(c)}>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div style={{ border: "1px solid #E5E7EB", padding: "16px 20px", background: "#F9FAFB", display: "flex", alignItems: "center", gap: 12 }}>
          <Zap size={16} style={{ color: "#2563EB", flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
            Votre configuration est prête. EdRCF va pré-scorer 16M+ entreprises selon votre thèse et vous alerter sur les signaux BODACC pertinents.
          </div>
        </div>
      </div>

      <NavRow onBack={p.onBack} onNext={p.onFinish} nextLabel="Accéder au Dashboard" nextIcon={<ArrowRight size={14} />} />
    </>
  );
}

"use client";

import { useState } from "react";
import { Check, Loader2, X, ArrowRight, AlertCircle } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

// ── Brand SVG logos ────────────────────────────────────────────────────────────

function DealCloudLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="13" rx="2" fill="#1E3A5F" />
      <path d="M7 12h10M7 15.5h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="5" r="3" fill="#1E3A5F" />
      <path d="M15.5 5h3M17 3.5v3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SalesforceLogo() {
  return (
    <svg width="22" height="16" viewBox="0 0 50 34" fill="none">
      <path d="M20.8 3.2a9.5 9.5 0 0 1 7.2 3.3A7.6 7.6 0 0 1 32 5.5a7.6 7.6 0 0 1 7.6 7.6c0 .3 0 .6-.05.9A6.1 6.1 0 0 1 44 20a6.1 6.1 0 0 1-6.1 6.1H12.5a9.3 9.3 0 0 1 0-18.6c.3 0 .6 0 .9.03A9.5 9.5 0 0 1 20.8 3.2z" fill="#00A1E0" />
    </svg>
  );
}

function AffinityLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 20h16L12 2z" fill="#6366F1" />
      <path d="M12 8l-4 10h8L12 8z" fill="#fff" opacity="0.35" />
    </svg>
  );
}

function HubSpotLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#F97316">
      <path d="M15.5 8.5V6.3a1.8 1.8 0 1 0-1.5 0v2.2a5 5 0 0 0-2.3 1.1L5.8 6.4a2 2 0 1 0-.9 1.5l5.8 3.1A5 5 0 0 0 10 13a5 5 0 0 0 .7 2.6l-1.8 1.8a1.7 1.7 0 1 0 1.1 1.1l1.8-1.8A5 5 0 1 0 15.5 8.5zM14 18a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

function PipedriveLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="10" r="4.5" fill="#22C55E" />
      <path d="M12 14.5v7.5" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function OutlookLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="5" width="14" height="14" rx="1.5" fill="#0078D4" />
      <path d="M4 9.5h8M4 12h8M4 14.5h5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M15 8l8 4-8 4V8z" fill="#0078D4" />
      <path d="M15 8l8 4-8 4" stroke="#50a0e8" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: "dealcloud",  Logo: DealCloudLogo,  color: "#1E3A5F", title: "DealCloud",          sub: "Deal & Relationship CRM",  desc: "Synchronise deals, contacts et historiques. Détecte les doublons en temps réel.", category: "CRM" },
  { id: "salesforce", Logo: SalesforceLogo, color: "#00A1E0", title: "Salesforce",         sub: "CRM",                      desc: "Pipeline commercial et historique complet des contacts.", category: "CRM" },
  { id: "affinity",   Logo: AffinityLogo,   color: "#6366F1", title: "Affinity",           sub: "Relationship CRM",         desc: "Scoring relationnel automatique. Intelligence sur le warm sourcing.", category: "CRM" },
  { id: "hubspot",    Logo: HubSpotLogo,    color: "#F97316", title: "HubSpot",            sub: "CRM",                      desc: "Suivi marketing et séquences de prospection sortante.", category: "CRM" },
  { id: "pipedrive",  Logo: PipedriveLogo,  color: "#22C55E", title: "Pipedrive",          sub: "Sales CRM",                desc: "Pipeline visuel adapté aux boutiques M&A et advisory.", category: "CRM" },
  { id: "linkedin",   Logo: LinkedInLogo,   color: "#0A66C2", title: "LinkedIn",           sub: "Relationship Intelligence",desc: "Warm sourcing via les connexions de votre équipe.", category: "Sourcing" },
  { id: "outlook",    Logo: OutlookLogo,    color: "#0078D4", title: "Outlook / Exchange", sub: "Email Intelligence",       desc: "Détection de relations via l'historique email et réunions.", category: "Messaging" },
];

// EdRCF canonical fields
const EDRCF_FIELDS = [
  { key: "company_name",   label: "Company Name",       type: "string",  required: true  },
  { key: "siren",          label: "SIREN / Tax ID",     type: "string",  required: true  },
  { key: "revenue",        label: "Revenue (k€)",       type: "number",  required: false },
  { key: "sector",         label: "Sector",             type: "string",  required: false },
  { key: "city",           label: "City",               type: "string",  required: false },
  { key: "deal_stage",     label: "Deal Stage",         type: "string",  required: false },
  { key: "last_contact",   label: "Last Contact Date",  type: "date",    required: false },
  { key: "owner",          label: "Deal Owner",         type: "string",  required: false },
];

const CRM_FIELD_SUGGESTIONS: Record<string, string[]> = {
  dealcloud:  ["Company_Name", "Tax_Number", "LTM_Revenue_kEUR", "Industry_Code", "HQ_City", "Deal_Stage", "Last_Activity_Date", "Relationship_Owner"],
  salesforce: ["Name", "TaxId__c", "AnnualRevenue", "Industry", "BillingCity", "StageName", "LastActivityDate", "OwnerId"],
  affinity:   ["name", "siren", "revenue_eur", "sector_tag", "location", "pipeline_stage", "last_interaction", "owner_email"],
  hubspot:    ["company_name", "vat_number", "annualrevenue", "industry", "city", "dealstage", "notes_last_contacted", "hubspot_owner_id"],
  pipedrive:  ["name", "registration_number", "revenue", "category", "address_city", "stage_name", "last_activity_date", "owner_name"],
  linkedin:   ["firstName + lastName", "—", "—", "industry", "location", "—", "connectionDate", "recruiter"],
  outlook:    ["displayName", "—", "—", "—", "city", "—", "lastEmailDate", "senderAddress"],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [status, setStatus]   = useState<Record<string, "idle" | "loading" | "connected">>(
    Object.fromEntries(INTEGRATIONS.map(i => [i.id, "idle"]))
  );
  const [mappingFor, setMappingFor] = useState<string | null>(null);
  const [fieldMaps, setFieldMaps]   = useState<Record<string, Record<string, string>>>({});

  const handleConnect = (id: string) => {
    setStatus(p => ({ ...p, [id]: "loading" }));
    setTimeout(() => setStatus(p => ({ ...p, [id]: "connected" })), 1400 + Math.random() * 700);
  };

  const handleDisconnect = (id: string) => {
    setStatus(p => ({ ...p, [id]: "idle" }));
    setFieldMaps(p => { const n = { ...p }; delete n[id]; return n; });
  };

  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#FAFAFA", ...S }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.14em", marginBottom: 10 }}>
            SETTINGS / INTEGRATIONS
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
            Data & Integrations
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.65 }}>
            Connect your CRM and sourcing tools to eliminate duplicates and enrich your pipeline automatically.
          </p>
        </div>

        {/* Connected count banner */}
        {Object.values(status).some(s => s === "connected") && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", marginBottom: 24,
            background: "#F0FDF4", border: "1px solid #BBF7D0",
          }}>
            <Check size={13} style={{ color: "#16A34A", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#166534" }}>
              {Object.values(status).filter(s => s === "connected").length} integration{Object.values(status).filter(s => s === "connected").length > 1 ? "s" : ""} active — duplicate detection enabled
            </span>
          </div>
        )}

        {/* Groups */}
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 10 }}>
              {cat.toUpperCase()}
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
              {INTEGRATIONS.filter(i => i.category === cat).map(({ id, Logo, color, title, sub, desc }, idx, arr) => {
                const s = status[id];
                const mapped = !!fieldMaps[id];
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "15px 20px",
                      borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none",
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, flexShrink: 0,
                      border: "1px solid #F3F4F6", background: "#FAFAFA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Logo />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</span>
                        <span style={{
                          ...M, fontSize: 8, color: "#9CA3AF", letterSpacing: "0.06em",
                          border: "1px solid #F3F4F6", padding: "1px 5px",
                        }}>
                          {sub.toUpperCase()}
                        </span>
                        {s === "connected" && mapped && (
                          <span style={{ ...M, fontSize: 8, color: "#16A34A", letterSpacing: "0.06em" }}>
                            MAPPING ACTIF
                          </span>
                        )}
                        {s === "connected" && !mapped && (
                          <span style={{ ...M, fontSize: 8, color: "#F59E0B", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 3 }}>
                            <AlertCircle size={9} /> CONFIG REQUISE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5 }}>{desc}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {s === "connected" && (
                        <>
                          <button
                            onClick={() => setMappingFor(id)}
                            style={{
                              fontSize: 12, color: "#374151",
                              background: "transparent", border: "1px solid #E5E7EB",
                              padding: "6px 14px", cursor: "pointer", transition: "all 0.1s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "#374151")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
                          >
                            {mapped ? "Edit Mapping" : "Set Up"}
                          </button>
                          <button
                            onClick={() => handleDisconnect(id)}
                            style={{
                              fontSize: 12, color: "#9CA3AF",
                              background: "transparent", border: "1px solid #F3F4F6",
                              padding: "6px 10px", cursor: "pointer", transition: "all 0.1s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#DC2626"; e.currentTarget.style.color = "#DC2626"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#F3F4F6"; e.currentTarget.style.color = "#9CA3AF"; }}
                          >
                            Disconnect
                          </button>
                        </>
                      )}
                      {s !== "connected" && (
                        <button
                          onClick={() => s === "idle" && handleConnect(id)}
                          disabled={s === "loading"}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 12, fontWeight: 500, padding: "6px 16px",
                            border: "1px solid #111827",
                            background: s === "loading" ? "#F9FAFB" : "transparent",
                            color: s === "loading" ? "#9CA3AF" : "#111827",
                            cursor: s === "idle" ? "pointer" : "default",
                            transition: "all 0.15s", whiteSpace: "nowrap" as const,
                          }}
                          onMouseEnter={e => { if (s === "idle") { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#fff"; } }}
                          onMouseLeave={e => { if (s === "idle") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111827"; } }}
                        >
                          {s === "loading"
                            ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Connecting…</>
                            : "Connect"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Field Mapping Modal */}
      {mappingFor && (
        <FieldMappingModal
          id={mappingFor}
          integration={INTEGRATIONS.find(i => i.id === mappingFor)!}
          existing={fieldMaps[mappingFor] ?? {}}
          onSave={m => { setFieldMaps(p => ({ ...p, [mappingFor]: m })); setMappingFor(null); }}
          onClose={() => setMappingFor(null)}
        />
      )}
    </div>
  );
}

// ── Field Mapping Modal ────────────────────────────────────────────────────────

function FieldMappingModal({ id, integration, existing, onSave, onClose }: {
  id: string;
  integration: typeof INTEGRATIONS[0];
  existing: Record<string, string>;
  onSave: (m: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [map, setMap] = useState<Record<string, string>>(existing);
  const suggestions = CRM_FIELD_SUGGESTIONS[id] ?? CRM_FIELD_SUGGESTIONS.dealcloud;
  const mappedCount = Object.values(map).filter(Boolean).length;
  const requiredMapped = EDRCF_FIELDS.filter(f => f.required).every(f => !!map[f.key]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 200 }}
      />

      {/* Dialog */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 201,
        width: 620, maxHeight: "82vh",
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        boxShadow: "0 24px 64px rgba(0,0,0,0.10)",
        display: "flex", flexDirection: "column",
        ...S,
      }}>

        {/* Dialog header */}
        <div style={{
          padding: "18px 24px 14px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <integration.Logo />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                Configure {integration.title}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.55 }}>
              Map your {integration.title} fields to EdRCF properties for bi-directional sync.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, display: "flex" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
            onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 28px 1fr",
          padding: "8px 24px", background: "#F9FAFB",
          borderBottom: "1px solid #F3F4F6", flexShrink: 0,
        }}>
          <span style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.1em" }}>EdRCF FIELD</span>
          <span />
          <span style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.1em" }}>
            {integration.title.toUpperCase()} FIELD
          </span>
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {EDRCF_FIELDS.map(({ key, label, type, required }, i) => (
            <div
              key={key}
              style={{
                display: "grid", gridTemplateColumns: "1fr 28px 1fr",
                alignItems: "center",
                padding: "11px 24px",
                borderBottom: i < EDRCF_FIELDS.length - 1 ? "1px solid #F9FAFB" : "none",
                background: map[key] ? "transparent" : required ? "rgba(254,243,199,0.3)" : "transparent",
              }}
            >
              {/* EdRCF */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{label}</span>
                <span style={{ ...M, fontSize: 8, color: "#D1D5DB", letterSpacing: "0.06em" }}>{type}</span>
                {required && <span style={{ ...M, fontSize: 8, color: "#DC2626" }}>REQ</span>}
              </div>

              {/* Arrow */}
              <ArrowRight size={11} style={{ color: "#D1D5DB", justifySelf: "center" as const }} />

              {/* CRM select */}
              <select
                value={map[key] ?? ""}
                onChange={e => setMap(p => ({ ...p, [key]: e.target.value }))}
                style={{
                  width: "100%", border: "1px solid #E5E7EB",
                  padding: "6px 9px", fontSize: 12, cursor: "pointer",
                  color: map[key] ? "#111827" : "#9CA3AF",
                  background: "#FFFFFF", outline: "none",
                  ...M, transition: "border-color 0.1s",
                }}
                onFocus={e => (e.target.style.borderColor = "#374151")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              >
                <option value="">— Not mapped —</option>
                {suggestions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #F3F4F6",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, background: "#FAFAFA",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.06em" }}>
              {mappedCount}/{EDRCF_FIELDS.length} MAPPED
            </span>
            {!requiredMapped && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#D97706" }}>
                <AlertCircle size={11} /> Required fields missing
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                fontSize: 12, color: "#6B7280", background: "transparent",
                border: "1px solid #E5E7EB", padding: "8px 18px",
                cursor: "pointer", transition: "all 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(map)}
              style={{
                fontSize: 12, fontWeight: 500,
                background: "#111827", color: "#FFFFFF",
                border: "none", padding: "8px 22px",
                cursor: "pointer", transition: "opacity 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Save Mapping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

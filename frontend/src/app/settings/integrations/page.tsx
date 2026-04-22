"use client";

import { useState } from "react";
import { Cloud, Linkedin, Mail, Check, Loader2, X, ArrowRight, AlertCircle } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

// ── Data ──────────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: "dealcloud",   Icon: Cloud,    color: "#1E3A5F", title: "DealCloud",           sub: "Deal & Relationship CRM",  desc: "Synchronise deals, contacts et historiques. Détecte les doublons en temps réel.", category: "CRM" },
  { id: "salesforce",  Icon: Cloud,    color: "#00A1E0", title: "Salesforce",          sub: "CRM",                      desc: "Pipeline commercial et historique complet des contacts.", category: "CRM" },
  { id: "affinity",    Icon: Cloud,    color: "#6366F1", title: "Affinity",            sub: "Relationship CRM",         desc: "Scoring relationnel automatique. Intelligence sur le warm sourcing.", category: "CRM" },
  { id: "hubspot",     Icon: Cloud,    color: "#F97316", title: "HubSpot",             sub: "CRM",                      desc: "Suivi marketing et séquences de prospection sortante.", category: "CRM" },
  { id: "pipedrive",   Icon: Cloud,    color: "#22C55E", title: "Pipedrive",           sub: "Sales CRM",                desc: "Pipeline visuel adapté aux boutiques M&A et advisory.", category: "CRM" },
  { id: "linkedin",    Icon: Linkedin, color: "#0A66C2", title: "LinkedIn",            sub: "Relationship Intelligence",desc: "Warm sourcing via les connexions de votre équipe.", category: "Sourcing" },
  { id: "outlook",     Icon: Mail,     color: "#0078D4", title: "Outlook / Exchange",  sub: "Email Intelligence",       desc: "Détection de relations via l'historique email et réunions.", category: "Messaging" },
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
              {INTEGRATIONS.filter(i => i.category === cat).map(({ id, Icon, color, title, sub, desc }, idx, arr) => {
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
                      <Icon size={16} style={{ color }} />
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
              <integration.Icon size={15} style={{ color: integration.color }} />
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

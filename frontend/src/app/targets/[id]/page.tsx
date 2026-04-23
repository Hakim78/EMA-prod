"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Network, ArrowUpRight, AlertTriangle,
  Users, MapPin, Hash, Calendar, Building2, ExternalLink, FileText,
  Activity, X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { Target } from "@/types";
import CompanyNetworkGraph, { type NetworkNode, type NetworkLink } from "@/components/ui/CompanyNetworkGraph";

function buildNetworkNodes(t: Target): NetworkNode[] {
  const nodes: NetworkNode[] = [{ id: t.siren ?? t.id, name: t.name, type: "company" }];
  t.dirigeants?.forEach((d, i) => nodes.push({ id: `dir-${i}`, name: d.name, type: "director" }));
  t.group?.subsidiaries?.slice(0, 6).forEach((sub, i) => nodes.push({ id: `sub-${i}`, name: sub, type: "subsidiary" }));
  if (t.group?.parent) nodes.push({ id: "parent", name: t.group.parent, type: "investor" });
  return nodes;
}

function buildNetworkLinks(t: Target): NetworkLink[] {
  const links: NetworkLink[] = [];
  const cid = t.siren ?? t.id;
  t.dirigeants?.forEach((_, i) => links.push({ source: cid, target: `dir-${i}`, label: "dirige" }));
  t.group?.subsidiaries?.slice(0, 6).forEach((_, i) => links.push({ source: cid, target: `sub-${i}`, label: "filiale" }));
  if (t.group?.parent) links.push({ source: "parent", target: cid, label: "détient" });
  return links;
}

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const DIMENSION_FR: Record<string, string> = {
  signaux_patrimoniaux: "PATRIMONIAUX",
  signaux_strategiques: "STRATÉGIQUES",
  signaux_financiers: "FINANCIERS",
  signaux_gouvernance: "GOUVERNANCE",
  signaux_marche: "MARCHÉ",
};

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? "#4A9A5A" : pct >= 60 ? "#FF4500" : pct >= 40 ? "#884422" : "#333333";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ ...M, fontSize: 8, color: "#444444", letterSpacing: "0.12em" }}>{label}</span>
        <span style={{ ...M, fontSize: 8, color }}>{score}/{max}</span>
      </div>
      <div style={{ height: 2, background: "#1A1A1A", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function TargetDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [news, setNews] = useState<{ title: string; link: string; date: string; source: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/targets/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        setTarget(d.data);
        setLoading(false);
        const siren = d.data?.siren;
        if (siren) {
          setNewsLoading(true);
          fetch(`/api/news/${siren}`)
            .then(r => r.json())
            .then(d => { setNews(d.data?.articles || []); setNewsLoading(false); })
            .catch(() => setNewsLoading(false));
        }
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#0A0A0A", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4500", animation: "ping 1.5s ease infinite" }} />
      <span style={{ ...M, fontSize: 9, color: "#444444", letterSpacing: "0.2em" }}>CHARGEMENT_DOSSIER…</span>
      <style>{`@keyframes ping { 75%,100% { transform: scale(2.5); opacity: 0; } }`}</style>
    </div>
  );

  if (error || !target) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#0A0A0A", flexDirection: "column", gap: 16 }}>
      <AlertTriangle size={24} style={{ color: "#FF4500" }} />
      <span style={{ ...M, fontSize: 10, color: "#FAFAFA", letterSpacing: "0.15em" }}>CIBLE_INTROUVABLE</span>
      <Link href="/targets" style={{ ...M, fontSize: 9, color: "#444444", letterSpacing: "0.1em", textDecoration: "none" }}>← RETOUR_VAULT</Link>
    </div>
  );

  const dims = target.scoring_details ? Object.entries(target.scoring_details) : [];
  const hot = target.bodacc_recent;

  return (
    <div style={{ minHeight: "100dvh", background: "#0A0A0A", overflowY: "auto" }} className="thin-scrollbar">

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "#FAFAFA", color: "#0A0A0A",
          padding: "8px 20px", zIndex: 200,
          ...M, fontSize: 9, letterSpacing: "0.12em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4500" }} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        height: 48, borderBottom: "1px solid #1F1F1F",
        display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
        background: "#050505", position: "sticky", top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#444444", display: "flex" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FAFAFA")}
          onMouseLeave={e => (e.currentTarget.style.color = "#444444")}
        >
          <ArrowLeft size={14} />
        </button>
        <div style={{ width: 1, height: 20, background: "#1F1F1F" }} />
        <span style={{ ...S, fontSize: 14, color: "#FAFAFA", fontStyle: "italic", flex: 1 }}>{target.name}</span>
        {hot && (
          <span style={{
            ...M, fontSize: 8, color: "#FF4500", letterSpacing: "0.12em",
            border: "1px solid rgba(255,69,0,0.3)", padding: "2px 8px",
            animation: "pulse 2s infinite",
          }}>BODACC_ALERT</span>
        )}
        <span style={{ ...M, fontSize: 24, color: "#FF4500", letterSpacing: "-0.03em" }}>{target.globalScore}</span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Score card */}
          <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 20 }}>
            <div style={{ ...M, fontSize: 8, color: "#444444", letterSpacing: "0.15em", marginBottom: 12 }}>M&A_INDEX_SCORE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
              <span style={{ ...M, fontSize: 48, color: "#FF4500", lineHeight: 1, letterSpacing: "-0.03em" }}>{target.globalScore}</span>
              <span style={{ ...M, fontSize: 9, color: "#444444" }}>/100</span>
            </div>
            <div style={{ height: 3, background: "#1A1A1A", marginBottom: 16 }}>
              <div style={{ height: "100%", width: `${target.globalScore}%`, background: "#FF4500", boxShadow: "0 0 8px rgba(255,69,0,0.4)" }} />
            </div>
            <div style={{ ...M, fontSize: 9, color: target.priorityLevel?.includes("Prioritaire") ? "#FF4500" : "#666666", letterSpacing: "0.08em" }}>
              {target.priorityLevel ?? "—"}
            </div>

            {dims.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1A1A1A" }}>
                <div style={{ ...M, fontSize: 7, color: "#2A2A2A", letterSpacing: "0.15em", marginBottom: 10 }}>DIMENSIONS_SCORING</div>
                {dims.map(([key, dim]) => (
                  <ScoreBar
                    key={key}
                    label={dim.label || DIMENSION_FR[key] || key}
                    score={dim.score || 0}
                    max={dim.max || 100}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Identity */}
          <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 16 }}>
            <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.15em", borderBottom: "1px solid #1A1A1A", paddingBottom: 8, marginBottom: 12 }}>IDENTITÉ_SOCIÉTÉ</div>
            {[
              { k: "SIREN", v: target.siren, icon: <Hash size={10} /> },
              { k: "CODE_NAF", v: target.code_naf, icon: <Building2 size={10} /> },
              { k: "CRÉATION", v: target.creation_date, icon: <Calendar size={10} /> },
              { k: "VILLE", v: target.city, icon: <MapPin size={10} /> },
              { k: "RÉGION", v: target.region, icon: <MapPin size={10} /> },
              { k: "STRUCTURE", v: target.structure, icon: <Building2 size={10} /> },
              { k: "SECTEUR", v: target.sector, icon: <Activity size={10} /> },
            ].filter(r => r.v).map(row => (
              <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #0D0D0D" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "#444444" }}>{row.icon}</span>
                  <span style={{ ...M, fontSize: 8, color: "#444444", letterSpacing: "0.1em" }}>{row.k}</span>
                </div>
                <span style={{ ...M, fontSize: 9, color: "#FAFAFA" }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Financials */}
          {target.financials && (
            <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 16 }}>
              <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.15em", borderBottom: "1px solid #1A1A1A", paddingBottom: 8, marginBottom: 12 }}>DONNÉES_FINANCIÈRES</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { k: "CHIFFRE_D'AFFAIRES", v: target.financials.revenue },
                  { k: "CROISSANCE_CA", v: target.financials.revenue_growth },
                  { k: "EBITDA", v: target.financials.ebitda },
                  { k: "MARGE_EBITDA", v: target.financials.ebitda_margin },
                ].filter(r => r.v).map(row => (
                  <div key={row.k} style={{ background: "#111111", border: "1px solid #1A1A1A", padding: "8px 10px" }}>
                    <div style={{ ...M, fontSize: 7, color: "#444444", marginBottom: 3, letterSpacing: "0.1em" }}>{row.k}</div>
                    <div style={{ ...M, fontSize: 11, color: "#FAFAFA" }}>{row.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dirigeants */}
          {(target.dirigeants?.length ?? 0) > 0 && (
            <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 16 }}>
              <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.15em", borderBottom: "1px solid #1A1A1A", paddingBottom: 8, marginBottom: 12 }}>DIRIGEANTS</div>
              {target.dirigeants?.map((d, i) => (
                <div key={i} style={{
                  borderLeft: "2px solid #1F1F1F", paddingLeft: 10, marginBottom: 10, paddingBottom: 4,
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderLeftColor = "#FF4500")}
                  onMouseLeave={e => (e.currentTarget.style.borderLeftColor = "#1F1F1F")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ ...S, fontSize: 12, color: "#FAFAFA" }}>{d.name}</span>
                    {d.age > 0 && (
                      <span style={{ ...M, fontSize: 9, color: d.age >= 65 ? "#FF4500" : "#666666" }}>{d.age} ans</span>
                    )}
                  </div>
                  <span style={{ ...M, fontSize: 8, color: "#555555", letterSpacing: "0.08em" }}>{d.role}</span>
                  {d.since && <span style={{ ...M, fontSize: 7, color: "#2A2A2A", display: "block", marginTop: 2 }}>depuis {d.since}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Group */}
          {target.group?.is_group && (
            <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 16 }}>
              <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.15em", borderBottom: "1px solid #1A1A1A", paddingBottom: 8, marginBottom: 12 }}>STRUCTURE_GROUPE</div>
              {target.group.parent && (
                <div style={{ background: "#111111", border: "1px solid #1A1A1A", padding: "8px 10px", marginBottom: 8 }}>
                  <div style={{ ...M, fontSize: 7, color: "#444444", marginBottom: 2 }}>MAISON_MÈRE</div>
                  <div style={{ ...M, fontSize: 11, color: "#FAFAFA" }}>{target.group.parent}</div>
                </div>
              )}
              {target.group.consolidated_revenue && (
                <div style={{ background: "#111111", border: "1px solid #1A1A1A", padding: "8px 10px", marginBottom: 8 }}>
                  <div style={{ ...M, fontSize: 7, color: "#444444", marginBottom: 2 }}>CA_CONSOLIDÉ</div>
                  <div style={{ ...M, fontSize: 11, color: "#4A9A5A" }}>{target.group.consolidated_revenue}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Analysis */}
          {target.analysis && (
            <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 20 }}>
              <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.2em", marginBottom: 12 }}>01. THÈSE_STRATÉGIQUE</div>
              <div style={{ ...M, fontSize: 20, color: "#FAFAFA", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: 12, fontStyle: "italic" }}>
                {target.analysis.type ?? "—"}
              </div>
              <div style={{ ...S, fontSize: 13, color: "#666666", lineHeight: 1.6, borderLeft: "2px solid rgba(255,69,0,0.3)", paddingLeft: 12 }}>
                «{target.analysis.narrative ?? "Analyse en cours."}»
              </div>
            </div>
          )}

          {/* Signals */}
          {(target.topSignals?.length ?? 0) > 0 && (
            <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 20 }}>
              <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.2em", marginBottom: 12 }}>02. INDICATEURS_CONVICTION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {target.topSignals?.map((sig, i) => (
                  <div key={i} style={{
                    borderLeft: `2px solid ${sig.severity === "high" ? "#FF4500" : sig.severity === "medium" ? "#884422" : "#2A2A2A"}`,
                    paddingLeft: 12, paddingBottom: 6,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ ...M, fontSize: 10, color: "#FAFAFA", letterSpacing: "0.04em" }}>{sig.label?.toUpperCase()}</span>
                      {sig.points && <span style={{ ...M, fontSize: 8, color: "#4A9A5A" }}>+{sig.points} pts</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {sig.family && <span style={{ ...M, fontSize: 7, color: "#444444", letterSpacing: "0.1em" }}>{sig.family?.toUpperCase()}</span>}
                      {sig.severity && (
                        <span style={{
                          ...M, fontSize: 7,
                          color: sig.severity === "high" ? "#FF4500" : "#666666",
                          letterSpacing: "0.1em",
                        }}>{sig.severity?.toUpperCase()}</span>
                      )}
                      {sig.source_url ? (
                        <a href={sig.source_url} target="_blank" rel="noreferrer" style={{ ...M, fontSize: 7, color: "#444444", textDecoration: "none", display: "flex", gap: 2, alignItems: "center" }}>
                          {sig.source} <ExternalLink size={7} />
                        </a>
                      ) : sig.source ? (
                        <span style={{ ...M, fontSize: 7, color: "#333333" }}>{sig.source}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activation */}
          {target.activation && (
            <div style={{ background: "#111111", border: "1px solid rgba(255,69,0,0.2)", padding: 20 }}>
              <div style={{ ...M, fontSize: 8, color: "#FF4500", letterSpacing: "0.2em", marginBottom: 16 }}>03. ACTIVATION_STRATÉGIQUE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {target.activation.approach && (
                  <div>
                    <div style={{ ...M, fontSize: 7, color: "#444444", letterSpacing: "0.12em", marginBottom: 4 }}>ANGLE_D'APPROCHE</div>
                    <div style={{ ...S, fontSize: 13, color: "#FAFAFA" }}>{target.activation.approach}</div>
                  </div>
                )}
                {(target.activation.deciders?.length ?? 0) > 0 && (
                  <div>
                    <div style={{ ...M, fontSize: 7, color: "#444444", letterSpacing: "0.12em", marginBottom: 6 }}>DÉCIDEURS_CLÉS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {target.activation.deciders?.map((d, i) => (
                        <span key={i} style={{
                          ...M, fontSize: 9, color: "#FAFAFA",
                          background: "#1A1A1A", border: "1px solid #2A2A2A",
                          padding: "3px 8px",
                        }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {target.activation.reason && (
                  <div>
                    <div style={{ ...M, fontSize: 7, color: "#444444", letterSpacing: "0.12em", marginBottom: 4 }}>MOTIF_OBJECTIF</div>
                    <div style={{ ...S, fontSize: 12, color: "#888888" }}>{target.activation.reason}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* News */}
          <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 20 }}>
            <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.2em", marginBottom: 12 }}>VEILLE_PRESSE</div>
            {newsLoading ? (
              <span style={{ ...M, fontSize: 9, color: "#333333" }}>Chargement articles…</span>
            ) : news.length === 0 ? (
              <span style={{ ...M, fontSize: 9, color: "#2A2A2A" }}>Aucun article récent trouvé.</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {news.slice(0, 6).map((article, i) => (
                  <a
                    key={i}
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 12px",
                      background: "transparent", border: "1px solid #111111",
                      textDecoration: "none",
                      borderLeft: "2px solid transparent",
                      transition: "background 0.1s, border-color 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#111111"; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = "#FF4500"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = "transparent"; }}
                  >
                    <ExternalLink size={11} style={{ color: "#FF4500", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ ...S, fontSize: 12, color: "#FAFAFA", lineHeight: 1.4, marginBottom: 4 }}>{article.title}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ ...M, fontSize: 8, color: "#444444" }}>{article.source}</span>
                        <span style={{ ...M, fontSize: 8, color: "#333333" }}>{article.date?.split(",")[0]}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Réseau cartographique */}
          <div style={{ background: "#0D0D0D", border: "1px solid #1F1F1F", padding: 20 }}>
            <div style={{ ...M, fontSize: 8, color: "#2A2A2A", letterSpacing: "0.2em", marginBottom: 12 }}>04. RÉSEAU_CARTOGRAPHIQUE</div>
            <CompanyNetworkGraph
              nodes={buildNetworkNodes(target)}
              links={buildNetworkLinks(target)}
              height={300}
            />
          </div>

          {/* Bottom bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 16, borderTop: "1px solid #1F1F1F",
          }}>
            <button
              onClick={() => router.push(`/graph?siren=${target.siren}`)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", border: "1px solid #1F1F1F", background: "#111111",
                cursor: "pointer", color: "#FAFAFA",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4500"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1F1F1F"; }}
            >
              <Network size={13} style={{ color: "#FF4500" }} />
              <span style={{ ...M, fontSize: 9, letterSpacing: "0.12em" }}>RÉSEAU_RELATIONNEL</span>
            </button>
            <button
              onClick={() => { showToast("EXPORT_DOSSIER_INITIÉ"); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", border: "1px solid #FF4500",
                background: "rgba(255,69,0,0.05)",
                cursor: "pointer", color: "#FAFAFA",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,69,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,69,0,0.05)"; }}
            >
              <FileText size={13} style={{ color: "#FF4500" }} />
              <span style={{ ...M, fontSize: 9, letterSpacing: "0.12em" }}>GÉNÉRER_DOSSIER</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
    </div>
  );
}

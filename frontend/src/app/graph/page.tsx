"use client";

import { useState, useMemo, useRef, useEffect, useCallback, Component, Suspense } from "react";
import type { ReactNode, ErrorInfo } from "react";
import {
  Network, Search, X, AlertTriangle, Building2, Users,
  GitBranch, Zap, Activity, TrendingUp, Layers, ZoomIn, ZoomOut,
  Maximize2, Filter, ChevronRight, MapPin, BarChart2,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { forceCollide, forceX, forceY, forceManyBody } from "d3-force";
import { CanvasSkeleton } from "@/components/ui/PageSkeleton";
import ErrorState from "@/components/ui/ErrorState";
import CompanyNetworkGraph, { type NetworkNode, type NetworkLink } from "@/components/ui/CompanyNetworkGraph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

class GraphErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  componentDidCatch(e: Error, i: ErrorInfo) { console.warn("[Graph]", e, i); }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
        <Activity size={24} style={{ color: "#FF4500" }} />
        <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.15em" }}>ERREUR_GRAPHE</span>
        <button onClick={() => this.setState({ crashed: false })} style={{ ...M, fontSize: 9, color: "#FF4500", background: "transparent", border: "none", cursor: "pointer" }}>
          RÉESSAYER
        </button>
      </div>
    );
    return this.props.children;
  }
}

interface GraphNode {
  id: string; name: string; type: string; role: string; color: string;
  company?: string; score?: number | null; signals_count?: number;
  signals?: string[]; is_holding?: boolean; age?: number; age_signal?: boolean;
  multi_mandats?: boolean; sector?: string; city?: string; siren?: string;
  ca?: string; ebitda?: string; priority?: string; node_size?: number;
  bodacc_recent?: boolean; x?: number; y?: number;
}
interface GraphLink {
  source: string | GraphNode; target: string | GraphNode;
  label: string; value: number; type?: string;
}
interface GraphData { nodes: GraphNode[]; links: GraphLink[]; }
interface GraphStats { nodes: number; links: number; companies: number; directors: number; cross_mandates: number; signals: number; }
type PanelTab = "profil" | "connexions" | "signaux";

const NODE_COLORS = {
  company: "#FF4500", company_bodacc: "#FF6600", director: "#FAFAFA",
  holding: "#884422", default: "#444444",
};

// ── Stratified layout: holdings top · companies middle ring · directors outer ──
function computeStratifiedLayout(nodes: GraphNode[], links: GraphLink[]): void {
  const companies = nodes.filter(n => n.type === "company" && !n.is_holding);
  const directors  = nodes.filter(n => n.type === "director");
  const holdings   = nodes.filter(n => n.is_holding || n.type === "holding");

  // ── Holdings: horizontal row at top ──────────────────────────────────────
  holdings.forEach((n, i) => {
    const span = Math.max(0, (holdings.length - 1) * 130);
    n.fx = (i / Math.max(holdings.length - 1, 1) - 0.5) * span;
    n.fy = -240;
  });

  // ── Companies: radial ring sorted by score desc ───────────────────────────
  const sorted = [...companies].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const cR = Math.max(130, sorted.length * 28);
  sorted.forEach((n, i) => {
    const angle = (i / Math.max(sorted.length, 1)) * 2 * Math.PI - Math.PI / 2;
    n.fx = cR * Math.cos(angle);
    n.fy = cR * Math.sin(angle);
  });

  // ── Directors: grouped near their primary company ─────────────────────────
  // Build director → connected-company map
  const dirToCompany = new Map<string, string[]>();
  directors.forEach(d => dirToCompany.set(d.id, []));
  links.forEach(l => {
    const s = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
    const t = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
    const isCompS = companies.some(c => c.id === s);
    const isCompT = companies.some(c => c.id === t);
    if (isCompS && dirToCompany.has(t)) dirToCompany.get(t)!.push(s);
    if (isCompT && dirToCompany.has(s)) dirToCompany.get(s)!.push(t);
  });

  // Group directors by their primary company (most connections → first company)
  const companyDirGroups = new Map<string, GraphNode[]>();
  directors.forEach(d => {
    const cids = dirToCompany.get(d.id) ?? [];
    const primary = cids[0] ?? "__unlinked__";
    if (!companyDirGroups.has(primary)) companyDirGroups.set(primary, []);
    companyDirGroups.get(primary)!.push(d);
  });

  companyDirGroups.forEach((group, cid) => {
    const company = companies.find(c => c.id === cid);
    const baseX = company?.fx ?? 0;
    const baseY = company?.fy ?? 0;

    // Direction from origin to company → directors radiate outward from there
    const dirAngle = Math.atan2(baseY, baseX);
    const outR = cR + 90;

    group.forEach((d, i) => {
      const spread = Math.min((group.length - 1) * 40, 200);
      const offset = group.length === 1 ? 0 : (i / (group.length - 1) - 0.5) * spread;
      const perp = dirAngle + Math.PI / 2;
      d.fx = outR * Math.cos(dirAngle) + offset * Math.cos(perp);
      d.fy = outR * Math.sin(dirAngle) + offset * Math.sin(perp);
    });
  });

  // ── Overlap resolution pass (simple iterative push) ───────────────────────
  const MIN_DIST = 36;
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (a.fx === undefined || b.fx === undefined) continue;
        const dx = (b.fx ?? 0) - (a.fx ?? 0);
        const dy = (b.fy ?? 0) - (a.fy ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) / 2 + 1;
          const nx = dx / dist, ny = dy / dist;
          // Don't push holdings (they're fixed to their layer)
          if (a.type !== "holding" && !a.is_holding) { a.fx! -= nx * push; a.fy! -= ny * push; }
          if (b.type !== "holding" && !b.is_holding) { b.fx! += nx * push; b.fy! += ny * push; }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${alpha})`;
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy);
  ctx.closePath();
}

function GraphPageInner() {
  const searchParams = useSearchParams();
  const siren = searchParams?.get("siren");

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("profil");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const fgRef = useRef<any>(null);
  const tickRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => { tickRef.current = (tickRef.current + 0.5) % 100; animRef.current = requestAnimationFrame(tick); };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const url = siren ? `/api/graph?siren=${siren}` : "/api/graph";
    setFetchError(false);
    fetch(url).then(r => r.json()).then(d => {
      // Pre-compute stratified layout before setting state
      computeStratifiedLayout(d.data.nodes, d.data.links);
      setGraphData(d.data);
      setStats(d.stats);
      if (d.data.nodes.length > 0) {
        setSelectedNode(d.data.nodes.find((n: GraphNode) => n.type === "company") ?? d.data.nodes[0]);
      }
      setLoading(false);
    }).catch(() => { setLoading(false); setFetchError(true); });
  }, [siren, retryKey]);

  // Apply custom d3 forces after graph mounts / data changes
  useEffect(() => {
    if (!fgRef.current || !graphData.nodes.length) return;
    const fg = fgRef.current;
    // Strong repulsion — nodes push each other away
    fg.d3Force("charge", forceManyBody().strength(-300).distanceMax(400));
    // Collision — prevent node overlap
    fg.d3Force("collision", forceCollide((n: any) => (n.node_size || 6) + 12).strength(0.9));
    // Soft positional pull toward pre-computed fx/fy
    fg.d3Force("anchorX", forceX((n: any) => n.fx ?? 0).strength(0.8));
    fg.d3Force("anchorY", forceY((n: any) => n.fy ?? 0).strength(0.8));
    // Kill default link force — positions are already set
    fg.d3Force("link", null);
    fg.d3ReheatSimulation();
  }, [graphData.nodes.length]);

  const neighborIds = useMemo(() => {
    if (!selectedNode || !focusMode) return null;
    const ids = new Set<string>([selectedNode.id]);
    graphData.links.forEach(l => {
      const s = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
      const t = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
      if (s === selectedNode.id) ids.add(t);
      if (t === selectedNode.id) ids.add(s);
    });
    return ids;
  }, [selectedNode, focusMode, graphData.links]);

  const filteredData = useMemo(() => {
    let nodes = graphData.nodes;
    if (search) nodes = nodes.filter(n =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      (n.sector ?? "").toLowerCase().includes(search.toLowerCase())
    );
    const ids = new Set(nodes.map(n => n.id));
    return { nodes, links: graphData.links.filter(l => ids.has(l.source as string) && ids.has(l.target as string)) };
  }, [search, graphData]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    try {
      const { x, y } = node;
      if (!isFinite(x) || !isFinite(y)) return;
      const r = node.node_size || 6;
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isDirector = node.type === "director";
      const isHolding = node.is_holding || node.type === "holding";
      const isBodacc = !!node.bodacc_recent;
      const isFaded = neighborIds != null && !neighborIds.has(node.id);

      let nodeColor: string;
      if (isDirector) nodeColor = NODE_COLORS.director;
      else if (isHolding) nodeColor = NODE_COLORS.holding;
      else if (isBodacc) nodeColor = NODE_COLORS.company_bodacc;
      else nodeColor = NODE_COLORS.company;

      const alpha = isFaded ? 0.1 : 1;

      if ((isSelected || isHovered) && !isFaded) {
        ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 2 * Math.PI);
        const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4);
        g.addColorStop(0, hexToRgba(nodeColor, isSelected ? 0.3 : 0.15));
        g.addColorStop(1, hexToRgba(nodeColor, 0));
        ctx.fillStyle = g; ctx.fill();
      }

      if (isSelected) {
        ctx.beginPath(); ctx.arc(x, y, r + 4 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = nodeColor; ctx.lineWidth = 1.5 / globalScale; ctx.stroke();
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = isFaded ? 0 : 8;
      ctx.shadowColor = nodeColor;

      if (isDirector) {
        drawDiamond(ctx, x, y, r);
        ctx.fillStyle = hexToRgba(nodeColor, 0.9); ctx.fill();
        ctx.strokeStyle = "#1F1F1F"; ctx.lineWidth = 1 / globalScale; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = nodeColor; ctx.fill();
      }

      if (isHolding) {
        ctx.beginPath(); ctx.arc(x, y, r + 2 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = hexToRgba(nodeColor, 0.5); ctx.lineWidth = 1 / globalScale; ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      if (!isDirector && (node.score ?? 0) > 0 && globalScale > 0.7) {
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#0A0A0A";
        ctx.font = `bold ${Math.max(5, Math.min(8, 6 / globalScale))}px monospace`;
        ctx.fillText(String(node.score), x, y);
      }
      if (globalScale > 0.6 && !isFaded) {
        const fs = Math.max(7, Math.min(11, 9 / globalScale));
        const label = node.name.length > 14 ? node.name.slice(0, 14) + "…" : node.name;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = isDirector ? "#FAFAFA" : "#FAFAFA";
        ctx.font = `${fs}px monospace`;
        ctx.fillText(label, x, y + r + 3 / globalScale);
      }
      ctx.restore();
    } catch { /* safe */ }
  }, [selectedNode, hoveredNode, neighborIds]);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    try {
      const { source: s, target: t } = link;
      if (!isFinite(s?.x) || !isFinite(t?.x)) return;
      const isFaded = neighborIds != null && (!neighborIds.has(s.id) || !neighborIds.has(t.id));
      ctx.save();
      ctx.globalAlpha = isFaded ? 0.03 : 1;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
      if (link.type === "bodacc") {
        ctx.setLineDash([6, 4]); ctx.lineDashOffset = -tickRef.current;
        ctx.strokeStyle = "rgba(255,69,0,0.6)"; ctx.lineWidth = 1.5;
      } else if (link.type === "dirigeant" || link.type === "directs") {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(250,250,250,0.3)"; ctx.lineWidth = 1;
      } else if (link.type === "holding") {
        ctx.setLineDash([]); ctx.strokeStyle = "rgba(136,68,34,0.7)"; ctx.lineWidth = 2;
      } else if (link.type === "cross_mandate") {
        ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(255,69,0,0.5)"; ctx.lineWidth = 1.5;
      } else {
        ctx.setLineDash([]); ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
      }
      ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      ctx.restore();
    } catch { /* safe */ }
  }, [neighborIds]);

  const panelLinks = useMemo(() => {
    if (!selectedNode) return [];
    return graphData.links.filter(l => {
      const s = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
      const t = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
      return s === selectedNode.id || t === selectedNode.id;
    }).slice(0, 8);
  }, [selectedNode, graphData.links]);

  if (loading)     return <CanvasSkeleton label="CHARGEMENT_GRAPHE…" />;
  if (fetchError)  return <div style={{ height: "100dvh", display: "flex" }}><ErrorState onRetry={() => { setFetchError(false); setLoading(true); setRetryKey(k => k + 1); }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{
        height: 40, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        background: "var(--bg-raise)",
      }}>
        <Network size={11} style={{ color: "#FF4500" }} />
        <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.15em" }}>RÉSEAU_INTELLIGENCE_M&A</span>
        <div style={{ flex: 1 }} />
        {stats && (
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { v: stats.companies, l: "CIB" },
              { v: stats.directors, l: "DIR" },
              { v: stats.cross_mandates, l: "CROSS" },
              { v: stats.signals, l: "SIG" },
            ].map(s => (
              <span key={s.l} style={{ ...M, fontSize: 8, color: "var(--fg-dim)" }}>
                <span style={{ color: "var(--fg)" }}>{s.v}</span> {s.l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{
        height: 36, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        background: "var(--bg-raise)",
      }}>
        <Search size={11} style={{ color: "var(--fg-dim)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nœud…"
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "var(--fg)", ...M, fontSize: 10, flex: 1,
          }}
        />
        {selectedNode && (
          <button
            onClick={() => setFocusMode(p => !p)}
            style={{
              ...M, fontSize: 8, padding: "3px 8px",
              background: focusMode ? "rgba(255,69,0,0.1)" : "transparent",
              border: `1px solid ${focusMode ? "#FF4500" : "var(--border)"}`,
              color: focusMode ? "#FF4500" : "var(--fg-muted)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4, letterSpacing: "0.08em",
            }}
          >
            <Filter size={9} /> FOCUS
          </button>
        )}
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => fgRef.current?.zoom?.((fgRef.current?.zoom?.() || 1) * 1.3, 200)}
            style={{ ...M, fontSize: 8, color: "var(--fg-muted)", background: "transparent", border: "1px solid var(--border)", padding: "3px 6px", cursor: "pointer" }}>
            <ZoomIn size={10} />
          </button>
          <button onClick={() => fgRef.current?.zoom?.((fgRef.current?.zoom?.() || 1) * 0.7, 200)}
            style={{ ...M, fontSize: 8, color: "var(--fg-muted)", background: "transparent", border: "1px solid var(--border)", padding: "3px 6px", cursor: "pointer" }}>
            <ZoomOut size={10} />
          </button>
          <button onClick={() => fgRef.current?.zoomToFit?.(500, 40)}
            style={{ ...M, fontSize: 8, color: "var(--fg-muted)", background: "transparent", border: "1px solid var(--border)", padding: "3px 6px", cursor: "pointer" }}>
            <Maximize2 size={10} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4500", animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
              <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.2em" }}>CHARGEMENT_GRAPHE…</span>
            </div>
          ) : (
            <GraphErrorBoundary>
              <ForceGraph2D
                ref={fgRef}
                graphData={filteredData}
                backgroundColor="#0A0A0A"
                nodeLabel={() => ""}
                nodeCanvasObject={nodeCanvasObject}
                linkCanvasObject={linkCanvasObject}
                onNodeClick={(n: any) => { setSelectedNode(n); setActiveTab("profil"); }}
                onNodeHover={(n: any) => setHoveredNode(n)}
                onBackgroundClick={() => focusMode && setFocusMode(false)}
                nodeRelSize={1}
                linkDirectionalParticles={(l: any) => l.type === "cross_mandate" ? 2 : 0}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleColor={() => "#FF4500"}
                linkDirectionalParticleSpeed={0.004}
                // Nodes have fx/fy set — simulation only handles collision/residual
                d3AlphaDecay={0.04}
                d3VelocityDecay={0.6}
                warmupTicks={0}
                cooldownTicks={50}
                onEngineStop={() => fgRef.current?.zoomToFit?.(600, 60)}
              />
            </GraphErrorBoundary>
          )}

          {/* Scanning overlay */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1,
            background: "rgba(255,69,0,0.15)",
            animation: "scanLine 6s linear infinite",
            pointerEvents: "none",
          }} />

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 12 }}>
            {[
              { c: "#FF4500", l: "CIBLE" },
              { c: "#FAFAFA", l: "DIRIGEANT" },
              { c: "#884422", l: "HOLDING" },
            ].map(item => (
              <div key={item.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.c, display: "block" }} />
                <span style={{ ...M, fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{item.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel */}
        {selectedNode && (
          <div style={{
            width: 260, flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
            background: "var(--bg)",
          }}>
            {/* Panel header */}
            <div style={{
              height: 40, borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 12px", flexShrink: 0, background: "var(--bg-raise)",
            }}>
              <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>NODE_ANALYSIS</span>
              <button onClick={() => setSelectedNode(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-dim)", display: "flex" }}>
                <X size={12} />
              </button>
            </div>

            {/* Node name */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ ...S, fontSize: 14, color: "var(--fg)", fontStyle: "italic", marginBottom: 4, lineHeight: 1.2 }}>
                {selectedNode.name}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ ...M, fontSize: 8, color: selectedNode.type === "director" ? "var(--fg)" : "#FF4500", letterSpacing: "0.1em" }}>
                  {selectedNode.type === "director" ? "DIRIGEANT" : selectedNode.is_holding ? "HOLDING" : "CIBLE_M&A"}
                </span>
                {selectedNode.score != null && (
                  <span style={{ ...M, fontSize: 20, color: "#FF4500", lineHeight: 1, marginLeft: "auto" }}>{selectedNode.score}</span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              {(["profil", "connexions", "signaux"] as PanelTab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, height: 32, background: "transparent",
                  border: "none", borderBottom: `2px solid ${activeTab === tab ? "#FF4500" : "transparent"}`,
                  cursor: "pointer", ...M, fontSize: 8,
                  color: activeTab === tab ? "var(--fg)" : "var(--fg-dim)",
                  letterSpacing: "0.1em",
                }}>
                  {tab === "profil" ? "PROFIL" : tab === "connexions" ? "LIENS" : "SIGNAUX"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }} className="thin-scrollbar">
              {activeTab === "profil" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selectedNode.bodacc_recent && (
                    <div style={{
                      display: "flex", gap: 6, alignItems: "center",
                      padding: "6px 10px", background: "rgba(255,69,0,0.05)",
                      border: "1px solid rgba(255,69,0,0.2)",
                    }}>
                      <AlertTriangle size={10} style={{ color: "#FF4500", flexShrink: 0 }} />
                      <span style={{ ...M, fontSize: 8, color: "#FF4500", letterSpacing: "0.1em" }}>BODACC_RÉCENT</span>
                    </div>
                  )}
                  {[
                    { k: "SECTEUR", v: selectedNode.sector },
                    { k: "VILLE", v: selectedNode.city },
                    { k: "SIREN", v: selectedNode.siren },
                    { k: "CA", v: selectedNode.ca },
                    { k: "EBITDA", v: selectedNode.ebitda },
                    { k: "RÔLE", v: selectedNode.role },
                    { k: "PRIORITÉ", v: selectedNode.priority },
                  ].filter(r => r.v && r.v !== "N/A").map(row => (
                    <div key={row.k} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", padding: "6px 10px" }}>
                      <div style={{ ...M, fontSize: 7, color: "var(--fg-muted)", marginBottom: 2, letterSpacing: "0.12em" }}>{row.k}</div>
                      <div style={{ ...M, fontSize: 10, color: "var(--fg)" }}>{row.v}</div>
                    </div>
                  ))}
                  {selectedNode.multi_mandats && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 8px", border: "1px solid var(--border)" }}>
                      <GitBranch size={9} style={{ color: "#FF4500" }} />
                      <span style={{ ...M, fontSize: 8, color: "#FF4500", letterSpacing: "0.1em" }}>MULTI_MANDATS</span>
                    </div>
                  )}
                  {selectedNode.age_signal && (
                    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 8px", border: "1px solid var(--border)" }}>
                      <TrendingUp size={9} style={{ color: "#FF4500" }} />
                      <span style={{ ...M, fontSize: 8, color: "#FF4500", letterSpacing: "0.1em" }}>SIGNAL_SUCCESSION</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "connexions" && (() => {
                const neighborNodes: NetworkNode[] = [
                  { id: selectedNode.id, name: selectedNode.name, type: selectedNode.type === "director" ? "director" : selectedNode.is_holding ? "investor" : "company" },
                  ...panelLinks.map(l => {
                    const sid = typeof l.source === "object" ? (l.source as GraphNode).id : l.source;
                    const tid = typeof l.target === "object" ? (l.target as GraphNode).id : l.target;
                    const otherId = sid === selectedNode.id ? tid : sid;
                    const other = graphData.nodes.find(n => n.id === otherId);
                    if (!other) return null;
                    return { id: other.id, name: other.name, type: other.type === "director" ? "director" as const : other.is_holding ? "investor" as const : "company" as const };
                  }).filter((n): n is NetworkNode => n !== null),
                ];
                const neighborLinks: NetworkLink[] = panelLinks.map(l => ({
                  source: typeof l.source === "object" ? (l.source as GraphNode).id : l.source as string,
                  target: typeof l.target === "object" ? (l.target as GraphNode).id : l.target as string,
                  label: l.label,
                }));
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {panelLinks.length === 0 ? (
                      <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>Aucune connexion visible</span>
                    ) : (
                      <>
                        <CompanyNetworkGraph nodes={neighborNodes} links={neighborLinks} height={200} />
                        {panelLinks.map((l, i) => {
                          const other = (typeof l.source === "object" ? (l.source as GraphNode).id : l.source) === selectedNode.id
                            ? (typeof l.target === "object" ? l.target as GraphNode : null)
                            : (typeof l.source === "object" ? l.source as GraphNode : null);
                          return (
                            <div key={i} style={{
                              borderLeft: "2px solid var(--border)", paddingLeft: 8, paddingBottom: 6,
                              transition: "border-color 0.15s",
                            }}
                              onMouseEnter={e => (e.currentTarget.style.borderLeftColor = "#FF4500")}
                              onMouseLeave={e => (e.currentTarget.style.borderLeftColor = "var(--border)")}
                            >
                              <div style={{ ...M, fontSize: 10, color: "var(--fg)" }}>{other?.name?.slice(0, 18) ?? "—"}</div>
                              <div style={{ ...M, fontSize: 8, color: "var(--fg-muted)" }}>{l.type?.toUpperCase()} // {l.label?.slice(0, 20)}</div>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <button
                      onClick={() => setFocusMode(p => !p)}
                      style={{
                        marginTop: 4, width: "100%", height: 32,
                        border: `1px solid ${focusMode ? "#FF4500" : "var(--border)"}`,
                        background: focusMode ? "rgba(255,69,0,0.05)" : "transparent",
                        ...M, fontSize: 8, color: focusMode ? "#FF4500" : "var(--fg-muted)",
                        cursor: "pointer", letterSpacing: "0.1em",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      <Filter size={9} />
                      {focusMode ? "DÉSACTIVER_FOCUS" : "ISOLER_CE_NŒUD"}
                    </button>
                  </div>
                );
              })()}

              {activeTab === "signaux" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {(selectedNode.signals?.length ?? 0) === 0 ? (
                    <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>Aucun signal actif</span>
                  ) : selectedNode.signals?.map((sig, i) => (
                    <div key={i} style={{
                      borderLeft: "2px solid #FF4500", paddingLeft: 8, paddingBottom: 4,
                    }}>
                      <div style={{ ...M, fontSize: 9, color: "var(--fg)", lineHeight: 1.5 }}>{sig}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {selectedNode.type === "company" && selectedNode.siren && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
                <Link href={`/targets/${selectedNode.siren}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--bg-alt)", border: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#FF4500"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,69,0,0.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-alt)"; }}
                >
                  <span style={{ ...M, fontSize: 9, color: "var(--fg)", letterSpacing: "0.1em" }}>OUVRIR_DOSSIER</span>
                  <ChevronRight size={12} style={{ color: "#FF4500" }} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanLine { from { top: -2% } to { top: 102% } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--bg)", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.15em" }}>CHARGEMENT_GRAPHE…</div>}>
      <GraphPageInner />
    </Suspense>
  );
}

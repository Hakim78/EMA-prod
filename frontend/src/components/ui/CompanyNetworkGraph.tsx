"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export interface NetworkNode {
  id: string;
  name: string;
  type: "company" | "investor" | "subsidiary" | "director";
}

export interface NetworkLink {
  source: string;
  target: string;
  label?: string;
}

interface Props {
  nodes: NetworkNode[];
  links: NetworkLink[];
  width?: number;
  height?: number;
}

const TYPE_R: Record<NetworkNode["type"], number> = {
  company: 13, investor: 8, director: 7, subsidiary: 7,
};

// Fixed hub-and-spoke positions: company center, groups around it
function computePositions(nodes: NetworkNode[], w: number, h: number): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  const cx = w / 2;
  const cy = h / 2 + 10;

  const company    = nodes.find(n => n.type === "company");
  const investors  = nodes.filter(n => n.type === "investor");
  const directors  = nodes.filter(n => n.type === "director");
  const subs       = nodes.filter(n => n.type === "subsidiary");

  if (company) pos[company.id] = { x: cx, y: cy };

  // Investors: top center, spread horizontally
  const invRadius = 130;
  investors.forEach((n, i) => {
    const total = investors.length;
    const span = Math.min((total - 1) * 90, w * 0.5);
    pos[n.id] = {
      x: total === 1 ? cx : cx - span / 2 + i * (span / (total - 1)),
      y: cy - invRadius,
    };
  });

  // Directors: right side, spread vertically
  const sideRadius = 160;
  directors.forEach((n, i) => {
    const total = directors.length;
    const span = Math.min((total - 1) * 52, h * 0.6);
    pos[n.id] = {
      x: cx + sideRadius,
      y: total === 1 ? cy : cy - span / 2 + i * (span / (total - 1)),
    };
  });

  // Subsidiaries: left side, spread vertically
  subs.forEach((n, i) => {
    const total = subs.length;
    const span = Math.min((total - 1) * 52, h * 0.6);
    pos[n.id] = {
      x: cx - sideRadius,
      y: total === 1 ? cy : cy - span / 2 + i * (span / (total - 1)),
    };
  });

  return pos;
}

function trunc(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export default function CompanyNetworkGraph({ nodes, links, width, height = 360 }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(480);
  const [hoveredId, setHoveredId]   = useState<string | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver(e => setContainerW(e[0].contentRect.width || 480));
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const W = width ?? containerW;
  const H = height;

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Read CSS vars for dark/light theme support
    const cs = getComputedStyle(document.documentElement);
    const csGet = (v: string, fallback: string) => cs.getPropertyValue(v).trim() || fallback;
    const BG      = csGet("--bg-raise", "#FFFFFF");
    const FG      = csGet("--fg",       "#121212");
    const MUTED   = csGet("--fg-muted", "#737373");
    const DIM     = csGet("--fg-dim",   "#BBBBBB");
    const BORDER  = csGet("--border",   "#E5E7EB");

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    const pos = computePositions(nodes, W, H);

    // Build neighbor set for hover
    const neighborIds: Set<string> | null = hoveredId ? new Set([hoveredId]) : null;
    if (hoveredId && neighborIds) {
      links.forEach(l => {
        const s = typeof l.source === "object" ? (l.source as NetworkNode).id : l.source;
        const t = typeof l.target === "object" ? (l.target as NetworkNode).id : l.target;
        if (s === hoveredId) neighborIds.add(t);
        if (t === hoveredId) neighborIds.add(s);
      });
    }

    // ── Links ──────────────────────────────────────────────────────────────
    links.forEach(l => {
      const sId = typeof l.source === "object" ? (l.source as NetworkNode).id : l.source;
      const tId = typeof l.target === "object" ? (l.target as NetworkNode).id : l.target;
      const sp = pos[sId];
      const tp = pos[tId];
      if (!sp || !tp) return;

      const isActive = neighborIds ? (neighborIds.has(sId) && neighborIds.has(tId)) : false;
      const isFaded  = !!neighborIds && !isActive;

      ctx.save();
      ctx.globalAlpha = isFaded ? 0.06 : isActive ? 0.9 : 0.45;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(tp.x, tp.y);
      ctx.strokeStyle = isActive ? FG : MUTED;
      ctx.lineWidth   = isActive ? 1.5 : 0.8;
      ctx.stroke();

      // Edge label (only when active or no hover)
      if (l.label && !isFaded) {
        const mx = (sp.x + tp.x) / 2;
        const my = (sp.y + tp.y) / 2;

        // Small pill background
        ctx.font = `8px "Space Mono", monospace`;
        const tw = ctx.measureText(l.label).width;
        ctx.globalAlpha = isActive ? 0.85 : 0.4;
        ctx.fillStyle = BG;
        ctx.fillRect(mx - tw / 2 - 3, my - 5, tw + 6, 10);

        ctx.fillStyle = isActive ? MUTED : DIM;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(l.label, mx, my);
      }

      ctx.restore();
    });

    // ── Nodes ──────────────────────────────────────────────────────────────
    nodes.forEach(node => {
      const p  = pos[node.id];
      if (!p) return;
      const r         = TYPE_R[node.type] ?? 7;
      const isHovered = hoveredId === node.id;
      const isFaded   = !!neighborIds && !neighborIds.has(node.id);

      ctx.save();
      ctx.globalAlpha = isFaded ? 0.12 : 1;

      // Hover glow
      if (isHovered) {
        const grad = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 3.5);
        grad.addColorStop(0, `${FG}18`);
        grad.addColorStop(1, `${FG}00`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Node fill
      const fill =
        node.type === "company"    ? FG :
        node.type === "investor"   ? "#2563EB" :
        MUTED;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      // Node stroke
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = node.type === "company" ? MUTED : BORDER;
      ctx.lineWidth   = node.type === "company" ? 2 : 1;
      ctx.stroke();

      // Company initials inside node
      if (node.type === "company") {
        const initials = node.name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
        ctx.font = `bold 8px "Inter", sans-serif`;
        ctx.fillStyle = BG;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initials, p.x, p.y);
      }

      // Label below node
      const isMain = node.type === "company";
      const maxChars = isMain ? 22 : 17;
      const label = trunc(node.name, maxChars);
      const fs    = isMain ? 11 : 9;
      const fw    = isMain ? "600" : "400";

      ctx.font = `${fw} ${fs}px "Inter", sans-serif`;
      const tw = ctx.measureText(label).width;
      const labelY = p.y + r + 5;

      // Label background pill
      ctx.fillStyle = BG;
      ctx.beginPath();
      ctx.roundRect(p.x - tw / 2 - 3, labelY - 1, tw + 6, fs + 4, 2);
      ctx.fill();

      // Label text
      ctx.fillStyle = isFaded ? DIM :
        node.type === "company"  ? FG :
        node.type === "investor" ? "#2563EB" :
        MUTED;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, p.x, labelY);

      // Type tag below label (for non-company nodes)
      if (!isMain) {
        const tag =
          node.type === "investor"   ? "INVEST." :
          node.type === "director"   ? "DIR."    : "FIL.";
        ctx.font      = `7px "Space Mono", monospace`;
        ctx.fillStyle = isFaded ? DIM : DIM;
        ctx.fillText(tag, p.x, labelY + fs + 3);
      }

      ctx.restore();
    });

    // ── Legend ─────────────────────────────────────────────────────────────
    if (nodes.length > 1) {
      const types = [...new Set(nodes.map(n => n.type))];
      const legendItems: { color: string; label: string }[] = [];
      if (types.includes("company"))    legendItems.push({ color: FG,       label: "Société cible" });
      if (types.includes("investor"))   legendItems.push({ color: "#2563EB", label: "Actionnaire" });
      if (types.includes("director"))   legendItems.push({ color: MUTED,     label: "Dirigeant" });
      if (types.includes("subsidiary")) legendItems.push({ color: MUTED,     label: "Filiale" });

      let lx = 10;
      const ly = H - 18;
      ctx.font = `8px "Space Mono", monospace`;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(lx + 4, ly + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = DIM;
        ctx.textAlign    = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label, lx + 11, ly + 4);
        lx += ctx.measureText(item.label).width + 22;
      });
    }

  }, [nodes, links, W, H, hoveredId]);

  // Hover hit test
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const pos = computePositions(nodes, W, H);
    let found: string | null = null;
    for (const node of nodes) {
      const p = pos[node.id];
      if (!p) continue;
      const r = TYPE_R[node.type] ?? 7;
      if (Math.hypot(mx - p.x, my - p.y) <= r + 4) { found = node.id; break; }
    }
    setHoveredId(found);
    canvas.style.cursor = found ? "pointer" : "default";
  }, [nodes, W, H]);

  const handleMouseLeave = useCallback(() => setHoveredId(null), []);

  if (!nodes.length) return null;

  return (
    <div
      ref={wrapperRef}
      style={{ width: width ? `${width}px` : "100%", height: `${H}px`, overflow: "hidden", background: "var(--bg-raise)" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}

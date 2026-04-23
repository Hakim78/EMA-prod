"use client";

import { useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

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

const NODE_COLOR: Record<NetworkNode["type"], string> = {
  company:    "#111827",
  investor:   "#3B82F6",
  subsidiary: "#9CA3AF",
  director:   "#9CA3AF",
};

const NODE_RADIUS: Record<NetworkNode["type"], number> = {
  company:    10,
  investor:   6,
  subsidiary: 5,
  director:   5,
};

export default function CompanyNetworkGraph({ nodes, links, width, height = 480 }: Props) {
  const graphRef = useRef<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredNeighbors = useCallback((nodeId: string) => {
    const neighbors = new Set<string>([nodeId]);
    links.forEach(l => {
      const s = typeof l.source === "object" ? (l.source as NetworkNode).id : l.source;
      const t = typeof l.target === "object" ? (l.target as NetworkNode).id : l.target;
      if (s === nodeId) neighbors.add(t);
      if (t === nodeId) neighbors.add(s);
    });
    return neighbors;
  }, [links]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, id, name, type } = node;
    if (!isFinite(x) || !isFinite(y)) return;

    const isHovered = hoveredId === id;
    const neighborIds = hoveredId ? hoveredNeighbors(hoveredId) : null;
    const isFaded = neighborIds ? !neighborIds.has(id) : false;

    const r = (NODE_RADIUS[type as NetworkNode["type"]] ?? 5) * (isHovered ? 1.5 : 1);
    const color = NODE_COLOR[type as NetworkNode["type"]] ?? "#9CA3AF";

    ctx.save();
    ctx.globalAlpha = isFaded ? 0.2 : 1;

    if (isHovered) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}18`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    if (type === "company") {
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    if (globalScale > 0.8 || isHovered) {
      const label = name.length > 16 ? name.slice(0, 16) + "…" : name;
      const fs = Math.max(4, Math.min(5, 5 / globalScale));
      ctx.font = `${fs}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isFaded ? "#D1D5DB" : "#374151";
      ctx.fillText(label, x, y + r + 2 / globalScale);
    }

    ctx.restore();
  }, [hoveredId, hoveredNeighbors]);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const { source: s, target: t } = link;
    if (!isFinite(s?.x) || !isFinite(t?.x)) return;

    const neighborIds = hoveredId ? hoveredNeighbors(hoveredId) : null;
    const sId = s.id ?? s;
    const tId = t.id ?? t;
    const isActive = neighborIds ? (neighborIds.has(sId) && neighborIds.has(tId)) : false;
    const isFaded = neighborIds ? !isActive : false;

    ctx.save();
    ctx.globalAlpha = isFaded ? 0.05 : 1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = isActive ? "#374151" : "#E5E7EB";
    ctx.lineWidth = isActive ? 1 : 0.5;
    ctx.stroke();
    ctx.restore();
  }, [hoveredId, hoveredNeighbors]);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredId(node ? node.id : null);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (!graphRef.current) return;
    graphRef.current.centerAt(node.x, node.y, 600);
    graphRef.current.zoom(3, 600);
  }, []);

  if (!nodes.length) return null;

  return (
    <div style={{ width: width ? `${width}px` : "100%", height: `${height}px`, background: "#FFFFFF", borderRadius: 2, overflow: "hidden" }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links }}
        backgroundColor="#FFFFFF"
        nodeLabel={() => ""}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObject={linkCanvasObject}
        linkCanvasObjectMode={() => "replace"}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        nodeRelSize={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleColor={() => "#9CA3AF"}
        linkDirectionalParticleSpeed={0.002}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.4}
        warmupTicks={60}
        cooldownTicks={200}
      />
    </div>
  );
}

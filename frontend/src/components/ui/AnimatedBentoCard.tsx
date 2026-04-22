"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface AnimatedBentoCardProps {
  /** Path to the .riv file, e.g. "/bento-cards.riv" */
  riveSrc: string;
  /** Gradient string applied over the Rive canvas — controls the card mood */
  scrim?: string;
  /** Canvas opacity (0–1). Default 0.65 */
  riveOpacity?: number;
  /** Extra class names for grid placement (bc-lookalike, bc-pipeline…) */
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/* ─── Shared tokens ─── */
const CARD_SHADOW = [
  "0 20px 48px rgba(0,0,0,0.24)",
  "0 4px 12px rgba(0,0,0,0.14)",
  "inset 0 1px 0 rgba(255,255,255,0.08)",
].join(", ");

const CARD_SHADOW_HOVER = [
  "0 32px 72px rgba(0,0,0,0.32)",
  "0 8px 20px rgba(0,0,0,0.16)",
  "inset 0 1px 0 rgba(255,255,255,0.10)",
].join(", ");

export default function AnimatedBentoCard({
  riveSrc,
  scrim = "linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.35) 55%, transparent 100%)",
  riveOpacity = 0.65,
  className = "",
  onClick,
  children,
}: AnimatedBentoCardProps) {
  const { RiveComponent } = useRive({
    src: riveSrc,
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  });

  return (
    <div
      className={`bento-card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px) scale(1.005)";
        el.style.boxShadow = CARD_SHADOW_HOVER;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0) scale(1)";
        el.style.boxShadow = CARD_SHADOW;
      }}
    >
      {/* ── Rive animation layer ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: riveOpacity,
        transition: "opacity 600ms ease",
        pointerEvents: "none",
      }}>
        <RiveComponent style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* ── Scrim overlay (mood tint + text readability) ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: scrim,
        pointerEvents: "none",
      }} />

      {/* ── Top highlight edge (glass feel) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
        pointerEvents: "none",
      }} />

      {/* ── Card content (absolute fill so children can use absolute positioning) ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}

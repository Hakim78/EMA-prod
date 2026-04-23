"use client";

import { useState, useRef } from "react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "right";
  maxWidth?: number;
}

export default function Tooltip({ content, children, placement = "top", maxWidth = 220 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const ref                   = useRef<HTMLSpanElement>(null);

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    if (placement === "top") {
      setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    } else if (placement === "bottom") {
      setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    } else {
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
    setVisible(true);
  };

  const transformStyle = (): React.CSSProperties => {
    if (placement === "top")    return { transform: "translate(-50%, -100%)" };
    if (placement === "bottom") return { transform: "translate(-50%, 0)" };
    return { transform: "translate(0, -50%)" };
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        {children}
      </span>
      {visible && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            pointerEvents: "none",
            ...transformStyle(),
          }}
        >
          <div style={{
            background: "var(--fg)",
            color: "var(--bg)",
            padding: "6px 10px",
            maxWidth,
            ...S, fontSize: 11, lineHeight: 1.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

/** Inline hint icon — wraps a ? in a circle, tooltip on hover */
export function HintIcon({ text, placement = "top" }: { text: string; placement?: "top" | "bottom" | "right" }) {
  return (
    <Tooltip content={text} placement={placement}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 13, height: 13, flexShrink: 0, cursor: "default",
        border: "1px solid var(--border)", borderRadius: "50%",
        ...M, fontSize: 7, color: "var(--fg-dim)", lineHeight: 1,
        userSelect: "none",
      }}>
        ?
      </span>
    </Tooltip>
  );
}

"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
}

export default function ShinyButton({ children, onClick, disabled, title, style }: Props) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? {} : { scale: 1.015 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.11)",
        color: disabled ? "rgba(255,255,255,0.3)" : "#F0F0F0",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
        transition: "border-color 0.15s",
        ...style,
      }}
    >
      {/* Shimmer sweep — gris très discret */}
      <motion.span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "55%",
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.065) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
        initial={{ left: "-60%" }}
        animate={{ left: "160%" }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatDelay: 1.8,
          ease: "easeInOut",
        }}
      />
      {children}
    </motion.button>
  );
}

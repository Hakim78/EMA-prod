"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, List, Target, Check, ChevronRight, ArrowRight,
  Database, Zap, TrendingUp,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const CHECKLIST = [
  { id: "profile",      label: "Configure firm profile & strategy",  done: true,  href: "/settings/profile" },
  { id: "thesis",       label: "Set investment thesis & criteria",   done: false, href: "/settings/thesis" },
  { id: "crm",          label: "Connect CRM & data integrations",    done: false, href: "/settings/integrations" },
  { id: "team",         label: "Invite team members",                done: false, href: "/settings/team" },
  { id: "search",       label: "Run your first search",              done: false, href: "/" },
];

const ACTION_CARDS = [
  {
    Icon: Search,
    title: "Run a search",
    desc: "Use natural language to find acquisition targets from 16M+ indexed French companies.",
    href: "/",
    cta: "Open Copilot",
  },
  {
    Icon: List,
    title: "Explore your lists",
    desc: "Manage your pipeline, track saved companies and export directly to your CRM.",
    href: "/pipeline",
    cta: "View Pipeline",
  },
  {
    Icon: Target,
    title: "Find similar companies",
    desc: "Upload a target and find comparable acquisition candidates using AI lookalike matching.",
    href: "/?mode=lookalike",
    cta: "Lookalike Search",
  },
];

const PLATFORM_STATS = [
  { label: "Entreprises indexées",     value: "16.2M",  icon: Database },
  { label: "Signaux BODACC / mois",    value: "24K+",   icon: Zap },
  { label: "Match score IA",           value: "Actif",  icon: TrendingUp },
];

export default function GettingStartedHub() {
  const router = useRouter();
  const [checklist, setChecklist] = useState(CHECKLIST);

  const completed = checklist.filter(c => c.done).length;
  const total     = checklist.length;
  const pct       = Math.round((completed / total) * 100);

  const goTo = (href: string) => {
    if (typeof window !== "undefined") localStorage.setItem("ema_onboarding_done", "1");
    router.push(href);
  };

  const toggleItem = (id: string) =>
    setChecklist(p => p.map(c => c.id === id ? { ...c, done: !c.done } : c));

  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAFA", ...S }}>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header style={{
        height: 52, background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", flexShrink: 0,
      }}>
        <span style={{ ...M, fontSize: 11, fontWeight: 700, color: "#111827", letterSpacing: "0.06em" }}>
          EdRCF <span style={{ color: "#9CA3AF", fontWeight: 400 }}>6.0</span>
        </span>
        <button
          onClick={() => goTo("/")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#6B7280",
            background: "transparent", border: "1px solid #E5E7EB",
            padding: "6px 14px", cursor: "pointer", transition: "all 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#111827"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; }}
        >
          Skip to Dashboard <ArrowRight size={12} />
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Welcome block */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.14em", marginBottom: 10 }}>
            GETTING STARTED
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
            Welcome to EdRCF
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.75 }}>
            Your M&A sourcing platform is ready. Complete the setup below to activate scoring on 16M+ companies.
          </p>
        </div>

        {/* ── 2-col grid ────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>

          {/* LEFT — Action cards */}
          <div>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 14 }}>
              QUICK ACTIONS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid #E5E7EB", background: "#E5E7EB" }}>
              {ACTION_CARDS.map(({ Icon, title, desc, href, cta }) => (
                <div
                  key={title}
                  onClick={() => goTo(href)}
                  style={{
                    background: "#FFFFFF",
                    padding: "22px 24px",
                    display: "flex", gap: 18, alignItems: "flex-start",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#FFFFFF")}
                >
                  {/* Icon box */}
                  <div style={{
                    width: 40, height: 40, flexShrink: 0,
                    background: "#F9FAFB", border: "1px solid #F3F4F6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} style={{ color: "#374151" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 5 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.65, marginBottom: 12 }}>{desc}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, ...M, fontSize: 10, color: "#374151", letterSpacing: "0.04em" }}>
                      {cta} <ChevronRight size={11} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Platform stats */}
            <div style={{ marginTop: 20, background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em" }}>PLATFORM STATS</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                {PLATFORM_STATS.map(({ label, value, icon: StatIcon }, i) => (
                  <div key={label} style={{
                    padding: "16px 20px",
                    borderRight: i < PLATFORM_STATS.length - 1 ? "1px solid #F3F4F6" : "none",
                  }}>
                    <StatIcon size={13} style={{ color: "#9CA3AF", marginBottom: 8 }} />
                    <div style={{ ...M, fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{value}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Setup checklist */}
          <div>
            <div style={{ ...M, fontSize: 9, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 14 }}>
              SETUP CHECKLIST
            </div>

            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
              {/* Progress */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                  <span style={{ fontSize: 12, color: "#374151" }}>
                    {completed} <span style={{ color: "#9CA3AF" }}>of {total} completed</span>
                  </span>
                  <span style={{ ...M, fontSize: 10, color: "#9CA3AF" }}>{pct}%</span>
                </div>
                <div style={{ height: 2, background: "#F3F4F6" }}>
                  <div style={{
                    height: "100%", background: "#111827",
                    width: `${pct}%`, transition: "width 0.35s ease",
                  }} />
                </div>
              </div>

              {/* Items */}
              {checklist.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 20px",
                    borderBottom: i < checklist.length - 1 ? "1px solid #F9FAFB" : "none",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onClick={() => item.href === "/settings/integrations" || item.href === "/" ? goTo(item.href) : toggleItem(item.id)}
                >
                  <div
                    style={{
                      width: 18, height: 18, flexShrink: 0,
                      border: `1px solid ${item.done ? "#111827" : "#D1D5DB"}`,
                      background: item.done ? "#111827" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {item.done && <Check size={10} style={{ color: "#fff" }} />}
                  </div>
                  <span style={{
                    fontSize: 12, flex: 1, lineHeight: 1.5,
                    color: item.done ? "#9CA3AF" : "#374151",
                    textDecoration: item.done ? "line-through" : "none",
                  }}>
                    {item.label}
                  </span>
                  {!item.done && <ChevronRight size={12} style={{ color: "#D1D5DB", flexShrink: 0 }} />}
                </div>
              ))}
            </div>

            {/* CTA to integrations */}
            <div style={{ marginTop: 14 }}>
              <button
                onClick={() => goTo("/settings/integrations")}
                style={{
                  width: "100%", padding: "11px 0",
                  background: "#111827", color: "#FFFFFF",
                  border: "none", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Configure Integrations <ArrowRight size={13} />
              </button>
              <p style={{ ...M, fontSize: 9, color: "#D1D5DB", textAlign: "center", marginTop: 10, letterSpacing: "0.06em" }}>
                VOUS POUVEZ REVENIR ICI DEPUIS SETTINGS
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

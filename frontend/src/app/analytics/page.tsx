"use client";

import { useMemo } from "react";
import { useTargets } from "@/lib/queries/useTargets";
import type { Target } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import { AnalyticsSkeleton } from "@/components/ui/PageSkeleton";
import ErrorState from "@/components/ui/ErrorState";

const M = { fontFamily: "'JetBrains Mono',monospace" } as const;
const S = { fontFamily: "Inter,sans-serif" } as const;

const CHART_STYLE = {
  background: "transparent",
  fontFamily: "'JetBrains Mono',monospace",
  fontSize: 9,
  fill: "var(--fg-dim)",
};

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useTargets();
  const targets: Target[] = data?.data ?? [];

  if (isLoading) return <AnalyticsSkeleton />;
  if (isError)   return <div style={{ height: "100dvh", display: "flex" }}><ErrorState onRetry={() => refetch()} /></div>;

  const total = data?.total ?? 0;
  const avgScore = useMemo(() => {
    if (!targets.length) return 0;
    return Math.round(targets.reduce((s: number, t: Target) => s + t.globalScore, 0) / targets.length);
  }, [targets]);
  const hotCount = useMemo(() => targets.filter((t: Target) => t.bodacc_recent).length, [targets]);
  const topScore = useMemo(() => targets.length ? Math.max(...targets.map((t: Target) => t.globalScore)) : 0, [targets]);

  const kpis = [
    { label: "PIPELINE_VALUE",  value: "1.24B€",                     delta: "+14%",   up: true  },
    { label: "AVG_SCORE",       value: String(avgScore),              delta: "STABLE", up: null  },
    { label: "BODACC_FLAGGED",  value: hotCount.toLocaleString("fr"), delta: "LIVE",   up: true  },
    { label: "TOP_SCORE",       value: String(topScore),              delta: "GOLD",   up: null  },
  ];

  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    targets.forEach((t: Target) => { if (t.sector) map[t.sector] = (map[t.sector] ?? 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, val]) => ({ name: name.slice(0, 10), val }));
  }, [targets]);

  const scoreDistrib = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({ range: `${i * 10}-${i * 10 + 9}`, val: 0 }));
    targets.forEach((t: Target) => {
      const idx = Math.min(Math.floor(t.globalScore / 10), 9);
      buckets[idx].val++;
    });
    return buckets;
  }, [targets]);

  const radarData = [
    { s: "Croissance", A: 82 },
    { s: "Marge",      A: 74 },
    { s: "Marché",     A: 91 },
    { s: "Signal",     A: 68 },
    { s: "Potentiel",  A: 85 },
    { s: "Taille",     A: 77 },
  ];

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i],
    v: 40 + Math.floor(Math.random() * 40) + i * 3,
  }));

  return (
    <div style={{ height: "100dvh", overflowY: "auto", background: "var(--bg)" }} className="thin-scrollbar">

      {/* Header */}
      <div style={{
        height: 40, borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px",
        background: "var(--bg-raise)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.2em" }}>ANALYTICS_INTELLIGENCE_A24</span>
        <div style={{ flex: 1 }} />
        <span style={{ ...M, fontSize: 9, color: "var(--up)" }}>● {total.toLocaleString("fr")} CIBLES</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid var(--border)" }}>
        {kpis.map((k, i) => (
          <div key={k.label} style={{
            padding: "24px 20px",
            borderRight: i < 3 ? "1px solid var(--border)" : "none",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.12em" }}>{k.label}</span>
              <ArrowUpRight size={12} style={{ color: "var(--fg-dim)" }} />
            </div>
            <div>
              <div style={{ ...M, fontSize: 32, color: i === 0 ? "#FF4500" : "var(--fg)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {isLoading ? "—" : k.value}
              </div>
              <div style={{ ...M, fontSize: 9, color: k.up === true ? "var(--up)" : k.up === false ? "#FF4500" : "var(--fg-muted)", marginTop: 4 }}>
                {k.delta}
              </div>
            </div>
            <div style={{ height: 32 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[30,35,32,40,38,42,45].map((v, j) => ({ v, j }))}>
                  <Area type="monotone" dataKey="v" stroke="#FF4500" fill="#FF4500" fillOpacity={0.06} strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)" }}>

        {/* Score distribution */}
        <div style={{ padding: "20px", borderRight: "1px solid var(--border)" }}>
          <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 16, textTransform: "uppercase" }}>
            Score_Distribution
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistrib} barSize={14}>
              <XAxis dataKey="range" tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "var(--bg-alt)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}
                labelStyle={{ color: "var(--fg-dim)" }}
                itemStyle={{ color: "var(--fg)" }}
              />
              <Bar dataKey="val" fill="var(--fg-dim)" radius={[1, 1, 0, 0]}
                onMouseEnter={(_, i) => i}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector volume */}
        <div style={{ padding: "20px" }}>
          <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 16, textTransform: "uppercase" }}>
            Sector_Volume_Capture
          </h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sectorData} layout="vertical" barSize={8}>
              <XAxis type="number" tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={CHART_STYLE} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={{ background: "var(--bg-alt)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}
                labelStyle={{ color: "var(--fg-dim)" }}
                itemStyle={{ color: "var(--fg)" }}
              />
              <Bar dataKey="val" fill="#FF4500" radius={[0, 1, 1, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)" }}>

        {/* Risk radar */}
        <div style={{ padding: "20px", borderRight: "1px solid var(--border)" }}>
          <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 16, textTransform: "uppercase" }}>
            Risk_Radar_Matrix
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="s" tick={{ ...CHART_STYLE }} />
              <Radar dataKey="A" stroke="#FF4500" fill="#FF4500" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div style={{ padding: "20px" }}>
          <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 16, textTransform: "uppercase" }}>
            Signal_Velocity_Monthly
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <XAxis dataKey="m" tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "var(--bg-alt)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}
                labelStyle={{ color: "var(--fg-dim)" }}
                itemStyle={{ color: "var(--fg)" }}
              />
              <Area type="monotone" dataKey="v" stroke="var(--fg)" fill="var(--fg)" fillOpacity={0.04} strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 table */}
      <div style={{ padding: "20px" }}>
        <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>
          Top_10_Targets_By_Score
        </h4>
        <div>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 56px 80px 100px", height: 28, alignItems: "center", borderBottom: "1px solid var(--border)" }}>
            {["#","NOM","SCORE","CA","SIGNAL"].map(h => (
              <span key={h} style={{ ...M, fontSize: 8, color: "var(--fg-dim)", letterSpacing: "0.12em" }}>{h}</span>
            ))}
          </div>
          {[...targets].sort((a, b) => b.globalScore - a.globalScore).slice(0, 10).map((t, i) => (
            <div key={t.id} style={{
              display: "grid", gridTemplateColumns: "32px 1fr 56px 80px 100px",
              height: 36, alignItems: "center", borderBottom: "1px solid var(--border)",
              transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ ...S, fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
              <span style={{ ...M, fontSize: 11, color: t.globalScore >= 75 ? "var(--fg)" : "var(--fg-muted)" }}>{t.globalScore}</span>
              <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>{t.financials?.revenue ?? "—"}</span>
              <span style={{ ...M, fontSize: 8, color: t.bodacc_recent ? "#FF4500" : "var(--fg-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.topSignals?.[0]?.label?.toUpperCase().slice(0, 16) ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

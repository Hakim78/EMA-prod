"use client";

import { useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ChatPanel from "@/components/search/ChatPanel";
import ResultsPanel from "@/components/search/ResultsPanel";
import CompanyHUD from "@/components/search/CompanyHUD";
import type { SearchMessage, SearchCompany, SearchFilter } from "@/types/search";
import type { Target, TargetsApiResponse, FilterOptions } from "@/types/index";


function targetsToCompanies(targets: Target[]): SearchCompany[] {
  return targets.map(t => ({
    id:          t.id,
    name:        t.name,
    description: [t.sector, t.sub_sector].filter(Boolean).join(" · ") || t.sector,
    country:     "France",
    sector:      t.sector,
    city:        t.city,
    revenue:     t.financials?.revenue ?? undefined,
    employees:   t.financials?.effectif ?? undefined,
    score:       t.globalScore,
    siren:       t.siren,
    website:     undefined,
    signal:      t.topSignals?.[0]?.label ?? undefined,
    structure:   t.structure ?? undefined,
    founded:     t.creation_date ?? undefined,
  }));
}

function filtersToSearchFilters(options: FilterOptions): SearchFilter[] {
  const pills: SearchFilter[] = [];
  (options.sectors ?? []).slice(0, 3).forEach((s, i) =>
    pills.push({ id: `sector-${i}`, type: "Secteur", label: s, value: s, icon: "🏢" })
  );
  (options.regions ?? []).slice(0, 2).forEach((r, i) =>
    pills.push({ id: `region-${i}`, type: "Région", label: r, value: r, icon: "📍" })
  );
  (options.structures ?? []).slice(0, 1).forEach((s, i) =>
    pills.push({ id: `struct-${i}`, type: "Structure", label: s, value: s, icon: "👥" })
  );
  return pills;
}

async function fetchTargets(_query: string): Promise<{ companies: SearchCompany[]; filters: SearchFilter[] }> {
  const r = await fetch(`/api/targets?limit=50`);
  if (!r.ok) return { companies: [], filters: [] };
  const d: TargetsApiResponse = await r.json();
  return {
    companies: targetsToCompanies(d.data ?? []),
    filters:   filtersToSearchFilters(d.filters ?? { sectors: [], regions: [], structures: [], ebitda_ranges: [] }),
  };
}

// Simulated AI insight snippets — replaced by real API later
const AI_SNIPPETS = [
  "Entreprise familiale 3ème génération, rentabilité élevée, cédant identifié.",
  "Modèle récurrent B2B, marges EBITDA ~18%, croissance organique stable.",
  "Leader régional sur niche défensive, faible dépendance client unique.",
  "Dirigeant fondateur 65 ans, pas de successeur identifié en interne.",
  "Acquisition add-on idéale, actifs industriels récents (2021).",
  "Clientèle grands comptes verrouillée par contrats pluriannuels.",
];

export default function SearchPage() {
  const [messages, setMessages]               = useState<SearchMessage[]>([]);
  const [companies, setCompanies]             = useState<SearchCompany[]>([]);
  const [filters, setFilters]                 = useState<SearchFilter[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [hiddenIds, setHiddenIds]             = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds]               = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<SearchCompany | null>(null);
  const [aiInsights, setAiInsights]           = useState<Record<string, string | "loading">>({});

  const send = useCallback(async (query: string) => {
    const uid = Date.now().toString();
    const aid = (Date.now() + 1).toString();
    setMessages(p => [
      ...p,
      { id: uid, role: "user",      content: query, timestamp: Date.now() },
      { id: aid, role: "assistant", content: "",    timestamp: Date.now(), actions: [] },
    ]);
    setLoading(true);
    setCompanies([]);
    setFilters([]);
    setHiddenIds(new Set());
    setSelectedCompany(null);
    setAiInsights({});

    let targetsLoaded = false;
    const loadTargets = async () => {
      if (targetsLoaded) return;
      targetsLoaded = true;
      try {
        const { companies: cs, filters: fs } = await fetchTargets(query);
        if (cs.length > 0) { setCompanies(cs); setFilters(fs); }
      } catch { /* silent */ }
    };

    try {
      const res = await fetch(`/api/copilot/stream?q=${encodeURIComponent(query)}`);
      if (!res.ok || !res.body) throw new Error("stream_failed");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.chunk)  setMessages(p => p.map(m => m.id === aid ? { ...m, content: m.content + ev.chunk } : m));
            if (ev.action) setMessages(p => p.map(m => m.id === aid ? { ...m, actions: [...(m.actions ?? []), ev.action] } : m));
            if (ev.done)   loadTargets();
          } catch { /* skip */ }
        }
      }
      await loadTargets();
    } catch {
      try {
        const r = await fetch(`/api/copilot/query?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        setMessages(p => p.map(m => m.id === aid ? { ...m, content: d.response ?? "Aucun résultat.", actions: ["Recherche complète"] } : m));
      } catch {
        setMessages(p => p.map(m => m.id === aid ? { ...m, content: "Erreur : serveur inaccessible." } : m));
      }
      await loadTargets();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEnrich = useCallback((ids: string[]) => {
    // Set all to loading
    const loadingMap: Record<string, "loading"> = {};
    ids.forEach(id => { loadingMap[id] = "loading"; });
    setAiInsights(loadingMap);

    // Stagger reveal: each row gets its insight with a small delay
    ids.forEach((id, i) => {
      setTimeout(() => {
        const snippet = AI_SNIPPETS[i % AI_SNIPPETS.length];
        setAiInsights(prev => ({ ...prev, [id]: snippet }));
      }, 800 + i * 120);
    });
  }, []);

  const visibleCompanies = companies.filter(c => !hiddenIds.has(c.id));

  const handleSave = (id: string) => {
    setSavedIds(s => new Set([...s, id]));
    fetch("/api/pipeline/add", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id, stage: "Sourced" }),
    }).catch(() => {});
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      <PanelGroup direction="horizontal" style={{ flex: 1, overflow: "hidden" }}>
        <Panel defaultSize={30} minSize={20} maxSize={45}>
          <ChatPanel messages={messages} loading={loading} onSend={send} />
        </Panel>
        <PanelResizeHandle style={{ width: 4, background: "var(--border)", cursor: "col-resize", flexShrink: 0 }} />
        <Panel defaultSize={70}>
          <ResultsPanel
            companies={visibleCompanies}
            filters={filters}
            loading={loading}
            savedIds={savedIds}
            aiInsights={aiInsights}
            onRemoveFilter={id => setFilters(f => f.filter(p => p.id !== id))}
            onSave={handleSave}
            onHide={id => setHiddenIds(h => new Set([...h, id]))}
            onRowClick={setSelectedCompany}
            onEnrich={handleEnrich}
          />
        </Panel>
      </PanelGroup>

      {selectedCompany && (
        <CompanyHUD company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </div>
  );
}

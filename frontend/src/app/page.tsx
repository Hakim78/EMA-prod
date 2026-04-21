"use client";

import { useState, useCallback } from "react";
import ChatPanel from "@/components/search/ChatPanel";
import ResultsPanel from "@/components/search/ResultsPanel";
import type { SearchMessage, SearchCompany, SearchFilter } from "@/types/search";

export default function SearchPage() {
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [companies, setCompanies] = useState<SearchCompany[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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
            if (ev.chunk) {
              setMessages(p => p.map(m =>
                m.id === aid ? { ...m, content: m.content + ev.chunk } : m
              ));
            }
            if (ev.action) {
              setMessages(p => p.map(m =>
                m.id === aid ? { ...m, actions: [...(m.actions ?? []), ev.action] } : m
              ));
            }
            if (ev.companies) setCompanies(ev.companies);
            if (ev.filters)   setFilters(ev.filters);
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch {
      // Fallback : non-streaming
      try {
        const r = await fetch(`/api/copilot/query?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        setMessages(p => p.map(m =>
          m.id === aid ? {
            ...m,
            content:  d.response ?? "Aucun résultat.",
            actions:  ["Recherche complète"],
          } : m
        ));
        if (d.companies) setCompanies(d.companies);
        if (d.filters)   setFilters(d.filters);
      } catch {
        setMessages(p => p.map(m =>
          m.id === aid ? { ...m, content: "Erreur : serveur inaccessible." } : m
        ));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleCompanies = companies.filter(c => !hiddenIds.has(c.id));

  const handleSave = (id: string) => {
    setSavedIds(s => new Set([...s, id]));
    fetch("/api/pipeline/add", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ companyId: id, stage: "Sourced" }),
    }).catch(() => { /* silent — pipeline API optional */ });
  };

  return (
    <div style={{
      display:  "flex",
      height:   "100%",
      overflow: "hidden",
      background: "var(--bg)",
    }}>
      <ChatPanel
        messages={messages}
        loading={loading}
        onSend={send}
      />
      <ResultsPanel
        companies={visibleCompanies}
        filters={filters}
        loading={loading}
        savedIds={savedIds}
        onRemoveFilter={id => setFilters(f => f.filter(p => p.id !== id))}
        onSave={handleSave}
        onHide={id => setHiddenIds(h => new Set([...h, id]))}
        onRowClick={company => console.log("Open HUD →", company.id, company.name)}
      />
    </div>
  );
}

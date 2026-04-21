import type { SearchCompany } from "@/types/search";

export type Stage = "Sourced" | "Contacted" | "Meeting" | "LOI" | "Signed";

export const STAGES: Stage[] = ["Sourced", "Contacted", "Meeting", "LOI", "Signed"];

export interface PipelineItem {
  company: SearchCompany;
  stage: Stage;
  savedAt: number;
}

const KEY = "ema_pipeline_v1";

export function getPipeline(): PipelineItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export function setPipeline(items: PipelineItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToPipeline(company: SearchCompany) {
  const items = getPipeline();
  if (items.some(i => i.company.id === company.id)) return;
  items.unshift({ company, stage: "Sourced", savedAt: Date.now() });
  setPipeline(items);
}

export function moveStage(id: string, stage: Stage) {
  setPipeline(getPipeline().map(i => i.company.id === id ? { ...i, stage } : i));
}

export function removeFromPipeline(id: string) {
  setPipeline(getPipeline().filter(i => i.company.id !== id));
}

export function exportCSV(items: PipelineItem[]) {
  const header = "Nom,Secteur,SIREN,Ville,Score,Stage,Sauvegardé le";
  const rows = items.map(({ company: c, stage, savedAt }) =>
    [c.name, c.sector ?? "", c.siren ?? "", c.city ?? "", c.score ?? "", stage,
      new Date(savedAt).toLocaleDateString("fr")].map(v => `"${v}"`).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "pipeline_edrcf.csv"; a.click();
  URL.revokeObjectURL(url);
}

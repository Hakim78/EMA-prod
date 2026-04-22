export interface WorkList {
  id: string;
  name: string;
  createdAt: number;
}

const KEY = "ema_lists_v1";

const DEFAULTS: WorkList[] = [
  { id: "default-1", name: "Projet Industrie 2026", createdAt: 0 },
  { id: "default-2", name: "Mandat Achat Santé",    createdAt: 0 },
];

export function getLists(): WorkList[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return DEFAULTS;
    const parsed = JSON.parse(stored) as WorkList[];
    return parsed.length > 0 ? parsed : DEFAULTS;
  } catch { return DEFAULTS; }
}

export function createList(name: string): WorkList {
  const list: WorkList = { id: Date.now().toString(), name: name.trim(), createdAt: Date.now() };
  const lists = getLists();
  lists.push(list);
  localStorage.setItem(KEY, JSON.stringify(lists));
  return list;
}

export function deleteList(id: string) {
  const lists = getLists().filter(l => l.id !== id);
  localStorage.setItem(KEY, JSON.stringify(lists));
}

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  X,
  Folder,
  Upload,
  Plus,
  Minus,
  MapPin,
  Globe,
  Building2,
  Users,
  TrendingUp,
  Tag,
  Sparkles,
  Radar,
  FolderSearch,
  Ban,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

// ── Types ─────────────────────────────────────────────────────────────────────
export interface KeywordEntry { value: string; weight: number }
export interface ExampleCompanyEntry { name: string; url?: string }
export interface AvailableList { id: string; name: string; count: number }

export interface FilterState {
  hqLocations: string[];
  operatingLocations: string[];
  operatingMode: "all" | "any";
  ownershipTypes: string[];
  headcount: { min?: number; max?: number; minGrowth?: number };
  growth: {
    headcountEnabled: boolean;
    trafficEnabled: boolean;
    headcountRange?: [number, number];
    trafficRange?: [number, number];
  };
  keywords: KeywordEntry[];
  exampleCompanies: ExampleCompanyEntry[];
  intentSignals: { enabled: boolean; subSignals: string[] };
  searchWithinList?: string;
  excludeFromLists: string[];
}

interface Props {
  state: FilterState;
  onChange: (state: FilterState) => void;
  availableLists: AvailableList[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COUNTRIES: { code: string; name: string }[] = [
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "UK", name: "United Kingdom" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "LU", name: "Luxembourg" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
];

const OWNERSHIP_TYPES = ["Private", "Family-owned", "Public", "Private equity", "Venture capital"] as const;

const INTENT_SUB_SIGNALS = [
  { id: "founder-retirement", label: "Founder approaching retirement (60+)" },
  { id: "pe-portfolio-hold",  label: "PE portfolio 3-7 year hold" },
  { id: "leadership-change",  label: "Recent leadership changes" },
  { id: "ma-activity",        label: "M&A activity in sector" },
] as const;

const KEYWORD_WEIGHTS: { v: number; label: string }[] = [
  { v:  1, label: "+1 Basic Weight"      },
  { v:  2, label: "+2 Medium Weight"     },
  { v:  3, label: "+3 Maximum Weight"    },
  { v: -1, label: "−1"                   },
  { v: -2, label: "−2"                   },
  { v: -3, label: "−3 Strong Exclusion"  },
];

type SectionKey =
  | "hq" | "op" | "owner" | "head" | "growth" | "keywords"
  | "examples" | "intent" | "savedList" | "exclude";

const SECTIONS: { key: SectionKey; title: string; Icon: typeof MapPin }[] = [
  { key: "hq",        title: "Headquarters Location",   Icon: MapPin       },
  { key: "op",        title: "Operating Location",      Icon: Globe        },
  { key: "owner",     title: "Ownership Type",          Icon: Building2    },
  { key: "head",      title: "Headcount",               Icon: Users        },
  { key: "growth",    title: "Growth",                  Icon: TrendingUp   },
  { key: "keywords",  title: "Keywords",                Icon: Tag          },
  { key: "examples",  title: "Example Companies",       Icon: Sparkles     },
  { key: "intent",    title: "Intent Signals",          Icon: Radar        },
  { key: "savedList", title: "Search within saved list", Icon: FolderSearch },
  { key: "exclude",   title: "Exclude from results",    Icon: Ban          },
];

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_FILTER_STATE: FilterState = {
  hqLocations: [],
  operatingLocations: [],
  operatingMode: "any",
  ownershipTypes: [],
  headcount: {},
  growth: { headcountEnabled: false, trafficEnabled: false },
  keywords: [],
  exampleCompanies: [],
  intentSignals: { enabled: false, subSignals: [] },
  searchWithinList: undefined,
  excludeFromLists: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function countActive(s: FilterState): number {
  let n = 0;
  if (s.hqLocations.length > 0) n++;
  if (s.operatingLocations.length > 0) n++;
  if (s.ownershipTypes.length > 0) n++;
  if (s.headcount.min !== undefined || s.headcount.max !== undefined || s.headcount.minGrowth !== undefined) n++;
  if (s.growth.headcountEnabled || s.growth.trafficEnabled) n++;
  if (s.keywords.length > 0) n++;
  if (s.exampleCompanies.length > 0) n++;
  if (s.intentSignals.enabled) n++;
  if (s.searchWithinList) n++;
  if (s.excludeFromLists.length > 0) n++;
  return n;
}

function weightColors(weight: number): { bg: string; border: string; fg: string } {
  if (weight > 0) return { bg: "rgba(22,163,74,0.10)",  border: "rgba(22,163,74,0.40)",  fg: "var(--up)" };
  if (weight < 0) return { bg: "rgba(220,38,38,0.10)",  border: "rgba(220,38,38,0.40)",  fg: "var(--down)" };
  return                { bg: "var(--bg-raise)",        border: "var(--border)",         fg: "var(--fg-muted)" };
}

// ── Reusable subcomponents ────────────────────────────────────────────────────
function HelpText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...S, fontSize: 11, fontStyle: "italic", color: "var(--fg-muted)", marginTop: 6, lineHeight: 1.4 }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function NumberInput({
  value, onChange, placeholder, min, max,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      placeholder={placeholder}
      min={min}
      max={max}
      onChange={(e: { target: { value: string } }) => {
        const raw = e.target.value;
        if (raw === "") return onChange(undefined);
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
      style={{
        ...S, fontSize: 12, color: "var(--fg)",
        width: "100%", padding: "6px 8px",
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        outline: "none", transition: "border-color 0.15s",
      }}
      onFocus={(e: { currentTarget: HTMLInputElement }) => (e.currentTarget.style.borderColor = "var(--fg-muted)")}
      onBlur={(e: { currentTarget: HTMLInputElement }) => (e.currentTarget.style.borderColor = "var(--border)")}
    />
  );
}

function TextInput({
  value, onChange, placeholder, onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      style={{
        ...S, fontSize: 12, color: "var(--fg)",
        width: "100%", padding: "6px 8px",
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        outline: "none", transition: "border-color 0.15s",
      }}
      onFocus={(e: { currentTarget: HTMLInputElement }) => (e.currentTarget.style.borderColor = "var(--fg-muted)")}
      onBlur={(e: { currentTarget: HTMLInputElement }) => (e.currentTarget.style.borderColor = "var(--border)")}
    />
  );
}

function Switch({
  checked, onChange, ariaLabel,
}: { checked: boolean; onChange: (v: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative", width: 28, height: 15, flexShrink: 0,
        background: "transparent", border: "none", padding: 0, cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: checked ? "var(--fg)" : "var(--bg-alt)",
        border: "1px solid var(--border)", transition: "background 0.2s",
      }} />
      <motion.div
        animate={{ left: checked ? 13 : 2 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "absolute", top: 2, width: 9, height: 9,
          background: "var(--bg-raise)", border: "1px solid var(--border)",
        }}
      />
    </button>
  );
}

function Chip({
  label, selected, onClick, removable, onRemove,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px",
        background: selected ? "var(--fg)" : "var(--bg-raise)",
        color: selected ? "var(--bg)" : "var(--fg)",
        border: `1px solid ${selected ? "var(--fg)" : "var(--border)"}`,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: "all 0.15s",
        ...S, fontSize: 11,
      }}
      onMouseEnter={(e: { currentTarget: HTMLDivElement }) => {
        if (!selected && onClick) e.currentTarget.style.borderColor = "var(--fg-muted)";
      }}
      onMouseLeave={(e: { currentTarget: HTMLDivElement }) => {
        if (!selected && onClick) e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <span>{label}</span>
      {removable && (
        <button
          onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onRemove?.(); }}
          aria-label={`Remove ${label}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 12, height: 12, marginLeft: 1,
            background: "transparent", border: "none", cursor: "pointer",
            color: "inherit", opacity: 0.5, padding: 0,
          }}
          onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "0.5")}
        >
          <X size={9} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

// Multi-select dropdown for countries / lists.
function MultiSelect({
  options, selected, onToggle, placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: "100%", padding: "6px 8px",
          background: "var(--bg-raise)", border: "1px solid var(--border)",
          ...S, fontSize: 12, color: selected.length === 0 ? "var(--fg-muted)" : "var(--fg)",
          cursor: "pointer", textAlign: "left", outline: "none",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
        onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.borderColor = "var(--fg-muted)")}
        onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <span>{selected.length === 0 ? placeholder : `${selected.length} selected`}</span>
        <ChevronRight
          size={12}
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", color: "var(--fg-muted)" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 30,
              background: "var(--bg-raise)", border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              maxHeight: 220, overflow: "auto",
            }}
          >
            <div style={{ padding: 6, borderBottom: "1px solid var(--border)" }}>
              <input
                type="text"
                value={query}
                onChange={(e: { target: { value: string } }) => setQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%", padding: "4px 6px",
                  background: "var(--bg)", border: "1px solid var(--border)",
                  ...S, fontSize: 12, color: "var(--fg)", outline: "none",
                }}
              />
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: 10, ...S, fontSize: 12, color: "var(--fg-muted)", textAlign: "center" }}>
                No match
              </div>
            ) : (
              filtered.map(opt => {
                const active = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => onToggle(opt.value)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", background: "transparent",
                      border: "none", cursor: "pointer",
                      ...S, fontSize: 12, color: active ? "var(--fg)" : "var(--fg-muted)",
                      textAlign: "left", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: 12, height: 12, flexShrink: 0,
                      border: `1px solid ${active ? "var(--fg)" : "var(--border)"}`,
                      background: active ? "var(--fg)" : "transparent",
                    }} />
                    <span>{opt.label}</span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Segmented control (All of / Any of).
function Segmented<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div style={{
      display: "inline-flex", border: "1px solid var(--border)",
      background: "var(--bg-raise)", padding: 2,
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              ...S, fontSize: 11, fontWeight: active ? 600 : 400,
              padding: "4px 10px",
              background: active ? "var(--fg)" : "transparent",
              color: active ? "var(--bg)" : "var(--fg-muted)",
              border: "none", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Custom range slider with single thumb (used for headcount visual).
function SimpleSlider({
  value, onChange, min, max, step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 20 }}>
      <div style={{
        position: "absolute", top: 9, left: 0, right: 0, height: 2,
        background: "var(--bg-alt)", border: "1px solid var(--border)",
      }} />
      <div style={{
        position: "absolute", top: 9, left: 0, height: 2,
        width: `${pct}%`, background: "var(--fg)",
      }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: { target: { value: string } }) => onChange(Number(e.target.value))}
        style={{
          position: "absolute", inset: 0, width: "100%", height: 20,
          opacity: 0, cursor: "pointer", margin: 0,
        }}
      />
      <div style={{
        position: "absolute", top: 4, left: `calc(${pct}% - 6px)`,
        width: 12, height: 12, background: "var(--bg-raise)",
        border: "1.5px solid var(--fg)", pointerEvents: "none",
      }} />
    </div>
  );
}

// ── Section accordion wrapper ─────────────────────────────────────────────────
function Section({
  title, Icon, open, onToggle, badgeCount, children,
}: {
  title: string;
  Icon: typeof MapPin;
  open: boolean;
  onToggle: () => void;
  badgeCount?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px", background: "transparent",
          border: "none", cursor: "pointer", textAlign: "left",
          color: "var(--fg)", transition: "background 0.1s",
        }}
        onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "transparent")}
      >
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: "flex", alignItems: "center", color: "var(--fg-muted)" }}
        >
          <ChevronRight size={13} />
        </motion.div>
        <Icon size={13} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
        <span style={{ ...S, fontSize: 12, fontWeight: 500, flex: 1 }}>{title}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <span style={{
            ...M, fontSize: 9, padding: "1px 5px",
            background: "var(--fg)", color: "var(--bg)",
            letterSpacing: "0.04em",
          }}>
            {badgeCount}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 12px 14px 12px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Keyword chip with weight popover ──────────────────────────────────────────
function KeywordChip({
  entry, onWeightChange, onRemove,
}: {
  entry: KeywordEntry;
  onWeightChange: (w: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = weightColors(entry.weight);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div
        onClick={() => setOpen(p => !p)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 7px",
          background: c.bg,
          border: `1px solid ${c.border}`,
          color: c.fg,
          cursor: "pointer", userSelect: "none",
          ...S, fontSize: 11,
          transition: "all 0.15s",
        }}
      >
        <span>{entry.value}</span>
        <sup style={{ ...M, fontSize: 9, fontWeight: 700, marginLeft: 1 }}>
          {entry.weight > 0 ? `+${entry.weight}` : entry.weight}
        </sup>
        <button
          onClick={(e: { stopPropagation: () => void }) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove keyword ${entry.value}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 12, height: 12, marginLeft: 1,
            background: "transparent", border: "none", cursor: "pointer",
            color: c.fg, opacity: 0.5, padding: 0,
          }}
          onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.opacity = "0.5")}
        >
          <X size={9} strokeWidth={2.5} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 40,
              background: "var(--bg-raise)", border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              minWidth: 170,
            }}
          >
            {KEYWORD_WEIGHTS.map(w => {
              const active = entry.weight === w.v;
              return (
                <button
                  key={w.v}
                  onClick={() => { onWeightChange(w.v); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 10px", background: "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    ...S, fontSize: 12,
                    color: active ? "var(--fg)" : "var(--fg-muted)",
                    fontWeight: active ? 600 : 400,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.background = "transparent")}
                >
                  {w.v > 0 ? <Plus size={10} style={{ color: "var(--up)" }} /> : <Minus size={10} style={{ color: "var(--down)" }} />}
                  {w.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function FilterPanel({ state, onChange, availableLists }: Props) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    hq: true, op: false, owner: true, head: false, growth: false,
    keywords: true, examples: false, intent: false,
    savedList: false, exclude: false,
  });

  const [keywordDraft, setKeywordDraft] = useState("");
  const [exampleDraft, setExampleDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const toggleSection = (k: SectionKey) =>
    setOpenSections(prev => ({ ...prev, [k]: !prev[k] }));

  const activeCount = countActive(state);

  // ── Mutators (immutable updates) ────────────────────────────────────────────
  const update = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });

  const toggleHq = (v: string) =>
    update({ hqLocations: state.hqLocations.includes(v)
      ? state.hqLocations.filter(x => x !== v)
      : [...state.hqLocations, v] });

  const toggleOp = (v: string) =>
    update({ operatingLocations: state.operatingLocations.includes(v)
      ? state.operatingLocations.filter(x => x !== v)
      : [...state.operatingLocations, v] });

  const toggleOwner = (v: string) =>
    update({ ownershipTypes: state.ownershipTypes.includes(v)
      ? state.ownershipTypes.filter(x => x !== v)
      : [...state.ownershipTypes, v] });

  const toggleExclude = (id: string) =>
    update({ excludeFromLists: state.excludeFromLists.includes(id)
      ? state.excludeFromLists.filter(x => x !== id)
      : [...state.excludeFromLists, id] });

  const toggleSubSignal = (id: string) => {
    const cur = state.intentSignals.subSignals;
    update({
      intentSignals: {
        ...state.intentSignals,
        subSignals: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id],
      },
    });
  };

  const addKeyword = () => {
    const v = keywordDraft.trim();
    if (!v || state.keywords.some(k => k.value.toLowerCase() === v.toLowerCase())) return;
    update({ keywords: [...state.keywords, { value: v, weight: 1 }] });
    setKeywordDraft("");
  };

  const removeKeyword = (value: string) =>
    update({ keywords: state.keywords.filter(k => k.value !== value) });

  const setKeywordWeight = (value: string, weight: number) =>
    update({ keywords: state.keywords.map(k => k.value === value ? { ...k, weight } : k) });

  const addExample = (name: string, url?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (state.exampleCompanies.length >= 3) return;
    if (state.exampleCompanies.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    update({ exampleCompanies: [...state.exampleCompanies, { name: trimmed, url }] });
    setExampleDraft("");
  };

  const removeExample = (name: string) =>
    update({ exampleCompanies: state.exampleCompanies.filter(c => c.name !== name) });

  const clearAll = () => onChange(DEFAULT_FILTER_STATE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg-raise)",
      borderRight: "1px solid var(--border)",
      overflow: "hidden",
    }}>

      {/* Header */}
      <div style={{
        height: 36, flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 12px",
        background: "var(--bg-raise)", gap: 8,
      }}>
        <span style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>Filters</span>
        {activeCount > 0 && (
          <span style={{
            ...M, fontSize: 9, padding: "1px 6px",
            background: "var(--fg)", color: "var(--bg)",
            letterSpacing: "0.04em",
          }}>
            {activeCount} active
          </span>
        )}
        <div style={{ flex: 1 }} />
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              ...S, fontSize: 11, color: "var(--fg-muted)",
              background: "transparent", border: "none", cursor: "pointer",
              padding: "4px 6px", transition: "color 0.15s",
            }}
            onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.color = "var(--down)")}
            onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.color = "var(--fg-muted)")}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

        {/* 1 — Headquarters Location */}
        <Section
          title={SECTIONS[0].title} Icon={SECTIONS[0].Icon}
          open={openSections.hq} onToggle={() => toggleSection("hq")}
          badgeCount={state.hqLocations.length}
        >
          <MultiSelect
            options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
            selected={state.hqLocations}
            onToggle={toggleHq}
            placeholder="Select countries..."
          />
          {state.hqLocations.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {state.hqLocations.map(code => {
                const c = COUNTRIES.find(x => x.code === code);
                return (
                  <Chip
                    key={code}
                    label={c?.name ?? code}
                    selected
                    removable
                    onRemove={() => toggleHq(code)}
                  />
                );
              })}
            </div>
          )}
        </Section>

        {/* 2 — Operating Location */}
        <Section
          title={SECTIONS[1].title} Icon={SECTIONS[1].Icon}
          open={openSections.op} onToggle={() => toggleSection("op")}
          badgeCount={state.operatingLocations.length}
        >
          <SectionLabel>Match mode</SectionLabel>
          <Segmented
            value={state.operatingMode}
            onChange={(v: "all" | "any") => update({ operatingMode: v })}
            options={[
              { value: "all", label: "All of" },
              { value: "any", label: "Any of" },
            ]}
          />
          <div style={{ height: 8 }} />
          <MultiSelect
            options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
            selected={state.operatingLocations}
            onToggle={toggleOp}
            placeholder="Select countries..."
          />
          {state.operatingLocations.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {state.operatingLocations.map(code => {
                const c = COUNTRIES.find(x => x.code === code);
                return (
                  <Chip
                    key={code}
                    label={c?.name ?? code}
                    selected
                    removable
                    onRemove={() => toggleOp(code)}
                  />
                );
              })}
            </div>
          )}
          <HelpText>
            All of = company operates in ALL listed countries. Any of = at least one.
          </HelpText>
        </Section>

        {/* 3 — Ownership Type */}
        <Section
          title={SECTIONS[2].title} Icon={SECTIONS[2].Icon}
          open={openSections.owner} onToggle={() => toggleSection("owner")}
          badgeCount={state.ownershipTypes.length}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {OWNERSHIP_TYPES.map(t => (
              <Chip
                key={t}
                label={t}
                selected={state.ownershipTypes.includes(t)}
                onClick={() => toggleOwner(t)}
              />
            ))}
          </div>
        </Section>

        {/* 4 — Headcount */}
        <Section
          title={SECTIONS[3].title} Icon={SECTIONS[3].Icon}
          open={openSections.head} onToggle={() => toggleSection("head")}
          badgeCount={
            (state.headcount.min !== undefined || state.headcount.max !== undefined ? 1 : 0) +
            (state.headcount.minGrowth !== undefined ? 1 : 0)
          }
        >
          <SectionLabel>Range</SectionLabel>
          <div style={{ display: "flex", gap: 6 }}>
            <NumberInput
              value={state.headcount.min}
              onChange={(v: number | undefined) => update({ headcount: { ...state.headcount, min: v } })}
              placeholder="Min"
              min={0}
            />
            <NumberInput
              value={state.headcount.max}
              onChange={(v: number | undefined) => update({ headcount: { ...state.headcount, max: v } })}
              placeholder="Max"
              min={0}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <SimpleSlider
              value={Math.min(state.headcount.max ?? 0, 10000)}
              onChange={(v: number) => update({ headcount: { ...state.headcount, max: v } })}
              min={0}
              max={10000}
              step={50}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>0</span>
              <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>10000+</span>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionLabel>Min headcount growth %</SectionLabel>
            <NumberInput
              value={state.headcount.minGrowth}
              onChange={(v: number | undefined) => update({ headcount: { ...state.headcount, minGrowth: v } })}
              placeholder="0"
              min={-50}
              max={200}
            />
          </div>
        </Section>

        {/* 5 — Growth */}
        <Section
          title={SECTIONS[4].title} Icon={SECTIONS[4].Icon}
          open={openSections.growth} onToggle={() => toggleSection("growth")}
          badgeCount={(state.growth.headcountEnabled ? 1 : 0) + (state.growth.trafficEnabled ? 1 : 0)}
        >
          {/* Headcount growth */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...S, fontSize: 12, color: "var(--fg)" }}>Headcount growth</span>
            <Switch
              checked={state.growth.headcountEnabled}
              onChange={(v: boolean) => update({ growth: { ...state.growth, headcountEnabled: v } })}
              ariaLabel="Toggle headcount growth"
            />
          </div>
          <AnimatePresence initial={false}>
            {state.growth.headcountEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.16 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <NumberInput
                    value={state.growth.headcountRange?.[0]}
                    onChange={(v: number | undefined) => {
                      const cur = state.growth.headcountRange ?? [-100, 500];
                      update({ growth: { ...state.growth, headcountRange: [v ?? -100, cur[1]] } });
                    }}
                    placeholder="Min %"
                    min={-100}
                    max={500}
                  />
                  <NumberInput
                    value={state.growth.headcountRange?.[1]}
                    onChange={(v: number | undefined) => {
                      const cur = state.growth.headcountRange ?? [-100, 500];
                      update({ growth: { ...state.growth, headcountRange: [cur[0], v ?? 500] } });
                    }}
                    placeholder="Max %"
                    min={-100}
                    max={500}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Website traffic growth */}
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...S, fontSize: 12, color: "var(--fg)" }}>Website traffic growth</span>
            <Switch
              checked={state.growth.trafficEnabled}
              onChange={(v: boolean) => update({ growth: { ...state.growth, trafficEnabled: v } })}
              ariaLabel="Toggle website traffic growth"
            />
          </div>
          <AnimatePresence initial={false}>
            {state.growth.trafficEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.16 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <NumberInput
                    value={state.growth.trafficRange?.[0]}
                    onChange={(v: number | undefined) => {
                      const cur = state.growth.trafficRange ?? [-100, 500];
                      update({ growth: { ...state.growth, trafficRange: [v ?? -100, cur[1]] } });
                    }}
                    placeholder="Min %"
                    min={-100}
                    max={500}
                  />
                  <NumberInput
                    value={state.growth.trafficRange?.[1]}
                    onChange={(v: number | undefined) => {
                      const cur = state.growth.trafficRange ?? [-100, 500];
                      update({ growth: { ...state.growth, trafficRange: [cur[0], v ?? 500] } });
                    }}
                    placeholder="Max %"
                    min={-100}
                    max={500}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* 6 — Keywords */}
        <Section
          title={SECTIONS[5].title} Icon={SECTIONS[5].Icon}
          open={openSections.keywords} onToggle={() => toggleSection("keywords")}
          badgeCount={state.keywords.length}
        >
          <TextInput
            value={keywordDraft}
            onChange={setKeywordDraft}
            placeholder="Type a keyword, press Enter..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
            }}
          />
          {state.keywords.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {state.keywords.map(k => (
                <KeywordChip
                  key={k.value}
                  entry={k}
                  onWeightChange={(w: number) => setKeywordWeight(k.value, w)}
                  onRemove={() => removeKeyword(k.value)}
                />
              ))}
            </div>
          )}
          <HelpText>Adding 1-3 relevant targeted keywords is usually enough.</HelpText>
        </Section>

        {/* 7 — Example Companies */}
        <Section
          title={SECTIONS[6].title} Icon={SECTIONS[6].Icon}
          open={openSections.examples} onToggle={() => toggleSection("examples")}
          badgeCount={state.exampleCompanies.length}
        >
          <TextInput
            value={exampleDraft}
            onChange={setExampleDraft}
            placeholder="Type company name or paste URL..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = exampleDraft.trim();
                if (trimmed.startsWith("http")) {
                  try {
                    const u = new URL(trimmed);
                    addExample(u.hostname.replace(/^www\./, ""), trimmed);
                  } catch {
                    addExample(trimmed);
                  }
                } else {
                  addExample(trimmed);
                }
              }
            }}
          />

          {/* "or" divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            margin: "10px 0", color: "var(--fg-dim)",
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ ...M, fontSize: 9, letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragOver(false);
              const text = e.dataTransfer.getData("text/plain");
              if (text) {
                if (text.startsWith("http")) {
                  try {
                    const u = new URL(text);
                    addExample(u.hostname.replace(/^www\./, ""), text);
                  } catch {
                    addExample(text);
                  }
                } else {
                  addExample(text);
                }
              }
            }}
            style={{
              padding: 14, textAlign: "center",
              border: `2px dashed ${dragOver ? "var(--up)" : "var(--border)"}`,
              background: dragOver ? "rgba(22,163,74,0.05)" : "transparent",
              transition: "all 0.15s",
              cursor: "default",
            }}
          >
            <Upload size={16} style={{ color: dragOver ? "var(--up)" : "var(--fg-muted)", marginBottom: 4 }} />
            <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
              Drop company URL here
            </div>
          </div>

          {state.exampleCompanies.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {state.exampleCompanies.map(c => {
                const initial = c.name.charAt(0).toUpperCase();
                const hue = (c.name.charCodeAt(0) * 7) % 360;
                return (
                  <div
                    key={c.name}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px",
                      background: "var(--bg-raise)", border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, flexShrink: 0,
                      background: `hsl(${hue}, 50%, 55%)`,
                      color: "#fff", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      ...M, fontSize: 11, fontWeight: 700,
                    }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...S, fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                      </div>
                      {c.url && (
                        <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.url}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeExample(c.name)}
                      aria-label={`Remove ${c.name}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 18, height: 18,
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "var(--fg-muted)", padding: 0, transition: "color 0.15s",
                      }}
                      onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.color = "var(--down)")}
                      onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => (e.currentTarget.style.color = "var(--fg-muted)")}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <HelpText>Keep it simple with 1-3 well-known companies.</HelpText>
        </Section>

        {/* 8 — Intent Signals */}
        <Section
          title={SECTIONS[7].title} Icon={SECTIONS[7].Icon}
          open={openSections.intent} onToggle={() => toggleSection("intent")}
          badgeCount={state.intentSignals.enabled ? Math.max(1, state.intentSignals.subSignals.length) : 0}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...S, fontSize: 12, fontWeight: 500, color: "var(--fg)" }}>Enable Intent Signals</span>
            <Switch
              checked={state.intentSignals.enabled}
              onChange={(v: boolean) =>
                update({ intentSignals: { enabled: v, subSignals: v ? state.intentSignals.subSignals : [] } })
              }
              ariaLabel="Toggle intent signals"
            />
          </div>
          <AnimatePresence initial={false}>
            {state.intentSignals.enabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {INTENT_SUB_SIGNALS.map(sig => (
                    <div
                      key={sig.id}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "6px 8px",
                        background: "var(--bg-raise)", border: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ ...S, fontSize: 11, color: "var(--fg)", flex: 1, paddingRight: 8 }}>
                        {sig.label}
                      </span>
                      <Switch
                        checked={state.intentSignals.subSignals.includes(sig.id)}
                        onChange={() => toggleSubSignal(sig.id)}
                        ariaLabel={`Toggle ${sig.label}`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* Thick divider before saved-list section */}
        <div style={{ height: 6, background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} />

        {/* 9 — Search within saved list */}
        <Section
          title={SECTIONS[8].title} Icon={SECTIONS[8].Icon}
          open={openSections.savedList} onToggle={() => toggleSection("savedList")}
          badgeCount={state.searchWithinList ? 1 : 0}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "_all", name: "All companies", count: 0 },
              ...availableLists,
            ].map(l => {
              const active = (state.searchWithinList ?? "_all") === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => update({ searchWithinList: l.id === "_all" ? undefined : l.id })}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px",
                    background: active ? "var(--bg-hover)" : "transparent",
                    border: `1px solid ${active ? "var(--fg-muted)" : "var(--border)"}`,
                    cursor: "pointer", textAlign: "left",
                    ...S, fontSize: 12, color: active ? "var(--fg)" : "var(--fg-muted)",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => {
                    if (!active) e.currentTarget.style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Folder size={12} style={{ flexShrink: 0, color: active ? "var(--fg)" : "var(--fg-muted)" }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.id === "_all" ? "All companies (default)" : l.name}
                  </span>
                  {l.id !== "_all" && (
                    <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>
                      ({l.count})
                    </span>
                  )}
                </button>
              );
            })}
            {availableLists.length === 0 && (
              <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", fontStyle: "italic", padding: "6px 0" }}>
                No saved lists yet.
              </div>
            )}
          </div>
        </Section>

        {/* Thick divider before exclude */}
        <div style={{ height: 6, background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} />

        {/* 10 — Exclude from results */}
        <Section
          title={SECTIONS[9].title} Icon={SECTIONS[9].Icon}
          open={openSections.exclude} onToggle={() => toggleSection("exclude")}
          badgeCount={state.excludeFromLists.length}
        >
          <SectionLabel>Companies in selected lists</SectionLabel>
          {availableLists.length === 0 ? (
            <div style={{ ...S, fontSize: 11, color: "var(--fg-muted)", fontStyle: "italic" }}>
              No saved lists to exclude.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {availableLists.map(l => {
                const active = state.excludeFromLists.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleExclude(l.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 8px",
                      background: active ? "rgba(220,38,38,0.06)" : "transparent",
                      border: `1px solid ${active ? "rgba(220,38,38,0.4)" : "var(--border)"}`,
                      cursor: "pointer", textAlign: "left",
                      ...S, fontSize: 12,
                      color: active ? "var(--down)" : "var(--fg-muted)",
                      transition: "all 0.1s",
                    }}
                  >
                    <div style={{
                      width: 12, height: 12, flexShrink: 0,
                      border: `1px solid ${active ? "var(--down)" : "var(--border)"}`,
                      background: active ? "var(--down)" : "transparent",
                    }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.name}
                    </span>
                    <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>
                      ({l.count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* bottom padding */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

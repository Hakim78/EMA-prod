"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { Folder, Plus, Search, Trash2, Check, ChevronDown } from "lucide-react";
import { getLists, createList, deleteList, type WorkList } from "@/lib/lists";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const ACTIVE_KEY = "ema_active_list";
const CHANGE_EVENT = "ema_active_list_changed";

// ─── HOOK ────────────────────────────────────────────────────────────────────

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACTIVE_KEY) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

export function useActiveList(): {
  activeListId: string | null;
  activeList: WorkList | null;
  setActiveList: (id: string | null) => void;
} {
  const id = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [lists, setLists] = useState<WorkList[]>([]);

  useEffect(() => {
    setLists(getLists());
    const refresh = () => setLists(getLists());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const activeListId = id || null;
  const activeList = activeListId ? lists.find((l) => l.id === activeListId) ?? null : null;

  const setActiveList = (next: string | null) => {
    if (next) {
      localStorage.setItem(ACTIVE_KEY, next);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { activeListId, activeList, setActiveList };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ListSwitcher() {
  const { activeList, setActiveList } = useActiveList();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [lists, setLists] = useState<WorkList[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLists(getLists());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    setTimeout(() => document.addEventListener("mousedown", close), 0);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const filtered = lists.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const list = createList(name);
    setActiveList(list.id);
    setLists(getLists());
    setNewName("");
    setCreating(false);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteList(id);
    setLists(getLists());
    if (activeList?.id === id) setActiveList(null);
  };

  const select = (id: string) => {
    setActiveList(id);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...S, display: "flex", alignItems: "center", gap: 6,
          height: 28, padding: "0 8px",
          background: open ? "var(--bg-alt)" : "var(--bg-raise)",
          border: `1px solid ${open ? "var(--fg-muted)" : "var(--border)"}`,
          color: "var(--fg)", fontSize: 12, cursor: "pointer",
          minWidth: 180, maxWidth: 220,
          transition: "all 0.1s",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = "var(--fg-muted)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <Folder size={11} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
        <span style={{
          flex: 1, textAlign: "left",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: activeList ? "var(--fg)" : "var(--fg-muted)",
        }}>
          {activeList ? activeList.name : "All companies"}
        </span>
        <ChevronDown size={11} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0,
          width: 260, zIndex: 100,
          background: "var(--bg-raise)", border: "1px solid var(--border)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
        }}>
          {/* Search */}
          <div style={{
            padding: "8px 10px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Search size={11} style={{ color: "var(--fg-dim)", flexShrink: 0 }} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lists…"
              style={{
                flex: 1, border: "none", background: "transparent",
                ...S, fontSize: 12, color: "var(--fg)", outline: "none",
              }}
            />
          </div>

          {/* All companies item */}
          <button
            onClick={() => { setActiveList(null); setOpen(false); }}
            style={{
              width: "100%", textAlign: "left", padding: "7px 12px",
              display: "flex", alignItems: "center", gap: 8,
              background: !activeList ? "var(--bg-hover)" : "transparent",
              border: "none", borderBottom: "1px solid var(--border)",
              cursor: "pointer", ...S, fontSize: 12,
              color: "var(--fg)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = !activeList ? "var(--bg-hover)" : "transparent")}
          >
            <Folder size={12} style={{ color: "var(--fg-muted)" }} />
            <span style={{ flex: 1 }}>All companies</span>
            {!activeList && <Check size={11} style={{ color: "var(--fg)" }} />}
          </button>

          {/* Lists */}
          <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0" }}>
            {filtered.map((list) => {
              const active = list.id === activeList?.id;
              return (
                <div
                  key={list.id}
                  className="ema-list-row"
                  style={{
                    display: "flex", alignItems: "center",
                    background: active ? "var(--bg-hover)" : "transparent",
                  }}
                >
                  <button
                    onClick={() => select(list.id)}
                    style={{
                      flex: 1, textAlign: "left",
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 12px", background: "transparent",
                      border: "none", cursor: "pointer",
                      ...S, fontSize: 12, color: "var(--fg)",
                    }}
                  >
                    <Folder size={12} style={{ color: "var(--fg-muted)", flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {list.name}
                    </span>
                    {active && <Check size={11} style={{ color: "var(--fg)", flexShrink: 0 }} />}
                  </button>
                  {list.createdAt > 0 && (
                    <button
                      onClick={(e) => handleDelete(e, list.id)}
                      className="ema-list-delete"
                      style={{
                        padding: "7px 10px", background: "transparent",
                        border: "none", cursor: "pointer",
                        color: "var(--fg-dim)",
                        display: "flex", alignItems: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--down)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
                      aria-label={`Delete ${list.name}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && search && (
              <div style={{ padding: "10px 12px", ...S, fontSize: 11, color: "var(--fg-dim)", fontStyle: "italic" }}>
                No matching lists
              </div>
            )}
          </div>

          {/* Create new */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "4px 0" }}>
            {creating ? (
              <form onSubmit={handleCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
                  placeholder="List name…"
                  style={{
                    flex: 1, border: "1px solid var(--border)",
                    background: "var(--bg)", color: "var(--fg)",
                    ...S, fontSize: 12, padding: "4px 8px", outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  style={{
                    padding: "4px 10px",
                    background: newName.trim() ? "var(--fg)" : "var(--bg-alt)",
                    border: "none", cursor: newName.trim() ? "pointer" : "default",
                    color: newName.trim() ? "var(--bg)" : "var(--fg-dim)",
                    ...M, fontSize: 10, letterSpacing: "0.04em",
                  }}
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px", background: "transparent",
                  border: "none", cursor: "pointer",
                  ...S, fontSize: 12, color: "var(--fg)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Plus size={12} style={{ flexShrink: 0, color: "var(--fg-muted)" }} />
                Create new list
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

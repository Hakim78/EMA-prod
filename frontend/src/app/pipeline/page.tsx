"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Download, ChevronDown, GripVertical } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { getPipeline, setPipeline, moveStage, removeFromPipeline, exportCSV, STAGES } from "@/lib/pipeline";
import type { PipelineItem, Stage } from "@/lib/pipeline";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const STAGE_COLORS: Record<Stage, string> = {
  Sourced:   "var(--fg-dim)",
  Contacted: "#2563EB",
  Meeting:   "#7C3AED",
  LOI:       "var(--signal)",
  Signed:    "var(--up)",
};

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(getPipeline());
    const onStorage = () => setItems(getPipeline());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refresh() { setItems(getPipeline()); }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStage = destination.droppableId as Stage;
    moveStage(draggableId, newStage);
    refresh();
    showToast(`→ ${newStage}`);
  }

  function handleMove(id: string, stage: Stage) {
    moveStage(id, stage);
    refresh();
    showToast(`→ ${stage}`);
  }

  function handleRemove(id: string) {
    removeFromPipeline(id);
    refresh();
  }

  function handleExport() {
    exportCSV(items);
    showToast("Export CSV lancé");
  }

  const total = items.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{
        height: 48, borderBottom: "1px solid var(--border)", flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
        background: "var(--bg-raise)",
      }}>
        <span style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>My Lists</span>
        <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>PIPELINE M&A</span>
        <div style={{ flex: 1 }} />
        {total > 0 && (
          <span style={{ ...M, fontSize: 10, color: "var(--fg-muted)" }}>
            {total} entreprise{total > 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={handleExport}
          disabled={total === 0}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", cursor: total > 0 ? "pointer" : "not-allowed",
            background: "transparent", border: "1px solid var(--border)",
            color: total > 0 ? "var(--fg-muted)" : "var(--fg-dim)",
            ...S, fontSize: 12, transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (total > 0) { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = total > 0 ? "var(--fg-muted)" : "var(--fg-dim)"; }}
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Kanban */}
      {total === 0 ? (
        <EmptyPipeline />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ flex: 1, display: "flex", overflowX: "auto", overflowY: "hidden" }}>
            {STAGES.map(stage => {
              const cards = items.filter(i => i.stage === stage);
              return (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  cards={cards}
                  onMove={handleMove}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--bg-raise)", border: "1px solid var(--border)",
          color: "var(--fg)", padding: "10px 20px", zIndex: 200,
          ...M, fontSize: 10, letterSpacing: "0.08em",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          pointerEvents: "none",
        }}>
          <span style={{ color: "var(--up)" }}>✓</span> {toast}
        </div>
      )}
    </div>
  );
}

// ── Kanban Column ──────────────────────────────────────────────────────────────

function KanbanColumn({ stage, cards, onMove, onRemove }: {
  stage: Stage;
  cards: PipelineItem[];
  onMove: (id: string, s: Stage) => void;
  onRemove: (id: string) => void;
}) {
  const color = STAGE_COLORS[stage];

  return (
    <div style={{
      width: 260, flexShrink: 0,
      display: "flex", flexDirection: "column",
      borderRight: "1px solid var(--border)",
    }}>
      {/* Column header */}
      <div style={{
        height: 40, borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 14px", flexShrink: 0,
        background: "var(--bg-alt)",
      }}>
        <span style={{ ...M, fontSize: 10, color, letterSpacing: "0.12em" }}>{stage.toUpperCase()}</span>
        <span style={{
          ...M, fontSize: 10, color,
          padding: "2px 7px", border: `1px solid ${color}`,
          background: `${color}18`,
        }}>
          {cards.length}
        </span>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1, overflowY: "auto", padding: "8px 0",
              background: snapshot.isDraggingOver ? `${color}08` : "transparent",
              transition: "background 0.15s",
              minHeight: 80,
            }}
          >
            {cards.map((item, index) => (
              <Draggable key={item.company.id} draggableId={item.company.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    style={{ ...dragProvided.draggableProps.style }}
                  >
                    <DealCard
                      item={item}
                      isDragging={dragSnapshot.isDragging}
                      dragHandleProps={dragProvided.dragHandleProps}
                      onMove={onMove}
                      onRemove={onRemove}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div style={{
                padding: "20px 14px", textAlign: "center",
                ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.08em",
              }}>
                VIDE
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ── Deal Card ──────────────────────────────────────────────────────────────────

function DealCard({ item, isDragging, dragHandleProps, onMove, onRemove }: {
  item: PipelineItem;
  isDragging: boolean;
  dragHandleProps: object | null | undefined;
  onMove: (id: string, s: Stage) => void;
  onRemove: (id: string) => void;
}) {
  const [stageOpen, setStageOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { company, stage, savedAt } = item;
  const stageColor = STAGE_COLORS[stage];
  const nextStages = STAGES.filter(s => s !== stage);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setStageOpen(false); }}
      style={{
        margin: "0 8px 6px",
        background: isDragging ? "var(--bg-raise)" : hovered ? "var(--bg-hover)" : "var(--bg-raise)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${stageColor}`,
        boxShadow: isDragging ? "0 8px 24px rgba(0,0,0,0.18)" : "none",
        transform: isDragging ? "rotate(1.5deg)" : "none",
        transition: isDragging ? "none" : "background 0.1s, box-shadow 0.15s",
        position: "relative",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div style={{ padding: "10px 12px" }}>
        {/* Grip + Name + Remove */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
          <div
            {...dragHandleProps}
            style={{
              flexShrink: 0, marginTop: 2, cursor: "grab",
              color: hovered ? "var(--fg-muted)" : "var(--fg-dim)",
              transition: "color 0.1s",
            }}
          >
            <GripVertical size={11} />
          </div>
          <span style={{ ...S, fontSize: 12, fontWeight: 600, color: "var(--fg)", lineHeight: 1.3, flex: 1 }}>
            {company.name}
          </span>
          <button
            onClick={() => onRemove(company.id)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--fg-dim)", padding: 0, flexShrink: 0,
              opacity: hovered ? 1 : 0, transition: "opacity 0.1s",
            }}
          >
            <X size={11} />
          </button>
        </div>

        {/* Sector + city */}
        <div style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.06em", marginBottom: 6 }}>
          {[company.sector, company.city].filter(Boolean).join(" · ").toUpperCase().slice(0, 30) || "—"}
        </div>

        {/* Score bar */}
        {company.score != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 3, background: "var(--bg-alt)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${company.score}%`, background: company.score >= 75 ? "var(--up)" : "var(--fg-muted)" }} />
            </div>
            <span style={{ ...M, fontSize: 9, color: "var(--fg-muted)" }}>{company.score}</span>
          </div>
        )}

        {/* Signal */}
        {company.signal && (
          <span style={{
            ...M, fontSize: 8, padding: "2px 6px",
            border: "1px solid var(--signal)", color: "var(--signal)",
            letterSpacing: "0.06em", display: "inline-block", marginBottom: 6,
            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {company.signal}
          </span>
        )}

        {/* Footer: date + move */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ ...M, fontSize: 8, color: "var(--fg-dim)" }}>
            {new Date(savedAt).toLocaleDateString("fr")}
          </span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setStageOpen(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "transparent", border: "1px solid var(--border)",
                cursor: "pointer", padding: "3px 8px",
                color: "var(--fg-muted)", ...M, fontSize: 8, letterSpacing: "0.06em",
                transition: "border-color 0.1s, color 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
            >
              <ArrowRight size={9} /> Déplacer <ChevronDown size={9} />
            </button>
            {stageOpen && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 4px)", right: 0, zIndex: 20,
                background: "var(--bg-raise)", border: "1px solid var(--border)",
                minWidth: 130, boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}>
                {nextStages.map(s => (
                  <button
                    key={s}
                    onClick={() => { onMove(company.id, s); setStageOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 12px", background: "transparent", border: "none",
                      cursor: "pointer", ...M, fontSize: 9,
                      color: STAGE_COLORS[s], letterSpacing: "0.06em",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ width: 6, height: 6, flexShrink: 0, background: STAGE_COLORS[s], borderRadius: "50%" }} />
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyPipeline() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
    }}>
      <div style={{ width: 120, height: 120 }}>
        <DotLottieReact
          src="https://lottie.host/5d2b20c9-2741-4270-af29-7c669d5878c5/VHODzIsBRa.lottie"
          loop autoplay
        />
      </div>
      <span style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>Pipeline vide</span>
      <span style={{ ...S, fontSize: 13, color: "var(--fg-muted)", textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
        Sauvegardez des entreprises depuis la recherche pour les retrouver ici, classées par étape de deal flow.
      </span>
      <span style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
        CLIQUEZ SUR [SAVE] DANS LE TABLEAU DE RECHERCHE
      </span>
    </div>
  );
}

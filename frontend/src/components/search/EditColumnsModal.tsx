"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { X, GripVertical, Plus, Trash2 } from "lucide-react";
import { COL_DEFS, type ColKey } from "./CompanyRow";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface Props {
  open: boolean;
  visibleCols: ColKey[];
  allCols: ColKey[];
  onApply: (cols: ColKey[]) => void;
  onClose: () => void;
}

export default function EditColumnsModal({
  open, visibleCols, allCols, onApply, onClose,
}: Props) {
  const [localVisible, setLocalVisible] = useState<ColKey[]>(visibleCols);

  useEffect(() => {
    if (open) setLocalVisible(visibleCols);
  }, [open, visibleCols]);

  if (!open) return null;

  const available = allCols.filter((c) => !localVisible.includes(c));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(localVisible);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocalVisible(items);
  };

  const addCol = (key: ColKey) => {
    setLocalVisible((prev) => [...prev, key]);
  };

  const removeCol = (key: ColKey) => {
    if (localVisible.length <= 1) return;
    setLocalVisible((prev) => prev.filter((k) => k !== key));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
        }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 480, maxHeight: "85vh", zIndex: 1000,
        background: "var(--bg-raise)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
              Edit columns
            </h3>
            <p style={{ ...S, fontSize: 11, color: "var(--fg-muted)", margin: "2px 0 0" }}>
              Drag to reorder. Toggle visibility.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26,
              background: "transparent", border: "none",
              cursor: "pointer", color: "var(--fg-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 0, flex: 1, overflow: "hidden",
        }}>
          {/* Available */}
          <div style={{
            padding: "10px 14px", borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              ...M, fontSize: 9, color: "var(--fg-dim)",
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Available ({available.length})
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {available.length === 0 ? (
                <p style={{ ...S, fontSize: 11, color: "var(--fg-dim)", fontStyle: "italic" }}>
                  All columns are visible.
                </p>
              ) : (
                available.map((key) => (
                  <button
                    key={key}
                    onClick={() => addCol(key)}
                    style={{
                      ...S, fontSize: 12, padding: "6px 10px",
                      background: "var(--bg)", border: "1px solid var(--border)",
                      color: "var(--fg)", textAlign: "left",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "border-color 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--fg-muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <Plus size={11} style={{ color: "var(--fg-muted)" }} />
                    <span style={{ flex: 1 }}>{COL_DEFS[key].label}</span>
                    <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>{COL_DEFS[key].width}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Visible (drag&drop) */}
          <div style={{
            padding: "10px 14px",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              ...M, fontSize: 9, color: "var(--fg-dim)",
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Visible — drag to reorder ({localVisible.length})
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="cols">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {localVisible.map((key, idx) => (
                      <Draggable key={key} draggableId={key} index={idx}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            style={{
                              ...prov.draggableProps.style,
                              ...S, fontSize: 12,
                              padding: "6px 10px 6px 6px",
                              background: snap.isDragging ? "var(--bg-hover)" : "var(--bg)",
                              border: `1px solid ${snap.isDragging ? "var(--fg-muted)" : "var(--border)"}`,
                              color: "var(--fg)",
                              display: "flex", alignItems: "center", gap: 6,
                              boxShadow: snap.isDragging ? "0 4px 12px rgba(0,0,0,0.12)" : undefined,
                            }}
                          >
                            <span
                              {...prov.dragHandleProps}
                              style={{
                                cursor: "grab", color: "var(--fg-dim)",
                                display: "flex", alignItems: "center", padding: "2px 0",
                              }}
                            >
                              <GripVertical size={12} />
                            </span>
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {COL_DEFS[key].label}
                            </span>
                            <span style={{ ...M, fontSize: 9, color: "var(--fg-dim)" }}>{COL_DEFS[key].width}</span>
                            <button
                              onClick={() => removeCol(key)}
                              disabled={localVisible.length <= 1}
                              style={{
                                background: "transparent", border: "none",
                                cursor: localVisible.length <= 1 ? "not-allowed" : "pointer",
                                color: "var(--fg-dim)", padding: 2,
                                display: "flex", alignItems: "center",
                                opacity: localVisible.length <= 1 ? 0.3 : 1,
                              }}
                              onMouseEnter={(e) => { if (localVisible.length > 1) e.currentTarget.style.color = "var(--down)"; }}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ ...S, fontSize: 11, color: "var(--fg-muted)" }}>
            {localVisible.length} column{localVisible.length !== 1 && "s"} visible
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                ...S, fontSize: 12, padding: "6px 14px",
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--fg-muted)", cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onApply(localVisible); onClose(); }}
              style={{
                ...S, fontSize: 12, fontWeight: 500, padding: "6px 14px",
                background: "var(--fg)", color: "var(--bg)",
                border: "none", cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

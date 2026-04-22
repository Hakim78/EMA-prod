"use client";

import { X } from "lucide-react";
import type { SearchFilter } from "@/types/search";

interface Props {
  filter: SearchFilter;
  onRemove: () => void;
  onToggleMode?: (id: string, mode: "include" | "must" | "exclude") => void;
}

export default function FilterPill({ filter, onRemove, onToggleMode }: Props) {
  const mode = filter.mode ?? "include";

  const handleClick = (e: React.MouseEvent) => {
    // Évite de déclencher le clic si on clique sur la croix
    if ((e.target as HTMLElement).closest('button')) return;
    if (!onToggleMode) return;
    if (mode === "exclude") { onToggleMode(filter.id, "include"); return; }
    onToggleMode(filter.id, mode === "include" ? "must" : "include");
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onToggleMode) return;
    onToggleMode(filter.id, mode === "exclude" ? "include" : "exclude");
  };

  // Dictionnaire de styles Tailwind selon le mode (Quiet Luxury)
  const modeStyles = {
    include: "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm",
    must:    "bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm",
    exclude: "bg-red-50/80 border-red-200 text-red-700 shadow-sm",
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={
        mode === "include" ? "Clic: Must-have · Clic droit: Exclure" : 
        mode === "must" ? "Must-have — Clic: Normal · Clic droit: Exclure" : 
        "Exclure — Clic: Normal"
      }
      className={`group flex items-center gap-1.5 px-2.5 py-1 border rounded-md cursor-pointer transition-all duration-200 select-none ${modeStyles[mode]}`}
    >
      {/* Icône optionnelle */}
      {filter.icon && <span className="text-[12px] opacity-70">{filter.icon}</span>}
      
      {/* Indicateur visuel du mode (plus propre que l'étoile texte) */}
      {mode === "must" && <span className="text-[12px] font-black leading-none">+</span>}
      {mode === "exclude" && <span className="text-[10px] font-black leading-none">−</span>}

      {/* Type du filtre (ex: SECTEUR) */}
      <span className="text-[9px] font-mono font-medium tracking-widest uppercase opacity-50">
        {filter.type}
      </span>

      {/* Valeur du filtre (ex: Agroalimentaire) */}
      <span className={`text-[11px] tracking-wide ${mode === "exclude" ? "line-through opacity-80" : ""} ${mode === "must" ? "font-semibold" : "font-medium"}`}>
        {filter.label}
      </span>

      {/* Bouton de suppression */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 flex items-center justify-center p-0.5 rounded-sm opacity-40 hover:opacity-100 hover:bg-black/5 transition-all"
        aria-label="Remove filter"
      >
        <X size={12} strokeWidth={2} />
      </button>
    </div>
  );
}
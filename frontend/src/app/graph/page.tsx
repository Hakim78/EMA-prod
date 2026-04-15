"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Search, Filter, Download, Info, Zap, ArrowUpRight, X, AlertTriangle, Building2 } from "lucide-react";
import dynamic from 'next/dynamic';
import Link from "next/link";

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphNode {
  id: string;
  name: string;
  type: string;
  role: string;
  color: string;
  company?: string;
  score?: number;
  signals_count?: number;
  signals?: string[];
  is_holding?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  value: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

type FilterType = 'all' | 'internal' | 'target' | 'advisor' | 'subsidiary';

const FILTER_OPTIONS: { key: FilterType; label: string; color: string }[] = [
  { key: 'all', label: 'Tout', color: '#ffffff' },
  { key: 'internal', label: 'Équipe EDR', color: '#6366f1' },
  { key: 'target', label: 'Cibles', color: '#10b981' },
  { key: 'advisor', label: 'Conseillers', color: '#f59e0b' },
  { key: 'subsidiary', label: 'Filiales', color: '#8b5cf6' },
];

const SEVERITY_COLOR: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6366f1',
};

export default function RelationshipGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/graph")
      .then(res => res.json())
      .then(data => {
        setGraphData(data.data);
        if (data.data.nodes.length > 2) {
          setSelectedNode(data.data.nodes[2]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch graph:", err);
        setLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    let nodes = graphData.nodes;

    // Apply type filter
    if (activeFilter !== 'all') {
      // When filtering to subsidiaries, also keep parent targets for context
      if (activeFilter === 'subsidiary') {
        const subNodes = nodes.filter(n => n.type === 'subsidiary');
        const parentIds = new Set(subNodes.map(n => n.company).filter(Boolean));
        nodes = nodes.filter(n => n.type === 'subsidiary' || (n.type === 'target' && parentIds.has(n.company)));
      } else {
        nodes = nodes.filter(n => n.type === activeFilter);
      }
    }

    // Apply search
    if (search) {
      nodes = nodes.filter(n =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.company || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l =>
      nodeIds.has(l.source as string) && nodeIds.has(l.target as string)
    );
    return { nodes, links };
  }, [search, activeFilter, graphData]);

  const typeLabel = (type: string) => {
    if (type === 'internal') return 'Équipe EDR';
    if (type === 'target') return 'Cible';
    if (type === 'advisor') return 'Conseil';
    if (type === 'subsidiary') return 'Filiale';
    return type;
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] pb-4 overflow-hidden">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 pt-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Network size={22} className="text-indigo-400" />
            </div>
            Intelligence Réseau
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Cartographie relationnelle propriétaire identifiant les chemins d'approche.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group w-full sm:w-64 lg:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
               <Search size={18} />
            </span>
            <input
               type="text"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Rechercher un noeud..."
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
          {/* Filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setActiveFilter(opt.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                  activeFilter === opt.key
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
                style={activeFilter === opt.key ? { borderColor: opt.color + '60', color: opt.color } : {}}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: opt.color, opacity: activeFilter === opt.key ? 1 : 0.4 }}
                />
                <span className="hidden sm:inline">{opt.label}</span>
                <Filter size={12} className="sm:hidden inline" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-h-0">

        <div className="lg:col-span-3 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] bg-[#050505] border border-white/10 relative overflow-hidden flex flex-col group shadow-[0_4px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Legend */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-col gap-2 sm:gap-3">
            {[
              { color: '#6366f1', label: 'Équipe EDR', pulse: true },
              { color: '#10b981', label: 'Cible', pulse: false },
              { color: '#f59e0b', label: 'Conseil', pulse: false },
              { color: '#8b5cf6', label: 'Filiale', pulse: false },
            ].map(({ color, label, pulse }) => (
              <div key={label} className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-2 sm:gap-3">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
            {/* Signal badge legend */}
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" />
              Signal actif
            </div>
          </div>

          {/* Zoom to fit button */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 flex flex-col gap-2">
             <button onClick={() => fgRef.current?.zoomToFit(400)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Download size={18} />
             </button>
          </div>

          <div className="flex-1 w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chargement du graphe réseau...</span>
                </div>
              </div>
            ) : (
              <ForceGraph2D
                ref={fgRef}
                graphData={filteredData}
                backgroundColor="#050505"
                nodeLabel="name"
                nodeColor={(node: any) => node.color}
                nodeRelSize={7}
                linkColor={(link: any) => link.label === 'Filiale' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}
                linkWidth={(link: any) => link.value}
                linkLineDash={(link: any) => link.label === 'Filiale' ? [2, 3] : null}
                onNodeClick={(node: any) => setSelectedNode(node)}
                nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
                  const { x, y } = node;
                  const isSubsidiary = node.type === 'subsidiary';
                  const r = isSubsidiary ? 4 : 6;
                  const fontSize = 12 / globalScale;

                  // Node circle
                  ctx.beginPath();
                  ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                  ctx.fillStyle = node.color;
                  ctx.fill();

                  // Holding ring — double border for holding companies
                  if (node.is_holding) {
                    ctx.beginPath();
                    ctx.arc(x, y, r + 3 / globalScale, 0, 2 * Math.PI, false);
                    ctx.strokeStyle = node.color + '60';
                    ctx.lineWidth = 1.5 / globalScale;
                    ctx.stroke();
                  }

                  // Selected ring
                  if (selectedNode?.id === node.id) {
                    ctx.beginPath();
                    ctx.arc(x, y, r + 3, 0, 2 * Math.PI, false);
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 2 / globalScale;
                    ctx.stroke();
                  }

                  // Signal badge — red dot top-right
                  if (node.signals_count > 0) {
                    const badgeR = 3.5 / globalScale;
                    const bx = x + r * 0.8;
                    const by = y - r * 0.8;
                    ctx.beginPath();
                    ctx.arc(bx, by, badgeR, 0, 2 * Math.PI, false);
                    ctx.fillStyle = '#ef4444';
                    ctx.fill();
                    // Badge count text
                    if (globalScale > 1.2 && node.signals_count > 1) {
                      ctx.fillStyle = '#fff';
                      ctx.font = `bold ${Math.max(6, 9 / globalScale)}px sans-serif`;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText(String(node.signals_count), bx, by);
                    }
                  }

                  // Label
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = isSubsidiary ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.8)';
                  ctx.font = `${isSubsidiary ? '' : 'bold '}${fontSize}px sans-serif`;
                  ctx.fillText(node.name, x, y + r + 8 / globalScale);
                }}
              />
            )}
          </div>

          <div className="absolute bottom-6 left-6 z-10">
             <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-[10px] tracking-widest uppercase font-black text-indigo-400 flex items-center gap-2">
                <Info size={14} /> Données réseau EdRCF 6.0
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode?.id}
              initial={{ opacity: 0, x: 20, y: 100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed lg:relative bottom-4 sm:bottom-10 left-3 right-3 lg:bottom-0 lg:left-0 lg:right-0 lg:col-span-1 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] bg-black/80 lg:bg-black/40 border border-white/10 backdrop-blur-3xl p-5 sm:p-6 lg:p-8 flex flex-col max-h-[50dvh] lg:max-h-full overflow-y-auto shadow-2xl space-y-4 sm:space-y-6 lg:space-y-8 z-[60]"
            >
              <div className="flex items-center justify-between lg:hidden mb-2">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Fiche Contact</span>
                <button onClick={() => setSelectedNode(null)} className="p-2 rounded-lg bg-white/5 text-gray-500"><X size={16} /></button>
              </div>

              <div className="space-y-4">
                <div
                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  style={{ backgroundColor: selectedNode.color + '20', border: `1px solid ${selectedNode.color}40` }}
                >
                  {selectedNode.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black text-white leading-tight tracking-tighter">{selectedNode.name}</h2>
                    {selectedNode.is_holding && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                        <Building2 size={10} /> Groupe
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{selectedNode.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Type</div>
                    <div className="text-sm font-black text-white capitalize">{typeLabel(selectedNode.type)}</div>
                 </div>
                 <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Score</div>
                    <div className="text-sm font-black text-white">{selectedNode.score ? `${selectedNode.score}/100` : 'N/A'}</div>
                 </div>
              </div>

              {selectedNode.company && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Entreprise</h3>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-sm font-bold text-gray-300">{selectedNode.company}</div>
                  </div>
                </div>
              )}

              {/* Signals section */}
              {(selectedNode.signals_count ?? 0) > 0 && selectedNode.signals && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-400" />
                    Signaux actifs ({selectedNode.signals_count})
                  </h3>
                  <div className="space-y-2">
                    {selectedNode.signals.map((sig, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span className="text-xs text-gray-300 font-medium leading-snug">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Intelligence Chemin</h3>
                 <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
                    <Zap size={18} className="text-indigo-400 shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Connexion identifiée via le <span className="text-white font-bold">réseau EdRCF 6.0</span>. Analyse de proximité basée sur les données Pappers et le mapping relationnel.
                    </p>
                 </div>
              </div>

              {selectedNode.type === 'target' && (
                <div className="pt-6 mt-auto">
                  <Link href={`/targets/${selectedNode.id}`} className="w-full py-4 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3">
                     Ouvrir la Fiche <ArrowUpRight size={18} />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Search, Filter, ZoomIn, ZoomOut, Download, Users, Briefcase, ChevronRight, MapPin, CheckCircle, ExternalLink, Info, Target as TargetIcon, Zap, ArrowUpRight } from "lucide-react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import Link from "next/link";

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// --- Mock Data ---
const graphData = {
  nodes: [
    { id: 'JD', name: 'John Doe', type: 'internal', role: 'Partner', color: '#6366f1' },
    { id: 'AS', name: 'Alice Smith', type: 'internal', role: 'Associate', color: '#6366f1' },
    { id: 'MB', name: 'Marc Berenson', type: 'target', role: 'CEO, Aetherial SA', color: '#10b981' },
    { id: 'TW', name: 'Thomas Wright', type: 'target', role: 'Founder, TechFlow', color: '#10b981' },
    { id: 'SJ', name: 'Sarah Jenkins', type: 'advisor', role: 'MD, Lazard', color: '#f59e0b' },
    { id: 'RJ', name: 'Robert Jones', type: 'advisor', role: 'Partner, PwC', color: '#f59e0b' },
    { id: 'AL', name: 'Alice Laurent', type: 'target', role: 'CFO, NexSphere', color: '#10b981' },
  ],
  links: [
    { source: 'JD', target: 'MB', label: 'Board Overlap', value: 3 },
    { source: 'JD', target: 'SJ', label: 'Former Colleague', value: 2 },
    { source: 'SJ', target: 'MB', label: 'Lead Advisor', value: 5 },
    { source: 'AS', target: 'TW', label: 'Alumni Network', value: 1 },
    { source: 'AS', target: 'AL', label: 'Relationship Path', value: 2 },
    { source: 'MB', target: 'AL', label: 'Industry Peer', value: 1 },
    { source: 'RJ', target: 'TW', label: 'Tax Advisory', value: 4 },
  ]
};

export default function RelationshipGraph() {
  const [selectedNode, setSelectedNode] = useState<any>(graphData.nodes[2]); // Default to Marc
  const [search, setSearch] = useState("");
  const fgRef = useRef<any>(null);
  const router = useRouter();

  // Filter nodes based on search
  const filteredData = useMemo(() => {
    if (!search) return graphData;
    const nodes = graphData.nodes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = graphData.links.filter(l => nodeIds.has(l.source as string) || nodeIds.has(l.target as string));
    return { nodes, links };
  }, [search]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto pb-4 px-4 overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pt-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Network size={32} className="text-indigo-400" />
            </div>
            Network Intelligence
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Proprietary relationship mapping identifying warm entry paths to C-level targets.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
               <Search size={18} />
            </span>
            <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search entities or path nodes..." 
               className="w-80 bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
            />
          </div>
          <button className="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={18} /> Relationship Depth
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        
        {/* Graph Area */}
        <div className="lg:col-span-3 rounded-[2.5rem] bg-[#050505] border border-white/10 relative overflow-hidden flex flex-col group shadow-[0_4px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {/* Legend */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
             <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" /> Internal Team
             </div>
             <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Target C-Level
             </div>
             <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Advisors
             </div>
          </div>

          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
             <button onClick={() => fgRef.current?.zoomToFit(400)} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Download size={18} />
             </button>
          </div>

          {/* Real Graph Component */}
          <div className="flex-1 w-full h-full">
            <ForceGraph2D
              ref={fgRef}
              graphData={filteredData}
              backgroundColor="#050505"
              nodeLabel="name"
              nodeColor={node => (node as any).color}
              nodeRelSize={7}
              linkColor={() => "rgba(255,255,255,0.08)"}
              linkWidth={link => (link as any).value}
              onNodeClick={(node) => setSelectedNode(node)}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5);

                // Draw circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                ctx.fill();
                
                // Active ring
                if (selectedNode?.id === node.id) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI, false);
                  ctx.strokeStyle = node.color;
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                }

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillText(label, node.x, node.y + 12);
              }}
            />
          </div>

          <div className="absolute bottom-6 left-6 z-10">
             <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-[10px] tracking-widest uppercase font-black text-indigo-400 flex items-center gap-2">
                <Info size={14} /> Intelligence Overlay Active: 14M Overlaps
             </div>
          </div>
        </div>

        {/* Node Detail Sidebar */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedNode?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl p-8 flex flex-col overflow-y-auto shadow-2xl space-y-8"
          >
            {selectedNode ? (
              <>
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    {selectedNode.name.split(' ').map((n: any) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight tracking-tighter">{selectedNode.name}</h2>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{selectedNode.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Strength</div>
                      <div className="text-sm font-black text-white">84% Path</div>
                   </div>
                   <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Context</div>
                      <div className="text-sm font-black text-white">Market-Direct</div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Contact Metadata</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500"><MapPin size={16} /></div>
                      <span className="text-gray-300 font-bold">Paris, France</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500"><Briefcase size={16} /></div>
                      <span className="text-gray-300 font-bold">Industry Concentration: Industrial Tech</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">AI Path Intelligence</h3>
                   <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3">
                      <Zap size={18} className="text-indigo-400 shrink-0" />
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        Strong proximity via <span className="text-white font-bold">Lazard advisory board</span>. Berenson attended the same Executive Forum as John Doe in 2023.
                      </p>
                   </div>
                </div>

                <div className="pt-6 mt-auto">
                  <Link href={`/targets/${selectedNode.id}/report`} className="w-full py-4 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3">
                     Generate Dossier <ArrowUpRight size={18} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                 <TargetIcon size={48} className="mb-4 text-gray-600" />
                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Select a node to extract relationship intelligence</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}


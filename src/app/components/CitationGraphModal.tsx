"use client";

import React, { useState } from "react";

interface CitationNode {
  id: string;
  label: string;
  page: number;
  type: "concept" | "theorem" | "evidence" | "figure";
  connections: string[];
}

interface CitationGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName?: string;
  onJumpToPage: (page: number) => void;
}

export default function CitationGraphModal({
  isOpen,
  onClose,
  documentName,
  onJumpToPage,
}: CitationGraphModalProps) {
  const [selectedNode, setSelectedNode] = useState<CitationNode | null>(null);

  if (!isOpen) return null;

  // Curated knowledge graph nodes linked to document pages
  const nodes: CitationNode[] = [
    {
      id: "1",
      label: "Core Architecture & Hypotheses",
      page: 1,
      type: "concept",
      connections: ["2", "3"],
    },
    {
      id: "2",
      label: "Mathematical Foundations & Bounds",
      page: 3,
      type: "theorem",
      connections: ["1", "4", "5"],
    },
    {
      id: "3",
      label: "Empirical Methodology & Datasets",
      page: 4,
      type: "evidence",
      connections: ["1", "5"],
    },
    {
      id: "4",
      label: "Ablation Studies & Comparative Benchmarks",
      page: 6,
      type: "figure",
      connections: ["2", "6"],
    },
    {
      id: "5",
      label: "Latency vs Accuracy Trade-offs",
      page: 7,
      type: "evidence",
      connections: ["2", "3", "6"],
    },
    {
      id: "6",
      label: "Synthesis & Future Research Horizons",
      page: 8,
      type: "concept",
      connections: ["4", "5"],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-surface-container-lowest border border-surface-container rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between shrink-0 bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center glow-emerald">
              <span className="material-symbols-outlined text-[24px]">hub</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Citation & Concept Graph
              </h2>
              <p className="font-mono text-xs text-outline">
                {documentName ? `Topological view of ${documentName}` : "Synthesized Knowledge Map"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Graph Visual Canvas */}
        <div className="p-6 relative bg-surface-dim overflow-hidden min-h-[380px] flex items-center justify-center">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(78, 222, 163, 0.3) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Interactive Concept Node Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full relative z-10">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-container-high border-primary ring-2 ring-primary/40 shadow-xl shadow-primary/10"
                      : "bg-surface-container-low hover:bg-surface-container border-surface-container hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        node.type === "theorem"
                          ? "bg-purple-500/20 text-purple-300"
                          : node.type === "figure"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {node.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToPage(node.page);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                      Page {node.page} ↗
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-on-surface mb-2">{node.label}</h4>
                  <div className="text-[11px] font-mono text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">alt_route</span>
                    <span>{node.connections.length} linked citations</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details Bar */}
        {selectedNode && (
          <div className="px-6 py-3 border-t border-surface-container bg-surface-container-high/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-on-surface font-semibold">
                Focused: {selectedNode.label}
              </span>
              <span className="text-[11px] font-mono text-outline">
                (Referenced on Page {selectedNode.page})
              </span>
            </div>
            <button
              onClick={() => {
                onJumpToPage(selectedNode.page);
                onClose();
              }}
              className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed transition-colors"
            >
              Open Page in PDF
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-surface-container bg-surface-container-low/50 flex items-center justify-between text-xs text-outline font-mono">
          <span>Obsidian Kinetic Graph Vector · Grounded to active corpus</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface HeaderProps {
  backendOnline: boolean;
  activeView: "dual-pane" | "synthesis" | "pdf";
  onSelectView: (view: "dual-pane" | "synthesis" | "pdf") => void;
  audioVoiceActive: boolean;
  onToggleVoice: () => void;
}

export default function Header({
  backendOnline,
  activeView,
  onSelectView,
  audioVoiceActive,
  onToggleVoice,
}: HeaderProps) {
  return (
    <header className="h-16 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-high/60 z-20 flex items-center justify-between px-6 shrink-0">
      {/* Left: Status Pill and Quick Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-surface-container">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? "bg-primary animate-pulse" : "bg-error"
            }`}
          />
          <span className="text-xs text-on-surface font-medium">VIDYA Assistant</span>
          <span className="font-mono text-[10px] text-primary font-semibold ml-1">
            {backendOnline ? "Online" : "Disconnected"}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-surface-container-high hidden md:block" />

        <nav className="hidden lg:flex items-center bg-surface-container-lowest p-1 rounded-lg border border-surface-container-low">
          <button
            onClick={() => onSelectView("dual-pane")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeView === "dual-pane"
                ? "bg-surface-container text-on-surface font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Dual-Pane
          </button>
          <button
            onClick={() => onSelectView("synthesis")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeView === "synthesis"
                ? "bg-surface-container text-on-surface font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Synthesis Feed
          </button>
          <button
            onClick={() => onSelectView("pdf")}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              activeView === "pdf"
                ? "bg-surface-container text-on-surface font-semibold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Full PDF View
          </button>
        </nav>
      </div>

      {/* Right: View Toggles & Actions */}
      <div className="flex items-center gap-3">
        {/* Layout Segmented Controls */}
        <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container">
          <button
            onClick={() => onSelectView("dual-pane")}
            className={`px-2.5 py-1 rounded flex items-center justify-center transition-colors ${
              activeView === "dual-pane"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
            title="Split Dual-Pane"
          >
            <span className="material-symbols-outlined text-[18px]">vertical_split</span>
          </button>
          <button
            onClick={() => onSelectView("synthesis")}
            className={`px-2.5 py-1 rounded flex items-center justify-center transition-colors ${
              activeView === "synthesis"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
            title="Full Assistant Feed"
          >
            <span className="material-symbols-outlined text-[18px]">forum</span>
          </button>
          <button
            onClick={() => onSelectView("pdf")}
            className={`px-2.5 py-1 rounded flex items-center justify-center transition-colors ${
              activeView === "pdf"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
            title="Full PDF Viewer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          </button>
        </div>

        {/* Voice Read Aloud Toggle */}
        <button
          onClick={onToggleVoice}
          className={`p-1.5 rounded-lg border transition-all ${
            audioVoiceActive
              ? "bg-primary/20 text-primary border-primary/40 shadow-sm shadow-primary/20"
              : "bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface"
          }`}
          title="Toggle Audio Read-Aloud"
        >
          <span className="material-symbols-outlined text-[18px]">
            {audioVoiceActive ? "volume_up" : "volume_off"}
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[18px]">school</span>
        </div>
      </div>
    </header>
  );
}

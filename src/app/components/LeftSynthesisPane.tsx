"use client";

import React, { useRef, useState, useEffect } from "react";
import { Subject } from "./Sidebar";

export interface Citation {
  id: number;
  label: string;
  page: number;
  title: string;
  subtitle: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "vidya";
  text: string;
  timestamp: string;
  route?: string;
  citations?: Citation[];
  pageNumber?: number | null;
  toolResult?: string | null;
  suggestions?: string[];
}

interface LeftSynthesisPaneProps {
  messages: ChatMessage[];
  isThinking: boolean;
  onSendQuery: (query: string) => void;
  onCitationClick: (page: number) => void;
  latestSuggestions: string[];
  speechSupported: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  uploadedPdfName?: string;
  subjects: Subject[];
  currentSubjectId?: string;
  onAssignSubject: (subjectId: string) => void;
  detectedSubjectBanner?: {
    suggestedName: string;
    existingId?: string;
    isNew: boolean;
  } | null;
  onConfirmDetectedSubject?: (createAsNew: boolean, subjectIdOrName: string) => void;
  onDismissDetectedSubject?: () => void;
  onNewChat: () => void;
}

export default function LeftSynthesisPane({
  messages,
  isThinking,
  onSendQuery,
  onCitationClick,
  latestSuggestions,
  speechSupported,
  isListening,
  onToggleMic,
  uploadedPdfName,
  subjects,
  currentSubjectId,
  onAssignSubject,
  detectedSubjectBanner,
  onConfirmDetectedSubject,
  onDismissDetectedSubject,
  onNewChat,
}: LeftSynthesisPaneProps) {
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages or thinking state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isThinking) return;
    onSendQuery(inputVal.trim());
    setInputVal("");
  };

  const currentSubject = subjects.find((s) => s.id === currentSubjectId);

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest/90 backdrop-blur-md rounded-l-xl p-4 lg:p-6 space-y-3 shadow-2xl relative overflow-hidden border-r border-surface-container-high/40">
      {/* Top Session Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 bg-surface-container-low/60 p-2.5 rounded-lg border border-surface-container">
        {/* Left: Active Session & Subject Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-semibold transition-colors shadow-sm"
            title="Start New Chat Session"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>New Chat</span>
          </button>

          {/* Manual Subject Assignment Dropdown */}
          <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md border border-surface-container-high">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: currentSubject ? currentSubject.color : "#86948a" }}
            />
            <span className="text-[11px] font-mono text-outline mr-1">Subject:</span>
            <select
              value={currentSubjectId || ""}
              onChange={(e) => onAssignSubject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-surface-container-high text-on-surface">
                Unassigned
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface-container-high text-on-surface">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 text-on-surface-variant">
          <button
            className="p-1.5 rounded-lg hover:text-primary hover:bg-surface-container-high transition-colors"
            title="Export Session Notes"
            onClick={() => {
              const fullText = messages
                .map((m) => `${m.sender.toUpperCase()} [${m.timestamp}]:\n${m.text}`)
                .join("\n\n---\n\n");
              const blob = new Blob([fullText], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `vidya_chat_${Date.now()}.txt`;
              a.click();
            }}
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
          </button>
          <div className="w-[1px] h-4 bg-surface-container-high mx-1" />
          <button
            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"
            title="Clear Current Messages"
            onClick={onNewChat}
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Auto-Detected Subject Suggestion Banner (when PDF is uploaded) */}
      {detectedSubjectBanner && onConfirmDetectedSubject && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px]">
              auto_awesome
            </span>
            <div className="text-xs">
              <span className="text-on-surface">
                Detected Subject for this document:{" "}
                <strong className="text-primary font-bold">{detectedSubjectBanner.suggestedName}</strong>
              </span>
              <span className="text-[11px] text-outline block sm:inline sm:ml-2">
                {detectedSubjectBanner.isNew
                  ? "(New Subject — Not in your list yet)"
                  : "(Matches existing subject in your library)"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() =>
                onConfirmDetectedSubject(
                  detectedSubjectBanner.isNew,
                  detectedSubjectBanner.existingId || detectedSubjectBanner.suggestedName
                )
              }
              className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed shadow-sm transition-all"
            >
              {detectedSubjectBanner.isNew ? "+ Create & Add" : "Confirm Link"}
            </button>
            {onDismissDetectedSubject && (
              <button
                onClick={onDismissDetectedSubject}
                className="p-1 rounded text-outline hover:text-on-surface"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thread Title */}
      <div className="px-1 flex items-center justify-between">
        <h1 className="font-headline font-bold text-base text-on-surface tracking-tight flex items-center gap-2 truncate">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {uploadedPdfName ? "description" : "forum"}
          </span>
          <span className="truncate">
            {uploadedPdfName ? uploadedPdfName : "General Research & Study Thread"}
          </span>
        </h1>
        {currentSubject && (
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-white shrink-0 ml-2"
            style={{ backgroundColor: currentSubject.color }}
          >
            {currentSubject.name}
          </span>
        )}
      </div>

      {/* Messages Feed Stream */}
      <div className="flex-1 space-y-4 pr-1 overflow-y-auto max-h-[calc(100vh-17.5rem)]">
        {messages.map((m, mIdx) => {
          const isLatestAssistantMessage =
            m.sender === "vidya" &&
            (mIdx === messages.length - 1 ||
              (mIdx === messages.length - 2 && messages[messages.length - 1].sender === "user"));

          const activeSuggestions = m.suggestions || (isLatestAssistantMessage ? latestSuggestions : []);

          return (
            <div key={m.id} className="space-y-2">
              {m.sender === "user" ? (
                <div className="p-3.5 rounded-xl bg-surface-container-low shadow-sm space-y-1 relative border border-surface-container">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-bright flex items-center justify-center text-primary text-[10px] font-bold font-mono">
                      YOU
                    </div>
                    <span className="text-xs font-semibold text-on-surface">You</span>
                    <span className="font-mono text-[10px] text-outline ml-auto">{m.timestamp}</span>
                  </div>
                  <p className="text-sm text-on-surface pl-8 leading-relaxed font-sans">{m.text}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-container shadow-xl space-y-3 relative border border-outline-variant/30">
                  {/* Assistant Message Header */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-xs font-semibold text-on-surface">VIDYA Reasoning</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        {m.route ? m.route : "Grounded RAG"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-outline">{m.timestamp}</span>
                  </div>

                  {/* Assistant Text Body */}
                  <div className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap font-sans">
                    {m.text}
                  </div>

                  {/* Grounded Citation Button */}
                  {m.pageNumber && (
                    <div className="pt-2 border-t border-surface-container-high/60 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-outline uppercase tracking-wider">
                        Citation:
                      </span>
                      <button
                        onClick={() => onCitationClick(m.pageNumber!)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-on-primary font-mono text-[11px] font-bold transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                        Page {m.pageNumber} ↗
                      </button>
                    </div>
                  )}

                  {/* Follow-up Suggestions attached at the end of the Answer (like ChatGPT) */}
                  {activeSuggestions && activeSuggestions.length > 0 && !isThinking && (
                    <div className="pt-3 border-t border-surface-container-high/50 space-y-1.5">
                      <span className="text-[10px] uppercase font-mono text-outline tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary">
                          tips_and_updates
                        </span>
                        Suggested Explorations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeSuggestions.slice(0, 3).map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => onSendQuery(sug)}
                            className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface-variant transition-all border border-surface-container"
                          >
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container animate-pulse flex items-center gap-3">
            <div className="w-5 h-5 rounded-md bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            </div>
            <span className="text-xs text-primary font-mono">
              VIDYA is synthesizing knowledge chunks & verifying citations...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Multimodal Input Console with Voice Mic Orb */}
      <div className="pt-1">
        <form
          onSubmit={handleSubmit}
          className="p-2.5 rounded-xl bg-surface-container-low shadow-2xl border border-surface-container focus-within:border-primary/50 transition-all"
        >
          {/* Status Tags */}
          <div className="flex items-center justify-between px-2 pb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-primary font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Grounded Deep RAG
              </span>
              {uploadedPdfName && (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-medium truncate max-w-[190px]">
                  <span className="material-symbols-outlined text-[13px] text-primary">
                    picture_as_pdf
                  </span>
                  {uploadedPdfName}
                </span>
              )}
              {isListening && (
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-error/20 text-error font-medium animate-pulse">
                  Listening to voice...
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-outline hidden sm:inline">
              Enter to send
            </span>
          </div>

          {/* Input & Action Buttons */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : "Ask VIDYA anything about your documents or concepts..."
              }
              className="w-full bg-transparent text-on-surface placeholder:text-outline text-sm focus:outline-none py-1.5 px-2"
            />

            <div className="flex items-center gap-2 shrink-0">
              {/* Voice Interaction Mic Orb */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`relative p-2 rounded-full transition-all flex items-center justify-center ${
                    isListening
                      ? "bg-error text-white shadow-lg shadow-error/50 scale-110"
                      : "bg-surface-container-high hover:bg-primary-container text-primary hover:text-on-primary-container"
                  }`}
                  title={isListening ? "Stop Listening" : "Voice Input (Speech to Text)"}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-error/40 animate-ping" />
                  )}
                  <span className="material-symbols-outlined text-[20px] relative z-10">
                    {isListening ? "mic" : "mic_none"}
                  </span>
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputVal.trim() || isThinking}
                className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-semibold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 disabled:opacity-30 disabled:scale-100"
              >
                <span>Run</span>
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

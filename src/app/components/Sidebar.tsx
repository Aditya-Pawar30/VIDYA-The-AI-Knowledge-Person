"use client";

import React, { useState } from "react";

export interface ChatSessionMeta {
  id: string;
  title: string;
  updatedAt: string;
  subjectId?: string;
  documentName?: string;
  messageCount: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  chatSessions: ChatSessionMeta[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  subjects: Subject[];
  onAddSubject: (name: string) => void;
  onRemoveSubject: (id: string) => void;
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  onOpenCorpus: () => void;
  onOpenCitations: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  activeTab,
  onSelectTab,
  chatSessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  subjects,
  onAddSubject,
  onRemoveSubject,
  studentName,
  onUpdateStudentName,
  onOpenCorpus,
  onOpenCitations,
}: SidebarProps) {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(studentName);

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      onAddSubject(newSubjectName.trim());
      setNewSubjectName("");
      setShowAddSubject(false);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateStudentName(tempName.trim());
    }
    setIsEditingName(false);
  };

  if (collapsed) {
    return (
      <aside className="w-16 h-full bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col items-center py-4 justify-between shrink-0 z-30 transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all glow-emerald"
            title="Expand Sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">neurology</span>
          </button>
          <div className="w-8 h-[1px] bg-surface-container-high" />
          <button
            onClick={onNewChat}
            className="p-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            title="New Chat"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={() => onSelectTab("dual-pane")}
            className={`p-2.5 rounded-lg transition-colors ${
              activeTab === "dual-pane"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
            title="Chat"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </button>
          <button
            onClick={onOpenCorpus}
            className="p-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Corpus & PDFs"
          >
            <span className="material-symbols-outlined text-[20px]">folder_data</span>
          </button>
          <button
            onClick={onOpenCitations}
            className="p-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Citation Graph"
          >
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </button>
          <button
            onClick={() => onSelectTab("subjects")}
            className={`p-2.5 rounded-lg transition-colors ${
              activeTab === "subjects"
                ? "bg-surface-container text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
            title="Subjects"
          >
            <span className="material-symbols-outlined text-[20px]">school</span>
          </button>
        </div>

        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          title="Expand"
        >
          <span className="material-symbols-outlined text-[18px]">dock_to_right</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-full bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between shrink-0 z-30 transition-all duration-300 shadow-xl">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header — Icon only, no text */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-surface-container-low shrink-0">
          <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shadow-inner glow-emerald">
            <span className="material-symbols-outlined text-primary text-[22px]">
              neurology
            </span>
          </div>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            title="Collapse Sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
          </button>
        </div>

        {/* Consoles Section */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <div className="text-[10px] uppercase font-mono text-outline px-2 mb-2 tracking-wider">
            Consoles
          </div>
          <nav className="space-y-1">
            {/* Chat */}
            <button
              onClick={() => onSelectTab("dual-pane")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                activeTab === "dual-pane"
                  ? "bg-surface-container text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Chat</span>
            </button>

            {/* Corpus & PDFs */}
            <button
              onClick={onOpenCorpus}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">
                  folder_data
                </span>
                <span>Corpus & PDFs</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors">
                open_in_new
              </span>
            </button>

            {/* Citation Graph */}
            <button
              onClick={onOpenCitations}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">
                  hub
                </span>
                <span>Citation Graph</span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary transition-colors">
                open_in_new
              </span>
            </button>

            {/* Subjects */}
            <button
              onClick={() => onSelectTab(activeTab === "subjects" ? "dual-pane" : "subjects")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                activeTab === "subjects"
                  ? "bg-surface-container text-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">school</span>
                <span>Subjects</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-outline">
                {subjects.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Subjects Drawer / List (when subjects tab is active) */}
        {activeTab === "subjects" && (
          <div className="px-4 py-2 border-t border-b border-surface-container-low shrink-0 bg-surface-container-lowest/50 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] uppercase font-mono text-outline tracking-wider">
                My Subjects
              </span>
              <button
                onClick={() => setShowAddSubject(!showAddSubject)}
                className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>New</span>
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {subjects.length === 0 ? (
                <p className="text-[11px] text-outline px-2 py-1 italic">
                  No subjects added yet.
                </p>
              ) : (
                subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container group transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="text-xs text-on-surface truncate font-medium">
                        {sub.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveSubject(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-error/20 text-outline hover:text-error transition-all"
                      title="Remove subject"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Subject Input */}
            {showAddSubject && (
              <div className="mt-2 flex items-center gap-1">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                  placeholder="Subject (e.g. Operating Systems)..."
                  className="flex-1 bg-surface-container-high border border-surface-container rounded-lg px-2 py-1 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={handleAddSubject}
                  className="p-1 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddSubject(false);
                    setNewSubjectName("");
                  }}
                  className="p-1 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ChatGPT-style Chat History Sessions */}
        <div className="px-4 pt-3 pb-1 flex-1 min-h-0 overflow-hidden flex flex-col">
          <div className="text-[10px] uppercase font-mono text-outline px-2 mb-2 tracking-wider flex items-center justify-between">
            <span>Conversations</span>
            <button
              onClick={onNewChat}
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-sans capitalize"
              title="Start a new thread"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>New</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {chatSessions.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <span className="material-symbols-outlined text-outline text-[22px] mb-1 block">
                  forum
                </span>
                <p className="text-[11px] text-outline font-mono">No chat threads</p>
                <p className="text-[10px] text-outline/60 mt-0.5">Start typing or upload a PDF</p>
              </div>
            ) : (
              chatSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const sessionSubject = subjects.find((s) => s.id === session.subjectId);

                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-surface-container text-primary font-semibold ring-1 ring-primary/40 shadow-sm"
                        : "hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`material-symbols-outlined text-[16px] shrink-0 ${
                          isActive ? "text-primary" : "text-outline group-hover:text-primary"
                        }`}
                      >
                        chat_bubble_outline
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs truncate font-medium">
                          {session.title || "Untitled Chat"}
                        </div>
                        <div className="font-mono text-[9px] text-outline truncate flex items-center gap-1.5">
                          <span>{session.updatedAt}</span>
                          {sessionSubject && (
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: sessionSubject.color }}
                              title={sessionSubject.name}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete chat session */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/20 text-outline hover:text-error transition-all"
                      title="Delete thread"
                    >
                      <span className="material-symbols-outlined text-[13px]">delete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Footer Profile — Logged in Student Name */}
      <div className="p-3 bg-surface-container-lowest border-t border-surface-container-low shrink-0">
        {isEditingName ? (
          <div className="p-2 rounded-lg bg-surface-container-low space-y-2 border border-primary/40">
            <span className="text-[10px] font-mono text-primary uppercase font-bold">
              Student Profile Name
            </span>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              placeholder="Your full name..."
              className="w-full bg-surface-container-high border border-surface-container rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => setIsEditingName(false)}
                className="px-2 py-0.5 rounded text-[11px] text-outline hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveName}
                className="px-2.5 py-0.5 rounded bg-primary text-on-primary text-[11px] font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              setTempName(studentName);
              setIsEditingName(true);
            }}
            className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-transparent hover:border-surface-container"
            title="Click to edit student profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                  {studentName || "Student"}
                </div>
                <div className="font-mono text-[10px] text-outline truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Student Active</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary text-[16px] transition-colors">
              edit
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

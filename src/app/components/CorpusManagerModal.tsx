"use client";

import React, { useRef, useState } from "react";
import { CorpusDocument, detectUnitFromFilename, sortCorpusDocuments } from "../utils/corpusUtils";
import { Subject } from "./Sidebar";

interface CorpusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpus: CorpusDocument[];
  subjects: Subject[];
  activeDocumentId?: string;
  onSelectDocument: (doc: CorpusDocument) => void;
  onUploadDocument: (file: File, subjectId?: string) => void;
  onRemoveDocument: (docId: string) => void;
  onAssignSubject: (docId: string, subjectId: string) => void;
}

export default function CorpusManagerModal({
  isOpen,
  onClose,
  corpus,
  subjects,
  activeDocumentId,
  onSelectDocument,
  onUploadDocument,
  onRemoveDocument,
  onAssignSubject,
}: CorpusManagerModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // Filter corpus
  const filtered = corpus.filter((doc) => {
    if (selectedSubjectFilter === "all") return true;
    if (selectedSubjectFilter === "unassigned") return !doc.subjectId;
    return doc.subjectId === selectedSubjectFilter;
  });

  // Sorted sequentially by unit
  const sorted = sortCorpusDocuments(filtered);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.toLowerCase().endsWith(".pdf")) {
          onUploadDocument(
            file,
            selectedSubjectFilter !== "all" && selectedSubjectFilter !== "unassigned"
              ? selectedSubjectFilter
              : undefined
          );
        }
      }
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.toLowerCase().endsWith(".pdf")) {
          onUploadDocument(
            file,
            selectedSubjectFilter !== "all" && selectedSubjectFilter !== "unassigned"
              ? selectedSubjectFilter
              : undefined
          );
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-surface-container-lowest border border-surface-container rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between shrink-0 bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">folder_data</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Corpus & PDF Knowledge Base
              </h2>
              <p className="font-mono text-xs text-outline">
                Automated Unit Analysis, Sequential Sorting & Subject Organization
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

        {/* Action Bar: Subject Filters & Upload */}
        <div className="px-6 py-3 border-b border-surface-container/60 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-outline uppercase tracking-wider mr-1">
              Subject:
            </span>
            <button
              onClick={() => setSelectedSubjectFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSubjectFilter === "all"
                  ? "bg-primary text-on-primary font-semibold shadow-sm"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              All Documents ({corpus.length})
            </button>
            {subjects.map((sub) => {
              const count = corpus.filter((c) => c.subjectId === sub.id).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectFilter(sub.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedSubjectFilter === sub.id
                      ? "bg-surface-bright text-on-surface ring-1 ring-primary font-semibold"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span>{sub.name}</span>
                  <span className="text-[10px] font-mono text-outline">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload PDF(s)</span>
            </button>
          </div>
        </div>

        {/* Content Body: Unit Sorted Queue */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Drag & Drop Prompt Overlay when dragging */}
          {isDragging && (
            <div className="p-8 border-2 border-dashed border-primary rounded-xl bg-primary/10 text-center animate-pulse">
              <span className="material-symbols-outlined text-primary text-[40px] mb-2">
                cloud_upload
              </span>
              <p className="text-sm font-semibold text-primary">
                Drop your PDFs here to automatically analyze and sort by Unit
              </p>
            </div>
          )}

          {sorted.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-3 text-outline">
                <span className="material-symbols-outlined text-[36px]">auto_stories</span>
              </div>
              <h3 className="font-headline text-base font-semibold text-on-surface mb-1">
                No PDFs in this subject yet
              </h3>
              <p className="text-xs text-outline max-w-sm mb-4">
                Upload your lecture notes or syllabus (e.g., &quot;Unit 1 - Intro.pdf&quot;, &quot;Unit 2 - Systems.pdf&quot;). VIDYA will automatically detect the unit keyword and queue them in order.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-lg hover:bg-primary-fixed transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Browse & Upload PDF</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-outline px-1">
                <span>SEQUENTIAL STUDY QUEUE ({sorted.length} PDFs)</span>
                <span>Click &quot;Load into Cockpit&quot; to study with AI</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {sorted.map((doc, idx) => {
                  const isActive = doc.id === activeDocumentId;
                  const docSubject = subjects.find((s) => s.id === doc.subjectId);

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isActive
                          ? "bg-surface-container-high/90 border-primary shadow-lg shadow-primary/5"
                          : "bg-surface-container-low hover:bg-surface-container border-surface-container"
                      }`}
                    >
                      {/* Left: Unit Badge & Document Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Unit Index Pill */}
                        <div
                          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                            isActive
                              ? "bg-primary text-on-primary border-primary-fixed"
                              : "bg-surface-container-highest text-primary border-surface-container"
                          }`}
                        >
                          <span className="font-mono text-[9px] uppercase tracking-tighter leading-none">
                            {doc.unitNumber < 900 ? "UNIT" : "DOC"}
                          </span>
                          <span className="font-headline font-bold text-sm leading-none mt-0.5">
                            {doc.unitNumber < 900 ? doc.unitNumber : idx + 1}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-on-surface truncate max-w-md">
                              {doc.name}
                            </span>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold">
                                Active Document
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-outline mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined text-[13px]">
                                label_important
                              </span>
                              {doc.unitLabel}
                            </span>
                            {doc.totalPages && <span>{doc.totalPages} pages</span>}
                            <span>Added {doc.uploadedAt}</span>
                            {docSubject && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold text-white"
                                style={{ backgroundColor: docSubject.color }}
                              >
                                {docSubject.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Subject Assign Dropdown */}
                        <select
                          value={doc.subjectId || ""}
                          onChange={(e) => onAssignSubject(doc.id, e.target.value)}
                          className="bg-surface-container-highest text-on-surface-variant hover:text-on-surface text-xs rounded-lg px-2.5 py-1.5 border border-surface-container focus:outline-none focus:border-primary"
                        >
                          <option value="">No Subject</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        {/* Load Button */}
                        <button
                          onClick={() => {
                            onSelectDocument(doc);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isActive
                              ? "bg-primary/20 text-primary border border-primary/40 cursor-default"
                              : "bg-primary hover:bg-primary-fixed text-on-primary shadow-sm"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isActive ? "check_circle" : "play_arrow"}
                          </span>
                          <span>{isActive ? "Loaded" : "Load Document"}</span>
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveDocument(doc.id)}
                          className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete from Corpus"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-surface-container bg-surface-container-low/50 flex items-center justify-between text-xs text-outline font-mono">
          <span>VIDYA Auto-Categorizer: keywords &quot;unit 1&quot;, &quot;module 2&quot;, &quot;chapter 3&quot;</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

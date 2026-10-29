"use client";

import React, { useRef, useState, useCallback } from "react";

interface RightDocumentPaneProps {
  pdfLoaded: boolean;
  pdfName: string;
  currentPage: number;
  totalPages: number;
  pageImageB64: string | null;
  zoomLevel: number;
  onPageChange: (newPage: number) => void;
  onZoomChange: (delta: number) => void;
  onUploadFile: (file: File) => void;
  isUploading: boolean;
  uploadProgress: string;
}

export default function RightDocumentPane({
  pdfLoaded,
  pdfName,
  currentPage,
  totalPages,
  pageImageB64,
  zoomLevel,
  onPageChange,
  onZoomChange,
  onUploadFile,
  isUploading,
  uploadProgress,
}: RightDocumentPaneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUploadFile(file);
        // Reset the input so the same file can be re-selected
        e.target.value = "";
      }
    },
    [onUploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onUploadFile(file);
      }
    },
    [onUploadFile]
  );

  const triggerBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const triggerBottomBrowse = useCallback(() => {
    bottomFileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`flex-1 flex flex-col bg-surface-container-lowest rounded-r-xl p-4 lg:p-6 space-y-4 shadow-2xl relative transition-all ${
        isDragging ? "ring-2 ring-primary/60 bg-primary/5" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs — one for each browse trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={bottomFileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 animate-bounce">
            <span className="material-symbols-outlined text-primary text-[36px]">
              cloud_upload
            </span>
          </div>
          <p className="text-sm font-semibold text-primary">Drop your PDF here</p>
          <p className="text-xs text-on-surface-variant mt-1">Release to upload and ingest</p>
        </div>
      )}

      {/* PDF Viewer Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 bg-surface-container-low/60 p-2.5 rounded-lg border border-surface-container">
        {/* Document Selector Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded bg-error/15 text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-semibold text-on-surface truncate max-w-[200px]">
              {pdfName || "No Document Ingested"}
            </span>
            {pdfLoaded && (
              <span className="font-mono text-[10px] text-outline shrink-0">
                ({totalPages} pages)
              </span>
            )}
          </div>
        </div>

        {/* Page Navigation & Zoom Dock */}
        {pdfLoaded && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Page Navigator */}
            <div className="flex items-center bg-surface-container-highest rounded-md px-1 py-0.5 border border-surface-container">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:text-primary text-on-surface-variant transition-colors disabled:opacity-30"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <div className="px-2 font-mono text-xs text-on-surface font-semibold flex items-center gap-1">
                <span>{currentPage}</span>
                <span className="text-outline">/</span>
                <span className="text-outline">{totalPages}</span>
              </div>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-primary text-on-surface-variant transition-colors disabled:opacity-30"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-surface-container rounded-md px-1.5 py-0.5 border border-surface-container-high">
              <button
                onClick={() => onZoomChange(-15)}
                className="p-1 hover:text-primary text-on-surface-variant transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="font-mono text-xs text-on-surface px-1.5 font-medium">
                {zoomLevel}%
              </span>
              <button
                onClick={() => onZoomChange(15)}
                className="p-1 hover:text-primary text-on-surface-variant transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Display */}
      <div className="flex-1 rounded-xl bg-surface-dim p-4 overflow-y-auto max-h-[calc(100vh-21rem)] flex justify-center items-center relative shadow-inner border border-surface-container">
        {!pdfLoaded ? (
          <div
            onClick={triggerBrowse}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all text-center max-w-sm group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-[32px]">
                cloud_upload
              </span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">
              Drop your PDF study document here
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Lecture notes, unit slides, research papers, or syllabus
            </p>
            <span className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary-fixed transition-colors">
              Browse Files
            </span>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-primary font-mono">{uploadProgress}</p>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden border border-surface-container"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            {pageImageB64 ? (
              <img
                src={`data:image/png;base64,${pageImageB64}`}
                alt={`Page ${currentPage}`}
                className="max-w-full h-auto object-contain rounded"
              />
            ) : (
              <div className="p-8 text-xs text-outline font-mono">Loading page render...</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Upload Dropzone Bar */}
      <div className="p-2.5 rounded-xl bg-surface-container-low shadow-lg border border-surface-container">
        <div
          onClick={triggerBottomBrowse}
          className="p-2.5 rounded-lg bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-2 cursor-pointer hover:bg-surface-container-high transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest group-hover:bg-primary group-hover:text-on-primary text-primary transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                {pdfLoaded ? "Upload another PDF document" : "Drop research papers to ground synthesis"}
              </div>
              <div className="font-mono text-[10px] text-outline">
                Supports PDF up to 100MB · Ingests into ChromaDB
              </div>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface transition-colors shrink-0"
          >
            Browse
          </button>
        </div>
      </div>
    </div>
  );
}

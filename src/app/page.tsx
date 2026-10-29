"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import Sidebar, { ChatSessionMeta, Subject } from "./components/Sidebar";
import Header from "./components/Header";
import LeftSynthesisPane, { ChatMessage } from "./components/LeftSynthesisPane";
import RightDocumentPane from "./components/RightDocumentPane";
import CorpusManagerModal from "./components/CorpusManagerModal";
import CitationGraphModal from "./components/CitationGraphModal";
import { CorpusDocument, detectUnitFromFilename, sortCorpusDocuments } from "./utils/corpusUtils";
import { detectSubject } from "./utils/subjectDetection";

export interface ChatSession {
  id: string;
  title: string;
  subjectId?: string;
  documentName?: string;
  documentTotalPages?: number;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const INITIAL_SUBJECTS: Subject[] = [
  { id: "sub-1", name: "Operating Systems", color: "#10b981" },
  { id: "sub-2", name: "Machine Learning", color: "#3b82f6" },
  { id: "sub-3", name: "Computer Networks", color: "#f59e0b" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init",
    sender: "vidya",
    text: "Welcome to VIDYA AI Knowledge Workspace. Upload your textbook, unit slides, or research paper (Unit 1, Unit 2...) to begin structured reasoning and grounded Q&A.",
    timestamp: "Ready",
  },
];

export default function VidyaWorkspacePage() {
  const API_BASE = "http://localhost:8000";

  // Navigation & View States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dual-pane");
  const [activeView, setActiveView] = useState<"dual-pane" | "synthesis" | "pdf">("dual-pane");
  const [backendOnline, setBackendOnline] = useState(false);
  const [audioVoiceActive, setAudioVoiceActive] = useState(false);

  // Modals
  const [isCorpusOpen, setIsCorpusOpen] = useState(false);
  const [isCitationGraphOpen, setIsCitationGraphOpen] = useState(false);

  // Student Profile
  const [studentName, setStudentName] = useState("Aarav Sharma");

  // Subjects & Corpus
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [corpus, setCorpus] = useState<CorpusDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");

  // ChatGPT-style Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // Document & PDF Viewer States
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImageB64, setPageImageB64] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Synthesis & Chat States
  const [isThinking, setIsThinking] = useState(false);
  const [latestSuggestions, setLatestSuggestions] = useState<string[]>([]);

  // Detected Subject Banner
  const [detectedSubjectBanner, setDetectedSubjectBanner] = useState<{
    suggestedName: string;
    existingId?: string;
    isNew: boolean;
    docName: string;
  } | null>(null);

  // Speech Recognition States
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize and load persisted data
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("vidya_student_name");
      if (savedName) setStudentName(savedName);

      const savedSubjects = localStorage.getItem("vidya_subjects");
      if (savedSubjects) setSubjects(JSON.parse(savedSubjects));

      const savedCorpus = localStorage.getItem("vidya_corpus");
      if (savedCorpus) setCorpus(JSON.parse(savedCorpus));

      const savedSessions = localStorage.getItem("vidya_chat_sessions");
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }

      // Default initial session
      const defaultSessionId = `session-${Date.now()}`;
      const defaultSession: ChatSession = {
        id: defaultSessionId,
        title: "New Research Session",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        updatedAt: "Just now",
        messages: INITIAL_MESSAGES,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSessionId);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Persist state updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vidya_subjects", JSON.stringify(subjects));
    } catch {}
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem("vidya_student_name", studentName);
    } catch {}
  }, [studentName]);

  useEffect(() => {
    try {
      const serializableCorpus = corpus.map(({ file, ...rest }) => rest);
      localStorage.setItem("vidya_corpus", JSON.stringify(serializableCorpus));
    } catch {}
  }, [corpus]);

  useEffect(() => {
    try {
      if (sessions.length > 0) {
        localStorage.setItem("vidya_chat_sessions", JSON.stringify(sessions));
      }
    } catch {}
  }, [sessions]);

  // Current active session & its messages
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || INITIAL_MESSAGES;

  // Check Backend Health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          const data = await res.json();
          setBackendOnline(true);
          if (data.pdf_loaded && !pdfLoaded) {
            setPdfLoaded(true);
            const fname = data.pdf_path ? data.pdf_path.split(/[\\/]/).pop() : "Ingested Document";
            setPdfName(fname);
          }
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => clearInterval(interval);
  }, [pdfLoaded]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSendQuery(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleMic = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Start a New Chat Session (like ChatGPT)
  const handleNewChat = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Conversation",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      updatedAt: "Just now",
      messages: INITIAL_MESSAGES,
      subjectId: currentSession?.subjectId,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setLatestSuggestions([]);
    setActiveTab("dual-pane");
  }, [currentSession?.subjectId]);

  // Select an existing chat session from history
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        if (target.documentName && target.documentName !== pdfName) {
          setPdfName(target.documentName);
          if (target.documentTotalPages) setTotalPages(target.documentTotalPages);
        }
      }
      setActiveTab("dual-pane");
    },
    [sessions, pdfName]
  );

  // Delete a chat session
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          const fallbackId = `session-${Date.now()}`;
          return [
            {
              id: fallbackId,
              title: "New Conversation",
              createdAt: "Now",
              updatedAt: "Just now",
              messages: INITIAL_MESSAGES,
            },
          ];
        }
        if (activeSessionId === sessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  // Subject Management
  const handleAddSubject = useCallback(
    (name: string): Subject => {
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
      const color = colors[subjects.length % colors.length];
      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        name,
        color,
      };
      setSubjects((prev) => [...prev, newSubject]);
      return newSubject;
    },
    [subjects.length]
  );

  const handleRemoveSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    // Clear subject from sessions and corpus
    setSessions((prev) =>
      prev.map((s) => (s.subjectId === id ? { ...s, subjectId: undefined } : s))
    );
    setCorpus((prev) =>
      prev.map((doc) => (doc.subjectId === id ? { ...doc, subjectId: undefined } : doc))
    );
  }, []);

  // Assign Subject to Current Active Chat Session & Document
  const handleAssignCurrentSubject = useCallback(
    (subjectId: string) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, subjectId: subjectId || undefined } : s))
      );
      if (activeDocId) {
        setCorpus((prev) =>
          prev.map((d) => (d.id === activeDocId ? { ...d, subjectId: subjectId || undefined } : d))
        );
      }
    },
    [activeSessionId, activeDocId]
  );

  // Confirm Detected Subject Banner
  const handleConfirmDetectedSubject = useCallback(
    (createAsNew: boolean, subjectIdOrName: string) => {
      let finalSubjectId = subjectIdOrName;
      if (createAsNew) {
        const created = handleAddSubject(subjectIdOrName);
        finalSubjectId = created.id;
      }

      handleAssignCurrentSubject(finalSubjectId);
      setDetectedSubjectBanner(null);
    },
    [handleAddSubject, handleAssignCurrentSubject]
  );

  // Fetch Page Image from FastAPI
  const loadPage = async (page: number) => {
    if (!pdfLoaded) return;
    try {
      const res = await fetch(`${API_BASE}/pdf-page?page=${page}`);
      if (!res.ok) return;
      const data = await res.json();
      setPageImageB64(data.image);
      setCurrentPage(data.page);
      setTotalPages(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload & Ingest PDF Handler
  const handleUploadFile = async (file: File, targetSubjectId?: string) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a valid .pdf file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress("Analyzing keywords & ingesting via LangGraph pipeline...");

    // Auto-detect unit keyword from filename (e.g. Unit 1, Module 2, Chapter 3)
    const unitInfo = detectUnitFromFilename(file.name);
    // Auto-detect subject from filename
    const detected = detectSubject(file.name, subjects);
    const newDocId = `doc-${Date.now()}`;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(`${API_BASE}/ingest`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Upload failed");
      }
      const data = await res.json();

      setPdfLoaded(true);
      setPdfName(file.name);
      setTotalPages(data.pages || 1);
      setCurrentPage(1);
      setActiveDocId(newDocId);

      const receivedSuggestions: string[] = data.suggestions || [];
      setLatestSuggestions(receivedSuggestions);

      // Determine initial subject
      const resolvedSubjectId =
        targetSubjectId || (detected.matchedExistingSubject ? detected.matchedExistingSubject.id : undefined);

      // Show auto-detection banner if subject was detected and not manually chosen
      if (!targetSubjectId && detected.confidence >= 0.5) {
        setDetectedSubjectBanner({
          suggestedName: detected.suggestedName,
          existingId: detected.matchedExistingSubject?.id,
          isNew: detected.isNew,
          docName: file.name,
        });
      }

      // Add to Corpus state with Unit sorting
      const newCorpusDoc: CorpusDocument = {
        id: newDocId,
        name: file.name,
        subjectId: resolvedSubjectId,
        unitNumber: unitInfo.unitNumber,
        unitLabel: unitInfo.unitLabel,
        totalPages: data.pages || 1,
        uploadedAt: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
        sizeBytes: file.size,
      };

      setCorpus((prev) => {
        const updated = [...prev.filter((d) => d.name !== file.name), newCorpusDoc];
        return sortCorpusDocuments(updated);
      });

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#4edea3", "#10b981", "#68dba9"],
      });

      await loadPage(1);

      // Append upload confirmation to current session's messages
      const ingestMsg: ChatMessage = {
        id: String(Date.now()),
        sender: "vidya",
        text: `Indexed "${file.name}" [${unitInfo.unitLabel}] (${data.pages} pages, ${data.chunks} chunks). How can I assist you with this document?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: receivedSuggestions,
      };

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            const isFirst = session.messages.length <= 1;
            return {
              ...session,
              title: isFirst ? `${file.name.replace(/\.pdf$/i, "")}` : session.title,
              documentName: file.name,
              documentTotalPages: data.pages || 1,
              subjectId: session.subjectId || resolvedSubjectId,
              updatedAt: "Just now",
              messages: [...session.messages, ingestMsg],
            };
          }
          return session;
        })
      );
    } catch (err: any) {
      console.error(err);
      alert(`Error ingesting PDF: ${err.message || "Unknown error"}. Ensure FastAPI backend is running.`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // Select Document from Corpus to Make Active
  const handleSelectCorpusDocument = async (doc: CorpusDocument) => {
    setActiveDocId(doc.id);
    setPdfName(doc.name);
    setPdfLoaded(true);
    if (doc.totalPages) setTotalPages(doc.totalPages);
    setCurrentPage(1);
    await loadPage(1);

    const switchMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "vidya",
      text: `Switched focus to "${doc.name}" (${doc.unitLabel}). Ready for reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              documentName: doc.name,
              documentTotalPages: doc.totalPages,
              subjectId: doc.subjectId || s.subjectId,
              messages: [...s.messages, switchMsg],
            }
          : s
      )
    );
  };

  const handleRemoveCorpusDoc = (docId: string) => {
    setCorpus((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocId === docId) {
      setActiveDocId("");
    }
  };

  const handleAssignCorpusSubject = (docId: string, subjectId: string) => {
    setCorpus((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, subjectId: subjectId || undefined } : d))
    );
  };

  // Send Query to /ask (within the current active session)
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update current session with user message and update thread title if needed
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          const isInitial = session.messages.length <= 1;
          const newTitle = isInitial
            ? queryText.length > 40
              ? queryText.slice(0, 40) + "..."
              : queryText
            : session.title;
          return {
            ...session,
            title: newTitle,
            updatedAt: "Just now",
            messages: [...session.messages, userMsg],
          };
        }
        return session;
      })
    );

    setIsThinking(true);

    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          style: "Normal",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Ask failed");
      }
      const data = await res.json();

      const vidyaMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "vidya",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        route: data.route,
        pageNumber: data.page_number,
        toolResult: data.tool_result,
        suggestions: latestSuggestions, // suggestions attached at the end of the answer
      };

      // Append assistant message to current session
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                updatedAt: "Just now",
                messages: [...session.messages, vidyaMsg],
              }
            : session
        )
      );

      if (data.page_number && data.page_number !== currentPage) {
        loadPage(data.page_number);
      }

      if (audioVoiceActive && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const clean = data.answer.replace(/[*#_`]/g, "");
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "vidya",
        text: err.message?.includes("No PDF loaded")
          ? "Please upload a study PDF first before asking questions."
          : "Server connection error. Please verify the FastAPI backend is running on port 8000.",
        timestamp: "Error",
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, errMsg] }
            : session
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  // Metadata for sidebar sessions list
  const chatSessionsMeta: ChatSessionMeta[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    updatedAt: s.updatedAt,
    subjectId: s.subjectId,
    documentName: s.documentName,
    messageCount: s.messages.length,
  }));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface">
      {/* Left Navigation Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "corpus") setIsCorpusOpen(true);
          else if (tab === "citations") setIsCitationGraphOpen(true);
        }}
        chatSessions={chatSessionsMeta}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onRemoveSubject={handleRemoveSubject}
        studentName={studentName}
        onUpdateStudentName={setStudentName}
        onOpenCorpus={() => setIsCorpusOpen(true)}
        onOpenCitations={() => setIsCitationGraphOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <Header
          backendOnline={backendOnline}
          activeView={activeView}
          onSelectView={setActiveView}
          audioVoiceActive={audioVoiceActive}
          onToggleVoice={() => {
            if (audioVoiceActive && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            setAudioVoiceActive(!audioVoiceActive);
          }}
        />

        {/* Dual-Pane / Responsive Body */}
        <main className="flex-1 overflow-hidden p-3 lg:p-4 bg-surface-dim">
          <div className="h-full w-full flex flex-col xl:flex-row items-stretch gap-3">
            {/* Left Pane: Q&A Chat Stream with ChatGPT Session architecture */}
            {(activeView === "dual-pane" || activeView === "synthesis") && (
              <LeftSynthesisPane
                messages={messages}
                isThinking={isThinking}
                onSendQuery={handleSendQuery}
                onCitationClick={(page) => loadPage(page)}
                latestSuggestions={latestSuggestions}
                speechSupported={speechSupported}
                isListening={isListening}
                onToggleMic={handleToggleMic}
                uploadedPdfName={pdfName}
                subjects={subjects}
                currentSubjectId={currentSession?.subjectId}
                onAssignSubject={handleAssignCurrentSubject}
                detectedSubjectBanner={detectedSubjectBanner}
                onConfirmDetectedSubject={handleConfirmDetectedSubject}
                onDismissDetectedSubject={() => setDetectedSubjectBanner(null)}
                onNewChat={handleNewChat}
              />
            )}

            {/* Right Pane: Document Viewer */}
            {(activeView === "dual-pane" || activeView === "pdf") && (
              <RightDocumentPane
                pdfLoaded={pdfLoaded}
                pdfName={pdfName}
                currentPage={currentPage}
                totalPages={totalPages}
                pageImageB64={pageImageB64}
                zoomLevel={zoomLevel}
                onPageChange={(page) => loadPage(page)}
                onZoomChange={(delta) => setZoomLevel((z) => Math.min(180, Math.max(60, z + delta)))}
                onUploadFile={handleUploadFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            )}
          </div>
        </main>
      </div>

      {/* Corpus & PDF Unit Organizer Modal */}
      <CorpusManagerModal
        isOpen={isCorpusOpen}
        onClose={() => setIsCorpusOpen(false)}
        corpus={corpus}
        subjects={subjects}
        activeDocumentId={activeDocId}
        onSelectDocument={handleSelectCorpusDocument}
        onUploadDocument={handleUploadFile}
        onRemoveDocument={handleRemoveCorpusDoc}
        onAssignSubject={handleAssignCorpusSubject}
      />

      {/* Citation Graph Modal */}
      <CitationGraphModal
        isOpen={isCitationGraphOpen}
        onClose={() => setIsCitationGraphOpen(false)}
        documentName={pdfName}
        onJumpToPage={(page) => {
          loadPage(page);
          setActiveView("dual-pane");
        }}
      />
    </div>
  );
}

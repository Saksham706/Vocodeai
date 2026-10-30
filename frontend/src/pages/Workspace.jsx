import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  WorkspaceProvider,
  useWorkspace,
} from "../context/WorkspaceContext";
import { useEffect, useState, useRef } from "react";
import { getWorkspace } from "../services/workspaceApi";

import ActivityBar from "../components/layout/ActivityBar";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/navbar";
import WorkspaceEditorSection from "../components/editor/WorkspaceEditorSection";
import WorkspaceTerminalSection from "../components/terminal/WorkspaceTerminalSection";
import LivePreview from "../components/preview/LivePreview";
import AIChat from "../components/ai/AIChat";
import WelcomeDashboard from "../components/dashboard/WelcomeDashboard";
import SettingsView from "../components/settings/SettingsView";

import { AIProvider } from "../context/AIContext";
import { X } from "lucide-react";

import "../styles/workspace.css";

/* ================= INNER IDE LAYOUT ================= */

function WorkspaceLayout() {
  const {
    terminals,
    activeTerminal,
    setActiveTerminal,
    killTerminal,
    openNewTerminal,
    previewUrl,
    activeFile,
    currentProject,
    tree,
    openFile,
    runCode,
    runProject,
    refreshPreview,
    selectedTarget,
    setCreateRequest,
    showTerminal,
    setShowTerminal,
    problems,
    setProblems,
    outputLogs,
    setOutputLogs,
    isSplitEditor,
    splitEditorFile,
    closeSplitEditor,
  } = useWorkspace();

  const location = useLocation();
  const navigate = useNavigate();
  const { id: workspaceId } = useParams();

  // Settings Panel State
  const [showSettings, setShowSettings] = useState(false);

  // Ctrl+, keyboard shortcut to toggle Settings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setShowSettings((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Shared Theme State (Synced with localStorage & document attribute)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  // 2. Activity Bar Tab State
  const [activityTab, setActivityTab] = useState("explorer");

  // 3. Persistent Left File Explorer State (Open by default)
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const toggleExplorer = () => {
    setIsExplorerOpen((prev) => !prev);
  };

  // 4. AI Assistant Panel State (Toggleable, default false on Welcome screen)
  const [showAI, setShowAI] = useState(false);
  const toggleAI = () => {
    setShowAI((prev) => !prev);
  };

  // 5. Integrated Terminal State (Managed via WorkspaceContext)
  const toggleTerminal = () => {
    if (showTerminal) {
      setShowTerminal(false);
    } else {
      setShowTerminal(true);
      if (terminals.length === 0) {
        openNewTerminal("bash");
      }
    }
  };

  const [activeTermTab, setActiveTermTab] = useState("terminal");
  const [isTermMaximized, setIsTermMaximized] = useState(false);

  // Synchronize terminal sessions with real backend PTYs
  const sessions =
    terminals && terminals.length > 0
      ? terminals.map((t, idx) => ({
          id: t.id,
          label: t.title || t.file?.split("/").pop() || t.shell || `term-${idx + 1}`,
          dot: t.shell === "node" ? "blue" : (t.file ? "accent" : "accent"),
          shell: t.shell || "bash",
          file: t.file || null,
        }))
      : [];

  const activeSessionId = activeTerminal || sessions[0]?.id || null;

  const [splitTerminalId, setSplitTerminalId] = useState(null);

  const handleSelectSession = (id) => {
    setActiveTerminal(id);
  };

  const handleCloseSession = (id) => {
    if (splitTerminalId === id) {
      setSplitTerminalId(null);
    }
    killTerminal(id);
  };

  const handleAddSession = (shell = "bash") => {
    const validShell = typeof shell === "string" ? shell : "bash";
    openNewTerminal(validShell);
  };

  const handleSplitTerminal = () => {
    if (splitTerminalId) {
      setSplitTerminalId(null);
      return;
    }
    const currentActive = activeTerminal || terminals[0]?.id;
    const otherTerm = terminals.find((t) => t.id !== currentActive);
    if (otherTerm) {
      setSplitTerminalId(otherTerm.id);
    } else {
      const newId = `term_split_${Date.now()}`;
      createTerminal(newId, "bash", false);
      setSplitTerminalId(newId);
    }
  };

  const primaryTermId = splitTerminalId
    ? (activeTerminal === splitTerminalId
        ? terminals.find((t) => t.id !== splitTerminalId)?.id || activeTerminal
        : activeTerminal || terminals[0]?.id)
    : activeTerminal || terminals[0]?.id;

  const secondaryTermId = splitTerminalId;

  const isSplitActive = Boolean(
    secondaryTermId && primaryTermId && secondaryTermId !== primaryTermId
  );

  const handleCloseSplit = (idToClose) => {
    const target = idToClose || splitTerminalId;
    setSplitTerminalId(null);
    if (target && target !== activeTerminal) {
      killTerminal(target);
    }
  };

  // Interactive Debug Console state
  const [debugLogs, setDebugLogs] = useState([
    { id: 1, text: "VocodeAI Debugger ready. Target runtime attached.", type: "system" },
  ]);
  const [debugInput, setDebugInput] = useState("");

  const handleDebugSubmit = (e) => {
    e.preventDefault();
    const cmd = debugInput.trim();
    if (!cmd) return;
    setDebugLogs((prev) => [
      ...prev,
      { id: Date.now(), text: `> ${cmd}`, type: "input" },
    ]);
    try {
      // Safe client expression evaluation
      const evaluator = new Function(`"use strict"; return (${cmd})`);
      const val = evaluator();
      const res = typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
      setDebugLogs((prev) => [
        ...prev,
        { id: Date.now() + 1, text: res, type: "result" },
      ]);
    } catch (err) {
      setDebugLogs((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Error: ${err.message}`, type: "error" },
      ]);
    }
    setDebugInput("");
  };

  const handleProblemClick = (prob) => {
    if (prob.file) {
      openFile(prob.file);
    }
  };

  // 6. Resizable Sidebar
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const resizingSidebar = useRef(false);

  const startSidebarResize = () => {
    resizingSidebar.current = true;
  };

  const resizeSidebar = (e) => {
    if (!resizingSidebar.current) return;
    setSidebarWidth((w) => Math.min(Math.max(w + e.movementX, 190), 420));
  };

  const stopSidebarResize = () => {
    resizingSidebar.current = false;
  };

  // 7. Resizable Terminal
  const [terminalHeight, setTerminalHeight] = useState(220);
  const resizingTerminal = useRef(false);

  const startTerminalResize = () => {
    resizingTerminal.current = true;
  };

  const resizeTerminal = (e) => {
    if (!resizingTerminal.current) return;
    setTerminalHeight((h) => Math.min(Math.max(h - e.movementY, 90), 480));
  };

  const stopTerminalResize = () => {
    resizingTerminal.current = false;
  };

  // 8. Resizable AI Assistant Sidebar
  const [aiWidth, setAiWidth] = useState(() => {
    try {
      const stored = localStorage.getItem("vocode_ai_width");
      return stored ? parseInt(stored, 10) : 400;
    } catch {
      return 400;
    }
  });
  const [isAiMaximized, setIsAiMaximized] = useState(false);
  const resizingAi = useRef(false);

  const startAiResize = () => {
    resizingAi.current = true;
  };

  const resizeAi = (e) => {
    if (!resizingAi.current) return;
    setAiWidth((w) => {
      const next = Math.min(Math.max(w - e.movementX, 290), Math.floor(window.innerWidth * 0.75));
      try {
        localStorage.setItem("vocode_ai_width", next.toString());
      } catch {}
      return next;
    });
  };

  const stopAiResize = () => {
    resizingAi.current = false;
  };

  // Clear or reset terminal output
  const handleClearTerminal = () => {
    const target = activeTerminal || (terminals && terminals[0]?.id);
    if (target) {
      if (splitTerminalId === target) {
        setSplitTerminalId(null);
      }
      killTerminal(target);
    }
  };

  const handleMainRun = () => {
    const isHtml =
      activeFile?.toLowerCase().endsWith(".html") ||
      activeFile?.toLowerCase().endsWith(".htm");
    if (isHtml) {
      refreshPreview(true);
      return;
    }
    setShowTerminal(true);
    setActiveTermTab("terminal");
    if (activeFile) {
      runCode();
    } else {
      runProject();
    }
  };

  return (
    <div className={`ide-app ${theme}`}>
      {/* 1. PERMANENT TOP NAVIGATION BAR */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        isExplorerOpen={isExplorerOpen}
        toggleExplorer={toggleExplorer}
        showTerminal={showTerminal}
        toggleTerminal={toggleTerminal}
        showAI={showAI}
        toggleAI={toggleAI}
        onRun={handleMainRun}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div
        className="ide-main"
        onMouseMove={(e) => {
          resizeSidebar(e);
          resizeTerminal(e);
          resizeAi(e);
        }}
        onMouseUp={() => {
          stopSidebarResize();
          stopTerminalResize();
          stopAiResize();
        }}
        onMouseLeave={() => {
          stopSidebarResize();
          stopTerminalResize();
          stopAiResize();
        }}
      >
        {/* ===== LEFT ACTIVITY BAR (VS Code / Antigravity Style Rail) ===== */}
        <ActivityBar
          activeTab={activityTab}
          setActiveTab={setActivityTab}
          isExplorerOpen={isExplorerOpen}
          toggleExplorer={toggleExplorer}
          onOpenSettings={() => setShowSettings((prev) => !prev)}
          onRun={handleMainRun}
          isSettingsOpen={showSettings}
        />

        {/* ===== LEFT PERSISTENT FILE EXPLORER ===== */}
        {isExplorerOpen && (
          <div className="ide-sidebar-wrapper" style={{ width: sidebarWidth }}>
            <Sidebar onClose={() => setIsExplorerOpen(false)} />
            <div
              className="ide-sidebar-resizer"
              onMouseDown={startSidebarResize}
              title="Drag to resize explorer"
            />
          </div>
        )}

        {/* ===== CENTRAL COLUMN: CODE EDITOR / WELCOME DASHBOARD & INTEGRATED TERMINAL ===== */}
        <div className="ide-center">
          {showSettings ? (
            <SettingsView
              workspaceId={workspaceId || currentProject}
              onBack={() => setShowSettings(false)}
            />
          ) : activeFile ? (
            <WorkspaceEditorSection
              activeFile={activeFile}
              isSplitEditor={isSplitEditor}
              splitEditorFile={splitEditorFile}
              closeSplitEditor={closeSplitEditor}
            />
          ) : (
            /* Welcome Dashboard when no file is active */
            <div className="ide-welcome-section">
              <WelcomeDashboard
                theme={theme}
                onOpenFolder={() => {
                  if (!isExplorerOpen) setIsExplorerOpen(true);
                }}
                onNewFile={() => {
                  if (!isExplorerOpen) setIsExplorerOpen(true);
                  setCreateRequest({
                    type: "file",
                    parent: selectedTarget?.path || "",
                  });
                }}
                onOpenTerminal={() => {
                  if (terminals.length === 0) {
                    openNewTerminal("bash");
                  } else {
                    setShowTerminal(true);
                  }
                }}
                onOpenSettings={() => setShowSettings(true)}
              />
            </div>
          )}

          {/* ===== INTEGRATED BOTTOM TERMINAL ===== */}
          {showTerminal && (
            <WorkspaceTerminalSection
              terminalHeight={terminalHeight}
              startTerminalResize={startTerminalResize}
              isTermMaximized={isTermMaximized}
              setIsTermMaximized={setIsTermMaximized}
              setShowTerminal={setShowTerminal}
              activeTermTab={activeTermTab}
              setActiveTermTab={setActiveTermTab}
              onNewTerminal={() => handleAddSession("bash")}
              onSplitTerminal={handleSplitTerminal}
              isSplitActive={isSplitActive}
              onClearTerminal={handleClearTerminal}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onCloseSession={handleCloseSession}
              onAddSession={handleAddSession}
              problemCount={problems ? problems.length : 0}
              problems={problems}
              setProblems={setProblems}
              handleProblemClick={handleProblemClick}
              outputLogs={outputLogs}
              setOutputLogs={setOutputLogs}
              debugLogs={debugLogs}
              setDebugLogs={setDebugLogs}
              debugInput={debugInput}
              setDebugInput={setDebugInput}
              handleDebugSubmit={handleDebugSubmit}
              primaryTermId={primaryTermId}
              secondaryTermId={secondaryTermId}
              activeTerminal={activeTerminal}
              setActiveTerminal={setActiveTerminal}
              handleCloseSplit={handleCloseSplit}
              theme={theme}
            />
          )}
        </div>

        {/* ===== RIGHT COLUMN: FULL-HEIGHT AI ASSISTANT ===== */}
        {showAI && (
          <div
            className={`ide-ai-sidebar-wrapper ${isAiMaximized ? "maximized" : ""}`}
            style={{ width: isAiMaximized ? "65%" : `${aiWidth}px` }}
          >
            <div
              className="ide-ai-resizer"
              onMouseDown={startAiResize}
              title="Drag to resize AI Assistant"
            />
            <AIChat
              workspaceId={currentProject}
              onClose={() => setShowAI(false)}
              isMaximized={isAiMaximized}
              onToggleMaximize={() => setIsAiMaximized((prev) => !prev)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= WORKSPACE META LOADER ================= */

function WorkspaceLoader({ workspaceId, accessToken }) {
  const { setCurrentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!workspaceId || !accessToken) return;

    getWorkspace(accessToken, workspaceId)
      .then(setCurrentWorkspace)
      .catch(() => setCurrentWorkspace(null));
  }, [workspaceId, accessToken, setCurrentWorkspace]);

  return null;
}

/* ================= PROVIDER WRAPPER ================= */

export default function Workspace() {
  const { id: workspaceId } = useParams();
  const { user, accessToken, loading } = useAuth();

  if (loading) return null;
  if (!user || !accessToken) return null;

  return (
    <WorkspaceProvider key={workspaceId} userId={user.id} workspaceId={workspaceId}>
      <AIProvider>
        <WorkspaceLoader
          workspaceId={workspaceId}
          accessToken={accessToken}
        />
        <WorkspaceLayout />
      </AIProvider>
    </WorkspaceProvider>
  );
}

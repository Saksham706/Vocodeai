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
import EditorTabs from "../components/editor/EditorTabs";
import CodeEditor from "../components/editor/CodeEditor";
import TerminalTabs from "../components/terminal/TerminalTabs";
import TerminalPanel from "../components/terminal/TerminalPanel";
import LivePreview from "../components/preview/LivePreview";
import AIChat from "../components/ai/AIChat";
import WelcomeDashboard from "../components/dashboard/WelcomeDashboard";

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
  } = useWorkspace();

  const location = useLocation();
  const navigate = useNavigate();

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
    setShowTerminal(true);
    setActiveTermTab("terminal");
    if (activeFile?.endsWith(".html")) {
      refreshPreview();
    } else if (activeFile) {
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
        }}
        onMouseUp={() => {
          stopSidebarResize();
          stopTerminalResize();
        }}
        onMouseLeave={() => {
          stopSidebarResize();
          stopTerminalResize();
        }}
      >
        {/* ===== LEFT ACTIVITY BAR (VS Code / Antigravity Style Rail) ===== */}
        <ActivityBar
          activeTab={activityTab}
          setActiveTab={setActivityTab}
          isExplorerOpen={isExplorerOpen}
          toggleExplorer={toggleExplorer}
          onOpenSettings={() => navigate("/dashboard")}
          onRun={handleMainRun}
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
          {activeFile ? (
            /* Editor Section */
            <div className="ide-editor-section">
              <EditorTabs />

              <div className="ide-editor-view">
                <CodeEditor />
              </div>

              {previewUrl && (
                <LivePreview url={previewUrl} activeFile={activeFile} />
              )}
            </div>
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
              />
            </div>
          )}

          {/* ===== INTEGRATED BOTTOM TERMINAL ===== */}
          {showTerminal && (
            <div
              className={`ide-terminal-section ${isTermMaximized ? "maximized" : ""}`}
              style={{ height: isTermMaximized ? "75%" : terminalHeight }}
            >
              <div
                className="ide-terminal-resizer"
                onMouseDown={startTerminalResize}
                title="Drag to resize terminal"
              />

              <TerminalTabs
                activeTab={activeTermTab}
                setActiveTab={setActiveTermTab}
                onNewTerminal={() => handleAddSession("bash")}
                onSplitTerminal={handleSplitTerminal}
                isSplit={isSplitActive}
                onClearTerminal={handleClearTerminal}
                onToggleMaximize={() => setIsTermMaximized((prev) => !prev)}
                isMaximized={isTermMaximized}
                onClosePanel={() => setShowTerminal(false)}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onCloseSession={handleCloseSession}
                onAddSession={handleAddSession}
                problemCount={problems ? problems.length : 0}
              />

              <div className="ide-terminal-body">
                {activeTermTab === "terminal" && (
                  isSplitActive ? (
                    <div className="terminal-split-view">
                      <div
                        className={`terminal-split-pane ${activeTerminal === primaryTermId ? "focused" : ""}`}
                        onClick={() => setActiveTerminal(primaryTermId)}
                      >
                        <div className="terminal-pane-header">
                          <span className="terminal-pane-title">
                            {sessions.find((s) => s.id === primaryTermId)?.label || "bash"}
                          </span>
                          <button
                            type="button"
                            className="terminal-pane-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseSplit(primaryTermId);
                            }}
                            title="Close Terminal"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="terminal-pane-content">
                          <TerminalPanel
                            key={primaryTermId}
                            terminalId={primaryTermId}
                            theme={theme}
                          />
                        </div>
                      </div>

                      <div className="terminal-split-divider" />

                      <div
                        className={`terminal-split-pane ${activeTerminal === secondaryTermId ? "focused" : ""}`}
                        onClick={() => setActiveTerminal(secondaryTermId)}
                      >
                        <div className="terminal-pane-header">
                          <span className="terminal-pane-title">
                            {sessions.find((s) => s.id === secondaryTermId)?.label || "bash (split)"}
                          </span>
                          <button
                            type="button"
                            className="terminal-pane-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseSplit(secondaryTermId);
                            }}
                            title="Close Split Terminal"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="terminal-pane-content">
                          <TerminalPanel
                            key={secondaryTermId}
                            terminalId={secondaryTermId}
                            theme={theme}
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeTerminal ? (
                    <TerminalPanel
                      key={activeTerminal}
                      terminalId={activeTerminal}
                      theme={theme}
                    />
                  ) : (
                    <div className="term-shell-session">
                      <div className="term-block">
                        <div className="term-line">
                          <span className="term-prompt-user">saksham@vocodeai:</span>
                          <span className="term-prompt-path">~/workspace$</span>
                          <span className="term-cursor">█</span>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {activeTermTab === "output" && (
                  <div className="term-functional-panel">
                    <div className="term-panel-header">
                      <div className="term-panel-title">
                        <span>Workspace Execution &amp; Build Output</span>
                      </div>
                      <div className="term-panel-actions">
                        <button
                          type="button"
                          className="term-panel-btn"
                          onClick={() => setOutputLogs([])}
                        >
                          Clear Output
                        </button>
                      </div>
                    </div>
                    <div className="term-panel-scrollable">
                      {outputLogs && outputLogs.length > 0 ? (
                        outputLogs.map((log) => (
                          <div key={log.id} className="term-log-row">
                            <span className="term-log-time">[{log.time}]</span>
                            <span className={`term-log-text ${log.type || "info"}`}>
                              {log.text}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="term-dim-line">No recent execution logs.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTermTab === "problems" && (
                  <div className="term-functional-panel">
                    <div className="term-panel-header">
                      <div className="term-panel-title">
                        <span>
                          {problems && problems.length > 0
                            ? `${problems.length} problem${problems.length > 1 ? "s" : ""} detected`
                            : "No problems detected"}
                        </span>
                      </div>
                      {problems && problems.length > 0 && (
                        <div className="term-panel-actions">
                          <button
                            type="button"
                            className="term-panel-btn"
                            onClick={() => setProblems([])}
                          >
                            Clear Problems
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="term-panel-scrollable">
                      {problems && problems.length > 0 ? (
                        <div className="term-problems-list">
                          {problems.map((prob) => (
                            <div
                              key={prob.id}
                              className="term-problem-item"
                              onClick={() => handleProblemClick(prob)}
                              title="Click to jump to file"
                            >
                              <span
                                className={`term-problem-severity ${prob.severity || "error"}`}
                              >
                                {prob.severity || "error"}
                              </span>
                              <div className="term-problem-details">
                                <span className="term-problem-msg">{prob.message}</span>
                                <span className="term-problem-location">
                                  {prob.file} [{prob.line}:{prob.col}]
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="term-dim-line">
                          No syntax or compilation problems detected in the workspace.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTermTab === "debug" && (
                  <div className="term-functional-panel">
                    <div className="term-panel-header">
                      <div className="term-panel-title">
                        <span>Interactive Debug Console</span>
                      </div>
                      <div className="term-panel-actions">
                        <button
                          type="button"
                          className="term-panel-btn"
                          onClick={() => setDebugLogs([])}
                        >
                          Clear Console
                        </button>
                      </div>
                    </div>
                    <div className="term-panel-scrollable">
                      {debugLogs.map((log) => (
                        <div key={log.id} className="term-log-row">
                          <span className={`term-log-text ${log.type}`}>
                            {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleDebugSubmit} className="term-debug-input-row">
                      <span className="term-debug-glyph">&gt;</span>
                      <input
                        type="text"
                        className="term-debug-input"
                        placeholder="Evaluate expression or command..."
                        value={debugInput}
                        onChange={(e) => setDebugInput(e.target.value)}
                      />
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT COLUMN: FULL-HEIGHT AI ASSISTANT ===== */}
        {showAI && (
          <div className="ide-ai-sidebar-wrapper">
            <AIChat
              workspaceId={currentProject}
              onClose={() => setShowAI(false)}
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

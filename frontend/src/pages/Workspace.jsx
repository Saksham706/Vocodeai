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
import GlobalSearch from "../components/explorer/GlobalSearch";
import RunDebugPanel from "../components/explorer/RunDebugPanel";
import Navbar from "../components/layout/navbar";
import WorkspaceEditorSection from "../components/editor/WorkspaceEditorSection";
import WorkspaceTerminalSection from "../components/terminal/WorkspaceTerminalSection";
import LivePreview from "../components/preview/LivePreview";
import AIChat from "../components/ai/AIChat";
import WelcomeDashboard from "../components/dashboard/WelcomeDashboard";
import SettingsView from "../components/settings/SettingsView";
import SourceControl from "../components/git/SourceControl";
import GitDiffEditor from "../components/git/GitDiffEditor";
import ExtensionsPanel from "../components/extensions/ExtensionsPanel";
import ExtensionDetailsView from "../components/extensions/ExtensionDetailsView";
import CommandPalette from "../components/common/CommandPalette";
import StatusBar from "../components/layout/StatusBar";
import { MARKETPLACE_EXTENSIONS } from "../config/marketplaceExtensions";
import {
  applyThemeExtension,
  getActiveThemeExtension,
} from "../utils/themeRegistry";
import {
  getGitStatus,
  stageGitFiles,
  unstageGitFiles,
  discardGitChanges,
} from "../services/gitApi";

import { AIProvider, useAI } from "../context/AIContext";
import { X, Puzzle } from "lucide-react";
import DashboardBackground from "../components/DashboardBackground";

import "../styles/workspace.css";

const DEFAULT_INSTALLED_EXTENSION_IDS = [
  "ext-vocode-ai-copilot",
  "ext-theme-one-dark-pro",
  "ext-prettier-formatter",
];

/* ================= INNER IDE LAYOUT ================= */

function WorkspaceLayout() {
  const {
    terminals,
    activeTerminal,
    setActiveTerminal,
    killTerminal,
    clearTerminal,
    restartTerminal,
    openNewTerminal,
    previewUrl,
    activeFile,
    currentProject,
    currentWorkspace,
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
  const { user, accessToken } = useAuth();
  const { aiConfig } = useAI();

  // Settings Panel State
  const [showSettings, setShowSettings] = useState(false);

  // Command Palette & Extension Details State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [viewingExtension, setViewingExtension] = useState(null);
  const [installedExtensionIds, setInstalledExtensionIds] = useState(() => {
    try {
      const saved = localStorage.getItem("vocode_installed_extensions");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(DEFAULT_INSTALLED_EXTENSION_IDS);
  });

  // Antigravity installed state
  const [isAntigravityInstalled, setIsAntigravityInstalled] = useState(() => {
    try {
      const saved = localStorage.getItem("vocode_installed_extensions");
      if (saved) return JSON.parse(saved).includes("google.google-antigravity");
    } catch {}
    return false;
  });

  useEffect(() => {
    const handleInstalled = (e) => {
      const extensionId = e.detail?.extensionId || e.detail?.extension?.id;
      if (extensionId) {
        setInstalledExtensionIds((prev) => new Set([...prev, extensionId]));
      }
      if (extensionId === "google.google-antigravity") {
        setIsAntigravityInstalled(true);
      }
    };
    const handleUninstalled = (e) => {
      const extensionId = e.detail?.extensionId || e.detail?.extension?.id;
      if (extensionId) {
        setInstalledExtensionIds((prev) => {
          const next = new Set(prev);
          next.delete(extensionId);
          return next;
        });
      }
      if (extensionId === "google.google-antigravity") {
        setIsAntigravityInstalled(false);
      }
    };
    const handleOpenExtDetails = (e) => {
      if (e.detail?.extension) {
        setViewingExtension(e.detail.extension);
      }
    };
    const handleOpenCmdPalette = () => {
      setShowCommandPalette(true);
    };

    window.addEventListener("vocode-extension-installed", handleInstalled);
    window.addEventListener("vocode-extension-uninstalled", handleUninstalled);
    window.addEventListener("vocode-open-extension-details", handleOpenExtDetails);
    window.addEventListener("vocode-open-command-palette", handleOpenCmdPalette);
    return () => {
      window.removeEventListener("vocode-extension-installed", handleInstalled);
      window.removeEventListener("vocode-extension-uninstalled", handleUninstalled);
      window.removeEventListener("vocode-open-extension-details", handleOpenExtDetails);
      window.removeEventListener("vocode-open-command-palette", handleOpenCmdPalette);
    };
  }, []);

  const setExtensionInstalled = (extensionId, installed) => {
    setInstalledExtensionIds((prev) => {
      const next = new Set(prev);
      if (installed) next.add(extensionId);
      else next.delete(extensionId);
      try {
        localStorage.setItem("vocode_installed_extensions", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    if (extensionId === "google.google-antigravity") {
      setIsAntigravityInstalled(installed);
    }
    window.dispatchEvent(
      new CustomEvent(installed ? "vocode-extension-installed" : "vocode-extension-uninstalled", {
        detail: { extensionId },
      })
    );
  };

  const handleInstallExtension = (extension) => {
    setExtensionInstalled(extension.id, true);
  };

  const handleUninstallExtension = (extension) => {
    setExtensionInstalled(extension.id, false);
  };

  const handleInstallAntigravity = () => {
    setExtensionInstalled("google.google-antigravity", true);
  };

  const handleUninstallAntigravity = () => {
    setExtensionInstalled("google.google-antigravity", false);
  };

  const handleFocusAntigravity = () => {
    setActivityTab("antigravity");
    setIsExplorerOpen(true);
    setShowAI(false);
    window.dispatchEvent(new CustomEvent("vocode-antigravity-focus"));
  };

  const handleNewAntigravityConversation = () => {
    setActivityTab("antigravity");
    setIsExplorerOpen(true);
    setShowAI(false);
    window.dispatchEvent(new CustomEvent("vocode-antigravity-new-chat"));
  };

  // Activity Bar Tab & Explorer State (must be initialized before keyboard shortcuts hook)
  const [activityTab, setActivityTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("github") || params.get("github_error")) return "git";
    try {
      return localStorage.getItem("vocode_active_activity_tab") || "explorer";
    } catch {
      return "explorer";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vocode_active_activity_tab", activityTab);
    } catch {}
  }, [activityTab]);

  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const toggleExplorer = () => {
    setIsExplorerOpen((prev) => !prev);
  };

  // VS Code Global Keyboard Shortcuts (Ctrl+Shift+F, Ctrl+Shift+D, Ctrl+Shift+E, Ctrl+Shift+G, Ctrl+,)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = (e.key || "").toLowerCase();

      // Ctrl+Shift+F: Global Search
      if (isCmdOrCtrl && e.shiftKey && key === "f") {
        e.preventDefault();
        if (activityTab === "search" && isExplorerOpen) {
          setIsExplorerOpen(false);
        } else {
          setActivityTab("search");
          setIsExplorerOpen(true);
        }
        return;
      }

      // Ctrl+Shift+D: Run and Debug
      if (isCmdOrCtrl && e.shiftKey && key === "d") {
        e.preventDefault();
        if ((activityTab === "debug" || activityTab === "run") && isExplorerOpen) {
          setIsExplorerOpen(false);
        } else {
          setActivityTab("debug");
          setIsExplorerOpen(true);
        }
        return;
      }

      // Ctrl+Shift+E: Explorer
      if (isCmdOrCtrl && e.shiftKey && key === "e") {
        e.preventDefault();
        if (activityTab === "explorer" && isExplorerOpen) {
          setIsExplorerOpen(false);
        } else {
          setActivityTab("explorer");
          setIsExplorerOpen(true);
        }
        return;
      }

      // Ctrl+Shift+G: Source Control
      if (isCmdOrCtrl && e.shiftKey && key === "g") {
        e.preventDefault();
        if (activityTab === "git" && isExplorerOpen) {
          setIsExplorerOpen(false);
        } else {
          setActivityTab("git");
          setIsExplorerOpen(true);
        }
        return;
      }

      // Ctrl+Shift+X: Extensions Marketplace
      if (isCmdOrCtrl && e.shiftKey && key === "x") {
        e.preventDefault();
        if (activityTab === "extensions" && isExplorerOpen) {
          setIsExplorerOpen(false);
        } else {
          setActivityTab("extensions");
          setIsExplorerOpen(true);
        }
        return;
      }

      // Ctrl+Shift+P / Cmd+Shift+P / F1: Command Palette
      if ((isCmdOrCtrl && e.shiftKey && key === "p") || e.key === "F1") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Ctrl+Shift+A or Ctrl+Alt+A: Toggle AI Assistant
      if (isCmdOrCtrl && (e.shiftKey || e.altKey) && key === "a") {
        e.preventDefault();
        setShowAI((prev) => !prev);
        return;
      }

      // Ctrl+, : Toggle Settings
      if (isCmdOrCtrl && e.key === ",") {
        e.preventDefault();
        setShowSettings((prev) => !prev);
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activityTab, isExplorerOpen]);

  // 1. Shared Theme State (Synced with localStorage & document attribute)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Initialize and apply saved theme extension
  useEffect(() => {
    const activeExtTheme = getActiveThemeExtension();
    if (activeExtTheme) {
      applyThemeExtension(activeExtTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  // 2. Diff & Git Changes State
  const [activeDiff, setActiveDiff] = useState(null);
  const [gitChangesCount, setGitChangesCount] = useState(0);

  const updateGitChangesCount = async () => {
    const wsId = workspaceId || currentProject;
    if (!accessToken || !wsId) return;
    try {
      const data = await getGitStatus(accessToken, wsId);
      if (data?.isRepo) {
        const count = (data.staged?.length || 0) + (data.unstaged?.length || 0) + (data.untracked?.length || 0);
        setGitChangesCount(count);
      } else {
        setGitChangesCount(0);
      }
    } catch {
      setGitChangesCount(0);
    }
  };

  useEffect(() => {
    updateGitChangesCount();
    const timer = setInterval(updateGitChangesCount, 8000);
    return () => clearInterval(timer);
  }, [accessToken, workspaceId, currentProject]);

  const handleDiffStage = async (filePath) => {
    const wsId = workspaceId || currentProject;
    await stageGitFiles(accessToken, wsId, [filePath]);
    updateGitChangesCount();
    setActiveDiff((prev) => (prev ? { ...prev, isStaged: true } : null));
  };

  const handleDiffUnstage = async (filePath) => {
    const wsId = workspaceId || currentProject;
    await unstageGitFiles(accessToken, wsId, [filePath]);
    updateGitChangesCount();
    setActiveDiff((prev) => (prev ? { ...prev, isStaged: false } : null));
  };

  const handleDiffDiscard = async (filePath) => {
    const wsId = workspaceId || currentProject;
    await discardGitChanges(accessToken, wsId, [filePath]);
    updateGitChangesCount();
    setActiveDiff(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("github") === "connected" || params.get("github_error")) {
      setActivityTab("git");
      setIsExplorerOpen(true);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search]);

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

  // Clear terminal screen
  const handleClearTerminal = () => {
    const target = activeTerminal || (terminals && terminals[0]?.id);
    if (target) {
      clearTerminal(target);
    }
  };

  // Restart active terminal session
  const handleRestartTerminal = () => {
    const target = activeTerminal || (terminals && terminals[0]?.id);
    if (target) {
      restartTerminal(target);
    }
  };

  // Kill active terminal session
  const handleKillTerminal = () => {
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
      {/* Unified Background System (Grid, Aurora Orbs & Glowing Curves) */}
      <DashboardBackground theme={theme} />

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
        onToggleGit={() => {
          if (activityTab === "git" && isExplorerOpen) {
            setIsExplorerOpen(false);
          } else {
            setActivityTab("git");
            setIsExplorerOpen(true);
          }
        }}
        onOpenExplorer={() => {
          setActivityTab("explorer");
          setIsExplorerOpen(true);
        }}
        onOpenSearch={() => {
          setActivityTab("search");
          setIsExplorerOpen(true);
        }}
        onOpenGit={() => {
          setActivityTab("git");
          setIsExplorerOpen(true);
        }}
        onOpenDebug={() => {
          setActivityTab("debug");
          setIsExplorerOpen(true);
        }}
        onOpenSettings={() => setShowSettings(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
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
          showAI={showAI}
          toggleAI={toggleAI}
          onOpenSettings={() => setShowSettings((prev) => !prev)}
          onRun={handleMainRun}
          isSettingsOpen={showSettings}
          gitChangesCount={gitChangesCount}
        />

        {/* ===== LEFT PERSISTENT FILE EXPLORER & VIEWS ===== */}
        {isExplorerOpen && (
          <div
            className="ide-sidebar-wrapper"
            style={{
              width:
                activityTab === "antigravity"
                  ? Math.max(sidebarWidth, 380)
                  : sidebarWidth,
            }}
          >
            {activityTab === "git" ? (
              <SourceControl
                workspaceId={workspaceId || currentProject}
                aiConfig={aiConfig}
                onOpenDiff={(diffData) => setActiveDiff(diffData)}
                onCloseSidebar={() => setIsExplorerOpen(false)}
              />
            ) : activityTab === "search" ? (
              <GlobalSearch
                workspaceId={workspaceId || currentProject}
                onClose={() => setIsExplorerOpen(false)}
              />
            ) : activityTab === "debug" || activityTab === "run" ? (
              <RunDebugPanel
                onRun={handleMainRun}
                onClearTerminal={handleClearTerminal}
                onRestartTerminal={handleRestartTerminal}
                onKillTerminal={handleKillTerminal}
              />
            ) : activityTab === "extensions" ? (
              <ExtensionsPanel onClose={() => setIsExplorerOpen(false)} />
            ) : activityTab === "antigravity" ? (
              <AIChat
                workspaceId={workspaceId || currentProject}
                onClose={() => setIsExplorerOpen(false)}
                isSidebar={true}
              />
            ) : (
              <Sidebar onClose={() => setIsExplorerOpen(false)} />
            )}
            <div
              className="ide-sidebar-resizer"
              onMouseDown={startSidebarResize}
              title="Drag to resize sidebar"
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
          ) : viewingExtension ? (
            <div
              className="ide-extension-details-wrapper"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "#0d151c",
              }}
            >
              <div className="ide-tabs-bar">
                <div className="ide-tabs-list">
                  <div
                    className="ide-tab"
                    onClick={() => setViewingExtension(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="tab-name">Welcome</span>
                  </div>
                  <div className="ide-tab active">
                    <Puzzle size={13} style={{ marginRight: 5, color: "#38bdf8" }} />
                    <span className="tab-name">
                      Extension: {viewingExtension.name}
                    </span>
                    <button
                      className="tab-close-btn"
                      onClick={() => setViewingExtension(null)}
                      title="Close Tab"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <ExtensionDetailsView
                  extension={viewingExtension}
                  isInstalled={
                    installedExtensionIds.has(viewingExtension.id)
                  }
                  onInstall={handleInstallExtension}
                  onUninstall={handleUninstallExtension}
                  onOpenAI={() => {
                    setViewingExtension(null);
                    handleFocusAntigravity();
                  }}
                  onClose={() => setViewingExtension(null)}
                />
              </div>
            </div>
          ) : activeDiff ? (
            <GitDiffEditor
              diffData={activeDiff}
              onClose={() => setActiveDiff(null)}
              onStage={handleDiffStage}
              onUnstage={handleDiffUnstage}
              onDiscard={handleDiffDiscard}
              theme={theme}
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
                  }
                  setShowTerminal(true);
                  setActiveTermTab("terminal");
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
              onRestartTerminal={handleRestartTerminal}
              onKillTerminal={handleKillTerminal}
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
        {showAI && activityTab !== "antigravity" && (
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

      {/* 3. VS CODE BOTTOM STATUS BAR */}
      <StatusBar
        userName={user?.name || user?.username || "Saksham"}
        gitBranch="main"
        gitChangesCount={gitChangesCount}
        problemCount={problems ? problems.length : 0}
        activeLanguage={
          activeFile
            ? activeFile.split(".").pop().toUpperCase()
            : "JavaScript"
        }
        onToggleTerminal={toggleTerminal}
        onTogglePreview={() => refreshPreview(true)}
        onFocusAntigravity={handleFocusAntigravity}
        isAntigravityInstalled={isAntigravityInstalled}
      />

      {/* 4. VS CODE COMMAND PALETTE */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        isAntigravityInstalled={isAntigravityInstalled}
        onFocusAntigravity={handleFocusAntigravity}
        onNewAntigravityConversation={handleNewAntigravityConversation}
        onSelectAIModel={() => {
          setShowAI(true);
        }}
        onToggleExplorer={toggleExplorer}
        onToggleTerminal={toggleTerminal}
        onOpenExtensions={() => {
          setActivityTab("extensions");
          setIsExplorerOpen(true);
        }}
        onOpenGit={() => {
          setActivityTab("git");
          setIsExplorerOpen(true);
        }}
        onOpenSearch={() => {
          setActivityTab("search");
          setIsExplorerOpen(true);
        }}
        onOpenDebug={() => {
          setActivityTab("debug");
          setIsExplorerOpen(true);
        }}
        onOpenSettings={() => setShowSettings(true)}
        onNewFile={() => {
          if (!isExplorerOpen) setIsExplorerOpen(true);
          setCreateRequest({
            type: "file",
            parent: selectedTarget?.path || "",
          });
        }}
        onNewFolder={() => {
          if (!isExplorerOpen) setIsExplorerOpen(true);
          setCreateRequest({
            type: "folder",
            parent: selectedTarget?.path || "",
          });
        }}
        onSaveFile={() => {
          if (activeFile && saveFile) saveFile(activeFile);
        }}
        onInstallAntigravity={handleInstallAntigravity}
      />
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
    <WorkspaceProvider key={workspaceId} userId={user.id || user._id} workspaceId={workspaceId}>
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

import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  WorkspaceProvider,
  useWorkspace,
} from "../context/WorkspaceContext";
import { useEffect, useState, useRef } from "react";
import { getWorkspace, listWorkspaces } from "../services/workspaceApi";
import {
  toWorkspaceSlug,
  isWorkspaceIdLike,
  saveWorkspaceSlug,
  getWorkspaceIdForSlug,
} from "../utils/workspaceUrl";

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
  THEME_DEFINITIONS,
} from "../utils/themeRegistry";
import {
  getGitStatus,
  stageGitFiles,
  unstageGitFiles,
  discardGitChanges,
} from "../services/gitApi";
import { saveFile } from "../services/fileApi";

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
    fileContents,
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
    activeProjectPort,
    isSplitEditor,
    splitEditorFile,
    closeSplitEditor,
    closeTab,
    deleteNode,
    applyFileChange,
    loadWorkspace,
  } = useWorkspace();

  const { workspaceId: ctxWorkspaceId } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeParam } = useParams();
  const workspaceId =
    ctxWorkspaceId ||
    location.state?.workspaceId ||
    (isWorkspaceIdLike(routeParam) ? routeParam : getWorkspaceIdForSlug(routeParam)) ||
    localStorage.getItem("vocode_recent_workspace");
  const { user, accessToken } = useAuth();
  const { aiConfig } = useAI();

  // Remember active workspace ID for Voco and instant redirects
  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem("vocode_recent_workspace", workspaceId);
    }
  }, [workspaceId]);

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
    document.body.setAttribute("data-theme", theme);
    if (theme === "light") {
      const activeExtTheme = getActiveThemeExtension();
      if (activeExtTheme && THEME_DEFINITIONS[activeExtTheme]?.cssVariables) {
        Object.keys(THEME_DEFINITIONS[activeExtTheme].cssVariables).forEach((key) => {
          document.documentElement.style.removeProperty(key);
        });
      }
      if (window.monaco?.editor) {
        window.monaco.editor.setTheme("light");
      }
    } else {
      const activeExtTheme = getActiveThemeExtension();
      if (activeExtTheme) {
        applyThemeExtension(activeExtTheme);
      } else if (window.monaco?.editor) {
        window.monaco.editor.setTheme("vs-dark");
      }
    }
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

  useEffect(() => {
    const isVisible = Boolean(showAI && activityTab !== "antigravity");
    window.dispatchEvent(
      new CustomEvent("vocode-ai-panel-toggle", { detail: { open: isVisible } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("vocode-ai-panel-toggle", { detail: { open: false } })
      );
    };
  }, [showAI, activityTab]);
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

  const handleMainRun = (file = null) => {
    let target = file || activeFile || (openTabs && openTabs.length > 0 ? openTabs[0] : null);
    if (file && activeFile && activeFile.endsWith(file)) {
      target = activeFile;
    }

    // If file was specified (e.g. "ThreeSum.java") but not matching activeFile directly, search tree
    if (file && tree) {
      const fileLower = file.toLowerCase();
      const fileNoExt = fileLower.replace(/\.[^.]+$/, "");
      const getList = (nodeOrList) => {
        if (!nodeOrList) return [];
        if (Array.isArray(nodeOrList)) return nodeOrList;
        if (Array.isArray(nodeOrList.children)) return nodeOrList.children;
        return [nodeOrList];
      };
      const findFilePath = (input) => {
        const nodes = getList(input);
        for (const n of nodes) {
          if (n.type === "file") {
            const nLower = (n.name || "").toLowerCase();
            const pLower = (n.path || "").toLowerCase();
            const nNoExt = nLower.replace(/\.[^.]+$/, "");
            if (
              nLower === fileLower ||
              pLower === fileLower ||
              pLower.endsWith("/" + fileLower) ||
              nNoExt === fileNoExt
            ) {
              return n.path;
            }
          }
          if (n.children) {
            const found = findFilePath(n.children);
            if (found) return found;
          }
        }
        return null;
      };
      const resolved = findFilePath(tree);
      if (resolved) target = resolved;
    }

    const isHtml =
      target?.toLowerCase().endsWith(".html") ||
      target?.toLowerCase().endsWith(".htm");
    if (isHtml) {
      refreshPreview(true, target);
      return;
    }
    setShowTerminal(true);
    setActiveTermTab("terminal");
    if (target) {
      runCode(target);
    } else {
      runProject();
    }
  };

  // Handle Voice Assistant (Voco) system actions
  useEffect(() => {
    const handleVoiceAction = async (e) => {
      const { action, payload } = e.detail || {};
      if (action === "workspace-tab" && payload?.tab) {
        const tab = payload.tab;
        if (tab === "settings") {
          setShowSettings(true);
        } else if (tab === "ai") {
          setShowAI(true);
        } else {
          setShowSettings(false);
          setIsExplorerOpen(true);
          setActivityTab(tab);
        }
      } else if (action === "open-terminal" || action === "toggle-terminal") {
        setShowTerminal(true);
        setActiveTermTab("terminal");
        if (!terminals || terminals.length === 0) {
          openNewTerminal("bash");
        }
      } else if (action === "close-terminal") {
        setShowTerminal(false);
      } else if (action === "close-file") {
        let fileTarget = payload?.target || payload?.name || activeFile;
        fileTarget = typeof fileTarget === "string" ? fileTarget.replace(/["']/g, "").trim() : "";
        if (fileTarget && fileTarget !== activeFile && tree) {
          const fileLower = fileTarget.toLowerCase();
          const fileNoExt = fileLower.replace(/\.[^.]+$/, "");
          const getList = (n) => (!n ? [] : Array.isArray(n) ? n : Array.isArray(n.children) ? n.children : [n]);
          const findFilePath = (input) => {
            for (const n of getList(input)) {
              if (n.type === "file") {
                const nLower = (n.name || "").toLowerCase();
                const pLower = (n.path || "").toLowerCase();
                const nNoExt = nLower.replace(/\.[^.]+$/, "");
                if (
                  nLower === fileLower ||
                  pLower === fileLower ||
                  pLower.endsWith("/" + fileLower) ||
                  nNoExt === fileNoExt
                ) {
                  return n.path;
                }
              }
              if (n.children) {
                const found = findFilePath(n.children);
                if (found) return found;
              }
            }
            return null;
          };
          const resolved = findFilePath(tree);
          if (resolved) fileTarget = resolved;
        }
        if (fileTarget) {
          closeTab(fileTarget);
        } else if (activeFile) {
          closeTab(activeFile);
        }
      } else if (action === "delete-file" || action === "delete_file") {
        let rawFileName = (payload?.path || payload?.name || payload?.target || "").replace(/["']/g, "").trim();
        rawFileName = rawFileName.replace(/\s+file$/i, "").trim();
        let fileTarget = rawFileName;
        if (tree && rawFileName) {
          const findFilePath = (input) => {
            const nodes = getList(input);
            for (const n of nodes) {
              if (n.type === "file") {
                const nLower = (n.name || "").toLowerCase();
                const pLower = (n.path || "").toLowerCase();
                const targetLower = rawFileName.toLowerCase();
                if (nLower === targetLower || pLower === targetLower || pLower.endsWith("/" + targetLower)) {
                  return n.path;
                }
              }
              if (n.children) {
                const found = findFilePath(n.children);
                if (found) return found;
              }
            }
            return null;
          };
          const resolved = findFilePath(tree);
          if (resolved) fileTarget = resolved;
        }
        if (fileTarget) {
          closeTab(fileTarget);
          try {
            await deleteNode(fileTarget);
          } catch (err) {
            console.warn("Failed to delete node:", err);
          }
          await loadWorkspace();
        }
      } else if (action === "write-file" || action === "write_file") {
        const filePath = payload?.path || payload?.name;
        const content = payload?.content;
        if (filePath && content !== undefined) {
          let resolvedPath = filePath;
          if (tree && !filePath.includes("/")) {
            const findFilePath = (input) => {
              const nodes = getList(input);
              for (const n of nodes) {
                if (n.type === "file") {
                  const nLower = (n.name || "").toLowerCase();
                  if (nLower === filePath.toLowerCase()) return n.path;
                }
                if (n.children) {
                  const found = findFilePath(n.children);
                  if (found) return found;
                }
              }
              return null;
            };
            const found = findFilePath(tree);
            if (found) resolvedPath = found;
          }
          await applyFileChange(resolvedPath, content);
        }
      } else if (action === "run-code") {
        let fileTarget = payload?.target || payload?.name || "";
        fileTarget = typeof fileTarget === "string" ? fileTarget.replace(/["']/g, "").trim() : "";
        handleMainRun(fileTarget || null);
      } else if (action === "create-file") {
        if (!isExplorerOpen) setIsExplorerOpen(true);
        setCreateRequest({
          type: "file",
          parent: selectedTarget?.path || "",
          initialName: payload?.name || "",
        });
      } else if (action === "create-folder") {
        if (!isExplorerOpen) setIsExplorerOpen(true);
        setCreateRequest({
          type: "folder",
          parent: selectedTarget?.path || "",
          initialName: payload?.name || "",
        });
      } else if (action === "toggle-explorer") {
        toggleExplorer();
      } else if (action === "open-git") {
        setActivityTab("git");
        setIsExplorerOpen(true);
      } else if (action === "toggle-settings") {
        setShowSettings((prev) => !prev);
      } else if (action === "toggle-ai") {
        setShowAI((prev) => !prev);
      } else if (action === "save-file") {
        if (activeFile && workspaceId) {
          saveFile(accessToken, workspaceId, activeFile, fileContents?.[activeFile] || "")
            .catch((err) => console.warn("Save failed:", err));
        }
      } else if (action === "open-folder") {
        const rawFolderName = (payload?.name || payload?.target || "").replace(/["']/g, "").trim();
        setActivityTab("explorer");
        setIsExplorerOpen(true);
        if (rawFolderName && tree) {
          const targetLower = rawFolderName.toLowerCase();
          const targetClean = targetLower.replace(/[\s_.-]/g, "");

          const getList = (nodeOrList) => {
            if (!nodeOrList) return [];
            if (Array.isArray(nodeOrList)) return nodeOrList;
            if (Array.isArray(nodeOrList.children)) return nodeOrList.children;
            return [nodeOrList];
          };

          const findFolderNode = (input) => {
            const nodes = getList(input);
            for (const n of nodes) {
              if (n.type === "folder") {
                const nLower = (n.name || "").toLowerCase();
                const pLower = (n.path || "").toLowerCase();
                const nClean = nLower.replace(/[\s_.-]/g, "");
                if (
                  nLower === targetLower ||
                  pLower === targetLower ||
                  pLower.endsWith("/" + targetLower) ||
                  nClean === targetClean ||
                  nLower.includes(targetLower)
                ) {
                  return n;
                }
              }
              if (n.children) {
                const found = findFolderNode(n.children);
                if (found) return found;
              }
            }
            return null;
          };

          const matchedFolder = findFolderNode(tree);
          const targetPath = matchedFolder ? matchedFolder.path : rawFolderName;
          setSelectedTarget({ path: targetPath, type: "folder" });
          const wsKey = currentProject || currentWorkspace?._id || "ws";
          try {
            localStorage.setItem(`vocode_folder_open_${wsKey}_${targetPath}`, JSON.stringify(true));
          } catch {}
          window.dispatchEvent(
            new CustomEvent("vocode-expand-folder", {
              detail: { path: targetPath, name: rawFolderName },
            })
          );
        }
      } else if (action === "open-file") {
        let rawFileName = (payload?.name || payload?.target || "").replace(/["']/g, "").trim();
        rawFileName = rawFileName
          .replace(/\s+dot\s+/gi, ".")
          .replace(/\.\s+/g, ".")
          .replace(/\s+file$/i, "")
          .trim();

        if (tree) {
          const targetLower = rawFileName.toLowerCase();
          const targetNoExt = targetLower.replace(/\.[^.]+$/, "");
          const targetClean = targetLower.replace(/[\s_.-]/g, "");
          const targetCleanNoExt = targetNoExt.replace(/[\s_.-]/g, "");

          const getList = (nodeOrList) => {
            if (!nodeOrList) return [];
            if (Array.isArray(nodeOrList)) return nodeOrList;
            if (Array.isArray(nodeOrList.children)) return nodeOrList.children;
            return [nodeOrList];
          };

          let candidateNode = null;

          const searchNodes = (input) => {
            const nodes = getList(input);
            for (const n of nodes) {
              if (n.type === "file") {
                const nLower = (n.name || "").toLowerCase();
                const pLower = (n.path || "").toLowerCase();
                const nNoExt = nLower.replace(/\.[^.]+$/, "");
                const nClean = nLower.replace(/[\s_.-]/g, "");
                const nCleanNoExt = nNoExt.replace(/[\s_.-]/g, "");

                // Tier 1: Exact match on name or path
                if (
                  nLower === targetLower ||
                  pLower === targetLower ||
                  pLower.endsWith("/" + targetLower)
                ) {
                  candidateNode = n;
                  return true;
                }

                // Tier 2: Match without extension (e.g. "ThreeSum" -> "ThreeSum.java")
                if (nNoExt === targetNoExt || nCleanNoExt === targetCleanNoExt) {
                  candidateNode = n;
                  return true;
                }

                // Tier 3: Match ignoring spaces/underscores/hyphens
                if (nClean === targetClean) {
                  candidateNode = n;
                  return true;
                }

                // Tier 4: Partial / substring match
                if (
                  (!candidateNode && targetNoExt.length > 2 && nNoExt.includes(targetNoExt)) ||
                  (!candidateNode && nNoExt.length > 2 && targetNoExt.includes(nNoExt))
                ) {
                  candidateNode = n;
                }
              }
              if (n.children && searchNodes(n.children)) {
                return true;
              }
            }
            return false;
          };

          searchNodes(tree);

          if (candidateNode) {
            if (candidateNode.path && candidateNode.path.includes("/")) {
              const parts = candidateNode.path.split("/");
              const parentFolder = parts.slice(0, -1).join("/");
              const wsKey = currentProject || currentWorkspace?._id || "ws";
              try {
                localStorage.setItem(`vocode_folder_open_${wsKey}_${parentFolder}`, JSON.stringify(true));
              } catch {}
              window.dispatchEvent(
                new CustomEvent("vocode-expand-folder", {
                  detail: { path: parentFolder },
                })
              );
            }
            setIsExplorerOpen(true);
            openFile(candidateNode.path);
          } else if (rawFileName) {
            openFile(rawFileName);
          }
        } else if (rawFileName) {
          openFile(rawFileName);
        }
      }
    };

    window.addEventListener("vocode-voice-action", handleVoiceAction);
    return () => window.removeEventListener("vocode-voice-action", handleVoiceAction);
  }, [
    selectedTarget,
    isExplorerOpen,
    activeFile,
    workspaceId,
    accessToken,
    fileContents,
    toggleExplorer,
    handleMainRun,
    currentProject,
    currentWorkspace,
    tree,
    openFile,
    terminals,
    openNewTerminal,
    closeTab,
    deleteNode,
    applyFileChange,
    loadWorkspace,
  ]);

  // Keep activeFile synchronized in localStorage for voice AI context
  useEffect(() => {
    try {
      if (activeFile) {
        localStorage.setItem("vocode_active_file", activeFile);
      } else {
        localStorage.removeItem("vocode_active_file");
      }
    } catch {}
  }, [activeFile]);

  // Execute any pending voice command queued before landing into this workspace
  useEffect(() => {
    try {
      const pendingRaw = sessionStorage.getItem("vocode_pending_voice_action");
      if (pendingRaw) {
        sessionStorage.removeItem("vocode_pending_voice_action");
        const pending = JSON.parse(pendingRaw);
        const timer = setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("vocode-voice-action", {
              detail: pending,
            })
          );
        }, 450);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("Failed to replay pending voice command:", e);
    }
  }, [workspaceId, tree]);

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
        theme={theme}
        userName={user?.firstName || user?.name?.split(" ")[0] || user?.username || (user?.email ? user.email.split("@")[0] : null) || "Developer"}
        gitBranch="main"
        gitChangesCount={gitChangesCount}
        problemCount={problems ? problems.length : 0}
        activeLanguage={
          activeFile
            ? activeFile.split(".").pop().toUpperCase()
            : "JavaScript"
        }
        activePort={activeProjectPort}
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
          if (activeFile && workspaceId) {
            saveFile(accessToken, workspaceId, activeFile, fileContents?.[activeFile] || "")
              .catch((err) => console.warn("Save failed:", err));
          }
        }}
        onInstallAntigravity={handleInstallAntigravity}
      />
    </div>
  );
}

/* ================= WORKSPACE META LOADER ================= */

function WorkspaceLoader({ workspaceId, accessToken, routeParam }) {
  const { setCurrentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!workspaceId || !accessToken) return;

    getWorkspace(accessToken, workspaceId)
      .then((ws) => {
        setCurrentWorkspace(ws);
        if (ws?.name) {
          const slug = toWorkspaceSlug(ws.name);
          saveWorkspaceSlug(slug, workspaceId);
          if (!routeParam || isWorkspaceIdLike(routeParam) || routeParam !== slug) {
            navigate(`/workspace/${slug}`, { replace: true, state: { workspaceId } });
          }
        }
      })
      .catch(() => setCurrentWorkspace(null));
  }, [workspaceId, accessToken, routeParam, navigate, setCurrentWorkspace]);

  return null;
}

/* ================= PROVIDER WRAPPER ================= */

export default function Workspace() {
  const { id: routeParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accessToken, loading } = useAuth();

  const directId =
    location.state?.workspaceId ||
    (isWorkspaceIdLike(routeParam) ? routeParam : getWorkspaceIdForSlug(routeParam)) ||
    localStorage.getItem("vocode_recent_workspace") ||
    null;

  const [resolvedId, setResolvedId] = useState(directId);

  useEffect(() => {
    if (directId) {
      setResolvedId(directId);
      return;
    }
    if (!accessToken) return;

    listWorkspaces(accessToken)
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) {
          navigate("/dashboard", { replace: true });
          return;
        }
        const match =
          list.find((w) => toWorkspaceSlug(w.name) === routeParam) || list[0];
        const id = match._id || match.id;
        saveWorkspaceSlug(toWorkspaceSlug(match.name), id);
        setResolvedId(id);
      })
      .catch(() => navigate("/dashboard", { replace: true }));
  }, [directId, routeParam, accessToken, navigate]);

  if (loading || !resolvedId) return null;
  if (!user || !accessToken) return null;

  return (
    <WorkspaceProvider key={resolvedId} userId={user.id || user._id} workspaceId={resolvedId}>
      <AIProvider>
        <WorkspaceLoader
          workspaceId={resolvedId}
          accessToken={accessToken}
          routeParam={routeParam}
        />
        <WorkspaceLayout />
      </AIProvider>
    </WorkspaceProvider>
  );
}

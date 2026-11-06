import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  PanelsTopLeft,
  PanelBottom,
  Columns2,
  Search,
  Sun,
  Moon,
  Settings,
  Minus,
  Square,
  Copy,
  X,
  Play,
  Eye,
  ArrowLeft,
  Keyboard,
  FileCode2,
  FolderPlus,
  Save,
  Check,
  Folder,
  Command,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import "../../styles/navbar.css";

const MENU_ITEMS = [
  "File",
  "Edit",
  "Selection",
  "View",
  "Go",
  "Run",
  "Terminal",
  "Help",
];

const KEYBOARD_SHORTCUTS = [
  { label: "Quick Open File", key: "Ctrl + P" },
  { label: "Keyboard Shortcuts", key: "Ctrl + Shift + P" },
  { label: "New File", key: "Ctrl + N" },
  { label: "New Folder", key: "Ctrl + Shift + N" },
  { label: "Save Active File", key: "Ctrl + S" },
  { label: "Close Active Tab", key: "Ctrl + W" },
  { label: "Toggle Explorer Sidebar", key: "Ctrl + B" },
  { label: "Toggle Integrated Terminal", key: "Ctrl + `" },
  { label: "Global Code Search", key: "Ctrl + Shift + F" },
  { label: "Source Control (Git)", key: "Ctrl + Shift + G" },
  { label: "Run and Debug Panel", key: "Ctrl + Shift + D" },
  { label: "Run Active File", key: "F5" },
  { label: "Run Full Project", key: "Ctrl + F5" },
  { label: "Live HTML Preview", key: "Alt + P" },
  { label: "Find in File", key: "Ctrl + F" },
  { label: "Replace in File", key: "Ctrl + H" },
  { label: "Format Document", key: "Shift + Alt + F" },
  { label: "Toggle Line Comment", key: "Ctrl + /" },
  { label: "Settings & Preferences", key: "Ctrl + ," },
  { label: "Toggle Fullscreen", key: "F11" },
];

function flattenTreeFiles(nodes, parentPath = "") {
  let result = [];
  if (!nodes || !Array.isArray(nodes)) return result;
  for (const node of nodes) {
    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === "file") {
      result.push({ name: node.name, path: fullPath });
    } else if (node.type === "folder" && node.children) {
      result = result.concat(flattenTreeFiles(node.children, fullPath));
    }
  }
  return result;
}

function renderQuickFileIcon(filePath) {
  try {
    const icon = getFileIcon(filePath);
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function") {
      const IconComp = icon;
      return <IconComp size={15} />;
    }
  } catch {}
  return <FileCode2 size={15} color="#38BDF8" />;
}

export default function Navbar({
  theme,
  toggleTheme,
  isExplorerOpen,
  toggleExplorer,
  showTerminal,
  toggleTerminal,
  showAI,
  toggleAI,
  onRun,
  onToggleGit,
  onOpenExplorer,
  onOpenSearch,
  onOpenGit,
  onOpenDebug,
  onOpenSettings,
}) {
  const navigate = useNavigate();
  const {
    activeFile,
    saveFile,
    dirtyFiles,
    openTabs,
    runCode,
    runProject,
    refreshPreview,
    setCreateRequest,
    openNewTerminal,
    selectedTarget,
    closeTab,
    tree,
    openFile,
    clearTerminal,
    restartTerminal,
    activeTerminal,
  } = useWorkspace();

  const isHTML = Boolean(
    activeFile?.toLowerCase().endsWith(".html") ||
    activeFile?.toLowerCase().endsWith(".htm")
  );

  const handleRunClick = () => {
    if (isHTML) {
      refreshPreview(true);
    } else if (onRun) {
      onRun();
    } else if (activeFile) {
      runCode();
    } else {
      runProject();
    }
  };

  const [activeMenu, setActiveMenu] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const [selectedQuickIndex, setSelectedQuickIndex] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const menuBarRef = useRef(null);
  const quickInputRef = useRef(null);

  // Flatten tree for Quick Open (Ctrl+P)
  const allWorkspaceFiles = useMemo(() => {
    return flattenTreeFiles(tree);
  }, [tree]);

  const filteredQuickFiles = useMemo(() => {
    const q = quickSearchQuery.trim().toLowerCase();
    if (!q) return allWorkspaceFiles.slice(0, 30);
    return allWorkspaceFiles
      .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 30);
  }, [allWorkspaceFiles, quickSearchQuery]);

  useEffect(() => {
    setSelectedQuickIndex(0);
  }, [filteredQuickFiles]);

  useEffect(() => {
    if (showQuickOpen) {
      setTimeout(() => quickInputRef.current?.focus(), 50);
    }
  }, [showQuickOpen]);

  // Sync fullscreen state with document events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const handleMaximize = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  };

  const handleMinimize = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.warn("Minimize error:", err);
    }
  };

  // Close menu dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = (e.key || "").toLowerCase();

      // Escape: Close modals
      if (e.key === "Escape") {
        setShowQuickOpen(false);
        setShowShortcutsModal(false);
        setShowAboutModal(false);
        setActiveMenu(null);
      }

      // Ctrl+P: Quick Open File
      if (isCmdOrCtrl && key === "p" && !e.shiftKey) {
        e.preventDefault();
        setShowQuickOpen((prev) => !prev);
        return;
      }

      // Ctrl+Shift+P: Shortcuts Modal
      if (isCmdOrCtrl && e.shiftKey && key === "p") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Ctrl+S: Save
      if (isCmdOrCtrl && key === "s") {
        e.preventDefault();
        if (activeFile && saveFile) saveFile(activeFile);
        return;
      }

      // Ctrl+N: New File
      if (isCmdOrCtrl && key === "n" && !e.shiftKey) {
        e.preventDefault();
        onOpenExplorer?.();
        setCreateRequest({ type: "file", parent: selectedTarget?.path || "" });
        return;
      }

      // Ctrl+Shift+N: New Folder
      if (isCmdOrCtrl && e.shiftKey && key === "n") {
        e.preventDefault();
        onOpenExplorer?.();
        setCreateRequest({ type: "folder", parent: selectedTarget?.path || "" });
        return;
      }

      // Ctrl+`: Toggle Terminal
      if (isCmdOrCtrl && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl+B: Toggle Explorer
      if (isCmdOrCtrl && key === "b") {
        e.preventDefault();
        toggleExplorer();
        return;
      }

      // F5: Run Active File
      if (e.key === "F5") {
        e.preventDefault();
        handleRunClick();
        return;
      }

      // F11: Toggle Full Screen
      if (e.key === "F11") {
        e.preventDefault();
        handleMaximize();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, saveFile, setCreateRequest, selectedTarget, toggleTerminal, toggleExplorer, onRun, handleMaximize, onOpenExplorer]);

  const handleMenuClick = (menu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleMenuMouseEnter = (menu) => {
    if (activeMenu) {
      setActiveMenu(menu);
    }
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const dispatchEditorAction = (action) => {
    window.dispatchEvent(new CustomEvent("vocode-editor-action", { detail: { action } }));
    closeMenu();
  };

  const handleQuickOpenKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedQuickIndex((prev) => (prev + 1) % Math.max(1, filteredQuickFiles.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedQuickIndex((prev) => (prev - 1 + filteredQuickFiles.length) % Math.max(1, filteredQuickFiles.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredQuickFiles[selectedQuickIndex]) {
        openFile(filteredQuickFiles[selectedQuickIndex].path);
        setShowQuickOpen(false);
        setQuickSearchQuery("");
      }
    } else if (e.key === "Escape") {
      setShowQuickOpen(false);
      setQuickSearchQuery("");
    }
  };

  return (
    <header className="ide-navbar" aria-label="Desktop IDE Navigation Bar">
      {/* 1. LEFT: VOCODEAI LOGO & 8 DESKTOP MENUS */}
      <div className="ide-nav-left" ref={menuBarRef}>
        <button
          type="button"
          className="dash-back-arrow-btn ide-nav-back-btn"
          onClick={() => navigate("/dashboard")}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={15} />
        </button>
        <div
          className="ide-brand-wrap"
          onClick={() => navigate("/dashboard")}
          title="Back to Dashboard"
        >
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai Logo"
            className="ide-brand-logo-img"
          />
        </div>

        {/* 8 Desktop Menus */}
        <nav className="ide-desktop-menubar">
          {MENU_ITEMS.map((menu) => (
            <div key={menu} className="ide-menu-wrapper">
              <button
                className={`ide-menu-trigger ${activeMenu === menu ? "open" : ""}`}
                onClick={() => handleMenuClick(menu)}
                onMouseEnter={() => handleMenuMouseEnter(menu)}
                aria-expanded={activeMenu === menu}
              >
                {menu}
              </button>

              {activeMenu === menu && (
                <div className="ide-menu-dropdown">
                  {/* ===== FILE MENU ===== */}
                  {menu === "File" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          onOpenExplorer?.();
                          setCreateRequest({
                            type: "file",
                            parent: selectedTarget?.path || "",
                          });
                        }}
                      >
                        <span>New File</span>
                        <kbd>Ctrl+N</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          onOpenExplorer?.();
                          setCreateRequest({
                            type: "folder",
                            parent: selectedTarget?.path || "",
                          });
                        }}
                      >
                        <span>New Folder</span>
                        <kbd>Ctrl+Shift+N</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          setShowQuickOpen(true);
                        }}
                      >
                        <span>Quick Open File...</span>
                        <kbd>Ctrl+P</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (activeFile && saveFile) saveFile(activeFile);
                        }}
                        disabled={!activeFile}
                      >
                        <span>Save</span>
                        <kbd>Ctrl+S</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          dirtyFiles?.forEach((f) => saveFile?.(f));
                        }}
                        disabled={!dirtyFiles || dirtyFiles.length === 0}
                      >
                        <span>Save All</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (activeFile && closeTab) closeTab(activeFile);
                        }}
                        disabled={!activeFile}
                      >
                        <span>Close Tab</span>
                        <kbd>Ctrl+W</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (openTabs) {
                            [...openTabs].forEach((t) => closeTab?.(t.name || t));
                          }
                        }}
                        disabled={!openTabs || openTabs.length === 0}
                      >
                        <span>Close All Tabs</span>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenSettings) onOpenSettings();
                          else navigate("/dashboard");
                        }}
                      >
                        <span>Preferences / Settings</span>
                        <kbd>Ctrl+,</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          navigate("/dashboard");
                        }}
                      >
                        <span>Go to Dashboard</span>
                        <kbd>Ctrl+H</kbd>
                      </button>
                    </>
                  )}

                  {/* ===== EDIT MENU ===== */}
                  {menu === "Edit" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("undo")}
                      >
                        <span>Undo</span>
                        <kbd>Ctrl+Z</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("redo")}
                      >
                        <span>Redo</span>
                        <kbd>Ctrl+Y</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("cut")}
                      >
                        <span>Cut</span>
                        <kbd>Ctrl+X</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("copy")}
                      >
                        <span>Copy</span>
                        <kbd>Ctrl+C</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("paste")}
                      >
                        <span>Paste</span>
                        <kbd>Ctrl+V</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("find")}
                      >
                        <span>Find in File</span>
                        <kbd>Ctrl+F</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("replace")}
                      >
                        <span>Replace in File</span>
                        <kbd>Ctrl+H</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("format")}
                      >
                        <span>Format Document</span>
                        <kbd>Shift+Alt+F</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("comment")}
                      >
                        <span>Toggle Line Comment</span>
                        <kbd>Ctrl+/</kbd>
                      </button>
                    </>
                  )}

                  {/* ===== SELECTION MENU ===== */}
                  {menu === "Selection" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("selectAll")}
                      >
                        <span>Select All</span>
                        <kbd>Ctrl+A</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("expandSelection")}
                      >
                        <span>Expand Selection</span>
                        <kbd>Alt+Shift+Right</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("shrinkSelection")}
                      >
                        <span>Shrink Selection</span>
                        <kbd>Alt+Shift+Left</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("copyLineDown")}
                      >
                        <span>Copy Line Down</span>
                        <kbd>Alt+Shift+Down</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("copyLineUp")}
                      >
                        <span>Copy Line Up</span>
                        <kbd>Alt+Shift+Up</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("moveLineDown")}
                      >
                        <span>Move Line Down</span>
                        <kbd>Alt+Down</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("moveLineUp")}
                      >
                        <span>Move Line Up</span>
                        <kbd>Alt+Up</kbd>
                      </button>
                    </>
                  )}

                  {/* ===== VIEW MENU ===== */}
                  {menu === "View" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenExplorer) onOpenExplorer();
                          else toggleExplorer();
                        }}
                      >
                        <span>File Explorer</span>
                        <kbd>Ctrl+Shift+E</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenSearch) onOpenSearch();
                        }}
                      >
                        <span>Global Search</span>
                        <kbd>Ctrl+Shift+F</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenGit) onOpenGit();
                          else if (onToggleGit) onToggleGit();
                        }}
                      >
                        <span>Source Control (Git)</span>
                        <kbd>Ctrl+Shift+G</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenDebug) onOpenDebug();
                        }}
                      >
                        <span>Run & Debug</span>
                        <kbd>Ctrl+Shift+D</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleTerminal();
                        }}
                      >
                        <span>Toggle Terminal Panel</span>
                        <kbd>Ctrl+`</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleAI();
                        }}
                      >
                        <span>Toggle AI Assistant</span>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenSettings) onOpenSettings();
                          else navigate("/dashboard");
                        }}
                      >
                        <span>Settings</span>
                        <kbd>Ctrl+,</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleTheme();
                        }}
                      >
                        <span>Toggle Theme ({theme === "dark" ? "Light" : "Dark"})</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          handleMaximize();
                        }}
                      >
                        <span>{isFullscreen ? "Exit Full Screen" : "Toggle Full Screen"}</span>
                        <kbd>F11</kbd>
                      </button>
                    </>
                  )}

                  {/* ===== GO MENU ===== */}
                  {menu === "Go" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          setShowQuickOpen(true);
                        }}
                      >
                        <span>Go to File...</span>
                        <kbd>Ctrl+P</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("gotoLine")}
                      >
                        <span>Go to Line...</span>
                        <kbd>Ctrl+G</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => dispatchEditorAction("find")}
                      >
                        <span>Go to Symbol...</span>
                        <kbd>Ctrl+Shift+O</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenExplorer) onOpenExplorer();
                          else toggleExplorer();
                        }}
                      >
                        <span>Switch to File Explorer</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenGit) onOpenGit();
                        }}
                      >
                        <span>Switch to Source Control</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (onOpenSearch) onOpenSearch();
                        }}
                      >
                        <span>Switch to Global Search</span>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          navigate("/dashboard");
                        }}
                      >
                        <span>Back to Dashboard</span>
                      </button>
                    </>
                  )}

                  {/* ===== RUN MENU ===== */}
                  {menu === "Run" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          handleRunClick();
                        }}
                      >
                        <span>Run Active File</span>
                        <kbd>F5</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          runProject();
                        }}
                      >
                        <span>Run Full Project</span>
                        <kbd>Ctrl+F5</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          refreshPreview(true);
                        }}
                      >
                        <span>Live Preview (HTML)</span>
                        <kbd>Alt+P</kbd>
                      </button>
                    </>
                  )}

                  {/* ===== TERMINAL MENU ===== */}
                  {menu === "Terminal" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          openNewTerminal("bash");
                        }}
                      >
                        <span>New Terminal (Bash)</span>
                        <kbd>Ctrl+Shift+`</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleTerminal();
                        }}
                      >
                        <span>Toggle Terminal Panel</span>
                        <kbd>Ctrl+`</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (activeTerminal && clearTerminal) {
                            clearTerminal(activeTerminal);
                          }
                        }}
                      >
                        <span>Clear Terminal Screen</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (activeTerminal && restartTerminal) {
                            restartTerminal(activeTerminal);
                          }
                        }}
                      >
                        <span>Restart Terminal Session</span>
                      </button>
                    </>
                  )}

                  {/* ===== HELP MENU ===== */}
                  {menu === "Help" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          window.open("/docs", "_blank");
                        }}
                      >
                        <span>Documentation</span>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          setShowShortcutsModal(true);
                        }}
                      >
                        <span>Keyboard Shortcuts</span>
                        <kbd>Ctrl+Shift+P</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          if (!showAI) toggleAI();
                        }}
                      >
                        <span>AI Assistant Prompt</span>
                      </button>
                      <div className="ide-menu-divider" />
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          setShowAboutModal(true);
                        }}
                      >
                        <span>About Vocodeai IDE</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* 2. CENTER: APPLICATION TITLE */}
      <div className="ide-nav-center">
        <span className="ide-app-title">Vocodeai IDE</span>
      </div>

      {/* 3. RIGHT: TOOLBAR CONTROLS & WINDOW BUTTONS */}
      <div className="ide-nav-right">
        {/* Prominent Run or Preview Button */}
        <button
          type="button"
          className={`ide-nav-run-btn ${isHTML ? "preview-btn" : ""}`}
          onClick={handleRunClick}
          disabled={!activeFile}
          title={
            activeFile
              ? isHTML
                ? `Preview ${activeFile} on next page (Alt+P)`
                : `Run ${activeFile} (F5)`
              : "Open a file to run (F5)"
          }
          aria-label={isHTML ? "Preview HTML" : "Run File"}
        >
          {isHTML ? (
            <>
              <Eye size={13} strokeWidth={2.2} />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" strokeWidth={0} />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Layout Panel Toggles */}
        <div className="ide-panel-controls">
          <button
            className={`ide-nav-icon-btn ${showAI ? "active" : ""}`}
            onClick={toggleAI}
            title="Toggle AI Assistant (Right Panel)"
            aria-label="Toggle AI Assistant"
          >
            <PanelsTopLeft size={16} strokeWidth={1.7} />
          </button>

          <button
            className={`ide-nav-icon-btn ${showTerminal ? "active" : ""}`}
            onClick={toggleTerminal}
            title="Toggle Integrated Terminal (Bottom Panel)"
            aria-label="Toggle Terminal"
          >
            <PanelBottom size={16} strokeWidth={1.7} />
          </button>

          <button
            className={`ide-nav-icon-btn ${isExplorerOpen ? "active" : ""}`}
            onClick={toggleExplorer}
            title="Toggle Explorer Sidebar (Left Panel)"
            aria-label="Toggle Explorer"
          >
            <Columns2 size={16} strokeWidth={1.7} />
          </button>
        </div>

        {/* Search Icon (Triggers Quick Open) */}
        <button
          className="ide-nav-icon-btn"
          onClick={() => setShowQuickOpen(true)}
          title="Quick Open File (Ctrl+P)"
          aria-label="Quick Open File"
        >
          <Search size={16} strokeWidth={1.7} />
        </button>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          className="ide-nav-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun size={16} strokeWidth={1.7} />
          ) : (
            <Moon size={16} strokeWidth={1.7} />
          )}
        </button>

        {/* Settings Icon */}
        <button
          className="ide-nav-icon-btn"
          onClick={() => {
            if (onOpenSettings) onOpenSettings();
            else navigate("/dashboard");
          }}
          title="Settings & Preferences (Ctrl+,)"
          aria-label="Settings"
        >
          <Settings size={16} strokeWidth={1.7} />
        </button>

        {/* Window Controls: Minimize, Maximize, Close */}
        <div className="ide-window-controls" aria-label="Window controls">
          <button
            className="ide-win-btn win-min"
            title={isFullscreen ? "Restore to original position" : "Minimize to Dashboard"}
            aria-label={isFullscreen ? "Restore to original position" : "Minimize to Dashboard"}
            onClick={handleMinimize}
          >
            <Minus size={13} strokeWidth={2} />
          </button>
          <button
            className="ide-win-btn win-max"
            title={isFullscreen ? "Restore (Original Position)" : "Maximize (Full Screen)"}
            aria-label={isFullscreen ? "Restore (Original Position)" : "Maximize (Full Screen)"}
            onClick={handleMaximize}
          >
            {isFullscreen ? (
              <Copy size={11} strokeWidth={2} />
            ) : (
              <Square size={11} strokeWidth={2} />
            )}
          </button>
          <button
            className="ide-win-btn win-close"
            title="Close"
            aria-label="Close"
            onClick={() => navigate("/dashboard")}
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* QUICK OPEN MODAL (Ctrl+P) */}
      {showQuickOpen && createPortal(
        <div className="ide-quickopen-overlay" onClick={() => setShowQuickOpen(false)}>
          <div className="ide-quickopen-card" onClick={(e) => e.stopPropagation()}>
            <div className="ide-quickopen-input-row">
              <Search size={16} color="#2BD87F" />
              <input
                ref={quickInputRef}
                type="text"
                className="ide-quickopen-input"
                placeholder="Search file by name or path..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                onKeyDown={handleQuickOpenKeyDown}
              />
              <span style={{ fontSize: "11px", color: "var(--nav-text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                ESC to close
              </span>
            </div>

            <div className="ide-quickopen-list">
              {filteredQuickFiles.length === 0 ? (
                <div className="ide-quickopen-empty">No matching files in workspace</div>
              ) : (
                filteredQuickFiles.map((file, idx) => (
                  <div
                    key={file.path}
                    className={`ide-quickopen-item ${idx === selectedQuickIndex ? "selected" : ""}`}
                    onClick={() => {
                      openFile(file.path);
                      setShowQuickOpen(false);
                      setQuickSearchQuery("");
                    }}
                    onMouseEnter={() => setSelectedQuickIndex(idx)}
                  >
                    <div className="ide-quickopen-left">
                      {renderQuickFileIcon(file.path)}
                      <span className="ide-quickopen-filename">{file.name}</span>
                    </div>
                    <span className="ide-quickopen-path">{file.path}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* KEYBOARD SHORTCUTS MODAL (Ctrl+Shift+P) */}
      {showShortcutsModal && createPortal(
        <div className="sc-modal-overlay" onClick={() => setShowShortcutsModal(false)}>
          <div className="ide-shortcuts-card" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-header-left">
                <div className="sc-modal-icon-wrap">
                  <Keyboard size={18} color="#2BD87F" />
                </div>
                <div>
                  <h3 className="sc-modal-title-text">Keyboard Shortcuts</h3>
                  <p className="sc-modal-subtitle">Essential keystrokes for high-speed development in VocodeAI</p>
                </div>
              </div>
              <button className="sc-modal-close" onClick={() => setShowShortcutsModal(false)} title="Close">
                <X size={15} />
              </button>
            </div>

            <div className="ide-shortcuts-grid">
              {KEYBOARD_SHORTCUTS.map((item) => (
                <div key={item.label} className="ide-shortcut-row">
                  <span>{item.label}</span>
                  <kbd>{item.key}</kbd>
                </div>
              ))}
            </div>

            <div className="sc-modal-footer">
              <button
                type="button"
                className="sc-modal-btn-cancel"
                onClick={() => setShowShortcutsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ABOUT MODAL */}
      {showAboutModal && createPortal(
        <div className="sc-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div
            className="sc-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", textAlign: "center", alignItems: "center" }}
          >
            <div style={{ marginBottom: "12px" }}>
              <img
                src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                alt="Vocodeai Logo"
                style={{ height: "42px", objectFit: "contain" }}
              />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0", color: "#FFFFFF" }}>
              VocodeAI Cloud IDE
            </h3>
            <span style={{ fontSize: "12px", color: "#2BD87F", fontWeight: "600", padding: "3px 10px", background: "rgba(43,216,127,0.12)", borderRadius: "6px" }}>
              v2.4.0 Production Release
            </span>
            <p style={{ fontSize: "13px", color: "#8EAD9E", margin: "16px 0 24px 0", lineHeight: "1.6" }}>
              Next-generation autonomous coding studio with Monaco Editor, deep Git & GitHub synchronization, cloud terminal execution, and multimodal AI pair programming.
            </p>
            <button
              className="sc-modal-btn-primary"
              onClick={() => setShowAboutModal(false)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

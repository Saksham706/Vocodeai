import { useState, useRef, useEffect } from "react";
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
  FolderPlus,
  FilePlus2,
  Save,
  Play,
  Eye,
  RotateCw,
  Terminal as TerminalIcon,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
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
}) {
  const navigate = useNavigate();
  const {
    activeFile,
    saveFile,
    runCode,
    runProject,
    refreshPreview,
    setCreateRequest,
    openNewTerminal,
    selectedTarget,
    closeTab,
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
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const menuBarRef = useRef(null);

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
        // Return back to original position
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
      // Ctrl+S / Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeFile && saveFile) saveFile(activeFile);
      }
      // Ctrl+N / Cmd+N: New File
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setCreateRequest({ type: "file", parent: selectedTarget?.path || "" });
      }
      // Ctrl+` / Cmd+`: Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
      }
      // Ctrl+B / Cmd+B: Toggle Explorer
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleExplorer();
      }
      // F5: Run Active File
      if (e.key === "F5") {
        e.preventDefault();
        handleRunClick();
      }
      // F11: Toggle Full Screen
      if (e.key === "F11") {
        e.preventDefault();
        handleMaximize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, saveFile, setCreateRequest, selectedTarget, toggleTerminal, toggleExplorer, onRun, handleMaximize]);

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

  return (
    <header className="ide-navbar" aria-label="Desktop IDE Navigation Bar">
      {/* 1. LEFT: VOCODEAI LOGO & 8 DESKTOP MENUS */}
      <div className="ide-nav-left" ref={menuBarRef}>
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
                  {menu === "File" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
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
                          setCreateRequest({
                            type: "folder",
                            parent: selectedTarget?.path || "",
                          });
                        }}
                      >
                        <span>New Folder</span>
                        <kbd>Ctrl+Shift+N</kbd>
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
                          if (activeFile && closeTab) closeTab(activeFile);
                        }}
                        disabled={!activeFile}
                      >
                        <span>Close Tab</span>
                        <kbd>Ctrl+W</kbd>
                      </button>
                      <div className="ide-menu-divider" />
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

                  {menu === "Edit" && (
                    <>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Undo</span>
                        <kbd>Ctrl+Z</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Redo</span>
                        <kbd>Ctrl+Y</kbd>
                      </button>
                      <div className="ide-menu-divider" />
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Cut</span>
                        <kbd>Ctrl+X</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Copy</span>
                        <kbd>Ctrl+C</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Paste</span>
                        <kbd>Ctrl+V</kbd>
                      </button>
                    </>
                  )}

                  {menu === "Selection" && (
                    <>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Select All</span>
                        <kbd>Ctrl+A</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Expand Selection</span>
                        <kbd>Alt+Shift+Right</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Shrink Selection</span>
                        <kbd>Alt+Shift+Left</kbd>
                      </button>
                    </>
                  )}

                  {menu === "View" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleExplorer();
                        }}
                      >
                        <span>Toggle Explorer</span>
                        <kbd>Ctrl+B</kbd>
                      </button>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          toggleTerminal();
                        }}
                      >
                        <span>Toggle Terminal</span>
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

                  {menu === "Go" && (
                    <>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Go to File...</span>
                        <kbd>Ctrl+P</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Go to Symbol...</span>
                        <kbd>Ctrl+Shift+O</kbd>
                      </button>
                      <button className="ide-menu-entry" onClick={closeMenu}>
                        <span>Go to Line...</span>
                        <kbd>Ctrl+G</kbd>
                      </button>
                    </>
                  )}

                  {menu === "Run" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          runCode();
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
                          refreshPreview();
                        }}
                      >
                        <span>Live Preview (HTML)</span>
                      </button>
                    </>
                  )}

                  {menu === "Terminal" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          openNewTerminal("bash");
                        }}
                      >
                        <span>New Terminal</span>
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
                    </>
                  )}

                  {menu === "Help" && (
                    <>
                      <button
                        className="ide-menu-entry"
                        onClick={() => {
                          closeMenu();
                          window.open("https://github.com", "_blank");
                        }}
                      >
                        <span>Documentation</span>
                      </button>
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

        {/* Search Icon */}
        <button
          className="ide-nav-icon-btn"
          title="Search Workspace (Ctrl+P)"
          aria-label="Search Workspace"
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
          onClick={() => navigate("/dashboard")}
          title="Settings / Dashboard"
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

      {/* About Modal */}
      {showAboutModal && (
        <div
          className="dash-modal-overlay"
          onClick={() => setShowAboutModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="dash-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", textAlign: "center", padding: "28px 24px" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <img src="/javalogo.png" alt="VocodeAI" style={{ width: "52px", height: "52px", borderRadius: "12px" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-primary)" }}>
              VocodeAI Cloud IDE
            </h3>
            <span style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: "600", padding: "2px 8px", background: "rgba(255,155,61,0.12)", borderRadius: "6px" }}>
              v1.2.0 Production
            </span>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "16px 0 24px 0", lineHeight: "1.6" }}>
              Autonomous AI-Powered Cloud IDE with Multimodal Vision, Docker execution, and Office document viewers.
            </p>
            <button
              className="dash-modal-btn-primary"
              onClick={() => setShowAboutModal(false)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

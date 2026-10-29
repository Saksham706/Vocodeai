import { useState, useRef, useEffect } from "react";
import {
  SquareTerminal,
  Terminal as TerminalIcon,
  Plus,
  Columns2,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import "../../styles/terminal.css";

const SHELL_OPTIONS = ["bash", "sh", "zsh", "node"];

export default function TerminalTabs({
  activeTab = "terminal",
  setActiveTab,
  onNewTerminal,
  onSplitTerminal,
  onClearTerminal,
  onToggleMaximize,
  isMaximized = false,
  isSplit = false,
  onClosePanel,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCloseSession,
  onAddSession,
  problemCount = 0,
}) {
  const [shellMenuOpen, setShellMenuOpen] = useState(false);
  const [selectedShell, setSelectedShell] = useState("bash");
  const shellMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shellMenuRef.current && !shellMenuRef.current.contains(e.target)) {
        setShellMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="terminal-header-container">
      {/* ================= ROW 1: HEADER TOOLBAR ================= */}
      <div className="terminal-toolbar-row">
        {/* LEFT PANEL MODE TABS */}
        <div className="terminal-mode-tabs">
          <button
            type="button"
            className={`term-mode-tab ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => setActiveTab("terminal")}
          >
            <SquareTerminal size={14} className="term-mode-icon" />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            className={`term-mode-tab ${activeTab === "output" ? "active" : ""}`}
            onClick={() => setActiveTab("output")}
          >
            <span>Output</span>
          </button>

          <button
            type="button"
            className={`term-mode-tab ${activeTab === "problems" ? "active" : ""}`}
            onClick={() => setActiveTab("problems")}
          >
            <span>Problems</span>
            <span
              className={`term-problems-badge ${problemCount > 0 ? "has-problems" : ""}`}
            >
              {problemCount}
            </span>
          </button>

          <button
            type="button"
            className={`term-mode-tab ${activeTab === "debug" ? "active" : ""}`}
            onClick={() => setActiveTab("debug")}
          >
            <span>Debug Console</span>
          </button>
        </div>

        {/* RIGHT ACTION CONTROLS */}
        <div className="terminal-actions-bar">
          {/* Shell Selector Dropdown */}
          <div className="term-shell-menu-wrap" ref={shellMenuRef}>
            <button
              type="button"
              className="term-shell-select-btn"
              onClick={() => setShellMenuOpen((prev) => !prev)}
              aria-label="Select Shell"
            >
              <span className="term-shell-glyph">&gt;_</span>
              <span className="term-shell-label">{selectedShell}</span>
              <ChevronDown size={13} className="term-chevron" />
            </button>

            {shellMenuOpen && (
              <div className="term-shell-popover">
                {SHELL_OPTIONS.map((sh) => (
                  <div
                    key={sh}
                    className={`term-shell-option ${sh === selectedShell ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedShell(sh);
                      setShellMenuOpen(false);
                      onAddSession?.(sh);
                    }}
                  >
                    <span>{sh}</span>
                    {sh === selectedShell && <Check size={12} className="check-icon" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Terminal (+) */}
          <div className="term-btn-tooltip-wrapper">
            <button
              type="button"
              className="term-tool-icon-btn"
              onClick={() => (onAddSession ? onAddSession(selectedShell || "bash") : onNewTerminal?.())}
              aria-label="New Terminal"
            >
              <Plus size={14} />
            </button>
            <span className="term-hover-tooltip">New Terminal</span>
          </div>

          {/* Split Terminal ([|]) */}
          <div className="term-btn-tooltip-wrapper">
            <button
              type="button"
              className={`term-tool-icon-btn ${isSplit ? "active" : ""}`}
              onClick={onSplitTerminal}
              aria-label="Split Terminal"
            >
              <Columns2 size={14} />
            </button>
            <span className="term-hover-tooltip">
              {isSplit ? "Unsplit Terminal" : "Split Terminal"}
            </span>
          </div>

          {/* Kill Terminal (Trash) */}
          <div className="term-btn-tooltip-wrapper">
            <button
              type="button"
              className="term-tool-icon-btn"
              onClick={onClearTerminal}
              aria-label="Kill Terminal"
            >
              <Trash2 size={14} />
            </button>
            <span className="term-hover-tooltip">Kill Terminal</span>
          </div>

          {/* Maximize / Restore */}
          <div className="term-btn-tooltip-wrapper">
            <button
              type="button"
              className="term-tool-icon-btn"
              onClick={onToggleMaximize}
              aria-label={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <span className="term-hover-tooltip">
              {isMaximized ? "Restore" : "Maximize"}
            </span>
          </div>

          {/* Close Panel (X) */}
          <div className="term-btn-tooltip-wrapper">
            <button
              type="button"
              className="term-tool-icon-btn"
              onClick={onClosePanel}
              aria-label="Close Terminal Panel"
            >
              <X size={14} />
            </button>
            <span className="term-hover-tooltip">Close Panel</span>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: SESSION TABS BAR ================= */}
      {activeTab === "terminal" && (
        <div className="terminal-sessions-bar">
          <div className="term-sessions-list">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`term-session-tab ${isActive ? "active" : ""}`}
                  onClick={() => onSelectSession?.(session.id)}
                >
                  <span
                    className={`term-session-dot ${session.dot || "accent"}`}
                  />
                  <span className="term-session-name">{session.label}</span>
                  <button
                    type="button"
                    className="term-session-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseSession?.(session.id);
                    }}
                    aria-label={`Close ${session.label} session`}
                  >
                    <X size={11} />
                  </button>
                </div>
              );
            })}

            {/* Add Session Tab (+) */}
            <button
              type="button"
              className="term-session-add-btn"
              onClick={() => onAddSession && onAddSession(selectedShell || "bash")}
              title="Add Terminal Session"
              aria-label="Add Terminal Session"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

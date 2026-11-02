import React, { useState } from "react";
import {
  Play,
  RotateCw,
  RotateCcw,
  Trash2,
  FileCode2,
  Terminal,
  FolderSync,
  ChevronRight,
  ChevronDown,
  Plus,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import "../../styles/sidebar.css";
import "../../styles/rundebug.css";

export default function RunDebugPanel({ onRun, onClearTerminal, onRestartTerminal, onKillTerminal }) {
  const {
    activeFile,
    terminals,
    activeTerminal,
    runCode,
    runProject,
    currentWorkspace,
    openNewTerminal,
  } = useWorkspace();

  const [watchExpressions, setWatchExpressions] = useState([]);
  const [newWatchInput, setNewWatchInput] = useState("");
  const [isAddingWatch, setIsAddingWatch] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState(new Set());

  const toggleSection = (section) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleAddWatch = (e) => {
    e.preventDefault();
    if (!newWatchInput.trim()) return;
    setWatchExpressions((prev) => [...prev, newWatchInput.trim()]);
    setNewWatchInput("");
    setIsAddingWatch(false);
  };

  // Determine language runtime for active file
  let runtimeName = "General Shell";
  let runnerCommand = "";
  if (activeFile) {
    if (activeFile.endsWith(".java")) {
      runtimeName = "Java OpenJDK 21";
      const parts = activeFile.split("/");
      const cls = parts.pop().replace(".java", "");
      runnerCommand = `javac "${activeFile}" && java -cp "." ${cls}`;
    } else if (activeFile.endsWith(".py")) {
      runtimeName = "Python 3.11";
      runnerCommand = `python3 "${activeFile}"`;
    } else if (activeFile.endsWith(".js") || activeFile.endsWith(".mjs")) {
      runtimeName = "Node.js v20";
      runnerCommand = `node "${activeFile}"`;
    } else if (activeFile.endsWith(".cpp") || activeFile.endsWith(".cc")) {
      runtimeName = "C++ (G++ Compiler)";
      runnerCommand = `g++ "${activeFile}" -o a.out && ./a.out`;
    } else if (activeFile.endsWith(".c")) {
      runtimeName = "C (GCC Compiler)";
      runnerCommand = `gcc "${activeFile}" -o a.out && ./a.out`;
    } else if (activeFile.endsWith(".html") || activeFile.endsWith(".htm")) {
      runtimeName = "HTML Live Preview";
      runnerCommand = "Live Web Previewer";
    }
  }

  const baseFileName = activeFile ? activeFile.split("/").pop() : null;

  return (
    <aside className="ide-sidebar run-debug-sidebar" aria-label="Run and Debug">
      {/* 1. Header */}
      <div className="sidebar-explorer-header">
        <span className="explorer-header-title">RUN AND DEBUG</span>
      </div>

      {/* 2. Top Primary Action Buttons */}
      <div className="run-debug-actions-card">
        {/* Main "Run Active File" Button */}
        <button
          type="button"
          className="run-primary-btn"
          onClick={() => (onRun ? onRun() : runCode())}
          title={baseFileName ? `Execute ${baseFileName}` : "Run Code in Terminal"}
        >
          <Play size={16} className="run-btn-icon" fill="currentColor" />
          <div className="run-btn-text">
            <span className="run-btn-title">
              {baseFileName ? `Run ${baseFileName}` : "Run Active Code"}
            </span>
            <span className="run-btn-subtitle">{runtimeName}</span>
          </div>
        </button>

        {/* Run Full Project Button */}
        <button
          type="button"
          className="run-secondary-btn"
          onClick={() => runProject()}
          title="Detect entrypoint and run full project"
        >
          <FolderSync size={14} />
          <span>Run Full Project</span>
        </button>

        {/* Quick Session Controls */}
        <div className="run-controls-bar">
          <button
            type="button"
            className="run-control-btn"
            onClick={onClearTerminal}
            title="Clear Terminal Output"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
          <button
            type="button"
            className="run-control-btn"
            onClick={onRestartTerminal}
            title="Restart Active Terminal Session"
          >
            <RotateCw size={13} />
            <span>Restart</span>
          </button>
          <button
            type="button"
            className="run-control-btn danger"
            onClick={onKillTerminal}
            title="Kill Terminal Session"
          >
            <Trash2 size={13} />
            <span>Kill</span>
          </button>
        </div>
      </div>

      {/* 3. Target Environment & Command Preview */}
      {activeFile && (
        <div className="run-config-preview">
          <div className="run-preview-label">
            <Cpu size={12} />
            <span>ACTIVE RUNTIME</span>
          </div>
          <div className="run-preview-item">
            <span className="run-preview-key">File:</span>
            <span className="run-preview-val">{activeFile}</span>
          </div>
          <div className="run-preview-item">
            <span className="run-preview-key">Env:</span>
            <span className="run-preview-val highlight">{runtimeName}</span>
          </div>
          {runnerCommand && (
            <div className="run-command-box">
              <code>$ {runnerCommand}</code>
            </div>
          )}
        </div>
      )}

      {/* 4. VS Code Accordions: Watch, Variables, Breakpoints */}
      <div className="run-accordions-container">
        {/* WATCH SECTION */}
        <div className="run-accordion-group">
          <div
            className="run-accordion-header"
            onClick={() => toggleSection("watch")}
          >
            <span className="run-accordion-chevron">
              {collapsedSections.has("watch") ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            <span className="run-accordion-title">WATCH</span>
            <button
              type="button"
              className="run-accordion-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingWatch(true);
              }}
              title="Add Expression"
            >
              <Plus size={12} />
            </button>
          </div>

          {!collapsedSections.has("watch") && (
            <div className="run-accordion-content">
              {isAddingWatch && (
                <form onSubmit={handleAddWatch} className="run-watch-add-form">
                  <input
                    type="text"
                    className="run-watch-input"
                    placeholder="Expression to watch..."
                    value={newWatchInput}
                    onChange={(e) => setNewWatchInput(e.target.value)}
                    autoFocus
                    onBlur={() => setIsAddingWatch(false)}
                  />
                </form>
              )}
              {watchExpressions.length > 0 ? (
                watchExpressions.map((expr, idx) => (
                  <div key={idx} className="run-watch-item">
                    <span className="run-watch-expr">{expr}:</span>
                    <span className="run-watch-val">not available</span>
                  </div>
                ))
              ) : (
                <span className="run-empty-msg">No watch expressions evaluated.</span>
              )}
            </div>
          )}
        </div>

        {/* VARIABLES SECTION */}
        <div className="run-accordion-group">
          <div
            className="run-accordion-header"
            onClick={() => toggleSection("variables")}
          >
            <span className="run-accordion-chevron">
              {collapsedSections.has("variables") ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            <span className="run-accordion-title">VARIABLES</span>
          </div>
          {!collapsedSections.has("variables") && (
            <div className="run-accordion-content">
              <span className="run-empty-msg">No active debug session variables.</span>
            </div>
          )}
        </div>

        {/* BREAKPOINTS SECTION */}
        <div className="run-accordion-group">
          <div
            className="run-accordion-header"
            onClick={() => toggleSection("breakpoints")}
          >
            <span className="run-accordion-chevron">
              {collapsedSections.has("breakpoints") ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </span>
            <span className="run-accordion-title">BREAKPOINTS</span>
          </div>
          {!collapsedSections.has("breakpoints") && (
            <div className="run-accordion-content">
              <div className="run-bp-item">
                <CheckCircle2 size={12} className="bp-check" />
                <span>Uncaught Exceptions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}


import React, { useEffect, useRef, useState, useCallback } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";
import {
  SquareTerminal,
  Plus,
  Trash2,
  RotateCw,
  Maximize2,
  Minimize2,
  FolderCode,
  ExternalLink,
  ChevronDown,
  Terminal as TerminalIcon,
  Cpu,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import { DEFAULT_SETTINGS } from "../../config/defaultSettings";
import "../../styles/cloudterminal.css";

const QUICK_COMMANDS = [
  { label: "ls -la", cmd: "ls -la\r" },
  { label: "pwd", cmd: "pwd\r" },
  { label: "node -v", cmd: "node -v\r" },
  { label: "python3 --version", cmd: "python3 --version || python --version\r" },
  { label: "git --version", cmd: "git --version\r" },
  { label: "java --version", cmd: "java --version\r" },
  { label: "whoami", cmd: "whoami\r" },
];

export default function CloudTerminalView({
  theme = "dark",
  workspaces = [],
  onNavigateToWorkspace,
}) {
  const { accessToken, user } = useAuth();

  // Environment State
  const [selectedEnv, setSelectedEnv] = useState(() => {
    if (workspaces && workspaces.length > 0) {
      return workspaces[0]._id;
    }
    return "cloud-sandbox";
  });

  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // 'connected' | 'connecting' | 'disconnected'
  const [activeSessionId, setActiveSessionId] = useState("cloud_main_1");
  const [sessions, setSessions] = useState([
    { id: "cloud_main_1", title: "bash", shell: "bash" },
  ]);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Refs
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const activeSessionRef = useRef(activeSessionId);
  activeSessionRef.current = activeSessionId;
  const selectedEnvRef = useRef(selectedEnv);
  selectedEnvRef.current = selectedEnv;

  const currentWorkspace = workspaces.find((w) => w._id === selectedEnv);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsEnvDropdownOpen(false);
      }
    };
    if (isEnvDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isEnvDropdownOpen]);

  // Send input helper
  const sendInput = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "input",
          terminalId: activeSessionRef.current,
          data,
        })
      );
    }
  }, []);

  // UNIFIED TERMINAL & WEBSOCKET LIFECYCLE
  useEffect(() => {
    if (!containerRef.current) return;

    // Detect theme
    const isLight =
      theme === "light" ||
      document.documentElement.getAttribute("data-theme") === "light";

    const termSettings =
      getEffectiveSettings()?.["terminal.integrated"] ||
      DEFAULT_SETTINGS["terminal.integrated"] ||
      {};

    // 1. Create Terminal
    const term = new Terminal({
      theme: isLight
        ? {
            background: "#ffffff",
            foreground: "#111827",
            cursor: "#FF8B32",
            cursorAccent: "#ffffff",
            selectionBackground: "rgba(255, 139, 50, 0.28)",
            black: "#111827",
            red: "#E53E3E",
            green: "#2E8540",
            yellow: "#B7791F",
            blue: "#2B6CB0",
            magenta: "#6B46C1",
            cyan: "#2C7A7B",
            white: "#718096",
            brightBlack: "#4A5568",
            brightRed: "#F56565",
            brightGreen: "#38A169",
            brightYellow: "#ECC94B",
            brightBlue: "#4299E1",
            brightMagenta: "#9F7AEA",
            brightCyan: "#38B2AC",
            brightWhite: "#1F2937",
          }
        : {
            background: "#030c08",
            foreground: "#D1D5DB",
            cursor: "#43E65C",
            cursorAccent: "#030C08",
            selectionBackground: "rgba(67, 230, 92, 0.28)",
            black: "#1F2937",
            red: "#EF4444",
            green: "#43E65C",
            yellow: "#FBBF24",
            blue: "#60A5FA",
            magenta: "#C084FC",
            cyan: "#2DD4BF",
            white: "#F3F4F6",
            brightBlack: "#4B5563",
            brightRed: "#F87171",
            brightGreen: "#34D399",
            brightYellow: "#FCD34D",
            brightBlue: "#93C5FD",
            brightMagenta: "#E9D5FF",
            brightCyan: "#5EEAD4",
            brightWhite: "#FFFFFF",
          },
      fontSize: 13.5,
      fontFamily:
        termSettings.fontFamily ||
        "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
      cursorStyle: "block",
      cursorBlink: true,
      cursorWidth: 2,
      scrollback: 10000,
      convertEol: true,
      allowTransparency: true,
      lineHeight: 1.25,
    });

    termRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    try {
      const webLinksAddon = new WebLinksAddon();
      term.loadAddon(webLinksAddon);
    } catch {}

    term.open(containerRef.current);

    const fitTerm = () => {
      try {
        if (containerRef.current && containerRef.current.clientWidth > 50) {
          fitAddon.fit();
          if (
            socketRef.current?.readyState === WebSocket.OPEN &&
            term.cols &&
            term.rows
          ) {
            socketRef.current.send(
              JSON.stringify({
                type: "resize",
                terminalId: activeSessionRef.current,
                cols: term.cols,
                rows: term.rows,
              })
            );
          }
        }
      } catch {}
    };

    // Auto fit & focus
    requestAnimationFrame(fitTerm);
    setTimeout(() => {
      fitTerm();
      term.focus();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(fitTerm);
    });
    resizeObserver.observe(containerRef.current);

    // Direct user typing -> forward raw keystrokes to PTY
    term.onData((data) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "input",
            terminalId: activeSessionRef.current,
            data,
          })
        );
      }
    });

    // Custom key event handler
    term.attachCustomKeyEventHandler((e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = (e.key || "").toLowerCase();

      if (e.shiftKey && e.key === "Insert") {
        if (e.type === "keydown") {
          navigator.clipboard.readText().then((text) => {
            if (text && socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(
                JSON.stringify({
                  type: "input",
                  terminalId: activeSessionRef.current,
                  data: text,
                })
              );
            }
          }).catch(() => {});
        }
        return false;
      }

      if (isCtrl && key === "c" && !e.altKey && !e.shiftKey) {
        if (term.hasSelection()) {
          const selection = term.getSelection();
          if (selection && e.type === "keydown") {
            navigator.clipboard.writeText(selection).catch(() => {});
          }
          return false;
        }
        return true;
      }

      if (isCtrl && key === "v" && !e.altKey) {
        if (e.type === "keydown") {
          navigator.clipboard.readText().then((text) => {
            if (text && socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(
                JSON.stringify({
                  type: "input",
                  terminalId: activeSessionRef.current,
                  data: text,
                })
              );
            }
          }).catch(() => {});
        }
        return false;
      }

      return true;
    });

    // 2. Connect WebSocket
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = backendUrl.replace(/^https?:\/\//, "");
    const token = accessToken || localStorage.getItem("accessToken") || "demo-token";

    setConnectionStatus("connecting");
    const ws = new WebSocket(`${protocol}://${host}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");

      // Spawn initial terminal session in selected workspace / sandbox
      ws.send(
        JSON.stringify({
          type: "create",
          terminalId: activeSessionRef.current,
          workspaceId: selectedEnvRef.current,
          shell: "bash",
          cols: term.cols || 120,
          rows: term.rows || 32,
        })
      );

      setTimeout(() => {
        term.focus();
      }, 100);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "output" && msg.terminalId === activeSessionRef.current) {
          term.write(msg.data);
        } else if (msg.type === "buffer" && msg.terminalId === activeSessionRef.current) {
          term.write(msg.data);
        } else if (msg.type === "created" && msg.terminalId === activeSessionRef.current) {
          term.focus();
        } else if (msg.type === "dead") {
          ws.send(
            JSON.stringify({
              type: "create",
              terminalId: msg.terminalId,
              workspaceId: selectedEnvRef.current,
              shell: "bash",
            })
          );
        }
      } catch (err) {
        console.error("Cloud terminal message parse error:", err);
      }
    };

    ws.onerror = () => {
      setConnectionStatus("disconnected");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    return () => {
      resizeObserver.disconnect();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      term.dispose();
      termRef.current = null;
    };
  }, [theme, accessToken]);

  // Handle switching environment / workspace
  const handleSelectEnv = (envId) => {
    setSelectedEnv(envId);
    selectedEnvRef.current = envId;
    setIsEnvDropdownOpen(false);

    if (termRef.current) {
      termRef.current.clear();
      termRef.current.writeln(`\r\n\x1b[33m⚡ Switching environment to ${envId === "cloud-sandbox" ? "Global Sandbox" : (workspaces.find(w => w._id === envId)?.name || envId)}...\x1b[0m\r\n`);
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Re-create terminal session in the target workspace
      socketRef.current.send(
        JSON.stringify({
          type: "create",
          terminalId: activeSessionRef.current,
          workspaceId: envId,
          shell: "bash",
          cols: termRef.current?.cols || 120,
          rows: termRef.current?.rows || 32,
        })
      );
    }

    setTimeout(() => {
      termRef.current?.focus();
    }, 150);
  };

  // Handle tab switching
  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    activeSessionRef.current = sessionId;
    termRef.current?.clear();

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "attach",
          terminalId: sessionId,
        })
      );
    }
    termRef.current?.focus();
  };

  // Add a new tab
  const handleAddSession = (shell = "bash") => {
    const newId = `cloud_term_${Date.now()}`;
    const newSession = { id: newId, title: shell, shell };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newId);
    activeSessionRef.current = newId;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "create",
          terminalId: newId,
          workspaceId: selectedEnvRef.current,
          shell,
          cols: termRef.current?.cols || 120,
          rows: termRef.current?.rows || 32,
        })
      );
    }
    termRef.current?.focus();
  };

  // Close a tab
  const handleCloseSession = (e, sessionId) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "kill",
          terminalId: sessionId,
        })
      );
    }

    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      const nextSession = remaining[remaining.length - 1];
      setActiveSessionId(nextSession.id);
      activeSessionRef.current = nextSession.id;
      termRef.current?.clear();
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "attach",
            terminalId: nextSession.id,
          })
        );
      }
    }
  };

  // Quick Command Execution
  const handleRunCommand = (cmd) => {
    sendInput(cmd);
    termRef.current?.focus();
  };

  // Clear Terminal
  const handleClear = () => {
    termRef.current?.clear();
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "clear",
          terminalId: activeSessionRef.current,
        })
      );
    }
    termRef.current?.focus();
  };

  // Restart Shell Session
  const handleRestart = () => {
    if (termRef.current) {
      termRef.current.clear();
      termRef.current.writeln("\r\n\x1b[33m⚡ Restarting Cloud Terminal session...\x1b[0m\r\n");
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "kill",
          terminalId: activeSessionRef.current,
        })
      );

      setTimeout(() => {
        socketRef.current.send(
          JSON.stringify({
            type: "create",
            terminalId: activeSessionRef.current,
            workspaceId: selectedEnvRef.current,
            shell: "bash",
          })
        );
        termRef.current?.focus();
      }, 250);
    }
  };

  // Copy selection
  const handleCopySelection = () => {
    if (termRef.current?.hasSelection()) {
      const text = termRef.current.getSelection();
      navigator.clipboard.writeText(text).then(() => {
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2000);
      });
    }
  };

  return (
    <div className={`cloud-terminal-wrapper ${isMaximized ? "maximized-mode" : ""}`}>
      {/* Top Header Bar */}
      <div className="cloud-terminal-card-header">
        <div className="terminal-header-left">
          <div className="terminal-title-badge">
            <SquareTerminal size={17} className="terminal-badge-icon" />
            <span className="terminal-badge-text">Cloud Terminal</span>
          </div>

          {/* Environment Selector Dropdown */}
          <div className="env-selector-container" ref={dropdownRef}>
            <button
              type="button"
              className="env-selector-btn"
              onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
              title="Change active workspace environment"
            >
              <FolderCode size={14} className="env-btn-icon" />
              <span className="env-btn-label">
                {selectedEnv === "cloud-sandbox"
                  ? "Global Cloud Sandbox"
                  : currentWorkspace?.name || "Workspace"}
              </span>
              <ChevronDown size={13} className="env-btn-chevron" />
            </button>

            {isEnvDropdownOpen && (
              <div className="env-dropdown-menu">
                <div className="env-dropdown-heading">Target Environment</div>
                <button
                  type="button"
                  className={`env-dropdown-item ${selectedEnv === "cloud-sandbox" ? "active" : ""}`}
                  onClick={() => handleSelectEnv("cloud-sandbox")}
                >
                  <Cpu size={14} />
                  <div className="env-item-details">
                    <span className="env-item-title">Global Cloud Sandbox</span>
                    <span className="env-item-desc">Root sandbox directory (~/workspace)</span>
                  </div>
                  {selectedEnv === "cloud-sandbox" && <Check size={14} className="env-item-check" />}
                </button>

                {workspaces && workspaces.length > 0 && (
                  <>
                    <div className="env-dropdown-divider" />
                    <div className="env-dropdown-heading">Your Workspaces</div>
                    {workspaces.map((ws) => (
                      <button
                        key={ws._id}
                        type="button"
                        className={`env-dropdown-item ${selectedEnv === ws._id ? "active" : ""}`}
                        onClick={() => handleSelectEnv(ws._id)}
                      >
                        <FolderCode size={14} />
                        <div className="env-item-details">
                          <span className="env-item-title">{ws.name}</span>
                          <span className="env-item-desc">Workspace folder (/workspace/{ws.name})</span>
                        </div>
                        {selectedEnv === ws._id && <Check size={14} className="env-item-check" />}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Jump to Workspace IDE Button (if workspace selected) */}
          {selectedEnv !== "cloud-sandbox" && onNavigateToWorkspace && (
            <button
              type="button"
              className="btn-open-in-ide"
              onClick={() => onNavigateToWorkspace(selectedEnv)}
              title="Open full IDE for this workspace"
            >
              <span>Open in IDE</span>
              <ExternalLink size={13} />
            </button>
          )}

          {/* Connection status badge */}
          <div
            className={`terminal-conn-status ${connectionStatus}`}
            onClick={connectionStatus === "disconnected" ? handleRestart : undefined}
            style={{ cursor: connectionStatus === "disconnected" ? "pointer" : "default" }}
            title={connectionStatus === "disconnected" ? "Click to Reconnect" : undefined}
          >
            <span className="conn-dot" />
            <span className="conn-label">
              {connectionStatus === "connected"
                ? "Cloud PTY Connected"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Disconnected (Click to Reconnect)"}
            </span>
            {connectionStatus === "disconnected" && <RefreshCw size={11} className="conn-retry-icon" />}
          </div>
        </div>

        {/* Action Controls */}
        <div className="terminal-header-right">
          {copiedNotice && (
            <span className="copy-toast-badge">
              <Check size={12} /> Copied!
            </span>
          )}

          <button
            type="button"
            className="term-tool-btn"
            onClick={handleCopySelection}
            title="Copy Selection"
          >
            <Copy size={14} />
          </button>

          <button
            type="button"
            className="term-tool-btn"
            onClick={handleClear}
            title="Clear Terminal Output (Ctrl+L)"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            className="term-tool-btn"
            onClick={handleRestart}
            title="Restart Shell Session"
          >
            <RotateCw size={14} />
            <span>Restart</span>
          </button>

          <button
            type="button"
            className="term-tool-btn"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore Window Size" : "Maximize Window"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Tabs and Quick Command Bar */}
      <div className="cloud-terminal-tabs-bar">
        <div className="terminal-tabs-list">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`cloud-term-tab ${sess.id === activeSessionId ? "active" : ""}`}
              onClick={() => handleSelectSession(sess.id)}
            >
              <TerminalIcon size={13} className="tab-term-icon" />
              <span className="tab-term-label">{sess.title}</span>
              {sessions.length > 1 && (
                <button
                  type="button"
                  className="tab-close-btn"
                  onClick={(e) => handleCloseSession(e, sess.id)}
                  title="Close Session"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn-add-term-tab"
            onClick={() => handleAddSession("bash")}
            title="New Bash Session"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="quick-command-chips">
          <span className="quick-chips-label">Quick Run:</span>
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              type="button"
              className="quick-chip-btn"
              onClick={() => handleRunCommand(qc.cmd)}
              title={`Execute '${qc.label}'`}
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Viewport */}
      <div
        className="cloud-terminal-viewport"
        ref={containerRef}
        onClick={() => {
          try {
            termRef.current?.focus();
          } catch {}
        }}
      />
    </div>
  );
}

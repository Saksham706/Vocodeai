import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import { DEFAULT_SETTINGS } from "../../config/defaultSettings";

export default function TerminalPanel({ terminalId, theme = "dark" }) {
  const { socketRef } = useWorkspace();
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalId || !containerRef.current) return;

    // Detect current active theme
    const isLight =
      theme === "light" ||
      document.documentElement.getAttribute("data-theme") === "light";

    const termSettings =
      getEffectiveSettings()?.["terminal.integrated"] ||
      DEFAULT_SETTINGS["terminal.integrated"] ||
      {};

    const term = new Terminal({
      theme: isLight
        ? {
            background: "#ffffff",
            foreground: "#101C24",
            cursor: "#FF8B32",
            cursorAccent: "#ffffff",
            selectionBackground: "rgba(255, 139, 50, 0.28)",
            black: "#101C24",
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
            brightWhite: "#1A202C",
          }
        : {
            background: "#030C08",
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
      fontSize: termSettings.fontSize || 13,
      fontFamily:
        termSettings.fontFamily ||
        "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
      cursorStyle: termSettings.cursorStyle || "block",
      cursorBlink: termSettings.cursorBlink ?? true,
      cursorWidth: 2,
      scrollback: termSettings.scrollback || 10000,
      smoothScrollDuration: 0,
      convertEol: true,
      allowTransparency: true,
      letterSpacing: 0,
      lineHeight: 1.22,
      rightClickSelectsWord: false,
    });

    termRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // Clickable links in terminal
    try {
      const webLinksAddon = new WebLinksAddon();
      term.loadAddon(webLinksAddon);
    } catch {}

    term.open(containerRef.current);

    // Initial safe fit
    const doFit = () => {
      try {
        if (containerRef.current?.clientWidth && containerRef.current?.clientHeight) {
          fitAddon.fit();
          if (
            socketRef.current?.readyState === WebSocket.OPEN &&
            term.cols &&
            term.rows
          ) {
            socketRef.current.send(
              JSON.stringify({
                type: "resize",
                terminalId,
                cols: term.cols,
                rows: term.rows,
              })
            );
          }
        }
      } catch {}
    };

    requestAnimationFrame(doFit);
    term.focus();

    // Replay existing buffer & send dimensions to server
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "attach",
          terminalId,
        })
      );
    }

    // Direct, ultra-low latency input sender
    const sendInput = (data) => {
      if (!data || socketRef.current?.readyState !== WebSocket.OPEN) return;
      socketRef.current.send(
        JSON.stringify({
          type: "input",
          terminalId,
          data,
        })
      );
    };

    // Forward raw xterm user input directly without character drops
    term.onData((data) => {
      sendInput(data);
    });

    // Clean, robust clipboard paste
    let isPasting = false;
    const pasteText = (text) => {
      if (!text || isPasting) return;
      isPasting = true;
      sendInput(text);
      setTimeout(() => {
        isPasting = false;
      }, 100);
    };

    const pasteFromClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          pasteText(text);
        }
      } catch {
        // Fallback for browsers with strict permissions
      }
    };

    // Terminal keyboard event handler
    term.attachCustomKeyEventHandler((e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = (e.key || "").toLowerCase();

      // Shift + Insert: Paste
      if (e.shiftKey && e.key === "Insert") {
        if (e.type === "keydown") {
          e.preventDefault?.();
          e.stopPropagation?.();
          pasteFromClipboard();
        }
        return false;
      }

      // Ctrl+C / Cmd+C: Copy if text is selected, else pass to shell (SIGINT)
      if (isCtrl && key === "c" && !e.altKey && !e.shiftKey) {
        if (term.hasSelection()) {
          const selection = term.getSelection();
          if (selection && e.type === "keydown") {
            navigator.clipboard.writeText(selection).catch(() => {});
          }
          return false;
        }
        return true; // Let xterm emit \x03 naturally on keydown
      }

      // Ctrl+V / Cmd+V: Paste from clipboard
      if (isCtrl && key === "v" && !e.altKey) {
        if (e.type === "keydown") {
          e.preventDefault?.();
          e.stopPropagation?.();
          pasteFromClipboard();
        }
        return false;
      }

      // Allow browser dev tools shortcuts
      if (isCtrl && e.shiftKey && (key === "i" || key === "j" || key === "c")) {
        return true;
      }

      return true;
    });

    // Native container paste listener
    const handleNativePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = e.clipboardData?.getData("text");
      if (text) {
        pasteText(text);
      }
    };

    // Right-Click Context Menu: Copy if selection, else Paste (VS Code behavior)
    const handleContextMenu = (e) => {
      e.preventDefault();
      if (term.hasSelection()) {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).catch(() => {});
        }
      } else {
        pasteFromClipboard();
      }
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener("paste", handleNativePaste, { capture: true });
    containerEl.addEventListener("contextmenu", handleContextMenu);

    // Live terminal output stream
    const outputHandler = (e) => {
      if (e.detail?.terminalId === terminalId && e.detail.data) {
        term.write(e.detail.data);
      }
    };

    // Terminal buffer reset / replay
    const bufferHandler = (e) => {
      if (e.detail?.terminalId === terminalId) {
        term.reset();
        if (e.detail.data) {
          term.write(e.detail.data);
        }
      }
    };

    window.addEventListener("terminal-output", outputHandler);
    window.addEventListener("terminal-buffer", bufferHandler);

    // High performance resize handling using requestAnimationFrame
    let rAFId = null;
    let lastCols = 0;
    let lastRows = 0;

    const resizeObserver = new ResizeObserver(() => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        try {
          if (!containerEl || !containerEl.clientWidth) return;
          fitAddon.fit();
          if (
            term.cols !== lastCols ||
            term.rows !== lastRows
          ) {
            lastCols = term.cols;
            lastRows = term.rows;
            if (socketRef.current?.readyState === WebSocket.OPEN && term.cols && term.rows) {
              socketRef.current.send(
                JSON.stringify({
                  type: "resize",
                  terminalId,
                  cols: term.cols,
                  rows: term.rows,
                })
              );
            }
          }
        } catch {}
      });
    });

    resizeObserver.observe(containerEl);

    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      containerEl.removeEventListener("paste", handleNativePaste, { capture: true });
      containerEl.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("terminal-output", outputHandler);
      window.removeEventListener("terminal-buffer", bufferHandler);
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [terminalId, socketRef, theme]);

  return (
    <div
      ref={containerRef}
      className="terminal-active-box"
      onClick={() => {
        try {
          termRef.current?.focus();
        } catch {}
      }}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
}

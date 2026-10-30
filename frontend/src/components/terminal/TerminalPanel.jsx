import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import { DEFAULT_SETTINGS } from "../../config/defaultSettings";

export default function TerminalPanel({ terminalId, theme = "dark" }) {
  const { socketRef } = useWorkspace();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!terminalId || !containerRef.current) return;

    // Detect theme
    const isLight = theme === "light" || document.documentElement.getAttribute("data-theme") === "light";

    const termSettings = getEffectiveSettings()?.["terminal.integrated"] || DEFAULT_SETTINGS["terminal.integrated"];

    const term = new Terminal({
      theme: isLight
        ? {
            background: "#ffffff",
            foreground: "#101C24",
            cursor: "#FF8B32",
            cursorAccent: "#ffffff",
            selectionBackground: "rgba(255, 139, 50, 0.25)",
            black: "#101C24",
            red: "#E53E3E",
            green: "#38A169",
            yellow: "#D69E2E",
            blue: "#3182CE",
            magenta: "#805AD5",
            cyan: "#319795",
            white: "#718096",
          }
        : {
            background: "#030C08",
            foreground: "#c9d1d9",
            cursor: "#43E65C",
            cursorAccent: "#030C08",
            selectionBackground: "rgba(67, 230, 92, 0.25)",
            black: "#484f58",
            red: "#ff7b72",
            green: "#43E65C",
            yellow: "#d29922",
            blue: "#58a6ff",
            magenta: "#bc8cff",
            cyan: "#39c5cf",
            white: "#b1bac4",
          },
      fontSize: termSettings.fontSize || 13,
      fontFamily: termSettings.fontFamily || "'Fira Code', Consolas, 'Courier New', monospace",
      cursorStyle: termSettings.cursorStyle || "block",
      cursorBlink: termSettings.cursorBlink ?? true,
      scrollback: termSettings.scrollback || 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    try {
      fitAddon.fit();
    } catch {}

    term.focus();

    // Replay existing buffer from server
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "attach",
          terminalId,
        })
      );
    }

    term.onData((data) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "input",
            terminalId,
            data,
          })
        );
      }
    });

    const outputHandler = (e) => {
      if (e.detail?.terminalId === terminalId) {
        term.write(e.detail.data);
      }
    };

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

    // Responsive resize observer
    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        try {
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
        } catch {}
      }, 50);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("terminal-output", outputHandler);
      window.removeEventListener("terminal-buffer", bufferHandler);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [terminalId, socketRef, theme]);

  return (
    <div
      ref={containerRef}
      className="terminal-active-box"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

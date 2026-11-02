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
  const termRef = useRef(null);

  useEffect(() => {
    if (!terminalId || !containerRef.current) return;

    // Detect theme
    const isLight =
      theme === "light" ||
      document.documentElement.getAttribute("data-theme") === "light";

    const termSettings =
      getEffectiveSettings()?.["terminal.integrated"] ||
      DEFAULT_SETTINGS["terminal.integrated"];

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
      fontFamily:
        termSettings.fontFamily ||
        "'Fira Code', Consolas, 'Courier New', monospace",
      cursorStyle: termSettings.cursorStyle || "block",
      cursorBlink: termSettings.cursorBlink ?? true,
      scrollback: termSettings.scrollback || 5000,
      convertEol: true,
    });

    termRef.current = term;

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

    // Strip ANSI / bracketed paste sequences (e.g. \x1b[200~ and \x1b[201~)
    const stripAnsi = (str) =>
      typeof str === "string"
        ? str.replace(/\x1b\[[0-9;]*[a-zA-Z~]/g, "")
        : str;

    // Centralized Input Sender with Strict Deduplication
    let lastSentData = "";
    let lastSentTime = 0;

    const sendInput = (data) => {
      if (!data || socketRef.current?.readyState !== WebSocket.OPEN) return;

      const now = Date.now();
      const clean = stripAnsi(data).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      // Deduplicate: If identical pasted text is received within 600ms, drop it (prevents double paste)
      if (
        clean.length > 1 &&
        clean === lastSentData &&
        now - lastSentTime < 600
      ) {
        return;
      }

      // Single character deduplication (within 30ms)
      if (
        clean.length === 1 &&
        clean === lastSentData &&
        now - lastSentTime < 30
      ) {
        return;
      }

      lastSentData = clean;
      lastSentTime = now;

      socketRef.current.send(
        JSON.stringify({
          type: "input",
          terminalId,
          data,
        })
      );
    };

    term.onData((data) => {
      sendInput(data);
    });

    // Helper for manual clipboard paste
    const pasteFromClipboard = async (explicitText) => {
      try {
        const text =
          explicitText !== undefined
            ? explicitText
            : await navigator.clipboard.readText();
        if (text) {
          sendInput(text);
        }
      } catch (err) {
        console.warn("Clipboard paste warning:", err);
      }
    };

    // Full Terminal Shortcut Key Support (Ctrl+R, Ctrl+Z, Ctrl+C, Ctrl+L, Ctrl+D, Ctrl+A, Ctrl+E, etc.)
    term.attachCustomKeyEventHandler((e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = (e.key || "").toLowerCase();

      // Handle Shift+Insert for paste
      if (e.shiftKey && e.key === "Insert") {
        if (e.type === "keydown") {
          e.preventDefault?.();
          e.stopPropagation?.();
          pasteFromClipboard();
        }
        return false;
      }

      // If a Control combination is pressed
      if (isCtrl && !e.altKey) {
        // Prevent browser defaults for terminal control keys (e.g. Ctrl+R reload, Ctrl+S save, Ctrl+U view source, etc.)
        e.preventDefault?.();
        e.stopPropagation?.();

        // Process only on keydown to prevent duplicate input on keyup
        if (e.type !== "keydown") {
          return false;
        }

        // Ctrl+C / Cmd+C: Copy selected text if any, else send SIGINT (\x03)
        if (key === "c") {
          if (term.hasSelection()) {
            const selection = term.getSelection();
            if (selection) {
              navigator.clipboard.writeText(selection).catch(() => {});
            }
          } else {
            sendInput("\x03"); // SIGINT
          }
          return false;
        }

        // Ctrl+V / Cmd+V: Paste from clipboard
        if (key === "v") {
          pasteFromClipboard();
          return false;
        }

        // Standard Control Keys Ctrl+A through Ctrl+Z (ASCII 1 through 26)
        // e.g. Ctrl+R -> \x12 (Reverse Search), Ctrl+Z -> \x1a (SIGTSTP), Ctrl+L -> \x0c (Clear), Ctrl+D -> \x04 (EOF)
        if (key.length === 1 && key >= "a" && key <= "z") {
          const charCode = key.charCodeAt(0) - 96;
          sendInput(String.fromCharCode(charCode));
          return false;
        }

        // Ctrl+Space or Ctrl+@ -> NUL (\x00)
        if (key === " " || key === "@") {
          sendInput("\x00");
          return false;
        }

        // Ctrl+[ -> ESC (\x1b)
        if (key === "[") {
          sendInput("\x1b");
          return false;
        }

        // Ctrl+\ -> SIGQUIT (\x1c)
        if (key === "\\") {
          sendInput("\x1c");
          return false;
        }

        // Ctrl+] -> \x1d
        if (key === "]") {
          sendInput("\x1d");
          return false;
        }

        // Ctrl+_ / Ctrl+- -> \x1f (Readline Undo)
        if (key === "_" || key === "-") {
          sendInput("\x1f");
          return false;
        }

        return false;
      }

      return true;
    });

    // Native DOM Paste Event Listener (captured at container level before reaching xterm children)
    const handlePaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = e.clipboardData?.getData("text");
      if (text) {
        sendInput(text);
      }
    };

    // Right-Click Context Menu: If text selected -> copy; else -> paste (VS Code behavior)
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
    // Use capture phase so we intercept before xterm helper textarea
    containerEl.addEventListener("paste", handlePaste, { capture: true });
    containerEl.addEventListener("contextmenu", handleContextMenu);

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
      containerEl.removeEventListener("paste", handlePaste, { capture: true });
      containerEl.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("terminal-output", outputHandler);
      window.removeEventListener("terminal-buffer", bufferHandler);
      resizeObserver.disconnect();
      term.dispose();
      termRef.current = null;
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
      style={{ width: "100%", height: "100%" }}
    />
  );
}

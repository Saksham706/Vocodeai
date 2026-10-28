import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useWorkspace } from "../../context/WorkspaceContext";

export default function TerminalPanel({ terminalId }) {
  const { socketRef } = useWorkspace();

  const containerRef = useRef(null);

  useEffect(() => {
    if (!terminalId || !socketRef.current) return;

    const term = new Terminal({
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
      fontSize: 14,
      cursorBlink: true,
      scrollback: 2000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(containerRef.current);
    fitAddon.fit();
    term.focus();

    term.onData((data) => {
      socketRef.current.send(
        JSON.stringify({
          type: "input",
          terminalId,
          data,
        })
      );
    });

    const outputHandler = (e) => {
      if (e.detail.terminalId === terminalId) {
        term.write(e.detail.data);
      }
    };

    window.addEventListener("terminal-output", outputHandler);

    return () => {
      window.removeEventListener("terminal-output", outputHandler);
      term.dispose();
    };
  }, [terminalId]);

  return (
    <div className="terminal-panel">
      <div ref={containerRef} className="xterm-container" />
    </div>
  );
}
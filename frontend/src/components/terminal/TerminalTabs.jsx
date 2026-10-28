import "../../styles/terminal.css";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  FiSquare,
  FiRefreshCw,
  FiTrash2,
  FiX,
  FiPlus,
} from "react-icons/fi";

export default function TerminalTabs() {
  const {
    terminals,
    activeTerminal,
    setActiveTerminal,
    killTerminal,
    openNewTerminal,
    socketRef,
  } = useWorkspace();

  if (!terminals.length) return null;

  const send = (payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const stopProcess = (id) => {
    send({ type: "input", terminalId: id, data: "\x03" });
  };

  const restartTerminal = (id) => {
    send({ type: "restart", terminalId: id });
  };

  const clearTerminal = (id) => {
    send({ type: "clear", terminalId: id });
  };

  return (
    <div className="terminal-header">
      {/* TABS */}
      <div className="terminal-tabs">
        {terminals.map((t, i) => (
          <div
            key={t.id}
            className={`terminal-tab ${
              activeTerminal === t.id ? "active" : ""
            }`}
            onClick={() => setActiveTerminal(t.id)}
          >
            <span className="dot" />
            <span className="title">Terminal {i + 1}</span>

            <div className="actions">
              <FiSquare
                title="Stop"
                onClick={(e) => {
                  e.stopPropagation();
                  stopProcess(t.id);
                }}
              />

              <FiRefreshCw
                title="Restart"
                onClick={(e) => {
                  e.stopPropagation();
                  restartTerminal(t.id);
                }}
              />

              <FiTrash2
                title="Clear"
                onClick={(e) => {
                  e.stopPropagation();
                  clearTerminal(t.id);
                }}
              />

              <FiX
                className="close"
                onClick={(e) => {
                  e.stopPropagation();
                  killTerminal(t.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT ACTIONS */}
      <div className="terminal-right">
        <button className="new-btn" onClick={openNewTerminal}>
          <FiPlus /> New
        </button>

        <button className="icon-btn">
          <FiSquare />
        </button>

        <button className="icon-btn danger">
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
import TerminalTabs from "./TerminalTabs";
import TerminalPanel from "./TerminalPanel";
import { X } from "lucide-react";

export default function WorkspaceTerminalSection({
  terminalHeight,
  startTerminalResize,
  isTermMaximized,
  setIsTermMaximized,
  setShowTerminal,
  activeTermTab,
  setActiveTermTab,
  onNewTerminal,
  onSplitTerminal,
  isSplitActive,
  onClearTerminal,
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  onAddSession,
  problemCount,
  problems,
  setProblems,
  handleProblemClick,
  outputLogs,
  setOutputLogs,
  debugLogs,
  setDebugLogs,
  debugInput,
  setDebugInput,
  handleDebugSubmit,
  primaryTermId,
  secondaryTermId,
  activeTerminal,
  setActiveTerminal,
  handleCloseSplit,
  theme,
}) {
  return (
    <div
      className={`ide-terminal-section ${isTermMaximized ? "maximized" : ""}`}
      style={{ height: isTermMaximized ? "75%" : terminalHeight }}
    >
      <div
        className="ide-terminal-resizer"
        onMouseDown={startTerminalResize}
        title="Drag to resize terminal"
      />

      <TerminalTabs
        activeTab={activeTermTab}
        setActiveTab={setActiveTermTab}
        onNewTerminal={onNewTerminal}
        onSplitTerminal={onSplitTerminal}
        isSplit={isSplitActive}
        onClearTerminal={onClearTerminal}
        onToggleMaximize={() => setIsTermMaximized((prev) => !prev)}
        isMaximized={isTermMaximized}
        onClosePanel={() => setShowTerminal(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onCloseSession={onCloseSession}
        onAddSession={onAddSession}
        problemCount={problemCount}
      />

      <div className="ide-terminal-body">
        {activeTermTab === "terminal" && (
          isSplitActive ? (
            <div className="terminal-split-view">
              <div
                className={`terminal-split-pane ${activeTerminal === primaryTermId ? "focused" : ""}`}
                onClick={() => setActiveTerminal(primaryTermId)}
              >
                <div className="terminal-pane-header">
                  <span className="terminal-pane-title">
                    {sessions.find((s) => s.id === primaryTermId)?.label || "bash"}
                  </span>
                  <button
                    type="button"
                    className="terminal-pane-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSplit(primaryTermId);
                    }}
                    title="Close Terminal"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="terminal-pane-content">
                  <TerminalPanel
                    key={primaryTermId}
                    terminalId={primaryTermId}
                    theme={theme}
                  />
                </div>
              </div>

              <div className="terminal-split-divider" />

              <div
                className={`terminal-split-pane ${activeTerminal === secondaryTermId ? "focused" : ""}`}
                onClick={() => setActiveTerminal(secondaryTermId)}
              >
                <div className="terminal-pane-header">
                  <span className="terminal-pane-title">
                    {sessions.find((s) => s.id === secondaryTermId)?.label || "bash (split)"}
                  </span>
                  <button
                    type="button"
                    className="terminal-pane-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSplit(secondaryTermId);
                    }}
                    title="Close Split Terminal"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="terminal-pane-content">
                  <TerminalPanel
                    key={secondaryTermId}
                    terminalId={secondaryTermId}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          ) : activeTerminal ? (
            <TerminalPanel
              key={activeTerminal}
              terminalId={activeTerminal}
              theme={theme}
            />
          ) : (
            <div className="term-shell-session">
              <div className="term-block">
                <div className="term-line">
                  <span className="term-prompt-user">saksham@vocodeai:</span>
                  <span className="term-prompt-path">~$</span>
                  <span className="term-cursor">█</span>
                </div>
              </div>
            </div>
          )
        )}

        {activeTermTab === "output" && (
          <div className="term-functional-panel">
            <div className="term-panel-header">
              <div className="term-panel-title">
                <span>Workspace Execution &amp; Build Output</span>
              </div>
              <div className="term-panel-actions">
                <button
                  type="button"
                  className="term-panel-btn"
                  onClick={() => setOutputLogs([])}
                >
                  Clear Output
                </button>
              </div>
            </div>
            <div className="term-panel-scrollable">
              {outputLogs && outputLogs.length > 0 ? (
                outputLogs.map((log) => (
                  <div key={log.id} className="term-log-row">
                    <span className="term-log-time">[{log.time}]</span>
                    <span className={`term-log-text ${log.type || "info"}`}>
                      {log.text}
                    </span>
                  </div>
                ))
              ) : (
                <p className="term-dim-line">No recent execution logs.</p>
              )}
            </div>
          </div>
        )}

        {activeTermTab === "problems" && (
          <div className="term-functional-panel">
            <div className="term-panel-header">
              <div className="term-panel-title">
                <span>
                  {problems && problems.length > 0
                    ? `${problems.length} problem${problems.length > 1 ? "s" : ""} detected`
                    : "No problems detected"}
                </span>
              </div>
              {problems && problems.length > 0 && (
                <div className="term-panel-actions">
                  <button
                    type="button"
                    className="term-panel-btn"
                    onClick={() => setProblems([])}
                  >
                    Clear Problems
                  </button>
                </div>
              )}
            </div>
            <div className="term-panel-scrollable">
              {problems && problems.length > 0 ? (
                <div className="term-problems-list">
                  {problems.map((prob) => (
                    <div
                      key={prob.id}
                      className="term-problem-item"
                      onClick={() => handleProblemClick(prob)}
                      title="Click to jump to file"
                    >
                      <span
                        className={`term-problem-severity ${prob.severity || "error"}`}
                      >
                        {prob.severity || "error"}
                      </span>
                      <div className="term-problem-details">
                        <span className="term-problem-msg">{prob.message}</span>
                        <span className="term-problem-location">
                          {prob.file} [{prob.line}:{prob.col}]
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="term-dim-line">
                  No syntax or compilation problems detected in the workspace.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTermTab === "debug" && (
          <div className="term-functional-panel">
            <div className="term-panel-header">
              <div className="term-panel-title">
                <span>Interactive Debug Console</span>
              </div>
              <div className="term-panel-actions">
                <button
                  type="button"
                  className="term-panel-btn"
                  onClick={() => setDebugLogs([])}
                >
                  Clear Console
                </button>
              </div>
            </div>
            <div className="term-panel-scrollable">
              {debugLogs.map((log) => (
                <div key={log.id} className="term-log-row">
                  <span className={`term-log-text ${log.type}`}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleDebugSubmit} className="term-debug-input-row">
              <span className="term-debug-glyph">&gt;</span>
              <input
                type="text"
                className="term-debug-input"
                placeholder="Evaluate expression or command..."
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


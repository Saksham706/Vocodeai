import { Bot, CheckCircle2, Cpu, ShieldCheck, Terminal, Layers } from "lucide-react";
import AntigravityLogo from "../common/AntigravityLogo";

export default function GeminiSettingsPanel() {
  return (
    <section className="settings-live-preview-box" style={{ marginBottom: 20 }}>
      {/* Header Bar */}
      <div className="preview-top-bar" style={{ gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <AntigravityLogo size={20} />
          <span className="preview-title" style={{ color: "#38bdf8", fontWeight: 600 }}>
            VocodeAI Core Engine
          </span>
        </div>
        <span className="preview-indicator" style={{ color: "#4ade80" }}>
          <span className="live-pulse-dot" style={{ backgroundColor: "#22c55e" }} />
          Online & Ready
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Engine Status Banner */}
        <div
          style={{
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "rgba(56, 189, 248, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#38bdf8",
              flexShrink: 0,
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#f8fafc" }}>
              VocodeAI Autonomous Pair Programmer
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Proprietary AI pair programming engine embedded directly in the VocodeAI Cloud IDE.
              Handles multi-file generation, terminal execution, and intelligent code refactoring.
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginTop: 14,
          }}
        >
          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#38bdf8" }}>
              <Terminal size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Terminal Execution</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Compiles & runs code in isolated Docker runner
            </span>
          </div>

          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80" }}>
              <Layers size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Multi-File Edits</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Directly generates and writes files into workspace
            </span>
          </div>

          <div style={featureBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a855f7" }}>
              <ShieldCheck size={15} />
              <strong style={{ fontSize: 12.5, color: "#f8fafc" }}>Safe Mode</strong>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
              Pre-flight validation for file modifications
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const featureBoxStyle = {
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(4, 16, 28, 0.45)",
  borderRadius: 8,
  padding: "10px 12px",
};

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  RotateCw,
  AlertCircle,
  XCircle,
  Radio,
  Bell,
  Code2,
  Terminal,
  Mic,
} from "lucide-react";
import AntigravityLogo from "../common/AntigravityLogo";
import "../../styles/statusbar.css";

export default function StatusBar({
  userName = "Developer",
  gitBranch = "main",
  gitChangesCount = 0,
  problemCount = 0,
  activeLanguage = "JavaScript",
  activePort = null,
  onToggleTerminal,
  onTogglePreview,
  onFocusAntigravity,
  isAntigravityInstalled = true,
}) {
  return (
    <footer className="ide-status-bar" aria-label="Status Bar">
      {/* Left Items */}
      <div className="status-bar-left">
        {/* Remote / User Tag */}
        <div className="status-item status-remote-badge" title={`Signed in as ${userName}`}>
          <span className="remote-icon">&gt;&lt;</span>
          <span className="status-text">{userName}</span>
        </div>

        {/* Git Branch & Sync */}
        <div className="status-item" title={`Current Branch: ${gitBranch}`}>
          <GitBranch size={13} style={{ marginRight: 4 }} />
          <span>{gitBranch}</span>
          <RotateCw size={11} style={{ marginLeft: 6, marginRight: 2 }} />
          <span>{gitChangesCount}</span>
        </div>

        {/* Errors & Warnings */}
        <div
          className="status-item"
          onClick={onToggleTerminal}
          title={`${problemCount} errors/warnings. Click to toggle problems tab.`}
        >
          <XCircle size={12} style={{ marginRight: 3 }} />
          <span>0</span>
          <AlertCircle size={12} style={{ marginLeft: 6, marginRight: 3 }} />
          <span>{problemCount}</span>
        </div>
      </div>

      {/* Right Items */}
      <div className="status-bar-right">
        {/* Voco Voice AI Status / Trigger Pill */}
        <div
          className="status-item status-voco-pill"
          onClick={() => window.dispatchEvent(new CustomEvent("vocode-toggle-voice"))}
          title="Voco Voice Assistant: Active & Listening (Say 'Hey Voco' or click to summon)"
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Mic size={12} style={{ color: "#00f2fe", marginRight: 4 }} />
          <span>Voco</span>
        </div>

        {/* Go Live Preview */}
        <div
          className="status-item status-live-btn"
          onClick={onTogglePreview}
          title={activePort ? `Connected on port ${activePort}. Click to open in browser.` : "Click to toggle live preview"}
        >
          <Radio size={12} style={{ marginRight: 4 }} />
          <span>{activePort ? `Port: ${activePort}` : "Go Live"}</span>
        </div>

        {/* Antigravity Status */}
        {isAntigravityInstalled && (
          <div
            className="status-item status-antigravity-pill"
            onClick={onFocusAntigravity}
            title="VocodeAI Assistant: Click to focus assistant"
          >
            <AntigravityLogo size={14} style={{ marginRight: 5 }} />
            <span>VocodeAI</span>
          </div>
        )}

        {/* Spaces / Tabs */}
        <div className="status-item" title="Indentation">
          <span>Spaces: 2</span>
        </div>

        {/* Encoding */}
        <div className="status-item" title="File Encoding">
          <span>UTF-8</span>
        </div>

        {/* Language */}
        <div className="status-item" title={`Language Mode: ${activeLanguage}`}>
          <span>{activeLanguage}</span>
        </div>

        {/* Notifications */}
        <div className="status-item" title="Notifications">
          <Bell size={12} />
        </div>
      </div>
    </footer>
  );
}


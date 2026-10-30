import React from "react";

const TAB_INFO = {
  templates: {
    badge: "Templates",
    title: "Pre-configured Project Starters",
    text: "Quickly spin up full-stack Node.js, Python, React, and Go environments with optimized AI scaffolding and integrated runtime configurations.",
  },
  terminal: {
    badge: "Cloud Terminal",
    title: "Direct Cloud Execution Shell",
    text: "Run scripts, execute Docker containers, install packages, and manage your cloud environment directly with native voice commands and integrated AI streaming.",
  },
  assistant: {
    badge: "AI Assistant",
    title: "Autonomous Pair Programmer",
    text: "Collaborate in real time with our conversational code generation model. Refactor complex algorithms, fix runtime exceptions, and inspect ASTs hands-free.",
  },
  settings: {
    badge: "Settings",
    title: "Workspace & Account Preferences",
    text: "Manage your API keys, model hyperparameters, editor keybindings (Vim / VS Code), billing subscriptions, and custom cloud runner nodes.",
  },
};

export default function DashboardPlaceholderTab({ activeTab, onBack }) {
  const info = TAB_INFO[activeTab];
  if (!info) return null;

  return (
    <div className="dashboard-placeholder-panel">
      <span className="placeholder-badge">{info.badge}</span>
      <h2 className="placeholder-title">{info.title}</h2>
      <p className="placeholder-text">{info.text}</p>
      <button className="btn-create-workspace-primary" onClick={onBack}>
        Back to Workspaces
      </button>
    </div>
  );
}


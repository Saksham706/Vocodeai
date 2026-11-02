import React from "react";
import {
  Files,
  Search,
  GitBranch,
  Play,
  Grid2X2,
  Settings,
} from "lucide-react";
import "../../styles/activitybar.css";

export default function ActivityBar({
  activeTab = "explorer",
  setActiveTab,
  isExplorerOpen,
  toggleExplorer,
  onOpenSettings,
  onRun,
  isSettingsOpen = false,
  gitChangesCount = 0,
}) {
  const handleItemClick = (id) => {
    if (id === activeTab && isExplorerOpen) {
      // Toggle sidebar off if already active
      toggleExplorer();
    } else {
      if (!isExplorerOpen) toggleExplorer();
      setActiveTab(id);
      if (id === "run" && onRun) {
        onRun();
      }
    }
  };

  return (
    <div className="ide-activity-bar" aria-label="Activity Bar">
      {/* Top action icons */}
      <div className="activity-bar-top">
        {/* 1. Files / Explorer */}
        <button
          className={`activity-bar-btn ${
            activeTab === "explorer" && isExplorerOpen ? "active" : ""
          }`}
          onClick={() => handleItemClick("explorer")}
          title="Explorer (Ctrl+Shift+E)"
          aria-label="Explorer"
        >
          <Files size={20} strokeWidth={1.8} />
        </button>

        {/* 2. Search */}
        <button
          className={`activity-bar-btn ${activeTab === "search" && isExplorerOpen ? "active" : ""}`}
          onClick={() => handleItemClick("search")}
          title="Search (Ctrl+Shift+F)"
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>

        {/* 3. Source Control */}
        <button
          className={`activity-bar-btn ${activeTab === "git" && isExplorerOpen ? "active" : ""}`}
          onClick={() => handleItemClick("git")}
          title="Source Control (Ctrl+Shift+G)"
          aria-label="Source Control"
        >
          <GitBranch size={20} strokeWidth={1.8} />
          {gitChangesCount > 0 && (
            <span className="activity-bar-badge" title={`${gitChangesCount} pending changes`}>
              {gitChangesCount > 99 ? "99+" : gitChangesCount}
            </span>
          )}
        </button>

        {/* 4. Run and Debug */}
        <button
          className={`activity-bar-btn ${(activeTab === "debug" || activeTab === "run") && isExplorerOpen ? "active" : ""}`}
          onClick={() => handleItemClick("debug")}
          title="Run and Debug (Ctrl+Shift+D)"
          aria-label="Run and Debug"
        >
          <Play size={20} strokeWidth={1.8} />
        </button>

        {/* 5. Extensions */}
        <button
          className={`activity-bar-btn ${activeTab === "extensions" ? "active" : ""}`}
          onClick={() => handleItemClick("extensions")}
          title="Extensions (Ctrl+Shift+X)"
          aria-label="Extensions"
        >
          <Grid2X2 size={20} strokeWidth={1.8} />
        </button>
      </div>

      {/* Bottom pinned settings icon */}
      <div className="activity-bar-bottom">
        <button
          className={`activity-bar-btn ${isSettingsOpen ? "active" : ""}`}
          onClick={onOpenSettings}
          title="Settings (Ctrl+,)"
          aria-label="Settings"
        >
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

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
}) {
  const handleItemClick = (id) => {
    if (id === "explorer") {
      if (activeTab === "explorer") {
        toggleExplorer();
      } else {
        if (!isExplorerOpen) toggleExplorer();
        setActiveTab("explorer");
      }
    } else {
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
          className={`activity-bar-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => handleItemClick("search")}
          title="Search (Ctrl+Shift+F)"
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>

        {/* 3. Source Control */}
        <button
          className={`activity-bar-btn ${activeTab === "git" ? "active" : ""}`}
          onClick={() => handleItemClick("git")}
          title="Source Control (Ctrl+Shift+G)"
          aria-label="Source Control"
        >
          <GitBranch size={20} strokeWidth={1.8} />
        </button>

        {/* 4. Run and Debug */}
        <button
          className={`activity-bar-btn ${activeTab === "debug" ? "active" : ""}`}
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

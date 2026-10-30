import React from "react";
import { Search, Sun, Moon, Upload, Download, Plus } from "lucide-react";

export default function DashboardHeader({
  search,
  setSearch,
  searchInputRef,
  theme,
  toggleTheme,
  folderInputRef,
  handleFolderSelected,
  onOpenImport,
  onOpenExport,
  workspacesCount = 0,
  createBtnRef,
  setShowCreate,
  createInputRef,
}) {
  return (
    <header className="dashboard-topbar">
      {/* Search Workspace Field */}
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          className="search-input-field"
          placeholder="Search workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-shortcut-badge">⌘ K</span>
      </div>

      {/* Theme Toggle Button */}
      <button
        className="dash-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label="Toggle dark and light mode"
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      {/* Hidden File Input for Folder Import */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: "none" }}
        onChange={handleFolderSelected}
      />

      {/* Import Folder Button */}
      <button
        className="btn-dash-action-secondary"
        onClick={onOpenImport}
        title="Import a folder from desktop as a new workspace"
      >
        <Upload size={17} />
        <span>Import</span>
      </button>

      {/* Export Workspaces Button */}
      <button
        className="btn-dash-action-secondary"
        onClick={onOpenExport}
        title="Export workspace folders as ZIP"
        disabled={workspacesCount === 0}
      >
        <Download size={17} />
        <span>Export</span>
      </button>

      {/* Primary "+ Create Workspace" Button */}
      <button
        ref={createBtnRef}
        className="btn-create-workspace-primary"
        onClick={() => {
          setShowCreate((prev) => {
            const next = !prev;
            if (next) {
              setTimeout(() => createInputRef.current?.focus(), 50);
            }
            return next;
          });
        }}
      >
        <Plus size={18} />
        <span>Create Workspace</span>
      </button>
    </header>
  );
}


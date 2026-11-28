import React from "react";
import { Search, Upload, Download, Plus } from "lucide-react";

export default function DashboardHeader({
  search,
  setSearch,
  searchInputRef,
  theme = "dark",
  toggleTheme = () => {},
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
        className="btn-dash-action-secondary vocode-pill-btn"
        onClick={onOpenImport}
        title="Import a folder from desktop as a new workspace"
      >
        <Upload size={17} />
        <span>Import</span>
      </button>

      {/* Export Workspaces Button */}
      <button
        className="btn-dash-action-secondary vocode-pill-btn"
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
        className="btn-create-workspace-primary vocode-pill-btn"
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
        <Plus size={16} />
        <span className="create-ws-btn-full">Create Workspace</span>
        <span className="create-ws-btn-short">Create</span>
      </button>
    </header>
  );
}


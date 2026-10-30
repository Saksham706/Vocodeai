import React from "react";
import {
  FolderClosed,
  MoreVertical,
  Pencil,
  Copy,
  Star,
  Download,
  Trash2,
  Plus,
} from "lucide-react";
import { formatRelativeTime } from "../../utils/formatTime";

export default function WorkspaceCardGrid({
  filteredWorkspaces = [],
  handleCardClick,
  menuOpenId,
  setMenuOpenId,
  openRenameModal,
  handleDuplicate,
  duplicatingId,
  handlePin,
  handleExportSingleWorkspace,
  openDeleteModal,
  search,
  showCreate,
  setShowCreate,
  createContainerRef,
  createInputRef,
  newName,
  setNewName,
  handleCreateWorkspace,
}) {
  return (
    <section className="workspaces-container">
      {/* Header Row: Heading on the left, Creation Controls on the right */}
      <div className="dashboard-header-row">
        <div className="dashboard-heading-section">
          <h1 className="dash-main-title">
            Your <span className="dash-heading-accent">Workspaces</span>
          </h1>
          <p className="dash-main-subtitle">
            Create, manage, and build with AI — all in one place.
          </p>
        </div>

        {showCreate && (
          <div className="workspace-create-inline-row" ref={createContainerRef}>
            <input
              ref={createInputRef}
              type="text"
              className="create-name-input"
              placeholder="Workspace name"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateWorkspace();
                if (e.key === "Escape") setShowCreate(false);
              }}
            />
            <button
              className="btn-create-inline"
              onClick={handleCreateWorkspace}
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* Workspace Card Grid */}
      {filteredWorkspaces.length > 0 ? (
        <div className="workspaces-grid">
          {filteredWorkspaces.map((ws) => (
            <div
              key={ws._id}
              className={`workspace-card-item ${menuOpenId === ws._id ? "has-open-menu" : ""}`}
              style={{ zIndex: menuOpenId === ws._id ? 1000 : 1 }}
            >
              {/* Folder Icon Tile (72x72) */}
              <div
                className="workspace-folder-tile"
                onClick={() => handleCardClick(ws._id)}
                title={`Open ${ws.name}`}
              >
                <FolderClosed className="workspace-folder-svg" />
              </div>

              {/* Workspace Details */}
              <div
                className="workspace-info"
                onClick={() => handleCardClick(ws._id)}
              >
                <div className="workspace-title-row">
                  <span className="workspace-name">{ws.name}</span>
                  {ws.isPinned && (
                    <span className="workspace-pinned-star" title="Pinned workspace">
                      ⭐
                    </span>
                  )}
                </div>
                <span className="workspace-meta">
                  {formatRelativeTime(ws.updatedAt || ws.createdAt)}
                </span>
              </div>

              {/* Three-Dot Overflow Trigger */}
              <button
                className="workspace-menu-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === ws._id ? null : ws._id);
                }}
                title="Workspace options"
                aria-label="Workspace options"
              >
                <MoreVertical size={19} />
              </button>

              {/* Overflow Context Dropdown */}
              {menuOpenId === ws._id && (
                <div
                  className="workspace-dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    className="dropdown-action-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      openRenameModal(ws);
                    }}
                  >
                    <Pencil size={14} />
                    <span>Rename</span>
                  </button>

                  <button
                    className="dropdown-action-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      handleDuplicate(ws);
                    }}
                    disabled={duplicatingId === ws._id}
                  >
                    <Copy size={14} />
                    <span>
                      {duplicatingId === ws._id ? "Duplicating..." : "Duplicate"}
                    </span>
                  </button>

                  <button
                    className="dropdown-action-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      handlePin(ws);
                    }}
                  >
                    <Star size={14} className={ws.isPinned ? "star-pinned-icon" : ""} />
                    <span>{ws.isPinned ? "Unpin" : "Pin"}</span>
                  </button>

                  <button
                    className="dropdown-action-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      handleExportSingleWorkspace(ws);
                    }}
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>

                  <button
                    className="dropdown-action-item danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(null);
                      openDeleteModal(ws);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="workspaces-empty-state">
          <div className="empty-state-icon-tile">
            <FolderClosed size={36} />
          </div>
          <h3 className="empty-state-title">
            {search ? "No workspaces found" : "No workspaces yet"}
          </h3>
          <p className="empty-state-desc">
            {search
              ? `No workspaces matched "${search}". Try searching for another name.`
              : "Create your first workspace to start building with Vocodeai."}
          </p>
          <button
            className="btn-create-workspace-primary"
            onClick={() => {
              setShowCreate(true);
              setTimeout(() => createInputRef.current?.focus(), 50);
            }}
          >
            <Plus size={18} />
            <span>Create Workspace</span>
          </button>
        </div>
      )}
    </section>
  );
}


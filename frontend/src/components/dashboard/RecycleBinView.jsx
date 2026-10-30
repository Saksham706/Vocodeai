import React from "react";
import { FolderClosed, Trash2, Check, RotateCcw } from "lucide-react";
import { getFileIcon } from "../../utils/getFileIcon";
import { formatRelativeTime } from "../../utils/formatTime";

export default function RecycleBinView({
  recycleItems = [],
  recycleLoading = false,
  recycleActionLoading = null,
  recycleMessage = null,
  handleRestoreItem,
  setPermDeleteModalItem,
  setShowEmptyBinModal,
  setActiveTab,
}) {
  return (
    <section className="recycle-bin-container">
      <div className="recycle-bin-header">
        <div>
          <h1 className="dash-main-title">
            Recycle <span className="dash-heading-accent">Bin</span>
          </h1>
          <p className="dash-main-subtitle">
            Restore deleted files and folders back to your workspace or permanently remove them.
          </p>
        </div>

        {recycleItems.length > 0 && (
          <button
            className="btn-empty-recycle"
            onClick={() => setShowEmptyBinModal(true)}
            disabled={recycleLoading}
          >
            <Trash2 size={16} />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {recycleMessage && (
        <div className="recycle-toast-banner">
          <Check size={16} className="recycle-toast-icon" />
          <span>{recycleMessage}</span>
        </div>
      )}

      {recycleLoading ? (
        <div className="recycle-bin-loading">
          <div className="recycle-spinner" />
          <p>Loading deleted items...</p>
        </div>
      ) : recycleItems.length === 0 ? (
        <div className="recycle-empty-state">
          <div className="recycle-empty-icon-wrap">
            <Trash2 size={42} />
          </div>
          <h3>Recycle Bin is Empty</h3>
          <p>
            Files and folders you delete in the workspace explorer will appear here before being permanently removed.
          </p>
          <button
            className="btn-create-workspace-primary"
            onClick={() => setActiveTab("workspaces")}
          >
            Back to Workspaces
          </button>
        </div>
      ) : (
        <div className="recycle-items-list">
          {recycleItems.map((item) => (
            <div key={item._id} className="recycle-item-card">
              <div className="recycle-item-icon-box">
                {item.type === "workspace" ? (
                  <FolderClosed size={24} style={{ color: "#FF9B3D" }} />
                ) : (
                  getFileIcon(item.name, item.type, false)
                )}
              </div>

              <div className="recycle-item-details">
                <div className="recycle-item-title-row">
                  <span className="recycle-item-name">{item.name}</span>
                  <span className={`recycle-item-type-badge ${item.type}`}>
                    {item.type === "workspace" ? "WORKSPACE" : item.type.toUpperCase()}
                  </span>
                  {item.items && item.items.length > 0 && item.type === "workspace" && (
                    <span className="recycle-item-ws-tag">
                      {item.items.length} {item.items.length === 1 ? "file" : "files"}
                    </span>
                  )}
                  {item.workspaceName && item.type !== "workspace" && (
                    <span className="recycle-item-ws-tag">
                      {item.workspaceName}
                    </span>
                  )}
                </div>
                <div className="recycle-item-meta">
                  <span className="recycle-item-path" title={item.originalPath}>
                    {item.type === "workspace" ? "Workspace folder: " : "Original path: "}
                    <code>{item.originalPath}</code>
                  </span>
                  <span className="recycle-item-dot">•</span>
                  <span className="recycle-item-time">
                    {formatRelativeTime(item.deletedAt)}
                  </span>
                </div>
              </div>

              <div className="recycle-item-actions">
                <button
                  className="btn-recycle-restore"
                  onClick={() => handleRestoreItem(item._id, item.name)}
                  disabled={recycleActionLoading === item._id}
                  title="Restore to workspace"
                >
                  <RotateCcw size={15} />
                  <span>
                    {recycleActionLoading === item._id ? "Restoring..." : "Restore"}
                  </span>
                </button>

                <button
                  className="btn-recycle-delete-perm"
                  onClick={() =>
                    setPermDeleteModalItem({ id: item._id, name: item.name, type: item.type })
                  }
                  disabled={recycleActionLoading === item._id}
                  title="Delete permanently"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


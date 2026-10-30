import React from "react";
import { FolderArchive, X, FolderClosed, RotateCcw, Download } from "lucide-react";
import { formatRelativeTime } from "../../utils/formatTime";

export default function ExportWorkspacesModal({
  showExportModal,
  setShowExportModal,
  isExporting,
  exportFilter,
  setExportFilter,
  toggleSelectAllExport,
  selectedExportIds,
  workspaces = [],
  toggleSelectWorkspaceForExport,
  handleConfirmExport,
}) {
  if (!showExportModal) return null;

  const filteredWorkspaces = workspaces.filter((w) =>
    (w.name || "").toLowerCase().includes(exportFilter.toLowerCase())
  );

  return (
    <div
      className="dash-modal-overlay"
      onClick={() => !isExporting && setShowExportModal(false)}
      onKeyDown={(e) => e.key === "Escape" && !isExporting && setShowExportModal(false)}
    >
      <div
        className="export-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <div className="dash-modal-title-wrap">
            <div className="dash-modal-icon">
              <FolderArchive size={17} />
            </div>
            <h3>Export Workspaces to ZIP</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={() => !isExporting && setShowExportModal(false)}
            aria-label="Close"
            disabled={isExporting}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dash-modal-body">
          <p className="dash-modal-desc" style={{ marginBottom: "14px" }}>
            Select the workspace folders you would like to package and export. A ZIP file will be generated and downloaded to your computer.
          </p>

          <div className="export-modal-controls">
            <input
              type="text"
              className="export-search-input"
              placeholder="Filter workspaces..."
              value={exportFilter}
              onChange={(e) => setExportFilter(e.target.value)}
            />
            <button
              type="button"
              className="export-select-all-btn"
              onClick={toggleSelectAllExport}
            >
              {selectedExportIds.size === workspaces.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="export-workspaces-list">
            {filteredWorkspaces.map((ws) => {
              const isSelected = selectedExportIds.has(ws._id);
              return (
                <div
                  key={ws._id}
                  className={`export-workspace-row ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSelectWorkspaceForExport(ws._id)}
                >
                  <input
                    type="checkbox"
                    className="export-checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="export-row-icon">
                    <FolderClosed size={16} />
                  </div>
                  <div className="export-row-info">
                    <div className="export-row-title-line">
                      <span className="export-row-name">{ws.name}</span>
                      {ws.isPinned && <span className="workspace-pinned-star">⭐</span>}
                    </div>
                    <span className="export-row-meta">
                      {formatRelativeTime(ws.updatedAt || ws.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-modal-footer">
          <div className="export-footer-info" style={{ marginRight: "auto" }}>
            {selectedExportIds.size} of {workspaces.length} selected
          </div>
          <button
            type="button"
            className="dash-modal-btn-cancel"
            onClick={() => setShowExportModal(false)}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dash-modal-btn-primary"
            onClick={handleConfirmExport}
            disabled={isExporting || selectedExportIds.size === 0}
          >
            {isExporting ? (
              <>
                <RotateCcw size={14} className="spin-icon" />
                <span>Creating ZIP...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export as ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import {
  Upload,
  X,
  FolderUp,
  FolderOpen,
  FolderClosed,
  FileText,
  RotateCcw,
} from "lucide-react";

export default function ImportWorkspaceModal({
  showImportModal,
  setShowImportModal,
  isImporting,
  importPendingFiles,
  setImportPendingFiles,
  importFolderName,
  setImportFolderName,
  isDragOver,
  setIsDragOver,
  handleDropFolder,
  triggerFolderBrowser,
  localPathInput,
  setLocalPathInput,
  handleScanDirectPath,
  isScanningLocal,
  commonFolders = [],
  handleConfirmImport,
}) {
  if (!showImportModal) return null;

  return (
    <div
      className="dash-modal-overlay"
      onClick={() => !isImporting && setShowImportModal(false)}
      onKeyDown={(e) =>
        e.key === "Escape" && !isImporting && setShowImportModal(false)
      }
    >
      <div
        className="dash-modal-card dash-modal-import"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <div className="dash-modal-title-wrap">
            <div className="dash-modal-icon">
              <Upload size={17} />
            </div>
            <h3>Import Workspace</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={() => !isImporting && setShowImportModal(false)}
            aria-label="Close"
            disabled={isImporting}
          >
            <X size={18} />
          </button>
        </div>

        {!importPendingFiles ? (
          /* Step 1: Drag & Drop Zone or Select Folder */
          <div className="dash-modal-body">
            <div
              className={`import-dropzone ${isDragOver ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDropFolder}
              onClick={triggerFolderBrowser}
            >
              <div className="import-dropzone-icon">
                <FolderUp size={34} />
              </div>
              <div className="import-dropzone-title">
                Drop your project folder here
              </div>
              <div className="import-dropzone-sub">
                or click to browse a folder from your desktop
              </div>
              <button
                type="button"
                className="import-browse-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFolderBrowser();
                }}
              >
                <FolderOpen size={16} />
                <span>Browse Folder</span>
              </button>
              <div className="import-dropzone-hint">
                Preserves your full folder tree, empty directories, and code.
              </div>
            </div>

            {/* Direct Path Input & Quick Folder Chips */}
            <div className="import-direct-path-wrap">
              <span className="import-path-label">Or enter folder path:</span>
              <div className="import-path-input-row">
                <input
                  type="text"
                  className="import-path-input"
                  placeholder="e.g. D:\C++_DSA or D:\output"
                  value={localPathInput}
                  onChange={(e) => setLocalPathInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScanDirectPath()}
                  disabled={isScanningLocal}
                />
                <button
                  type="button"
                  className="import-path-scan-btn"
                  onClick={() => handleScanDirectPath()}
                  disabled={isScanningLocal || !localPathInput.trim()}
                >
                  {isScanningLocal ? "Scanning..." : "Scan Folder"}
                </button>
              </div>

              {commonFolders.length > 0 && (
                <div className="import-chips-list">
                  <span className="import-chips-label">Quick select:</span>
                  {commonFolders.map((cf, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="import-folder-chip"
                      onClick={() => handleScanDirectPath(cf.path)}
                      disabled={isScanningLocal}
                      title={cf.path}
                    >
                      <FolderClosed size={12} />
                      <span>{cf.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Preview & Confirm Import */
          <form onSubmit={handleConfirmImport}>
            <div className="dash-modal-body">
              <div className="import-preview-card-wrap">
                <div className="import-preview-top">
                  <label
                    className="dash-modal-label"
                    htmlFor="import-ws-name"
                    style={{ margin: 0 }}
                  >
                    Workspace Name
                  </label>
                  <button
                    type="button"
                    className="import-change-btn"
                    onClick={() => {
                      setImportPendingFiles(null);
                      setImportFolderName("");
                    }}
                    disabled={isImporting}
                  >
                    Change Folder
                  </button>
                </div>
                <input
                  id="import-ws-name"
                  type="text"
                  className="dash-modal-input"
                  placeholder="Enter workspace name"
                  value={importFolderName}
                  onChange={(e) => setImportFolderName(e.target.value)}
                  disabled={isImporting}
                  required
                  autoFocus
                />

                <div className="import-preview-box">
                  <div className="import-preview-icon">
                    <FolderClosed size={24} />
                  </div>
                  <div className="import-preview-details">
                    <span className="import-preview-name">
                      {importFolderName || "Project Folder"}
                    </span>
                    <span className="import-preview-count">
                      {
                        importPendingFiles.filter((i) => i.type === "file")
                          .length
                      }{" "}
                      file(s) and{" "}
                      {
                        importPendingFiles.filter(
                          (i) => i.type === "folder"
                        ).length
                      }{" "}
                      folder(s) ready to import
                    </span>
                  </div>
                </div>

                {/* File Structure Preview (Folders first, then files) */}
                <div className="import-tree-preview-box">
                  {[...importPendingFiles]
                    .sort((a, b) => {
                      if (a.type === "folder" && b.type !== "folder") return -1;
                      if (a.type !== "folder" && b.type === "folder") return 1;
                      return (a.path || "").localeCompare(
                        b.path || "",
                        undefined,
                        {
                          numeric: true,
                          sensitivity: "base",
                        }
                      );
                    })
                    .slice(0, 12)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className={`import-tree-row ${
                          item.type === "folder" ? "is-folder" : ""
                        }`}
                      >
                        {item.type === "folder" ? (
                          <FolderClosed size={12} color="#F59E0B" />
                        ) : (
                          <FileText size={12} color="#38BDF8" />
                        )}
                        <span>
                          {item.path}
                          {item.type === "folder" ? "/" : ""}
                        </span>
                      </div>
                    ))}
                  {importPendingFiles.length > 12 && (
                    <div className="import-tree-more">
                      ...and {importPendingFiles.length - 12} more items
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-modal-btn-cancel"
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="dash-modal-btn-primary"
                disabled={isImporting || !importFolderName.trim()}
              >
                {isImporting ? (
                  <>
                    <RotateCcw size={14} className="spin-icon" />
                    <span>Importing files...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Import Workspace</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


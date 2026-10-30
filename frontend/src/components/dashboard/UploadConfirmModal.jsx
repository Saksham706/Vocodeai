import React from "react";
import { RotateCcw } from "lucide-react";

export default function UploadConfirmModal({
  showCenterUploadAlert,
  setShowCenterUploadAlert,
  importPendingFiles,
  importFolderName,
  setImportFolderName,
  isImporting,
  handleConfirmImport,
}) {
  if (!showCenterUploadAlert || !importPendingFiles) return null;

  const fileCount = importPendingFiles.filter((i) => i.type === "file").length;
  const folderCount = importPendingFiles.filter((i) => i.type === "folder").length;

  return (
    <div
      className="center-upload-dialog-overlay"
      onClick={() => !isImporting && setShowCenterUploadAlert(false)}
      onKeyDown={(e) =>
        e.key === "Escape" && !isImporting && setShowCenterUploadAlert(false)
      }
    >
      <div
        className="center-upload-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="center-upload-title">
          Upload {fileCount === 1 ? "one file" : `${fileCount.toLocaleString()} files`} to this site?
        </h3>

        <p className="center-upload-message">
          This will upload all files from "{importFolderName}". Only do this if you trust the site.
        </p>

        <div className="center-upload-details">
          <div className="center-upload-input-group">
            <label htmlFor="center-ws-name">Workspace Name</label>
            <input
              id="center-ws-name"
              type="text"
              className="center-upload-input"
              value={importFolderName}
              onChange={(e) => setImportFolderName(e.target.value)}
              disabled={isImporting}
              placeholder="Workspace name"
            />
          </div>
          <div className="center-upload-stats">
            <span>📁 {folderCount} folders</span>
            <span className="dot-sep">•</span>
            <span>📄 {fileCount} files</span>
          </div>
        </div>

        <div className="center-upload-actions">
          <button
            type="button"
            className="center-upload-btn-upload"
            onClick={handleConfirmImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <RotateCcw
                  size={14}
                  className="spin-icon"
                  style={{ display: "inline-block", marginRight: "6px" }}
                />
                <span>Uploading...</span>
              </>
            ) : (
              "Upload"
            )}
          </button>
          <button
            type="button"
            className="center-upload-btn-cancel"
            onClick={() => setShowCenterUploadAlert(false)}
            disabled={isImporting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { Pencil, X, RotateCcw, Check } from "lucide-react";

export default function RenameWorkspaceModal({
  renameModalWs,
  closeRenameModal,
  handleConfirmRename,
  renameInputRef,
  renameInputVal,
  setRenameInputVal,
  isRenaming,
}) {
  if (!renameModalWs) return null;

  return (
    <div
      className="dash-modal-overlay"
      onClick={closeRenameModal}
      onKeyDown={(e) => e.key === "Escape" && closeRenameModal()}
    >
      <div
        className="dash-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <div className="dash-modal-title-wrap">
            <div className="dash-modal-icon">
              <Pencil size={17} />
            </div>
            <h3>Rename Workspace</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={closeRenameModal}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleConfirmRename}>
          <div className="dash-modal-body">
            <label className="dash-modal-label" htmlFor="dash-ws-rename-input">
              Workspace Name
            </label>
            <input
              id="dash-ws-rename-input"
              ref={renameInputRef}
              type="text"
              className="dash-modal-input"
              placeholder="Enter workspace name"
              value={renameInputVal}
              onChange={(e) => setRenameInputVal(e.target.value)}
              disabled={isRenaming}
              maxLength={60}
              autoComplete="off"
            />
          </div>

          <div className="dash-modal-footer">
            <button
              type="button"
              className="dash-modal-btn-cancel"
              onClick={closeRenameModal}
              disabled={isRenaming}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dash-modal-btn-primary"
              disabled={isRenaming || !renameInputVal.trim()}
            >
              {isRenaming ? (
                <>
                  <RotateCcw size={14} className="spin-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


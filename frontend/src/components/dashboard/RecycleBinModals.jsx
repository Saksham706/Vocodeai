import React from "react";
import { Trash2, X, RotateCcw } from "lucide-react";

export function PermanentDeleteModal({
  permDeleteModalItem,
  setPermDeleteModalItem,
  handleConfirmPermanentDelete,
  recycleActionLoading,
}) {
  if (!permDeleteModalItem) return null;

  return (
    <div
      className="dash-modal-overlay"
      onClick={() => setPermDeleteModalItem(null)}
      onKeyDown={(e) => e.key === "Escape" && setPermDeleteModalItem(null)}
    >
      <div
        className="dash-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <div className="dash-modal-title-wrap">
            <div className="dash-modal-icon danger">
              <Trash2 size={17} />
            </div>
            <h3>Permanently Delete {permDeleteModalItem.type === "workspace" ? "Workspace" : "Item"}</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={() => setPermDeleteModalItem(null)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dash-modal-body">
          <p className="dash-modal-desc">
            Are you sure you want to permanently delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              "{permDeleteModalItem.name}"
            </strong>
            ? This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="dash-modal-footer">
          <button
            type="button"
            className="dash-modal-btn-cancel"
            onClick={() => setPermDeleteModalItem(null)}
            disabled={recycleActionLoading === permDeleteModalItem.id}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dash-modal-btn-danger"
            onClick={handleConfirmPermanentDelete}
            disabled={recycleActionLoading === permDeleteModalItem.id}
          >
            {recycleActionLoading === permDeleteModalItem.id ? (
              <>
                <RotateCcw size={14} className="spin-icon" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyRecycleBinModal({
  showEmptyBinModal,
  setShowEmptyBinModal,
  handleConfirmEmptyRecycleBin,
  recycleLoading,
  itemCount = 0,
}) {
  if (!showEmptyBinModal) return null;

  return (
    <div
      className="dash-modal-overlay"
      onClick={() => setShowEmptyBinModal(false)}
      onKeyDown={(e) => e.key === "Escape" && setShowEmptyBinModal(false)}
    >
      <div
        className="dash-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dash-modal-header">
          <div className="dash-modal-title-wrap">
            <div className="dash-modal-icon danger">
              <Trash2 size={17} />
            </div>
            <h3>Empty Recycle Bin</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={() => setShowEmptyBinModal(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dash-modal-body">
          <p className="dash-modal-desc">
            Are you sure you want to permanently delete all <strong>{itemCount}</strong> items in the Recycle Bin? All deleted files and folders will be purged forever.
          </p>
        </div>

        <div className="dash-modal-footer">
          <button
            type="button"
            className="dash-modal-btn-cancel"
            onClick={() => setShowEmptyBinModal(false)}
            disabled={recycleLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dash-modal-btn-danger"
            onClick={handleConfirmEmptyRecycleBin}
            disabled={recycleLoading}
          >
            {recycleLoading ? (
              <>
                <RotateCcw size={14} className="spin-icon" />
                <span>Emptying...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Empty Bin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { Trash2, X, RotateCcw } from "lucide-react";

export default function DeleteWorkspaceModal({
  deleteModalWs,
  closeDeleteModal,
  handleConfirmDelete,
  isDeleting,
}) {
  if (!deleteModalWs) return null;

  return (
    <div
      className="dash-modal-overlay"
      onClick={closeDeleteModal}
      onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
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
            <h3>Move to Recycle Bin</h3>
          </div>
          <button
            className="dash-modal-close-btn"
            onClick={closeDeleteModal}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dash-modal-body">
          <p className="dash-modal-desc">
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              "{deleteModalWs.name}"
            </strong>
            ? It will be safely moved to the <strong>Recycle Bin</strong>, where you can restore it anytime or permanently remove it.
          </p>
        </div>

        <div className="dash-modal-footer">
          <button
            type="button"
            className="dash-modal-btn-cancel"
            onClick={closeDeleteModal}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dash-modal-btn-danger"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <RotateCcw size={14} className="spin-icon" />
                <span>Moving...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Move to Recycle Bin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


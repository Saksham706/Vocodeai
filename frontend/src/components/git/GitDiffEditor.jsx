import React, { useState, useEffect } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { X, Check, RotateCcw, Columns2, Rows2 } from "lucide-react";
import { getFileIcon } from "../../utils/getFileIcon";
import { LANGUAGE_META } from "../../config/languages";
import "../../styles/sourcecontrol.css";

function getLanguageForFile(filePath) {
  if (!filePath) return "plaintext";
  const ext = filePath.split(".").pop()?.toLowerCase();
  for (const [lang, meta] of Object.entries(LANGUAGE_META)) {
    if (meta.ext === ext || (meta.aliases && meta.aliases.includes(ext))) {
      return meta.monacoLang || lang;
    }
  }
  return "plaintext";
}

export default function GitDiffEditor({
  diffData,
  onClose,
  onStage,
  onUnstage,
  onDiscard,
  theme = "vs-dark",
}) {
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  if (!diffData) return null;

  const { path, original = "", modified = "", isStaged = false } = diffData;
  const fileName = path.split("/").pop() || path;
  const language = getLanguageForFile(path);

  return (
    <div className="git-diff-container">
      {/* Diff Header */}
      <div className="git-diff-header">
        <div className="git-diff-header-left">
          {getFileIcon(fileName, "file", false)}
          <span className="git-diff-file-name">{fileName}</span>
          <span className="git-diff-file-tag">
            {isStaged ? "Index ↔ HEAD (Staged)" : "Working Tree ↔ Index"}
          </span>
        </div>

        <div className="git-diff-header-actions">
          {/* Toggle side-by-side / inline */}
          <button
            className="git-diff-action-btn"
            onClick={() => setRenderSideBySide((prev) => !prev)}
            title={renderSideBySide ? "Switch to Inline View" : "Switch to Side by Side"}
          >
            {renderSideBySide ? <Rows2 size={15} /> : <Columns2 size={15} />}
            <span>{renderSideBySide ? "Inline" : "Side by Side"}</span>
          </button>

          {isStaged ? (
            <button
              className="git-diff-action-btn"
              onClick={() => onUnstage && onUnstage(path)}
              title="Unstage changes"
            >
              <RotateCcw size={14} />
              <span>Unstage</span>
            </button>
          ) : (
            <>
              <button
                className="git-diff-action-btn"
                onClick={() => onStage && onStage(path)}
                title="Stage changes"
              >
                <Check size={14} />
                <span>Stage</span>
              </button>
              <button
                className="git-diff-action-btn danger"
                onClick={() => onDiscard && onDiscard(path)}
                title="Discard changes"
              >
                <RotateCcw size={14} />
                <span>Discard</span>
              </button>
            </>
          )}

          <div className="git-diff-divider" />

          <button
            className="git-diff-close-btn"
            onClick={onClose}
            title="Close Diff (Esc)"
            aria-label="Close Diff"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Monaco Diff Editor */}
      <div className="git-diff-editor-wrap">
        <DiffEditor
          original={original}
          modified={modified}
          language={language}
          theme={theme === "light" ? "light" : "vs-dark"}
          options={{
            readOnly: true,
            renderSideBySide,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            originalEditable: false,
          }}
        />
      </div>
    </div>
  );
}


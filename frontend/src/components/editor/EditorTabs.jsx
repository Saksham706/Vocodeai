import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import { LANGUAGE_META } from "../../config/languages";
import { Plus, X, Columns2, MoreVertical } from "lucide-react";
import "../../styles/editor.css";

export default function EditorTabs() {
  const {
    openTabs,
    activeFile,
    openFile,
    closeTab,
    dirtyFiles,
    setCreateRequest,
    isSplitEditor,
    toggleSplitEditor,
  } = useWorkspace();

  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setOptionsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current active file's extension & display label
  const activeExt = activeFile?.split(".").pop()?.toLowerCase();
  const currentLangLabel = activeExt
    ? LANGUAGE_META[activeExt]?.label || activeExt.toUpperCase()
    : "Plain Text";

  return (
    <div className="ide-tabs-bar">
      {/* LEFT: TABS LIST + NEW TAB */}
      <div className="ide-tabs-list">
        {openTabs.map((file) => {
          const fileName = file.split("/").pop();
          const isActive = activeFile === file;
          const isDirty = dirtyFiles.has(file);

          return (
            <div
              key={file}
              className={`ide-tab ${isActive ? "active" : ""}`}
              onClick={() => openFile(file)}
              title={file}
            >
              <span className="tab-icon">
                {getFileIcon(fileName, "file")}
              </span>

              <span className="tab-name">{fileName}</span>

              {isDirty && <span className="tab-dirty-dot" />}

              <button
                className="tab-close-btn"
                title="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(file);
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}

        {/* NEW TAB BUTTON */}
        <button
          className="ide-tab-new-btn"
          title="New File"
          onClick={() => setCreateRequest({ type: "file", parent: "" })}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* RIGHT: CONTROLS (LANGUAGE INDICATOR, SPLIT, MORE) */}
      <div className="ide-tabs-controls">
        {/* Language Indicator Badge (No dropdown) */}
        <div className="tab-lang-badge" title={`Language: ${currentLangLabel}`}>
          <span>{currentLangLabel}</span>
        </div>

        {/* Split Editor Toggle */}
        <button
          type="button"
          className={`tab-icon-btn ${isSplitEditor ? "active" : ""}`}
          onClick={() => toggleSplitEditor()}
          title={isSplitEditor ? "Unsplit Editor" : "Split Editor Right"}
          aria-label={isSplitEditor ? "Unsplit Editor" : "Split Editor Right"}
        >
          <Columns2 size={15} />
        </button>

        {/* More Options */}
        <div className="tab-control-dropdown-wrap" ref={optionsMenuRef}>
          <button
            className="tab-icon-btn"
            title="More Editor Actions"
            onClick={() => setOptionsMenuOpen((prev) => !prev)}
          >
            <MoreVertical size={15} />
          </button>

          {optionsMenuOpen && (
            <div className="tab-dropdown-menu">
              <div
                className="tab-dropdown-item"
                onClick={() => {
                  setOptionsMenuOpen(false);
                  setCreateRequest({ type: "file", parent: "" });
                }}
              >
                New File...
              </div>
              <div
                className="tab-dropdown-item"
                onClick={() => {
                  setOptionsMenuOpen(false);
                  if (activeFile) closeTab(activeFile);
                }}
              >
                Close Active File
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

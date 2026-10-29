import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import { LANGUAGE_META } from "../../config/languages";
import { Plus, X, Columns2, MoreVertical, ChevronDown, Check } from "lucide-react";
import "../../styles/editor.css";

const AVAILABLE_LANGUAGES = [
  { ext: "cpp", label: "C++" },
  { ext: "c", label: "C" },
  { ext: "py", label: "Python" },
  { ext: "js", label: "JavaScript" },
  { ext: "ts", label: "TypeScript" },
  { ext: "html", label: "HTML" },
  { ext: "css", label: "CSS" },
  { ext: "java", label: "Java" },
  { ext: "json", label: "JSON" },
];

export default function EditorTabs() {
  const {
    openTabs,
    activeFile,
    openFile,
    closeTab,
    dirtyFiles,
    setCreateRequest,
  } = useWorkspace();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
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

      {/* RIGHT: CONTROLS (LANGUAGE SELECTOR, SPLIT, MORE) */}
      <div className="ide-tabs-controls">
        {/* Language Selector */}
        <div className="tab-control-dropdown-wrap" ref={langMenuRef}>
          <button
            className="tab-lang-btn"
            onClick={() => setLangMenuOpen((prev) => !prev)}
            title="Select Language Mode"
          >
            <span>{currentLangLabel}</span>
            <ChevronDown size={13} />
          </button>

          {langMenuOpen && (
            <div className="tab-dropdown-menu">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <div
                  key={lang.ext}
                  className={`tab-dropdown-item ${
                    lang.label === currentLangLabel ? "active" : ""
                  }`}
                  onClick={() => setLangMenuOpen(false)}
                >
                  <span>{lang.label}</span>
                  {lang.label === currentLangLabel && <Check size={12} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Editor Toggle */}
        <button className="tab-icon-btn" title="Split Editor Right">
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

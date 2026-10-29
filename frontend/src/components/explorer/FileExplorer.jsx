import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import TreeNode from "./TreeNode";
import "../../styles/explorer.css";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode2,
  MoreVertical,
  FilePlus2,
  FolderPlus,
  RefreshCw,
  FoldVertical,
} from "lucide-react";

export default function FileExplorer({ workspaceTitle = "Vocodeai", collapseSignal, onCollapseAll }) {
  const {
    tree,
    createRequest,
    setCreateRequest,
    selectedTarget,
    setSelectedTarget,
    loadWorkspace,
    addFile,
    addFolder,
  } = useWorkspace();

  const [rootOpen, setRootOpen] = useState(true);
  const [rootMenuOpen, setRootMenuOpen] = useState(false);
  const [rootCreating, setRootCreating] = useState(null); // 'file' | 'folder'
  const rootMenuRef = useRef(null);
  const rootInputRef = useRef(null);

  // Collapse all when signal changes
  useEffect(() => {
    if (collapseSignal > 0) {
      setRootOpen(false);
    }
  }, [collapseSignal]);

  // Close root menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootMenuRef.current && !rootMenuRef.current.contains(e.target)) {
        setRootMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus root creation input
  useEffect(() => {
    if (rootCreating && rootInputRef.current) {
      rootInputRef.current.focus();
    }
  }, [rootCreating]);

  const handleRootInlineSubmit = async (e) => {
    const val = e.target.value.trim();
    if (e.key === "Enter" && val) {
      if (rootCreating === "file") {
        await addFile("", val);
      } else {
        await addFolder("", val);
      }
      setRootCreating(null);
      setRootOpen(true);
    } else if (e.key === "Escape") {
      setRootCreating(null);
    }
  };

  const isRootSelected = selectedTarget?.path === "" && selectedTarget?.type === "folder";

  return (
    <div className="file-explorer-tree-wrap">
      {/* ROOT WORKSPACE FOLDER ROW (▾ Vocodeai   [+file] [+folder] [↻] [⋮]) */}
      <div
        className={`tree-row folder root-row ${isRootSelected ? "selected" : ""}`}
        onClick={() => {
          setSelectedTarget({ path: "", type: "folder" });
          setRootOpen((prev) => !prev);
        }}
      >
        <div className="tree-left">
          <span className="arrow-col">
            {rootOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>

          <span className="folder-name-label root-label">
            {workspaceTitle || "Vocodeai"}
          </span>
        </div>

        {/* 4 Root Action Icons matching reference screenshot */}
        <div
          className={`tree-right-actions root-actions ${rootMenuOpen ? "menu-open" : ""}`}
          ref={rootMenuRef}
        >
          {/* 1. New File */}
          <button
            className="row-menu-btn"
            title="New File"
            onClick={(e) => {
              e.stopPropagation();
              setRootOpen(true);
              setRootCreating("file");
            }}
          >
            <FilePlus2 size={13} />
          </button>

          {/* 2. New Folder */}
          <button
            className="row-menu-btn"
            title="New Folder"
            onClick={(e) => {
              e.stopPropagation();
              setRootOpen(true);
              setRootCreating("folder");
            }}
          >
            <FolderPlus size={13} />
          </button>

          {/* 3. Refresh */}
          <button
            className="row-menu-btn"
            title="Refresh Explorer"
            onClick={(e) => {
              e.stopPropagation();
              loadWorkspace();
            }}
          >
            <RefreshCw size={12} />
          </button>

          {/* 4. More Options */}
          <button
            className="row-menu-btn"
            title="More Actions"
            onClick={(e) => {
              e.stopPropagation();
              setRootMenuOpen((prev) => !prev);
            }}
          >
            <MoreVertical size={13} />
          </button>

          {rootMenuOpen && (
            <div className="tree-context-menu" onClick={(e) => e.stopPropagation()}>
              <div
                className="context-menu-item"
                onClick={() => {
                  setRootMenuOpen(false);
                  setRootOpen(true);
                  setRootCreating("file");
                }}
              >
                <FilePlus2 size={13} />
                <span>New File in Root</span>
              </div>
              <div
                className="context-menu-item"
                onClick={() => {
                  setRootMenuOpen(false);
                  setRootOpen(true);
                  setRootCreating("folder");
                }}
              >
                <FolderPlus size={13} />
                <span>New Folder in Root</span>
              </div>
              <div
                className="context-menu-item"
                onClick={() => {
                  setRootMenuOpen(false);
                  loadWorkspace();
                }}
              >
                <RefreshCw size={13} />
                <span>Refresh Explorer</span>
              </div>
              {onCollapseAll && (
                <div
                  className="context-menu-item"
                  onClick={() => {
                    setRootMenuOpen(false);
                    onCollapseAll();
                  }}
                >
                  <FoldVertical size={13} />
                  <span>Collapse All</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Root Inline Creation Input */}
      {rootCreating && (
        <div className="tree-sub-guides" style={{ paddingLeft: "24px" }}>
          <div className="tree-row creating-row">
            <span className="icon-col">
              {rootCreating === "file" ? (
                <FileCode2 size={15} color="#38BDF8" />
              ) : (
                <Folder size={15} color="#F59E0B" />
              )}
            </span>
            <input
              ref={rootInputRef}
              className="inline-create-input"
              placeholder={rootCreating === "file" ? "fileName.ext" : "folderName"}
              onKeyDown={handleRootInlineSubmit}
              onBlur={() => setRootCreating(null)}
            />
          </div>
        </div>
      )}

      {/* Root Children with Vertical Guide Lines */}
      {rootOpen && (
        <div className="tree-sub-guides root-children">
          {/* External global create request at root */}
          {createRequest && createRequest.parent === "" && (
            <div className="tree-row creating-row" style={{ paddingLeft: "10px" }}>
              <span className="icon-col">
                {createRequest.type === "file" ? (
                  <FileCode2 size={15} color="#38BDF8" />
                ) : (
                  <Folder size={15} color="#F59E0B" />
                )}
              </span>
              <input
                autoFocus
                className="inline-create-input"
                placeholder={createRequest.type === "file" ? "newFile.ext" : "newFolder"}
                onKeyDown={async (e) => {
                  const val = e.target.value.trim();
                  if (e.key === "Enter" && val) {
                    if (createRequest.type === "file") await addFile("", val);
                    else await addFolder("", val);
                    setCreateRequest(null);
                  } else if (e.key === "Escape") {
                    setCreateRequest(null);
                  }
                }}
                onBlur={() => setCreateRequest(null)}
              />
            </div>
          )}

          {tree?.children?.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              path=""
              depth={1}
              collapseSignal={collapseSignal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

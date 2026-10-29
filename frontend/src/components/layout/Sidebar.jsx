import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  FilePlus2,
  FolderPlus,
  FoldVertical,
  RefreshCw,
} from "lucide-react";
import FileExplorer from "../explorer/FileExplorer";
import { useWorkspace } from "../../context/WorkspaceContext";
import "../../styles/sidebar.css";

export default function Sidebar({ onClose }) {
  const {
    currentWorkspace,
    loadWorkspace,
    selectedTarget,
    setCreateRequest,
  } = useWorkspace();

  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);
  const [collapseSignal, setCollapseSignal] = useState(0);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerInlineNewFile = () => {
    const targetParent = selectedTarget?.path || "";
    setCreateRequest({ type: "file", parent: targetParent });
  };

  const handleTriggerInlineNewFolder = () => {
    const targetParent = selectedTarget?.path || "";
    setCreateRequest({ type: "folder", parent: targetParent });
  };

  const handleCollapseAll = () => {
    setCollapseSignal((prev) => prev + 1);
  };

  const workspaceTitle = currentWorkspace?.name || "Vocodeai";

  return (
    <aside className="ide-sidebar">
      {/* 1. EXPLORER SECTION HEADER (Matches reference: 'Explorer' with '...') */}
      <div className="sidebar-explorer-header" ref={headerMenuRef}>
        <span className="explorer-header-title">Explorer</span>

        <button
          className="explorer-header-btn"
          title="Views and More Actions"
          onClick={() => setHeaderMenuOpen((prev) => !prev)}
          aria-label="More Explorer Actions"
        >
          <MoreHorizontal size={16} />
        </button>

        {headerMenuOpen && (
          <div className="explorer-dropdown-menu">
            <div
              className="ws-dropdown-item"
              onClick={() => {
                setHeaderMenuOpen(false);
                loadWorkspace();
              }}
            >
              <RefreshCw size={13} />
              <span>Refresh Explorer</span>
            </div>
            <div
              className="ws-dropdown-item"
              onClick={() => {
                setHeaderMenuOpen(false);
                handleCollapseAll();
              }}
            >
              <FoldVertical size={13} />
              <span>Collapse All Folders</span>
            </div>
            <div
              className="ws-dropdown-item"
              onClick={() => {
                setHeaderMenuOpen(false);
                handleTriggerInlineNewFile();
              }}
            >
              <FilePlus2 size={13} />
              <span>New File</span>
            </div>
            <div
              className="ws-dropdown-item"
              onClick={() => {
                setHeaderMenuOpen(false);
                handleTriggerInlineNewFolder();
              }}
            >
              <FolderPlus size={13} />
              <span>New Folder</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. FILE TREE CONTENT */}
      <div className="sidebar-tree-container">
        <FileExplorer
          workspaceTitle={workspaceTitle}
          collapseSignal={collapseSignal}
          onCollapseAll={handleCollapseAll}
        />
      </div>
    </aside>
  );
}

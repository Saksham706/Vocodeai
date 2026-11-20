import React, { useState, useEffect, useRef, useMemo } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import TreeNode from "./TreeNode";
import { sortTreeNodes } from "../../utils/buildTree";
import { getEffectiveSettings } from "../../utils/settingsStorage";
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
  Search,
  X,
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
    currentProject,
    currentWorkspace,
  } = useWorkspace();

  const wsKey = currentProject || currentWorkspace?._id || workspaceTitle || "ws_root";

  const [showHiddenFiles, setShowHiddenFiles] = useState(() => {
    return getEffectiveSettings()?.files?.showHiddenFiles ?? false;
  });

  useEffect(() => {
    const handleSettingsChange = (e) => {
      const hidden =
        e.detail?.settings?.files?.showHiddenFiles ??
        getEffectiveSettings()?.files?.showHiddenFiles;
      if (hidden !== undefined) setShowHiddenFiles(hidden);
    };
    window.addEventListener("vocode-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("vocode-settings-changed", handleSettingsChange);
  }, []);

  const [rootOpen, setRootOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(`vocode_root_open_${wsKey}`);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [rootMenuOpen, setRootMenuOpen] = useState(false);
  const [rootCreating, setRootCreating] = useState(null); // 'file' | 'folder'
  const rootMenuRef = useRef(null);
  const rootInputRef = useRef(null);

  const toggleRootOpen = () => {
    setRootOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`vocode_root_open_${wsKey}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const openRoot = () => {
    setRootOpen(true);
    try {
      localStorage.setItem(`vocode_root_open_${wsKey}`, JSON.stringify(true));
    } catch {}
  };

  // Collapse all when signal changes
  useEffect(() => {
    if (collapseSignal > 0) {
      setRootOpen(false);
      try {
        localStorage.setItem(`vocode_root_open_${wsKey}`, JSON.stringify(false));
      } catch {}
    }
  }, [collapseSignal, wsKey]);

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

  const [showFilter, setShowFilter] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterFolder, setFilterFolder] = useState(null);
  const filterInputRef = useRef(null);

  useEffect(() => {
    const handleToggle = () => {
      setShowFilter((prev) => {
        const next = !prev;
        if (next) {
          openRoot();
          setTimeout(() => filterInputRef.current?.focus(), 50);
        } else {
          setFilterQuery("");
          setFilterFolder(null);
        }
        return next;
      });
    };
    const handleSearchFolder = (e) => {
      setShowFilter(true);
      setFilterFolder(e.detail?.folderPath || null);
      setFilterQuery("");
      openRoot();
      setTimeout(() => filterInputRef.current?.focus(), 50);
    };

    window.addEventListener("vocode-toggle-explorer-search", handleToggle);
    window.addEventListener("vocode-search-in-folder", handleSearchFolder);
    return () => {
      window.removeEventListener("vocode-toggle-explorer-search", handleToggle);
      window.removeEventListener("vocode-search-in-folder", handleSearchFolder);
    };
  }, []);

  // Recursive filter for tree based on search query and folder scope
  const { filteredTree, matchCount } = useMemo(() => {
    const rawChildren = Array.isArray(tree?.children) ? tree.children : [];
    if (!filterQuery.trim() && !filterFolder) {
      return { filteredTree: rawChildren, matchCount: 0 };
    }

    const q = filterQuery.trim().toLowerCase();
    let count = 0;

    const filterNode = (node, parentPath = "") => {
      if (!node) return null;
      const fullPath = node.path || (parentPath ? `${parentPath}/${node.name}` : node.name);

      if (filterFolder) {
        const isSelfOrInside = fullPath === filterFolder || fullPath.startsWith(filterFolder + "/");
        const isAncestor = filterFolder.startsWith(fullPath + "/");
        if (!isSelfOrInside && !isAncestor) {
          return null;
        }
      }

      const isMatching = !q || (node.name || "").toLowerCase().includes(q);

      if (node.type === "file") {
        if (isMatching) {
          count++;
          return { ...node, path: fullPath };
        }
        return null;
      }

      // Folder
      let filteredChildren = [];
      if (Array.isArray(node.children)) {
        filteredChildren = node.children
          .map((child) => filterNode(child, fullPath))
          .filter(Boolean);
      }

      if (isMatching || filteredChildren.length > 0) {
        if (isMatching && q) count++;
        return {
          ...node,
          path: fullPath,
          children: filteredChildren,
          defaultOpen: true,
        };
      }

      return null;
    };

    const result = rawChildren.map((child) => filterNode(child, "")).filter(Boolean);
    return { filteredTree: result, matchCount: count };
  }, [tree, filterQuery, filterFolder]);

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
      openRoot();
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
          toggleRootOpen();
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
              openRoot();
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
              openRoot();
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

          {/* 4. Search Files & Folders */}
          <button
            className={`row-menu-btn ${showFilter ? "active" : ""}`}
            title="Search Files & Folders (Ctrl+F)"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilter((prev) => {
                const next = !prev;
                if (next) {
                  openRoot();
                  setTimeout(() => filterInputRef.current?.focus(), 50);
                } else {
                  setFilterQuery("");
                  setFilterFolder(null);
                }
                return next;
              });
            }}
          >
            <Search size={12} />
          </button>

          {/* 5. More Options */}
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
                  openRoot();
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
                  openRoot();
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
                  setShowFilter(true);
                  openRoot();
                  setTimeout(() => filterInputRef.current?.focus(), 50);
                }}
              >
                <Search size={13} />
                <span>Search in Workspace</span>
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

      {/* Explorer Search & Filter Bar (Compact Single Line) */}
      {showFilter && (
        <div className="explorer-filter-bar">
          <Search size={13} className="explorer-filter-icon" />

          {filterFolder && (
            <span className="filter-folder-tag" title={`Scoped to folder: ${filterFolder}`}>
              <span>{filterFolder.split("/").pop()}</span>
              <button
                type="button"
                className="tag-clear-btn"
                title="Remove folder filter"
                onClick={() => setFilterFolder(null)}
              >
                <X size={10} />
              </button>
            </span>
          )}

          <input
            ref={filterInputRef}
            type="text"
            className="explorer-filter-input"
            placeholder={filterFolder ? `Search in ${filterFolder.split("/").pop()}...` : "Search files & folders..."}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowFilter(false);
                setFilterQuery("");
                setFilterFolder(null);
              }
            }}
          />

          {(filterQuery || filterFolder) && (
            <span className="filter-match-count" title={`${matchCount} matching items`}>
              {matchCount}
            </span>
          )}

          {filterQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              title="Clear query"
              onClick={() => setFilterQuery("")}
            >
              <X size={11} />
            </button>
          )}

          <button
            type="button"
            className="filter-close-btn"
            title="Close search (Esc)"
            onClick={() => {
              setShowFilter(false);
              setFilterQuery("");
              setFilterFolder(null);
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

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

          {sortTreeNodes(filteredTree)
            .filter((child) => showHiddenFiles || !child.name.startsWith("."))
            .map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                path=""
                depth={1}
                collapseSignal={collapseSignal}
              />
            ))}

          {filteredTree?.length === 0 && (filterQuery || filterFolder) && (
            <div className="explorer-empty-filter">
              <span>No files or folders found</span>
              <button
                className="explorer-reset-filter-btn"
                onClick={() => {
                  setFilterQuery("");
                  setFilterFolder(null);
                }}
              >
                Reset search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

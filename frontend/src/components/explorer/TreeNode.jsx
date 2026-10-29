import React, { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import "../../styles/explorer.css";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  FilePlus2,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
  Folder,
  FolderOpen,
  FileCode2,
} from "lucide-react";

export default function TreeNode({ node, path, depth = 0, collapseSignal }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(node.name);
  const [creating, setCreating] = useState(null); // 'file' | 'folder'
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const deleteModalRef = useRef(null);

  const {
    openFile,
    addFile,
    addFolder,
    renameNode,
    deleteNode,
    activeFile,
    dirtyFiles,
    createRequest,
    setCreateRequest,
    selectedTarget,
    setSelectedTarget,
  } = useWorkspace();

  if (node.name === ".workspace.json") return null;

  const currentPath = path ? `${path}/${node.name}` : node.name;
  const isFile = node.type === "file";
  const isActiveFile = isFile && activeFile === currentPath;
  const isSelectedFolder = !isFile && selectedTarget?.path === currentPath;
  const isDirty = dirtyFiles.has(currentPath);

  // Collapse folder when collapseSignal triggers
  useEffect(() => {
    if (collapseSignal > 0 && !isFile) {
      setOpen(false);
    }
  }, [collapseSignal, isFile]);

  // Focus rename or inline creation inputs
  useEffect(() => {
    if ((editing || creating) && inputRef.current) {
      inputRef.current.focus();
      if (editing && isFile) {
        // Select basename excluding extension for smooth VS Code-style rename
        const dotIndex = tempName.lastIndexOf(".");
        if (dotIndex > 0) {
          inputRef.current.setSelectionRange(0, dotIndex);
        } else {
          inputRef.current.select();
        }
      } else if (editing) {
        inputRef.current.select();
      }
    }
  }, [editing, creating, isFile, tempName]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(e.target)) {
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitRename = async () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== node.name) {
      await renameNode(currentPath, trimmed);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setTempName(node.name);
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteNode(currentPath);
    setShowDeleteConfirm(false);
    setMenuOpen(false);
  };

  const copyRelativePath = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentPath);
    setMenuOpen(false);
  };

  // Keyboard shortcut listener for F2 and Delete on selected items
  const handleKeyDownRow = (e) => {
    if (isActiveFile || isSelectedFolder) {
      if (e.key === "F2") {
        e.preventDefault();
        setEditing(true);
      } else if (e.key === "Delete") {
        e.preventDefault();
        setShowDeleteConfirm(true);
      }
    }
  };

  /* ===================================================
     FOLDER NODE RENDERING
     =================================================== */
  if (node.type === "folder") {
    return (
      <div className="tree-node-group">
        {/* FOLDER ROW */}
        <div
          className={`tree-row folder ${isSelectedFolder ? "selected" : ""}`}
          onClick={() => {
            setSelectedTarget({ path: currentPath, type: "folder" });
            if (!editing) setOpen((prev) => !prev);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuOpen(true);
          }}
          tabIndex={0}
          onKeyDown={handleKeyDownRow}
        >
          <div className="tree-left">
            <span
              className="arrow-col"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((prev) => !prev);
              }}
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>

            <span className="icon-col">
              {getFileIcon(node.name, "folder", open)}
            </span>

            {editing ? (
              <input
                ref={inputRef}
                className="inline-create-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") cancelRename();
                }}
                onBlur={cancelRename}
              />
            ) : (
              <span className="folder-name-label">{node.name}</span>
            )}
          </div>

          {/* 3-dots Menu Button */}
          <div
            className={`tree-right-actions ${menuOpen ? "menu-open" : ""}`}
            ref={menuRef}
          >
            <button
              className="row-menu-btn"
              title="Folder Options"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <div
                className="tree-context-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="context-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpen(true);
                    setCreating("file");
                  }}
                >
                  <FilePlus2 size={13} />
                  <span>New File...</span>
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setOpen(true);
                    setCreating("folder");
                  }}
                >
                  <FolderPlus size={13} />
                  <span>New Folder...</span>
                </div>
                <div
                  className="context-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                >
                  <Pencil size={13} />
                  <span>Rename</span>
                  <span className="shortcut-hint">F2</span>
                </div>
                <div
                  className="context-menu-item"
                  onClick={copyRelativePath}
                >
                  <Copy size={13} />
                  <span>Copy Path</span>
                </div>
                <div
                  className="context-menu-item text-danger"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal / Popover */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div
              className="delete-confirm-card"
              ref={deleteModalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Delete Folder?</h4>
              <p>
                Are you sure you want to delete <strong>{node.name}</strong> and all its contents? This cannot be undone.
              </p>
              <div className="confirm-buttons">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline Folder Creation Row */}
        {creating && (
          <div className="tree-sub-guides" style={{ paddingLeft: "18px" }}>
            <div className="tree-row creating-row">
              <span className="icon-col">
                {creating === "file" ? (
                  <FileCode2 size={15} color="#38BDF8" />
                ) : (
                  <Folder size={15} color="#F59E0B" />
                )}
              </span>
              <input
                ref={inputRef}
                className="inline-create-input"
                placeholder={creating === "file" ? "newFile.ext" : "newFolder"}
                onKeyDown={async (e) => {
                  const val = e.target.value.trim();
                  if (e.key === "Enter" && val) {
                    if (creating === "file") await addFile(currentPath, val);
                    else await addFolder(currentPath, val);
                    setCreating(null);
                    setOpen(true);
                  } else if (e.key === "Escape") {
                    setCreating(null);
                  }
                }}
                onBlur={() => setCreating(null)}
              />
            </div>
          </div>
        )}

        {/* External Global Create Request targeted at this folder */}
        {createRequest && createRequest.parent === currentPath && (
          <div className="tree-sub-guides" style={{ paddingLeft: "18px" }}>
            <div className="tree-row creating-row">
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
                    if (createRequest.type === "file") await addFile(currentPath, val);
                    else await addFolder(currentPath, val);
                    setCreateRequest(null);
                    setOpen(true);
                  } else if (e.key === "Escape") {
                    setCreateRequest(null);
                  }
                }}
                onBlur={() => setCreateRequest(null)}
              />
            </div>
          </div>
        )}

        {/* FOLDER CHILDREN WITH VERTICAL GUIDE LINES */}
        {open && node.children && (
          <div className="tree-sub-guides">
            {node.children.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                path={currentPath}
                depth={depth + 1}
                collapseSignal={collapseSignal}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ===================================================
     FILE NODE RENDERING
     =================================================== */
  return (
    <div className="tree-node-group">
      <div
        className={`tree-row file ${isActiveFile ? "selected active" : ""}`}
        onClick={() => {
          setSelectedTarget({ path: path, type: "file" });
          if (!editing) openFile(currentPath);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        tabIndex={0}
        onKeyDown={handleKeyDownRow}
      >
        <div className="tree-left">
          <span className="arrow-col empty" />

          <span className="icon-col">
            {getFileIcon(node.name, "file")}
          </span>

          {editing ? (
            <input
              ref={inputRef}
              className="inline-create-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                if (e.key === "Escape") cancelRename();
              }}
              onBlur={cancelRename}
            />
          ) : (
            <span className="file-name-label">
              {node.name}
              {isDirty && <span className="dirty-dot">●</span>}
            </span>
          )}
        </div>

        {/* 3-dots Menu Button */}
        <div
          className={`tree-right-actions ${menuOpen ? "menu-open" : ""}`}
          ref={menuRef}
        >
          <button
            className="row-menu-btn"
            title="File Options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div
              className="tree-context-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="context-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  openFile(currentPath);
                }}
              >
                <span>Open in Editor</span>
              </div>
              <div
                className="context-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                <Pencil size={13} />
                <span>Rename</span>
                <span className="shortcut-hint">F2</span>
              </div>
              <div
                className="context-menu-item"
                onClick={copyRelativePath}
              >
                <Copy size={13} />
                <span>Copy Path</span>
              </div>
              <div
                className="context-menu-item text-danger"
                onClick={() => {
                  setMenuOpen(false);
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal / Popover */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="delete-confirm-card"
            ref={deleteModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Delete File?</h4>
            <p>
              Are you sure you want to permanently delete <strong>{node.name}</strong>?
            </p>
            <div className="confirm-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

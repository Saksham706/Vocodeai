import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import "../../styles/explorer.css";

export default function TreeNode({ node, path }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(node.name);
  const [creating, setCreating] = useState(null);

  const inputRef = useRef(null);

  const {
    openFile,
    addFile,
    addFolder,
    renameNode,
    deleteNode,
    activeFile,
    dirtyFiles,
    setCreateRequest,
  } = useWorkspace();

  if (node.name === ".workspace.json") return null;

  const currentPath = path ? `${path}/${node.name}` : node.name;

  const isActive =
    node.type === "file" && activeFile === currentPath;

  const isDirty = dirtyFiles.has(currentPath);

  useEffect(() => {
    if ((editing || creating) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, creating]);

  const submitRename = () => {
    if (tempName && tempName !== node.name) {
      renameNode(currentPath, tempName);
    }
    setEditing(false);
  };

  const cancelRename = () => {
    setTempName(node.name);
    setEditing(false);
  };

  if (node.isNew) {
    return (
      <div className="tree-row creating">
        <span className="file-indent" />
        <input
          ref={inputRef}
          className="rename-input"
          placeholder={
            node.type === "file" ? "newFile.ext" : "newFolder"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              node.type === "file"
                ? addFile(path, e.target.value.trim())
                : addFolder(path, e.target.value.trim());
              setCreateRequest(null);
            }
            if (e.key === "Escape") setCreateRequest(null);
          }}
        />
      </div>
    );
  }


  if (node.type === "folder") {
    return (
      <div className="tree-node">
        <div className="tree-row folder">
          <div
            className="tree-left"
            onClick={() => !editing && setOpen(!open)}
          >
            <span className="arrow">
              {open ? "▼" : "▶"}
            </span>

            <span className="icon">
              {getFileIcon(node.name, "folder", open)}
            </span>

            {editing ? (
              <input
                ref={inputRef}
                className="rename-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") cancelRename();
                }}
                onBlur={cancelRename}
              />
            ) : (
              <span className="name">{node.name}</span>
            )}
          </div>

          {!editing && (
            <div className="tree-actions">
              <button onClick={() => setCreating("file")}>
                ＋📄
              </button>
              <button onClick={() => setCreating("folder")}>
                ＋📁
              </button>
              <button onClick={() => setEditing(true)}>✎</button>
              <button onClick={() => deleteNode(currentPath)}>
                🗑
              </button>
            </div>
          )}
        </div>

        {creating && (
          <div className="tree-row creating">
            <span className="file-indent" />
            <input
              ref={inputRef}
              className="rename-input"
              placeholder={
                creating === "file"
                  ? "newFile.ext"
                  : "newFolder"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  creating === "file"
                    ? addFile(currentPath, e.target.value.trim())
                    : addFolder(
                        currentPath,
                        e.target.value.trim()
                      );
                  setCreating(null);
                  setOpen(true);
                }
                if (e.key === "Escape") setCreating(null);
              }}
              onBlur={() => setCreating(null)}
            />
          </div>
        )}

        {open &&
          node.children?.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              path={currentPath}
            />
          ))}
      </div>
    );
  }

  return (
    <div
      className={`tree-row file ${
        isActive ? "active" : ""
      }`}
      onClick={() => !editing && openFile(currentPath)}
    >
      <span className="file-indent" />

      <span className="icon">
        {getFileIcon(node.name, "file")}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          className="rename-input"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitRename();
            if (e.key === "Escape") cancelRename();
          }}
          onBlur={cancelRename}
        />
      ) : (
        <span className="name">
          {node.name}
          {isDirty && (
            <span className="dirty-dot">●</span>
          )}
        </span>
      )}

      {!editing && (
  <div className="tree-actions">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    >
      ✎
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteNode(currentPath);
      }}
    >
      🗑
    </button>
  </div>
)}
    </div>
  );
}
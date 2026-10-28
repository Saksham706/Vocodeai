import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
  duplicateWorkspace,
  pinWorkspace,
} from "../services/workspaceApi";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const createRef = useRef(null);

  /* LOAD */
  useEffect(() => {
    if (!accessToken) return;
    listWorkspaces(accessToken).then(setWorkspaces);
  }, [accessToken]);

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  /* CREATE */
  const create = async () => {
    if (!newName.trim()) return;
    const ws = await createWorkspace(accessToken, newName);
    setWorkspaces((p) => [ws, ...p]);
    setNewName("");
    setShowCreate(false);
  };

  /* DELETE */
  const handleDelete = async (id) => {
    await deleteWorkspace(accessToken, id);
    setWorkspaces((p) => p.filter((w) => w._id !== id));
  };

  /* DUPLICATE */
  const handleDuplicate = async (id) => {
    const copy = await duplicateWorkspace(accessToken, id);
    setWorkspaces((p) => [copy, ...p]);
  };

  /* PIN */
  const handlePin = async (ws) => {
    const updated = await pinWorkspace(
      accessToken,
      ws._id,
      !ws.isPinned
    );

    setWorkspaces((p) =>
      p.map((w) => (w._id === ws._id ? updated : w))
    );
  };

  /* RENAME */
  const submitRename = async (ws) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    const updated = await renameWorkspace(
      accessToken,
      ws._id,
      renameValue
    );

    setWorkspaces((p) =>
      p.map((w) => (w._id === ws._id ? updated : w))
    );

    setRenamingId(null);
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="brand">
          <img src="/Nlogo.png" />
        </div>

        <div className="actions">
          <input
            className="search-input"
            placeholder="Search workspace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="create-btn" onClick={() => setShowCreate(true)}>
            + Create Workspace
          </button>

          {showCreate && (
            <div className="create-popup">
              <input
                ref={createRef}
                placeholder="Workspace name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
              />
              <button className="create-btn" onClick={create}>Create</button>
            </div>
          )}
        </div>
      </header>

      {/* GRID */}
      <section className="workspace-grid">
        {filtered.map((ws) => (
          <div key={ws._id} className="workspace-card">
            <div
              className="card-main"
              onClick={() => navigate(`/workspace/${ws._id}`)}
            >
              <div className="folder-icon">📁</div>

              {renamingId === ws._id ? (
                <input
                  className="rename-input"
                  value={renameValue}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => submitRename(ws)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && submitRename(ws)
                  }
                />
              ) : (
                <span className="name">{ws.name}</span>
              )}

              {ws.isPinned && <span className="pin">⭐</span>}
            </div>

            {/* MENU BUTTON */}
            <button
              className="menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(menuOpen === ws._id ? null : ws._id);
              }}
            >
              ⋮
            </button>

            {/* DROPDOWN */}
            {menuOpen === ws._id && (
              <div className="dropdown">
                <div
                  onClick={() => {
                    setRenamingId(ws._id);
                    setRenameValue(ws.name);
                    setMenuOpen(null);
                  }}
                >
                  ✏️ Rename
                </div>

                <div
                  onClick={() => {
                    handleDuplicate(ws._id);
                    setMenuOpen(null);
                  }}
                >
                  📋 Duplicate
                </div>

                <div
                  onClick={() => {
                    handlePin(ws);
                    setMenuOpen(null);
                  }}
                >
                  ⭐ {ws.isPinned ? "Unpin" : "Pin"}
                </div>

                <div
                  className="danger"
                  onClick={() => handleDelete(ws._id)}
                >
                  🗑 Delete
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
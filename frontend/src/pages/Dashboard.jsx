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
import {
  getRecycleBin,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem,
  emptyRecycleBin,
} from "../services/fileApi";
import { getFileIcon } from "../utils/getFileIcon";
import {
  LayoutDashboard,
  Layers3,
  SquareTerminal,
  Sparkles,
  Settings,
  Search,
  Plus,
  FolderClosed,
  MoreVertical,
  ChevronRight,
  Sun,
  Moon,
  Pencil,
  Copy,
  Star,
  Trash2,
  LogOut,
  Menu,
  X,
  RotateCcw,
  Check,
} from "lucide-react";
import DashboardBackground from "../components/DashboardBackground";
import "../styles/dashboard.css";

/* Helper for relative timestamp formatting (e.g., "Updated 2 minutes ago") */
function formatRelativeTime(dateString) {
  if (!dateString) return "Updated 2 minutes ago";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Updated just now";
    if (diffMins === 1) return "Updated 1 minute ago";
    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    if (diffHours === 1) return "Updated 1 hour ago";
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;
    if (diffDays === 1) return "Updated yesterday";
    return `Updated ${diffDays} days ago`;
  } catch {
    return "Updated 2 minutes ago";
  }
}

export default function Dashboard() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();

  // Shared Theme State (Synced with localStorage & Landing/Auth pages)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  // State Management
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("workspaces");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Recycle Bin state
  const [recycleItems, setRecycleItems] = useState([]);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleActionLoading, setRecycleActionLoading] = useState(null);
  const [recycleMessage, setRecycleMessage] = useState(null);

  const searchInputRef = useRef(null);
  const createInputRef = useRef(null);
  const createContainerRef = useRef(null);
  const createBtnRef = useRef(null);

  // Load Workspaces
  useEffect(() => {
    if (!accessToken) return;
    listWorkspaces(accessToken).then((data) => {
      // If user has no workspaces from API, provide initial default workspace if empty
      if (Array.isArray(data) && data.length > 0) {
        setWorkspaces(data);
      } else {
        setWorkspaces([
          {
            _id: "demo-java",
            name: "Java",
            updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            isPinned: false,
          },
        ]);
      }
    });
  }, [accessToken]);

  // Load Recycle Bin
  const loadRecycleBin = async () => {
    if (!accessToken) return;
    try {
      setRecycleLoading(true);
      const items = await getRecycleBin(accessToken);
      setRecycleItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load recycle bin:", err);
    } finally {
      setRecycleLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadRecycleBin();
    }
  }, [accessToken]);

  useEffect(() => {
    if (activeTab === "recycle-bin" && accessToken) {
      loadRecycleBin();
    }
  }, [activeTab, accessToken]);

  const handleRestoreItem = async (id, name) => {
    if (!accessToken) return;
    try {
      setRecycleActionLoading(id);
      await restoreRecycleBinItem(accessToken, id);
      setRecycleItems((prev) => prev.filter((item) => item._id !== id));
      setRecycleMessage(`Restored "${name}" successfully`);
      setTimeout(() => setRecycleMessage(null), 3500);
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore item: " + err.message);
    } finally {
      setRecycleActionLoading(null);
    }
  };

  const handlePermanentDeleteItem = async (id, name) => {
    if (!accessToken) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setRecycleActionLoading(id);
      await permanentlyDeleteRecycleBinItem(accessToken, id);
      setRecycleItems((prev) => prev.filter((item) => item._id !== id));
      setRecycleMessage(`Permanently deleted "${name}"`);
      setTimeout(() => setRecycleMessage(null), 3500);
    } catch (err) {
      console.error("Permanent delete failed:", err);
      alert("Failed to permanently delete item: " + err.message);
    } finally {
      setRecycleActionLoading(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!accessToken || recycleItems.length === 0) return;
    if (
      !window.confirm(
        "Are you sure you want to permanently delete all items in the Recycle Bin? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setRecycleLoading(true);
      await emptyRecycleBin(accessToken);
      setRecycleItems([]);
      setRecycleMessage("Recycle bin emptied");
      setTimeout(() => setRecycleMessage(null), 3500);
    } catch (err) {
      console.error("Empty recycle bin failed:", err);
      alert("Failed to empty recycle bin: " + err.message);
    } finally {
      setRecycleLoading(false);
    }
  };

  // Command + K keyboard shortcut handler for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter workspaces by search
  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close menus and creation box on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      setMenuOpenId(null);
      setProfileMenuOpen(false);

      if (
        createContainerRef.current &&
        !createContainerRef.current.contains(e.target) &&
        createBtnRef.current &&
        !createBtnRef.current.contains(e.target)
      ) {
        setShowCreate(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* CREATE WORKSPACE */
  const handleCreateWorkspace = async () => {
    if (!newName.trim()) {
      createInputRef.current?.focus();
      return;
    }

    try {
      if (accessToken) {
        const ws = await createWorkspace(accessToken, newName.trim());
        setWorkspaces((prev) => [ws, ...prev]);
      } else {
        const newWs = {
          _id: `ws-${Date.now()}`,
          name: newName.trim(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
        };
        setWorkspaces((prev) => [newWs, ...prev]);
      }
      setNewName("");
      setShowCreate(false);
    } catch (err) {
      console.error("Create workspace failed:", err);
    }
  };

  /* DELETE WORKSPACE */
  const handleDelete = async (id) => {
    try {
      if (accessToken && !id.startsWith("demo-") && !id.startsWith("ws-")) {
        await deleteWorkspace(accessToken, id);
      }
      setWorkspaces((prev) => prev.filter((w) => w._id !== id));
      setMenuOpenId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* DUPLICATE WORKSPACE */
  const handleDuplicate = async (id) => {
    try {
      if (accessToken && !id.startsWith("demo-") && !id.startsWith("ws-")) {
        const copy = await duplicateWorkspace(accessToken, id);
        setWorkspaces((prev) => [copy, ...prev]);
      } else {
        const source = workspaces.find((w) => w._id === id);
        if (source) {
          const duplicated = {
            ...source,
            _id: `ws-${Date.now()}`,
            name: `${source.name} (Copy)`,
            updatedAt: new Date().toISOString(),
          };
          setWorkspaces((prev) => [duplicated, ...prev]);
        }
      }
      setMenuOpenId(null);
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  /* PIN WORKSPACE */
  const handlePin = async (ws) => {
    try {
      if (accessToken && !ws._id.startsWith("demo-") && !ws._id.startsWith("ws-")) {
        const updated = await pinWorkspace(accessToken, ws._id, !ws.isPinned);
        setWorkspaces((prev) =>
          prev.map((w) => (w._id === ws._id ? updated : w))
        );
      } else {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === ws._id ? { ...w, isPinned: !w.isPinned } : w
          )
        );
      }
      setMenuOpenId(null);
    } catch (err) {
      console.error("Pin failed:", err);
    }
  };

  /* RENAME WORKSPACE */
  const submitRename = async (ws) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      if (accessToken && !ws._id.startsWith("demo-") && !ws._id.startsWith("ws-")) {
        const updated = await renameWorkspace(accessToken, ws._id, renameValue.trim());
        setWorkspaces((prev) =>
          prev.map((w) => (w._id === ws._id ? updated : w))
        );
      } else {
        setWorkspaces((prev) =>
          prev.map((w) =>
            w._id === ws._id ? { ...w, name: renameValue.trim(), updatedAt: new Date().toISOString() } : w
          )
        );
      }
    } catch (err) {
      console.error("Rename failed:", err);
    } finally {
      setRenamingId(null);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/workspace/${id}`);
  };

  const userName =
    user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <div className={`dashboard-layout ${theme}`}>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="mobile-dashboard-header">
        <div className="sidebar-brand" onClick={() => navigate("/")}>
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai"
            className="sidebar-logo-img"
          />
        </div>
        <button
          className="mobile-hamburger-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =========================================================
         LEFT SIDEBAR
         ========================================================= */}
      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        {/* Brand Logo */}
        <div
          className="sidebar-brand"
          onClick={() => {
            setMobileSidebarOpen(false);
            navigate("/");
          }}
          title="Go to Vocodeai Home"
        >
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai Logo"
            className="sidebar-logo-img"
          />
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === "workspaces" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("workspaces");
              setMobileSidebarOpen(false);
            }}
          >
            <LayoutDashboard className="nav-icon" />
            <span>Workspaces</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "templates" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("templates");
              setMobileSidebarOpen(false);
            }}
          >
            <Layers3 className="nav-icon" />
            <span>Templates</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("terminal");
              setMobileSidebarOpen(false);
            }}
          >
            <SquareTerminal className="nav-icon" />
            <span>Cloud Terminal</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "assistant" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("assistant");
              setMobileSidebarOpen(false);
            }}
          >
            <Sparkles className="nav-icon" />
            <span>AI Assistant</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              setMobileSidebarOpen(false);
            }}
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "recycle-bin" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("recycle-bin");
              setMobileSidebarOpen(false);
            }}
          >
            <Trash2 className="nav-icon" />
            <span>Recycle Bin</span>
            {recycleItems.length > 0 && (
              <span className="sidebar-recycle-badge">{recycleItems.length}</span>
            )}
          </button>
        </nav>

        {/* User Profile Card (Bottom of Sidebar) */}
        <div
          className="sidebar-user-card"
          onClick={(e) => {
            e.stopPropagation();
            setProfileMenuOpen(!profileMenuOpen);
          }}
        >
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <ChevronRight className="user-chevron" />

          {/* Profile Popover Menu */}
          {profileMenuOpen && (
            <div className="user-popover" onClick={(e) => e.stopPropagation()}>
              <button
                className="popover-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setActiveTab("settings");
                }}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>
              <button
                className="popover-item danger"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================
         MAIN CONTENT AREA
         ========================================================= */}
      <main className="dashboard-main">
        {/* Decorative Background Curves & Glow */}
        <DashboardBackground theme={theme} />

        {/* Top Toolbar */}
        <header className="dashboard-topbar">
          {/* Search Workspace Field */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input-field"
              placeholder="Search workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-shortcut-badge">⌘ K</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            className="dash-theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle dark and light mode"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Primary "+ Create Workspace" Button */}
          <button
            ref={createBtnRef}
            className="btn-create-workspace-primary"
            onClick={() => {
              setShowCreate((prev) => {
                const next = !prev;
                if (next) {
                  setTimeout(() => createInputRef.current?.focus(), 50);
                }
                return next;
              });
            }}
          >
            <Plus size={18} />
            <span>Create Workspace</span>
          </button>
        </header>

        {/* ================= WORKSPACES TAB VIEW ================= */}
        {activeTab === "workspaces" && (
          <section className="workspaces-container">
            {/* Header Row: Heading on the left, Creation Controls on the right without layout shift */}
            <div className="dashboard-header-row">
              <div className="dashboard-heading-section">
                <h1 className="dash-main-title">
                  Your <span className="dash-heading-accent">Workspaces</span>
                </h1>
                <p className="dash-main-subtitle">
                  Create, manage, and build with AI — all in one place.
                </p>
              </div>

              {showCreate && (
                <div className="workspace-create-inline-row" ref={createContainerRef}>
                  <input
                    ref={createInputRef}
                    type="text"
                    className="create-name-input"
                    placeholder="Workspace name"
                    value={newName}
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateWorkspace();
                      if (e.key === "Escape") setShowCreate(false);
                    }}
                  />
                  <button
                    className="btn-create-inline"
                    onClick={handleCreateWorkspace}
                  >
                    Create
                  </button>
                </div>
              )}
            </div>

            {/* Workspace Card Grid */}
            {filteredWorkspaces.length > 0 ? (
              <div className="workspaces-grid">
                {filteredWorkspaces.map((ws) => (
                  <div key={ws._id} className="workspace-card-item">
                    {/* Folder Icon Tile (72x72) */}
                    <div
                      className="workspace-folder-tile"
                      onClick={() => handleCardClick(ws._id)}
                      title={`Open ${ws.name}`}
                    >
                      <FolderClosed className="workspace-folder-svg" />
                    </div>

                    {/* Workspace Details */}
                    <div
                      className="workspace-info"
                      onClick={() => handleCardClick(ws._id)}
                    >
                      <div className="workspace-title-row">
                        {renamingId === ws._id ? (
                          <input
                            className="workspace-rename-input"
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
                          <span className="workspace-name">{ws.name}</span>
                        )}
                        {ws.isPinned && (
                          <span className="workspace-pinned-star" title="Pinned">
                            ⭐
                          </span>
                        )}
                      </div>
                      <span className="workspace-meta">
                        {formatRelativeTime(ws.updatedAt || ws.createdAt)}
                      </span>
                    </div>

                    {/* Three-Dot Overflow Trigger */}
                    <button
                      className="workspace-menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === ws._id ? null : ws._id);
                      }}
                      title="Workspace options"
                      aria-label="Workspace options"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {/* Overflow Context Dropdown */}
                    {menuOpenId === ws._id && (
                      <div
                        className="workspace-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="dropdown-action-item"
                          onClick={() => {
                            setRenamingId(ws._id);
                            setRenameValue(ws.name);
                            setMenuOpenId(null);
                          }}
                        >
                          <Pencil size={14} />
                          <span>Rename</span>
                        </button>

                        <button
                          className="dropdown-action-item"
                          onClick={() => handleDuplicate(ws._id)}
                        >
                          <Copy size={14} />
                          <span>Duplicate</span>
                        </button>

                        <button
                          className="dropdown-action-item"
                          onClick={() => handlePin(ws)}
                        >
                          <Star size={14} />
                          <span>{ws.isPinned ? "Unpin" : "Pin"}</span>
                        </button>

                        <button
                          className="dropdown-action-item danger"
                          onClick={() => handleDelete(ws._id)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="workspaces-empty-state">
                <div className="empty-state-icon-tile">
                  <FolderClosed size={36} />
                </div>
                <h3 className="empty-state-title">
                  {search ? "No workspaces found" : "No workspaces yet"}
                </h3>
                <p className="empty-state-desc">
                  {search
                    ? `No workspaces matched "${search}". Try searching for another name.`
                    : "Create your first workspace to start building with Vocodeai."}
                </p>
                <button
                  className="btn-create-workspace-primary"
                  onClick={() => {
                    setShowCreate(true);
                    setTimeout(() => createInputRef.current?.focus(), 50);
                  }}
                >
                  <Plus size={18} />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ================= PLACEHOLDER TAB VIEWS ================= */}
        {activeTab === "templates" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Templates</span>
            <h2 className="placeholder-title">Pre-configured Project Starters</h2>
            <p className="placeholder-text">
              Quickly spin up full-stack Node.js, Python, React, and Go environments with optimized AI scaffolding and integrated runtime configurations.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Cloud Terminal</span>
            <h2 className="placeholder-title">Direct Cloud Execution Shell</h2>
            <p className="placeholder-text">
              Run scripts, execute Docker containers, install packages, and manage your cloud environment directly with native voice commands and integrated AI streaming.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "assistant" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">AI Assistant</span>
            <h2 className="placeholder-title">Autonomous Pair Programmer</h2>
            <p className="placeholder-text">
              Collaborate in real time with our conversational code generation model. Refactor complex algorithms, fix runtime exceptions, and inspect ASTs hands-free.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="dashboard-placeholder-panel">
            <span className="placeholder-badge">Settings</span>
            <h2 className="placeholder-title">Workspace & Account Preferences</h2>
            <p className="placeholder-text">
              Manage your API keys, model hyperparameters, editor keybindings (Vim / VS Code), billing subscriptions, and custom cloud runner nodes.
            </p>
            <button
              className="btn-create-workspace-primary"
              onClick={() => setActiveTab("workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        )}

        {/* ================= RECYCLE BIN TAB VIEW ================= */}
        {activeTab === "recycle-bin" && (
          <section className="recycle-bin-container">
            <div className="recycle-bin-header">
              <div>
                <h1 className="dash-main-title">
                  Recycle <span className="dash-heading-accent">Bin</span>
                </h1>
                <p className="dash-main-subtitle">
                  Restore deleted files and folders back to your workspace or permanently remove them.
                </p>
              </div>

              {recycleItems.length > 0 && (
                <button
                  className="btn-empty-recycle"
                  onClick={handleEmptyRecycleBin}
                  disabled={recycleLoading}
                >
                  <Trash2 size={16} />
                  <span>Empty Recycle Bin</span>
                </button>
              )}
            </div>

            {recycleMessage && (
              <div className="recycle-toast-banner">
                <Check size={16} className="recycle-toast-icon" />
                <span>{recycleMessage}</span>
              </div>
            )}

            {recycleLoading ? (
              <div className="recycle-bin-loading">
                <div className="recycle-spinner" />
                <p>Loading deleted items...</p>
              </div>
            ) : recycleItems.length === 0 ? (
              <div className="recycle-empty-state">
                <div className="recycle-empty-icon-wrap">
                  <Trash2 size={42} />
                </div>
                <h3>Recycle Bin is Empty</h3>
                <p>
                  Files and folders you delete in the workspace explorer will appear here before being permanently removed.
                </p>
                <button
                  className="btn-create-workspace-primary"
                  onClick={() => setActiveTab("workspaces")}
                >
                  Back to Workspaces
                </button>
              </div>
            ) : (
              <div className="recycle-items-list">
                {recycleItems.map((item) => (
                  <div key={item._id} className="recycle-item-card">
                    <div className="recycle-item-icon-box">
                      {getFileIcon(item.name, item.type, false)}
                    </div>

                    <div className="recycle-item-details">
                      <div className="recycle-item-title-row">
                        <span className="recycle-item-name">{item.name}</span>
                        <span className={`recycle-item-type-badge ${item.type}`}>
                          {item.type}
                        </span>
                        {item.workspaceName && (
                          <span className="recycle-item-ws-tag">
                            {item.workspaceName}
                          </span>
                        )}
                      </div>
                      <div className="recycle-item-meta">
                        <span className="recycle-item-path" title={item.originalPath}>
                          Original path: <code>{item.originalPath}</code>
                        </span>
                        <span className="recycle-item-dot">•</span>
                        <span className="recycle-item-time">
                          {formatRelativeTime(item.deletedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="recycle-item-actions">
                      <button
                        className="btn-recycle-restore"
                        onClick={() => handleRestoreItem(item._id, item.name)}
                        disabled={recycleActionLoading === item._id}
                        title="Restore to workspace"
                      >
                        <RotateCcw size={15} />
                        <span>
                          {recycleActionLoading === item._id ? "Restoring..." : "Restore"}
                        </span>
                      </button>

                      <button
                        className="btn-recycle-delete-perm"
                        onClick={() => handlePermanentDeleteItem(item._id, item.name)}
                        disabled={recycleActionLoading === item._id}
                        title="Delete permanently"
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

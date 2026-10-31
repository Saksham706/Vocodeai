import React from "react";
import {
  LayoutDashboard,
  Layers3,
  SquareTerminal,
  Settings,
  Trash2,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function DashboardSidebar({
  theme,
  activeTab,
  setActiveTab,
  recycleCount = 0,
  user,
  logout,
  profileMenuOpen,
  setProfileMenuOpen,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  navigate,
}) {
  const userName =
    user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User";
  const userEmail = user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <>
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

      {/* Left Sidebar */}
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
            {recycleCount > 0 && (
              <span className="sidebar-recycle-badge">{recycleCount}</span>
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
                onClick={async (e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(false);
                  await logout();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


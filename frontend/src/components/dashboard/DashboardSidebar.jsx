import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Layers3,
  Settings,
  Trash2,
  ChevronRight,
  LogOut,
  Menu,
  X,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import "../../styles/account.css";

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
  const userCardRef = useRef(null);

  const [customDisplayName, setCustomDisplayName] = useState(() => {
    return getEffectiveSettings()?.account?.displayName || "";
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem("vocode_user_avatar") || user?.avatar || "default";
  });

  useEffect(() => {
    const handleSettingsChange = (e) => {
      const disp =
        e.detail?.settings?.account?.displayName ??
        getEffectiveSettings()?.account?.displayName;
      if (disp !== undefined) setCustomDisplayName(disp);
    };
    window.addEventListener("vocode-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("vocode-settings-changed", handleSettingsChange);
  }, []);

  useEffect(() => {
    const handleAvatarChange = (e) => {
      const nextAvatar =
        e.detail?.avatar || localStorage.getItem("vocode_user_avatar") || "default";
      setUserAvatar(nextAvatar);
    };
    window.addEventListener("vocode-avatar-changed", handleAvatarChange);
    return () => window.removeEventListener("vocode-avatar-changed", handleAvatarChange);
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setUserAvatar((prev) => localStorage.getItem("vocode_user_avatar") || user.avatar || prev);
    }
  }, [user]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e) => {
      if (
        userCardRef.current &&
        !userCardRef.current.contains(e.target) &&
        !e.target.closest?.(".user-popover")
      ) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen, setProfileMenuOpen]);

  const userName =
    customDisplayName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "User");
  const userEmail = user?.email || "user@example.com";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const renderSidebarAvatar = () => {
    if (!userAvatar || userAvatar === "default" || userAvatar === "initial") {
      return <span className="user-avatar-initial">{userInitial}</span>;
    }
    if (userAvatar.startsWith("data:image/") || userAvatar.startsWith("http")) {
      return <img src={userAvatar} alt={userName} className="user-avatar-img" />;
    }
    const presetMap = {
      owl: "🦉",
      cyber: "⚡",
      terminal: "💻",
      rocket: "🚀",
      shield: "🛡️",
    };
    if (presetMap[userAvatar]) {
      return <span className="user-avatar-emoji">{presetMap[userAvatar]}</span>;
    }
    return <span className="user-avatar-initial">{userInitial}</span>;
  };

  return (
    <>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="mobile-dashboard-header">
        <button
          type="button"
          className="dash-back-arrow-btn sidebar-back-btn mobile-brand-back-btn"
          onClick={() => navigate("/")}
          title="Back to Landing Page"
          aria-label="Back to Landing Page"
        >
          <ArrowLeft size={16} />
        </button>
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
        {/* Brand Logo & Back to Landing */}
        <div className="sidebar-brand-wrapper">
          <button
            type="button"
            className="dash-back-arrow-btn sidebar-back-btn"
            onClick={() => navigate("/")}
            title="Back to Landing Page"
            aria-label="Back to Landing Page"
          >
            <ArrowLeft size={16} />
          </button>
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

        {/* User Profile Container */}
        <div ref={userCardRef} className="sidebar-profile-container">
          <div
            className={`sidebar-user-card ${activeTab === "account" ? "account-active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setProfileMenuOpen((prev) => !prev);
            }}
          >
            <div className="user-avatar">{renderSidebarAvatar()}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
            <ChevronRight className={`user-chevron ${profileMenuOpen ? "open" : ""}`} />
          </div>

          {/* Profile Popover Menu */}
          {profileMenuOpen && (
            <div
              className="user-popover animate-scale-in"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={`popover-item ${activeTab === "account" ? "active" : ""}`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileMenuOpen(false);
                  setActiveTab("account");
                }}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>
              <button
                type="button"
                className="popover-item danger"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileMenuOpen(false);
                  try {
                    await logout();
                  } catch (err) {
                    console.warn("Logout error:", err);
                  } finally {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/login", { replace: true });
                  }
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


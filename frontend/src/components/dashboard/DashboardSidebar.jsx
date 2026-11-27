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
      {/* Fixed Top-Left Circular Menu Button + Back to Landing Button */}
      <div className="dash-fixed-nav-controls">
        <button
          type="button"
          className={`dash-menu-circle ${mobileSidebarOpen ? "is-open" : ""}`}
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          aria-label="Toggle dashboard navigation"
          aria-expanded={mobileSidebarOpen}
        >
          <span className="dash-hamburger-morph" aria-hidden="true">
            <span className="hm-line hm-line-top" />
            <span className="hm-line hm-line-bot" />
          </span>
        </button>

        <button
          type="button"
          className="dash-back-circle"
          onClick={() => {
            if (activeTab && activeTab !== "workspaces") {
              setActiveTab("workspaces");
            } else {
              navigate("/");
            }
          }}
          title={activeTab && activeTab !== "workspaces" ? "Back to Workspaces" : "Back to Landing Page"}
          aria-label={activeTab && activeTab !== "workspaces" ? "Back to Workspaces" : "Back to Landing Page"}
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* Full-Screen Glassy Navigation Overlay (Matches Landing Page Overlay) */}
      <div
        className={`dash-nav-overlay ${theme} ${mobileSidebarOpen ? "is-open" : ""}`}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden={!mobileSidebarOpen}
      >
        <div className="dash-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <div className="dash-overlay-topbar">
            <span
              className="dash-overlay-wordmark"
              onClick={() => {
                setMobileSidebarOpen(false);
                navigate("/");
              }}
              role="button"
              tabIndex={mobileSidebarOpen ? 0 : -1}
            >
              VOCODEAI
            </span>
          </div>

          <nav className="dash-overlay-nav" aria-label="Dashboard Navigation">
            <ul className="dash-overlay-links">
              <li style={{ "--i": 0 }}>
                <button
                  type="button"
                  className={`dash-overlay-link ${activeTab === "workspaces" ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveTab("workspaces");
                    setMobileSidebarOpen(false);
                  }}
                  tabIndex={mobileSidebarOpen ? 0 : -1}
                >
                  <span className="dash-overlay-index">01</span>
                  <span>Workspaces</span>
                </button>
              </li>
              <li style={{ "--i": 1 }}>
                <button
                  type="button"
                  className={`dash-overlay-link ${activeTab === "templates" ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveTab("templates");
                    setMobileSidebarOpen(false);
                  }}
                  tabIndex={mobileSidebarOpen ? 0 : -1}
                >
                  <span className="dash-overlay-index">02</span>
                  <span>Templates</span>
                </button>
              </li>
              <li style={{ "--i": 2 }}>
                <button
                  type="button"
                  className={`dash-overlay-link ${activeTab === "settings" ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveTab("settings");
                    setMobileSidebarOpen(false);
                  }}
                  tabIndex={mobileSidebarOpen ? 0 : -1}
                >
                  <span className="dash-overlay-index">03</span>
                  <span>Settings</span>
                </button>
              </li>
              <li style={{ "--i": 3 }}>
                <button
                  type="button"
                  className={`dash-overlay-link ${activeTab === "recycle-bin" ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveTab("recycle-bin");
                    setMobileSidebarOpen(false);
                  }}
                  tabIndex={mobileSidebarOpen ? 0 : -1}
                >
                  <span className="dash-overlay-index">04</span>
                  <span>Recycle Bin</span>
                  {recycleCount > 0 && (
                    <span className="dash-overlay-badge">{recycleCount}</span>
                  )}
                </button>
              </li>
              <li style={{ "--i": 4 }}>
                <button
                  type="button"
                  className={`dash-overlay-link ${activeTab === "account" ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveTab("account");
                    setMobileSidebarOpen(false);
                  }}
                  tabIndex={mobileSidebarOpen ? 0 : -1}
                >
                  <span className="dash-overlay-index">05</span>
                  <span>Account</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Compact User & Sign Out Footer inside Overlay */}
          <div className="dash-overlay-footer">
            <div className="dash-overlay-user">
              <div className="user-avatar">{renderSidebarAvatar()}</div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-email">{userEmail}</span>
              </div>
            </div>
            <button
              type="button"
              className="dash-overlay-signout vocode-pill-btn"
              onClick={async () => {
                setMobileSidebarOpen(false);
                try {
                  await logout();
                } catch (err) {
                  console.warn("Logout error:", err);
                } finally {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("user");
                  localStorage.removeItem("vocode_ai_provider_config");
                  navigate("/?auth=login", { replace: true });
                }
              }}
              tabIndex={mobileSidebarOpen ? 0 : -1}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  X,
  Filter,
  Check,
  RotateCcw,
  Star,
  Download,
  Palette,
  Bot,
  Sparkles,
  Shield,
  GitBranch,
  Code2,
  SlidersHorizontal,
  Settings,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Layers,
} from "lucide-react";
import { MARKETPLACE_EXTENSIONS } from "../../config/marketplaceExtensions";
import {
  applyThemeExtension,
  getActiveThemeExtension,
  THEME_DEFINITIONS,
} from "../../utils/themeRegistry";
import { GoogleGLogo } from "../ai/AIModelSelector";
import "../../styles/extensions.css";

function ExtensionBrandIcon({ ext }) {
  if (ext.category === "theme" && ext.palette) {
    return (
      <div className="ext-palette-swatch-box" title={`${ext.name} Color Palette`}>
        {ext.palette.map((color, i) => (
          <div
            key={i}
            className="ext-palette-stripe"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }

  if (ext.iconType === "google") {
    return (
      <div className="ext-brand-icon-box">
        <GoogleGLogo size={18} />
      </div>
    );
  }

  if (ext.iconType === "openai") {
    return (
      <div className="ext-brand-icon-box" style={{ color: "#10a37f" }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947z" />
        </svg>
      </div>
    );
  }

  if (ext.iconType === "robot") {
    return (
      <div className="ext-brand-icon-box" style={{ color: "#38bdf8" }}>
        <Bot size={18} />
      </div>
    );
  }

  if (ext.iconType === "sparkles") {
    return (
      <div className="ext-brand-icon-box" style={{ color: "#facc15" }}>
        <Sparkles size={18} />
      </div>
    );
  }

  if (ext.iconType === "shield") {
    return (
      <div className="ext-brand-icon-box" style={{ color: "#a855f7" }}>
        <Shield size={18} />
      </div>
    );
  }

  if (ext.iconType === "git") {
    return (
      <div className="ext-brand-icon-box" style={{ color: "#f97316" }}>
        <GitBranch size={18} />
      </div>
    );
  }

  return (
    <div className="ext-brand-icon-box">
      <Code2 size={18} />
    </div>
  );
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "theme", label: "🎨 Themes" },
  { id: "ai", label: "🤖 AI Models" },
  { id: "formatter", label: "💅 Formatters" },
  { id: "productivity", label: "⚡ Productivity" },
  { id: "language", label: "🌐 Languages" },
];

export default function ExtensionsPanel({ onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewTab, setViewTab] = useState("marketplace"); // marketplace, installed, recommended
  const [installingIds, setInstallingIds] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [banner, setBanner] = useState(null);

  // Installed extensions state
  const [installedIds, setInstalledIds] = useState(() => {
    try {
      const saved = localStorage.getItem("vocode_installed_extensions");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    // Default installed extensions
    return new Set([
      "ext-vocode-ai-copilot",
      "ext-theme-one-dark-pro",
      "ext-prettier-formatter",
    ]);
  });

  // Active theme extension state
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return getActiveThemeExtension();
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      setActiveThemeId(e.detail?.themeId || null);
    };
    window.addEventListener("vocode-theme-extension-changed", handleThemeChange);
    return () =>
      window.removeEventListener("vocode-theme-extension-changed", handleThemeChange);
  }, []);

  const showBanner = (msg, type = "success") => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 3000);
  };

  const persistInstalled = (newSet) => {
    setInstalledIds(newSet);
    try {
      localStorage.setItem(
        "vocode_installed_extensions",
        JSON.stringify(Array.from(newSet))
      );
    } catch {}
  };

  // Install extension
  const handleInstall = (ext) => {
    setInstallingIds((prev) => new Set(prev).add(ext.id));
    setTimeout(() => {
      setInstallingIds((prev) => {
        const next = new Set(prev);
        next.delete(ext.id);
        return next;
      });
      const nextInstalled = new Set(installedIds).add(ext.id);
      persistInstalled(nextInstalled);

      // If it's a theme extension, automatically prompt or activate
      if (ext.themeId) {
        applyThemeExtension(ext.themeId, window.monaco);
        showBanner(`Installed and activated "${ext.name}" theme!`);
      } else {
        showBanner(`Installed "${ext.name}"!`);
      }
    }, 700);
  };

  // Uninstall extension
  const handleUninstall = (ext) => {
    if (ext.isCore) {
      showBanner("Core extension cannot be uninstalled.", "error");
      return;
    }
    const nextInstalled = new Set(installedIds);
    nextInstalled.delete(ext.id);
    persistInstalled(nextInstalled);

    if (ext.themeId && activeThemeId === ext.themeId) {
      applyThemeExtension(null, window.monaco);
    }
    setActiveMenuId(null);
    showBanner(`Uninstalled "${ext.name}"`);
  };

  // Set Theme Extension
  const handleSetTheme = (ext) => {
    if (!ext.themeId) return;
    applyThemeExtension(ext.themeId, window.monaco);
    showBanner(`Applied "${ext.name}" color theme!`);
  };

  // Filtered extensions
  const filteredExtensions = useMemo(() => {
    return MARKETPLACE_EXTENSIONS.filter((ext) => {
      // 1. View Tab Filter
      if (viewTab === "installed" && !installedIds.has(ext.id)) {
        return false;
      }
      if (viewTab === "recommended" && ext.category !== "theme" && ext.category !== "ai") {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== "all" && ext.category !== selectedCategory) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = ext.name.toLowerCase().includes(q);
        const matchesDesc = ext.description.toLowerCase().includes(q);
        const matchesPub = ext.publisher.toLowerCase().includes(q);
        const matchesCat = ext.category.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesPub || matchesCat;
      }

      return true;
    });
  }, [viewTab, selectedCategory, searchQuery, installedIds]);

  return (
    <div className="ext-panel-container">
      {/* Header */}
      <div className="ext-panel-header">
        <div className="ext-header-top">
          <div className="ext-title-row">
            <h3 className="ext-title">Extensions</h3>
            <span className="ext-badge-count">{filteredExtensions.length}</span>
          </div>
          <div className="ext-header-actions">
            <button
              className="ext-icon-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                showBanner("Refreshed Marketplace");
              }}
              title="Refresh Extensions"
            >
              <RotateCcw size={13} />
            </button>
            {onClose && (
              <button
                className="ext-icon-btn"
                onClick={onClose}
                title="Close Extensions"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="ext-search-box">
          <Search size={14} className="ext-search-icon" />
          <input
            type="text"
            className="ext-search-input"
            placeholder="Search Extensions in Marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ext-search-clear"
              onClick={() => setSearchQuery("")}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="ext-category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`ext-filter-chip ${
                selectedCategory === cat.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Tabs (Marketplace, Installed, Recommended) */}
      <div className="ext-view-tabs">
        <button
          className={`ext-view-tab ${viewTab === "marketplace" ? "active" : ""}`}
          onClick={() => setViewTab("marketplace")}
        >
          Marketplace
        </button>
        <button
          className={`ext-view-tab ${viewTab === "installed" ? "active" : ""}`}
          onClick={() => setViewTab("installed")}
        >
          Installed ({installedIds.size})
        </button>
        <button
          className={`ext-view-tab ${viewTab === "recommended" ? "active" : ""}`}
          onClick={() => setViewTab("recommended")}
        >
          Recommended
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className="ext-toast-banner">
          <span>{banner.msg}</span>
          <button
            onClick={() => setBanner(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Extensions List */}
      <div className="ext-list-content">
        {filteredExtensions.length === 0 ? (
          <div className="ext-empty-results">
            <Layers size={36} className="ext-empty-icon" />
            <h5>No Extensions Found</h5>
            <p>Try searching for a different keyword or select another category.</p>
          </div>
        ) : (
          filteredExtensions.map((ext) => {
            const isInstalled = installedIds.has(ext.id);
            const isInstalling = installingIds.has(ext.id);
            const isCurrentActiveTheme =
              ext.themeId && activeThemeId === ext.themeId;

            return (
              <div
                key={ext.id}
                className={`ext-item-card ${isCurrentActiveTheme ? "is-active-theme" : ""}`}
              >
                {/* Left Icon / Palette Swatch */}
                <div className="ext-icon-column">
                  <ExtensionBrandIcon ext={ext} />
                </div>

                {/* Details Column */}
                <div className="ext-details-column">
                  <div className="ext-name-row">
                    <h4 className="ext-name" title={ext.name}>
                      {ext.name}
                    </h4>
                    {ext.verified && (
                      <CheckCircle2
                        size={12}
                        className="ext-verified-badge"
                        title="Verified Publisher"
                      />
                    )}
                    <span className="ext-version">v{ext.version}</span>
                  </div>

                  <div className="ext-publisher-row">
                    <span className="ext-publisher">{ext.publisher}</span>
                    <span className={`ext-category-tag ${ext.category}`}>
                      {ext.category}
                    </span>
                  </div>

                  <p className="ext-desc">{ext.description}</p>

                  <div className="ext-meta-row">
                    <div className="ext-meta-item">
                      <Star size={10} color="#eab308" fill="#eab308" />
                      <span>{ext.rating}</span>
                    </div>
                    <div className="ext-meta-item">
                      <Download size={10} />
                      <span>{ext.downloads}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="ext-actions-column">
                  {!isInstalled ? (
                    <button
                      className="ext-btn-install"
                      onClick={() => handleInstall(ext)}
                      disabled={isInstalling}
                    >
                      {isInstalling ? (
                        <>
                          <RotateCcw size={11} className="spin-icon" />
                          <span>Installing</span>
                        </>
                      ) : (
                        <span>Install</span>
                      )}
                    </button>
                  ) : (
                    <>
                      {/* If Theme Extension and Installed */}
                      {ext.themeId ? (
                        <button
                          className={`ext-btn-set-theme ${
                            isCurrentActiveTheme ? "active" : ""
                          }`}
                          onClick={() => handleSetTheme(ext)}
                          title="Apply this color theme to editor"
                        >
                          <Palette size={11} />
                          <span>{isCurrentActiveTheme ? "Active" : "Set Theme"}</span>
                        </button>
                      ) : (
                        <span className="ext-installed-badge">
                          <Check size={10} />
                          <span>Installed</span>
                        </span>
                      )}

                      {/* More / Settings Menu */}
                      {!ext.isCore && (
                        <button
                          className="ext-btn-more"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === ext.id ? null : ext.id)
                          }
                          title="More options"
                        >
                          <Settings size={12} />
                        </button>
                      )}
                    </>
                  )}

                  {/* Popover Menu for Installed Extension */}
                  {activeMenuId === ext.id && (
                    <div className="ext-menu-popover">
                      {ext.themeId && (
                        <button
                          className="ext-menu-action-item"
                          onClick={() => {
                            handleSetTheme(ext);
                            setActiveMenuId(null);
                          }}
                        >
                          <Palette size={12} />
                          <span>Apply Color Theme</span>
                        </button>
                      )}
                      <button
                        className="ext-menu-action-item danger"
                        onClick={() => handleUninstall(ext)}
                      >
                        <Trash2 size={12} />
                        <span>Uninstall Extension</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


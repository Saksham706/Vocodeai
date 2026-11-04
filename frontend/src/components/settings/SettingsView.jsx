import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Code2,
  Eye,
  Sparkles,
  SquareTerminal,
  Play,
  Folder,
  Palette,
  Keyboard,
  User,
  Activity,
  Search,
  X,
  FileCode,
  RotateCcw,
  Check,
  Copy,
  ChevronRight,
  EyeOff,
  Sliders,
  ArrowLeft,
  Settings as SettingsIcon,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Lightbulb,
  Zap,
  HardDrive,
} from "lucide-react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_METADATA,
} from "../../config/defaultSettings";
import {
  getUserSettings,
  saveUserSettings,
  getWorkspaceOverrides,
  saveWorkspaceOverrides,
  getEffectiveSettings,
  getNestedValue,
  setNestedValue,
  resetSettingToDefault,
} from "../../utils/settingsStorage";
import "../../styles/settings.css";

// Map string icon names to Lucide icon components
const ICON_MAP = {
  Code2,
  Eye,
  Sparkles,
  SquareTerminal,
  Play,
  Folder,
  Palette,
  Keyboard,
  User,
  Activity,
  Zap,
  HardDrive,
};

// Logical grouping matching Docs Knowledge Base structure
const SETTINGS_GROUPS = [
  {
    group: "EDITOR & WORKBENCH",
    categoryIds: ["editor", "preview", "workbench"],
  },
  {
    group: "AI & RUNTIME",
    categoryIds: ["vocode.ai", "terminal.integrated", "runner"],
  },
  {
    group: "SYSTEM & ENVIRONMENT",
    categoryIds: ["files", "shortcuts", "account", "telemetry"],
  },
];

export default function SettingsView({ workspaceId = null, onBack = null }) {
  // Scope: 'user' (global) or 'workspace' (current project)
  const [scope, setScope] = useState(workspaceId ? "workspace" : "user");
  const [activeCategory, setActiveCategory] = useState("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [isJsonMode, setIsJsonMode] = useState(false);

  // Raw settings state
  const [userSettings, setUserSettings] = useState(getUserSettings);
  const [workspaceOverrides, setWorkspaceOverrides] = useState(() =>
    getWorkspaceOverrides(workspaceId)
  );

  // Password fields show/hide state
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Chip input temporary values for string arrays
  const [newChipVal, setNewChipVal] = useState({});

  // JSON mode editor state
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState(null);
  const [jsonSaved, setJsonSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchInputRef = useRef(null);
  const contentRef = useRef(null);

  // Effective settings based on active scope
  const activeSettings = useMemo(() => {
    return scope === "workspace" && workspaceId
      ? getEffectiveSettings(workspaceId)
      : userSettings;
  }, [scope, workspaceId, userSettings, workspaceOverrides]);

  // Sync state with storage on mount and changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserSettings(getUserSettings());
      if (workspaceId) {
        setWorkspaceOverrides(getWorkspaceOverrides(workspaceId));
      }
    };
    window.addEventListener("vocode-settings-changed", handleStorageChange);
    return () =>
      window.removeEventListener("vocode-settings-changed", handleStorageChange);
  }, [workspaceId]);

  // Command/Ctrl + F shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        if (!isJsonMode) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isJsonMode]);

  // Category selection: immediately displays that category & smoothly scrolls to top (Docs style)
  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setSearchQuery("");
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Jump to specific setting card within current category
  const handleJumpToSetting = (itemKey) => {
    const el = document.getElementById(`setting-card-${itemKey}`);
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("setting-card-highlighted");
      setTimeout(() => {
        el.classList.remove("setting-card-highlighted");
      }, 1500);
    }
  };

  // Handle setting modification
  const handleUpdate = (keyPath, newValue) => {
    if (scope === "workspace" && workspaceId) {
      const updatedOverrides = setNestedValue(
        { ...workspaceOverrides },
        keyPath,
        newValue
      );
      setWorkspaceOverrides(updatedOverrides);
      saveWorkspaceOverrides(workspaceId, updatedOverrides);
    } else {
      const updatedUser = setNestedValue(
        { ...userSettings },
        keyPath,
        newValue
      );
      setUserSettings(updatedUser);
      saveUserSettings(updatedUser);
    }
  };

  // Reset single setting
  const handleReset = (keyPath) => {
    resetSettingToDefault(keyPath, workspaceId, scope);
    setUserSettings(getUserSettings());
    if (workspaceId) {
      setWorkspaceOverrides(getWorkspaceOverrides(workspaceId));
    }
  };

  // Check if a setting is modified from default
  const isSettingModified = (keyPath) => {
    const currentVal = getNestedValue(activeSettings, keyPath);
    const defVal = getNestedValue(DEFAULT_SETTINGS, keyPath);
    return JSON.stringify(currentVal) !== JSON.stringify(defVal);
  };

  // Switch to JSON Editor Mode
  const handleToggleJsonMode = () => {
    if (!isJsonMode) {
      const targetObj =
        scope === "workspace" && workspaceId
          ? workspaceOverrides
          : userSettings;
      setJsonText(JSON.stringify(targetObj, null, 2));
      setJsonError(null);
      setJsonSaved(false);
    }
    setIsJsonMode(!isJsonMode);
  };

  // Save raw JSON
  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError(null);
      if (scope === "workspace" && workspaceId) {
        setWorkspaceOverrides(parsed);
        saveWorkspaceOverrides(workspaceId, parsed);
      } else {
        setUserSettings(parsed);
        saveUserSettings(parsed);
      }
      setJsonSaved(true);
      setTimeout(() => setJsonSaved(false), 2500);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter settings by search query (if any)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    return SETTINGS_METADATA.map((cat) => {
      const matchingItems = cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
      return {
        ...cat,
        items: matchingItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const totalMatches = useMemo(() => {
    if (!searchResults) return 0;
    return searchResults.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [searchResults]);

  // Current active category metadata
  const currentCategory = useMemo(() => {
    return (
      SETTINGS_METADATA.find((c) => c.id === activeCategory) ||
      SETTINGS_METADATA[0]
    );
  }, [activeCategory]);

  const CurrentCategoryIcon = ICON_MAP[currentCategory.icon] || Sliders;

  return (
    <div className="vocode-settings-container">
      {/* ----------------- TOP HEADER & TOOLBAR ----------------- */}
      <div className="settings-header">
        <div className="settings-header-top">
          <div className="settings-title-group">
            {onBack && (
              <button
                className="settings-back-btn"
                onClick={onBack}
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="settings-title">
              <SettingsIcon size={20} className="text-accent" />
              <span>Settings</span>
            </h2>

            {/* Scope Switcher: User vs Workspace */}
            <div className="settings-scope-switcher">
              <button
                type="button"
                className={`scope-btn ${scope === "user" ? "active" : ""}`}
                onClick={() => setScope("user")}
                title="Global preferences across all workspaces"
              >
                User
              </button>
              <button
                type="button"
                className={`scope-btn ${scope === "workspace" ? "active" : ""}`}
                onClick={() => setScope("workspace")}
                disabled={!workspaceId}
                title={
                  workspaceId
                    ? "Overrides specific to this workspace"
                    : "Open a workspace to edit workspace-specific settings"
                }
              >
                Workspace {workspaceId ? "" : "(Disabled)"}
              </button>
            </div>
          </div>

          <div className="settings-actions-group">
            <button
              type="button"
              className={`settings-action-btn ${isJsonMode ? "active" : ""}`}
              onClick={handleToggleJsonMode}
              title="Toggle settings.json view"
            >
              <FileCode size={15} />
              <span>{isJsonMode ? "Show UI" : "Open JSON"}</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar (when in UI mode) */}
        {!isJsonMode && (
          <div className="settings-search-wrapper">
            <Search size={16} className="settings-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="settings-search-input"
              placeholder="Search settings (e.g. font, preview, model, tab size)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="settings-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ----------------- SETTINGS BODY ----------------- */}
      {isJsonMode ? (
        /* RAW JSON VIEW */
        <div className="settings-json-view">
          <div className="settings-json-toolbar">
            <span className="settings-json-title">
              <FileCode size={16} />
              <span>
                {scope === "workspace" ? "Workspace settings.json" : "User settings.json"}
              </span>
            </span>

            <div className="settings-json-actions">
              {jsonError && (
                <span className="settings-json-status error">
                  JSON Error: {jsonError}
                </span>
              )}
              {jsonSaved && (
                <span className="settings-json-status saved">
                  <Check size={14} /> Saved Successfully
                </span>
              )}
              <button
                type="button"
                className="settings-action-btn"
                onClick={handleCopyJson}
                title="Copy JSON to Clipboard"
              >
                <Copy size={14} />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                className="settings-action-btn active"
                onClick={handleSaveJson}
                title="Save changes to settings"
              >
                <Check size={14} />
                <span>Save JSON</span>
              </button>
            </div>
          </div>

          <textarea
            className="settings-json-textarea"
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            }}
            spellCheck={false}
          />
        </div>
      ) : (
        /* DOCS-STYLE DEDICATED CATEGORY VIEW (NO SLIDING) */
        <div className="settings-body">
          {/* Left Category Sidebar (Docs Guide Tree Style) */}
          <aside className="settings-sidebar">
            <div className="settings-sidebar-header">
              <Sliders size={14} className="settings-sidebar-icon" />
              <span>PREFERENCES</span>
            </div>

            <div className="settings-sidebar-categories">
              {SETTINGS_GROUPS.map((grp) => (
                <div key={grp.group} className="settings-category-group">
                  <span className="settings-group-title">{grp.group}</span>
                  <div className="settings-group-links">
                    {grp.categoryIds.map((catId) => {
                      const cat = SETTINGS_METADATA.find((c) => c.id === catId);
                      if (!cat) return null;
                      const IconComp = ICON_MAP[cat.icon] || Sliders;
                      const isActive = activeCategory === cat.id && !searchQuery;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`settings-nav-item ${isActive ? "active" : ""}`}
                          onClick={() => handleSelectCategory(cat.id)}
                        >
                          <IconComp className="settings-nav-icon" />
                          <span className="settings-nav-label">{cat.label}</span>
                          <span className="settings-nav-badge">{cat.items.length}</span>
                          {isActive && <span className="active-indicator" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer Card (Docs Studio Style) */}
            <div className="settings-sidebar-footer">
              <div className="settings-footer-card">
                <Sparkles size={16} className="settings-card-glow-icon" />
                <div className="settings-card-text">
                  <strong>{scope === "workspace" ? "Workspace Profile" : "Global User Profile"}</strong>
                  <p>
                    {scope === "workspace"
                      ? "Custom overrides for this project."
                      : "Synchronized with your cloud developer account."}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Scrollable Settings Content Area (Middle Part Only Scrolling) */}
          <main className="settings-content" ref={contentRef}>
            {/* Search Results Mode */}
            {searchResults ? (
              <div className="settings-search-results-container animate-fade-in">
                <div className="settings-search-header-badge">
                  <Search size={14} />
                  <span>
                    Found {totalMatches} setting{totalMatches === 1 ? "" : "s"} matching "{searchQuery}"
                  </span>
                  <button
                    type="button"
                    className="btn-clear-search-link"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="settings-no-results">
                    <Search size={36} />
                    <h4>No settings found</h4>
                    <p>No settings matching "{searchQuery}". Try a different keyword.</p>
                  </div>
                ) : (
                  searchResults.map((category) => {
                    const CategoryIcon = ICON_MAP[category.icon] || Sliders;
                    return (
                      <div key={category.id} className="settings-search-group">
                        <div className="settings-search-group-title">
                          <CategoryIcon size={16} className="text-accent" />
                          <span>{category.label}</span>
                        </div>
                        <div className="settings-items-list">
                          {category.items.map((item) => renderSettingCard(item))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Dedicated Active Category View (Docs Topic Style - Instant & Direct) */
              <div className="settings-category-body animate-fade-in" key={currentCategory.id}>
                {/* Docs-Style Breadcrumb Navigation */}
                <nav className="docs-breadcrumb" aria-label="Breadcrumb">
                  <span className="crumb-item" onClick={onBack || undefined}>
                    VocodeAI
                  </span>
                  <ChevronRight size={13} className="crumb-sep" />
                  <span className="crumb-item">Settings</span>
                  <ChevronRight size={13} className="crumb-sep" />
                  <span className="crumb-item cat-label">
                    {scope === "workspace" ? "Workspace" : "User Preferences"}
                  </span>
                  <ChevronRight size={13} className="crumb-sep" />
                  <span className="crumb-item active">{currentCategory.label}</span>
                </nav>

                {/* Docs-Style Active Header */}
                <div className="settings-active-header">
                  <div className="settings-section-tag">
                    <CurrentCategoryIcon size={13} />
                    <span>PREFERENCES</span>
                  </div>
                  <h1 className="settings-h1">{currentCategory.label}</h1>
                  <p className="settings-lead-desc">{currentCategory.description}</p>
                  <div className="settings-meta-bar">
                    <span className="meta-badge">{currentCategory.items.length} Settings</span>
                    <span className="meta-dot">•</span>
                    <span>{scope === "workspace" ? "Workspace Override Scope" : "Global User Scope"}</span>
                    <span className="meta-dot">•</span>
                    <span className="meta-status-chip">
                      <CheckCircle2 size={12} /> Instant Auto-Sync
                    </span>
                  </div>
                </div>

                {/* Quick Section Jump Chips (Docs On-This-Page Style) */}
                {currentCategory.items.length > 2 && (
                  <div className="settings-jump-bar">
                    <span className="jump-bar-label">Jump to:</span>
                    <div className="settings-jump-chips">
                      {currentCategory.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className="settings-jump-chip"
                          onClick={() => handleJumpToSetting(item.key)}
                          title={`Jump to ${item.label}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Setting Cards List */}
                <div className="settings-items-list">
                  {currentCategory.items.map((item) => renderSettingCard(item))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );

  // Helper function to render a single setting card
  function renderSettingCard(item) {
    const val =
      getNestedValue(activeSettings, item.key) ??
      getNestedValue(DEFAULT_SETTINGS, item.key);
    const isModified = isSettingModified(item.key);

    return (
      <div key={item.key} id={`setting-card-${item.key}`} className="setting-card">
        <div className="setting-card-header">
          <div className="setting-title-wrapper">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h4 className="setting-label">{item.label}</h4>
              <span className="setting-key-tag">{item.key}</span>
            </div>
            <p className="setting-desc">{item.description}</p>
          </div>

          <div className="setting-actions">
            {isModified && (
              <button
                type="button"
                className="setting-reset-btn"
                onClick={() => handleReset(item.key)}
                title="Reset to default value"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="setting-control-area">
          {/* 1. BOOLEAN TOGGLE */}
          {item.type === "boolean" && (
            <label className="setting-switch">
              <input
                type="checkbox"
                className="setting-switch-input"
                checked={Boolean(val)}
                onChange={(e) => handleUpdate(item.key, e.target.checked)}
              />
              <span className="setting-switch-slider" />
              <span className="setting-switch-label">
                {val ? "Enabled" : "Disabled"}
              </span>
            </label>
          )}

          {/* 2. SELECT DROPDOWN */}
          {item.type === "select" && (
            <select
              className="setting-select"
              value={val}
              onChange={(e) => {
                const next =
                  typeof item.options[0]?.value === "number"
                    ? Number(e.target.value)
                    : e.target.value;
                handleUpdate(item.key, next);
              }}
            >
              {item.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* 3. NUMBER / SLIDER */}
          {item.type === "number" && (
            <div className="setting-slider-group">
              <input
                type="range"
                className="setting-slider"
                min={item.min ?? 0}
                max={item.max ?? 100}
                step={item.step ?? 1}
                value={val ?? item.min ?? 0}
                onChange={(e) => handleUpdate(item.key, Number(e.target.value))}
              />
              <span className="setting-slider-val">{val}</span>
            </div>
          )}

          {/* 4. STRING INPUT */}
          {item.type === "string" && (
            <input
              type="text"
              className="setting-text-input"
              value={val || ""}
              onChange={(e) => handleUpdate(item.key, e.target.value)}
            />
          )}

          {/* 5. PASSWORD (API KEYS) */}
          {item.type === "password" && (
            <div className="setting-password-wrap">
              <input
                type={visiblePasswords[item.key] ? "text" : "password"}
                className="setting-text-input"
                placeholder="Enter secret key or leave blank..."
                value={val || ""}
                onChange={(e) => handleUpdate(item.key, e.target.value)}
              />
              <button
                type="button"
                className="setting-password-toggle"
                onClick={() =>
                  setVisiblePasswords((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }))
                }
                title={visiblePasswords[item.key] ? "Hide Secret" : "Show Secret"}
              >
                {visiblePasswords[item.key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          {/* 6. STRING ARRAY (CHIPS) */}
          {item.type === "stringArray" && (
            <div className="setting-chips-container">
              <div className="setting-chips-list">
                {Array.isArray(val) &&
                  val.map((itemStr, idx) => (
                    <span key={idx} className="setting-chip">
                      {itemStr}
                      <button
                        type="button"
                        className="setting-chip-remove"
                        onClick={() => {
                          const next = val.filter((_, i) => i !== idx);
                          handleUpdate(item.key, next);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>
              <div className="setting-add-chip-row">
                <input
                  type="text"
                  className="setting-text-input"
                  placeholder="Add pattern (e.g. **/temp)..."
                  value={newChipVal[item.key] || ""}
                  onChange={(e) =>
                    setNewChipVal((prev) => ({
                      ...prev,
                      [item.key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newChipVal[item.key]?.trim()) {
                      e.preventDefault();
                      const next = [...(val || []), newChipVal[item.key].trim()];
                      handleUpdate(item.key, next);
                      setNewChipVal((prev) => ({
                        ...prev,
                        [item.key]: "",
                      }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="setting-add-chip-btn"
                  onClick={() => {
                    if (newChipVal[item.key]?.trim()) {
                      const next = [...(val || []), newChipVal[item.key].trim()];
                      handleUpdate(item.key, next);
                      setNewChipVal((prev) => ({
                        ...prev,
                        [item.key]: "",
                      }));
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

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
  Terminal,
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
  Terminal,
};

// Logical grouping matching Docs Knowledge Base structure
const SETTINGS_GROUPS = [
  {
    group: "EDITOR & WORKBENCH",
    categoryIds: ["editor", "preview", "workbench"],
  },
  {
    group: "AI & RUNTIME",
    categoryIds: ["vocode.ai", "terminal", "runner"],
  },
  {
    group: "SYSTEM & ENVIRONMENT",
    categoryIds: ["files", "keybindings", "account", "telemetry"],
  },
];

// Robust category finder that handles aliases ('terminal.integrated', 'shortcuts')
const findCategory = (catId) => {
  if (!catId) return SETTINGS_METADATA[0];
  return (
    SETTINGS_METADATA.find(
      (c) =>
        c.id === catId ||
        c.id === catId.replace(".integrated", "") ||
        (catId === "terminal.integrated" && c.id === "terminal") ||
        (catId === "shortcuts" && c.id === "keybindings") ||
        (catId === "keybindings" && c.id === "shortcuts")
    ) || SETTINGS_METADATA[0]
  );
};

export default function SettingsView({
  workspaceId = null,
  onBack = null,
  initialCategory = "editor",
}) {
  // Scope: 'user' (global) or 'workspace' (current project)
  const [scope, setScope] = useState(workspaceId ? "workspace" : "user");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [isJsonMode, setIsJsonMode] = useState(false);

  // Raw settings state
  const [userSettings, setUserSettings] = useState(getUserSettings);
  const [workspaceOverrides, setWorkspaceOverrides] = useState(() =>
    getWorkspaceOverrides(workspaceId)
  );

  // Live change indicators & feedback toast
  const [recentlyChanged, setRecentlyChanged] = useState({});
  const [activeToast, setActiveToast] = useState(null);
  const [lastSavedBanner, setLastSavedBanner] = useState(null);

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

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [activeToast]);

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

  // Category selection: immediately displays that category & smoothly scrolls to top
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

  // Handle setting modification with instantaneous visual notification
  const handleUpdate = (keyPath, newValue, itemLabel = "") => {
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

    const label = itemLabel || keyPath.split(".").pop();
    const displayVal =
      typeof newValue === "boolean"
        ? newValue
          ? "Enabled"
          : "Disabled"
        : Array.isArray(newValue)
        ? `${newValue.length} items`
        : String(newValue);

    setRecentlyChanged((prev) => ({
      ...prev,
      [keyPath]: {
        label,
        value: displayVal,
        time: Date.now(),
      },
    }));

    setLastSavedBanner({
      label,
      value: displayVal,
      time: Date.now(),
    });

    setActiveToast({
      key: keyPath,
      label,
      value: displayVal,
      id: Date.now(),
    });
  };

  // Reset single setting with notification
  const handleReset = (keyPath, itemLabel = "") => {
    resetSettingToDefault(keyPath, workspaceId, scope);
    setUserSettings(getUserSettings());
    if (workspaceId) {
      setWorkspaceOverrides(getWorkspaceOverrides(workspaceId));
    }
    const defVal = getNestedValue(DEFAULT_SETTINGS, keyPath);
    const label = itemLabel || keyPath.split(".").pop();
    const displayVal =
      typeof defVal === "boolean"
        ? defVal
          ? "Enabled"
          : "Disabled"
        : Array.isArray(defVal)
        ? `${defVal.length} items`
        : String(defVal);

    setRecentlyChanged((prev) => ({
      ...prev,
      [keyPath]: {
        label,
        value: `Reset to ${displayVal}`,
        time: Date.now(),
      },
    }));

    setLastSavedBanner({
      label,
      value: `Reset to ${displayVal}`,
      time: Date.now(),
    });

    setActiveToast({
      key: keyPath,
      label,
      value: `Default (${displayVal})`,
      id: Date.now(),
    });
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
      setActiveToast({
        key: "json",
        label: "settings.json",
        value: "Saved & Applied",
        id: Date.now(),
      });
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
      return { ...cat, items: matchingItems };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const totalMatches = useMemo(() => {
    if (!searchResults) return 0;
    return searchResults.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [searchResults]);

  // Current active category metadata
  const currentCategory = useMemo(() => {
    return findCategory(activeCategory);
  }, [activeCategory]);

  const CurrentCategoryIcon = ICON_MAP[currentCategory.icon] || Sliders;

  // Render live category preview boxes that respond to changing settings
  const renderLiveCategoryPreview = () => {
    const catId = currentCategory.id;

    // 1. Text Editor Live Preview
    if (catId === "editor") {
      const ed = activeSettings.editor || DEFAULT_SETTINGS.editor;
      return (
        <div className="settings-live-preview-box editor-preview animate-fade-in">
          <div className="preview-top-bar">
            <div className="preview-dots">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
            </div>
            <span className="preview-title">Live Editor Preview • Monaco Engine</span>
            <span className="preview-indicator">
              <span className="live-pulse-dot" />
              Real-Time Sync
            </span>
          </div>
          <div
            className="preview-code-body"
            style={{
              fontFamily: ed.fontFamily || "'Fira Code', monospace",
              fontSize: `${ed.fontSize || 14}px`,
              lineHeight: `${ed.lineHeight || 22}px`,
            }}
          >
            {ed.lineNumbers !== "off" && (
              <div className="preview-line-nums">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            )}
            <div className="preview-code-lines">
              <div className="code-line">
                <span className="tok-kw">export function</span>{" "}
                <span className="tok-fn-name">calculateMetrics</span>(
                <span className="tok-param">data</span>) &#123;
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="tok-kw">const</span> score = data.
                <span className="tok-method">map</span>(
                <span className="tok-param">x</span> =&gt; x.val *{" "}
                <span className="tok-num">2</span>);
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="tok-kw">return</span> score.
                <span className="tok-method">filter</span>(
                <span className="tok-param">n</span> =&gt; n &gt;{" "}
                <span className="tok-num">10</span>);
              </div>
              <div className="code-line">&#125;</div>
              <div className="code-line">
                <span className="tok-comment">
                  // Font: {ed.fontSize || 14}px • TabSize: {ed.tabSize || 2} • WordWrap:{" "}
                  {ed.wordWrap || "on"}
                </span>
                <span
                  className={`preview-cursor preview-cursor-${ed.cursorStyle || "line"}`}
                />
              </div>
            </div>
            {ed.minimap?.enabled && (
              <div className="preview-minimap-strip" title="Minimap Enabled">
                <div className="minimap-bar-1" />
                <div className="minimap-bar-2" />
                <div className="minimap-bar-3" />
                <div className="minimap-bar-4" />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. Terminal Live Preview
    if (catId === "terminal" || catId === "terminal.integrated") {
      const term =
        activeSettings["terminal.integrated"] ||
        DEFAULT_SETTINGS["terminal.integrated"];
      return (
        <div className="settings-live-preview-box terminal-preview animate-fade-in">
          <div className="preview-top-bar">
            <div className="preview-dots">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
            </div>
            <span className="preview-title">Live Terminal Preview • xterm.js Cloud PTY</span>
            <span className="preview-indicator">
              <span className="live-pulse-dot" />
              Real-Time Sync
            </span>
          </div>
          <div
            className="preview-terminal-body"
            style={{
              fontFamily:
                term.fontFamily ||
                "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              fontSize: `${term.fontSize || 13}px`,
            }}
          >
            <div className="term-line prompt-line">
              <span className="term-prompt">saksham@vocodeai:~$</span> node -v
            </div>
            <div className="term-line output-line">v20.18.0</div>
            <div className="term-line prompt-line">
              <span className="term-prompt">saksham@vocodeai:~$</span> echo "VocodeAI Cloud Container Ready"
            </div>
            <div className="term-line output-line">VocodeAI Cloud Container Ready</div>
            <div className="term-line prompt-line">
              <span className="term-prompt">saksham@vocodeai:~$</span>&nbsp;
              <span
                className={`preview-cursor term-cursor-${term.cursorStyle || "block"} ${
                  term.cursorBlink ? "blink" : ""
                }`}
              />
            </div>
          </div>
        </div>
      );
    }

    // 3. Workbench & Appearance Preview
    if (catId === "workbench") {
      const wb = activeSettings.workbench || DEFAULT_SETTINGS.workbench;
      return (
        <div className="settings-live-preview-box workbench-preview animate-fade-in">
          <div className="preview-top-bar">
            <span className="preview-title">Workbench Preview • Appearance & Scale</span>
            <span className="preview-indicator">
              <span className="live-pulse-dot" />
              Applied Globally
            </span>
          </div>
          <div className="workbench-preview-row">
            <div className="wb-badge">Theme: <strong>{wb.colorTheme || "dark"}</strong></div>
            <div className="wb-badge">Zoom Level: <strong>{wb.zoomLevel || 100}%</strong></div>
            <div className="wb-badge">Density: <strong>{wb.layoutDensity || "default"}</strong></div>
            <div className="wb-badge">Tab Sizing: <strong>{wb.tabSizing || "fit"}</strong></div>
          </div>
        </div>
      );
    }

    return null;
  };

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
                      const cat = findCategory(catId);
                      if (!cat) return null;
                      const IconComp = ICON_MAP[cat.icon] || Sliders;
                      const isActive =
                        (activeCategory === cat.id ||
                          (cat.id === "terminal" && activeCategory === "terminal.integrated") ||
                          (cat.id === "keybindings" && activeCategory === "shortcuts")) &&
                        !searchQuery;

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

            {/* Sidebar Footer Card */}
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

          {/* Right Scrollable Settings Content Area */}
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
                    {lastSavedBanner && (Date.now() - lastSavedBanner.time < 4000) ? (
                      <span className="meta-status-chip saving-pulse">
                        <Check size={12} className="text-accent" /> Saved: {lastSavedBanner.label} ({lastSavedBanner.value})
                      </span>
                    ) : (
                      <span className="meta-status-chip">
                        <CheckCircle2 size={12} /> Instant Auto-Sync
                      </span>
                    )}
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

                {/* Live Real-Time Previews (Editor / Terminal / Workbench) */}
                {renderLiveCategoryPreview()}

                {/* Setting Cards List */}
                <div className="settings-items-list">
                  {currentCategory.items.map((item) => renderSettingCard(item))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Real-time Floating Toast Notification */}
      {activeToast && (
        <div className="settings-live-toast animate-slide-up" key={activeToast.id}>
          <div className="toast-icon-wrap">
            <CheckCircle2 size={16} />
          </div>
          <div className="toast-body">
            <span className="toast-title">Setting Applied Live</span>
            <span className="toast-detail">
              {activeToast.label}: <strong>{activeToast.value}</strong>
            </span>
          </div>
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

    const changedInfo = recentlyChanged[item.key];
    const isRecentlyChanged = changedInfo && (Date.now() - changedInfo.time < 3500);

    return (
      <div
        key={item.key}
        id={`setting-card-${item.key}`}
        className={`setting-card ${isRecentlyChanged ? "just-saved" : ""}`}
      >
        <div className="setting-card-header">
          <div className="setting-title-wrapper">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h4 className="setting-label">{item.label}</h4>
              <span className="setting-key-tag">{item.key}</span>
              {isRecentlyChanged && (
                <span className="setting-saved-badge animate-pop-in">
                  <Check size={11} /> Saved
                </span>
              )}
            </div>
            <p className="setting-desc">{item.description}</p>
          </div>

          <div className="setting-actions">
            {isModified && (
              <button
                type="button"
                className="setting-reset-btn"
                onClick={() => handleReset(item.key, item.label)}
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
                onChange={(e) => handleUpdate(item.key, e.target.checked, item.label)}
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
                handleUpdate(item.key, next, item.label);
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
                onChange={(e) => handleUpdate(item.key, Number(e.target.value), item.label)}
              />
              <span className={`setting-slider-val ${isRecentlyChanged ? "highlight" : ""}`}>
                {val}
                {item.key.includes("fontSize") || item.key.includes("lineHeight")
                  ? "px"
                  : item.key.includes("Delay") || item.key.includes("Timeout")
                  ? "ms"
                  : item.key.includes("Zoom") || item.key.includes("zoomLevel")
                  ? "%"
                  : ""}
              </span>
            </div>
          )}

          {/* 4. STRING INPUT */}
          {item.type === "string" && (
            <input
              type="text"
              className="setting-text-input"
              value={val || ""}
              onChange={(e) => handleUpdate(item.key, e.target.value, item.label)}
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
                onChange={(e) => handleUpdate(item.key, e.target.value, item.label)}
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
                          handleUpdate(item.key, next, item.label);
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
                      handleUpdate(item.key, next, item.label);
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
                      handleUpdate(item.key, next, item.label);
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

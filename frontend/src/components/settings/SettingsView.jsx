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
};

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

    // ScrollSpy to dynamically highlight the category when scrolling down
  useEffect(() => {
    if (isJsonMode || searchQuery) return;
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        timeoutId = null;
        const sections = SETTINGS_METADATA.map((cat) =>
          document.getElementById(`section-${cat.id}`)
        ).filter(Boolean);

        const containerTop = scrollContainer.getBoundingClientRect().top;
        let currentId = null;

        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          const relativeTop = rect.top - containerTop;
          if (relativeTop <= 100 && relativeTop + rect.height > 30) {
            currentId = section.id.replace("section-", "");
            break;
          }
        }

        if (currentId) {
          setActiveCategory(currentId);
        }
      }, 50);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isJsonMode, searchQuery]);

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

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    const el = document.getElementById(`section-${catId}`);
    if (el && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const targetTop = el.getBoundingClientRect().top;
      contentRef.current.scrollBy({
        top: targetTop - containerTop - 12,
        behavior: "smooth",
      });
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

  // Filter settings by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return SETTINGS_METADATA;
    }
    const q = searchQuery.toLowerCase().trim();
    return SETTINGS_METADATA.map((cat) => {
      const matchingItems = cat.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
      return {
        ...cat,
        items: matchingItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery]);

  const totalMatches = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

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
                className={`scope-btn ${scope === "user" ? "active" : ""}`}
                onClick={() => setScope("user")}
                title="Global preferences across all workspaces"
              >
                User
              </button>
              <button
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
                className="settings-action-btn"
                onClick={handleCopyJson}
                title="Copy JSON to Clipboard"
              >
                <Copy size={14} />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
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
        /* STANDARD VS CODE UI VIEW */
        <div className="settings-body">
          {/* Left Category Sidebar */}
          <aside className="settings-sidebar">
            {SETTINGS_METADATA.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Sliders;
              const isMatch = filteredCategories.some((c) => c.id === cat.id);
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  className={`settings-nav-item ${isActive ? "active" : ""} ${
                    !isMatch && searchQuery ? "opacity-40" : ""
                  }`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <IconComp className="settings-nav-icon" />
                  <span className="settings-nav-label">{cat.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Scrollable Settings Content Area */}
          <main className="settings-content" ref={contentRef}>
            {filteredCategories.length === 0 ? (
              <div className="settings-no-results">
                <Search size={36} />
                <h4>No settings found</h4>
                <p>No settings matching "{searchQuery}". Try a different keyword.</p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const CategoryIcon = ICON_MAP[category.icon] || Sliders;

                return (
                  <section
                    key={category.id}
                    id={`section-${category.id}`}
                    className="settings-category-section"
                  >
                    <div className="settings-section-header">
                      <h3 className="settings-section-title">
                        <CategoryIcon size={18} className="text-accent" />
                        <span>{category.label}</span>
                      </h3>
                      <p className="settings-section-desc">
                        {category.description}
                      </p>
                    </div>

                    <div className="settings-items-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {category.items.map((item) => {
                        const val =
                          getNestedValue(activeSettings, item.key) ??
                          getNestedValue(DEFAULT_SETTINGS, item.key);
                        const isModified = isSettingModified(item.key);

                        return (
                          <div key={item.key} className="setting-card">
                            <div className="setting-card-header">
                              <div className="setting-title-wrapper">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <h4 className="setting-label">{item.label}</h4>
                                  <span className="setting-key-tag">
                                    {item.key}
                                  </span>
                                </div>
                                <p className="setting-desc">{item.description}</p>
                              </div>

                              <div className="setting-actions">
                                {isModified && (
                                  <button
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
                                    onChange={(e) =>
                                      handleUpdate(item.key, e.target.checked)
                                    }
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
                                    onChange={(e) =>
                                      handleUpdate(
                                        item.key,
                                        Number(e.target.value)
                                      )
                                    }
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
                                  onChange={(e) =>
                                    handleUpdate(item.key, e.target.value)
                                  }
                                />
                              )}

                              {/* 5. PASSWORD (API KEYS) */}
                              {item.type === "password" && (
                                <div className="setting-password-wrap">
                                  <input
                                    type={
                                      visiblePasswords[item.key]
                                        ? "text"
                                        : "password"
                                    }
                                    className="setting-text-input"
                                    placeholder="Enter secret key or leave blank..."
                                    value={val || ""}
                                    onChange={(e) =>
                                      handleUpdate(item.key, e.target.value)
                                    }
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
                                  >
                                    {visiblePasswords[item.key] ? (
                                      <EyeOff size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* 6. STRING ARRAY (CHIPS) */}
                              {item.type === "stringArray" && (
                                <div className="setting-chips-container">
                                  <div className="setting-chips-list">
                                    {Array.isArray(val) &&
                                      val.map((itemStr, idx) => (
                                        <span
                                          key={idx}
                                          className="setting-chip"
                                        >
                                          {itemStr}
                                          <button
                                            type="button"
                                            className="setting-chip-remove"
                                            onClick={() => {
                                              const next = val.filter(
                                                (_, i) => i !== idx
                                              );
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
                                          const next = [
                                            ...(val || []),
                                            newChipVal[item.key].trim(),
                                          ];
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
                                          const next = [
                                            ...(val || []),
                                            newChipVal[item.key].trim(),
                                          ];
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
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </div>
      )}
    </div>
  );
}


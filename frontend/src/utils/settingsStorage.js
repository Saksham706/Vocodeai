import { DEFAULT_SETTINGS } from "../config/defaultSettings";

const USER_SETTINGS_KEY = "vocode_user_settings";
const WORKSPACE_SETTINGS_PREFIX = "vocode_workspace_settings_";

/**
 * Deep merge utility to combine base default settings with user overrides
 */
function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;
  const output = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Get nested property by dot notation path (e.g. 'editor.minimap.enabled' or 'vocode.ai.defaultModel')
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  // 1. Exact match at root
  if (obj[path] !== undefined) return obj[path];

  // 2. Match against known DEFAULT_SETTINGS top-level keys that may contain dots (e.g., 'vocode.ai', 'terminal.integrated')
  for (const topKey of Object.keys(DEFAULT_SETTINGS)) {
    if (path === topKey) return obj[topKey];
    if (path.startsWith(topKey + ".")) {
      const remaining = path.slice(topKey.length + 1);
      const subParts = remaining.split(".");
      let curr = obj[topKey];
      for (const p of subParts) {
        if (curr === undefined || curr === null) return undefined;
        curr = curr[p];
      }
      return curr;
    }
  }

  // 3. Fallback standard dot path
  const parts = path.split(".");
  let curr = obj;
  for (const p of parts) {
    if (curr === undefined || curr === null) return undefined;
    curr = curr[p];
  }
  return curr;
}

/**
 * Set nested property by dot notation path with full support for top-level keys with dots
 * and deeply nested objects like 'editor.minimap.enabled'
 */
export function setNestedValue(obj, path, value) {
  const root = { ...obj };

  // Determine if path matches a known top-level key in DEFAULT_SETTINGS
  let topKey = null;
  let remainingPath = path;

  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (path === k) {
      root[k] = value;
      return root;
    }
    if (path.startsWith(k + ".")) {
      topKey = k;
      remainingPath = path.slice(k.length + 1);
      break;
    }
  }

  if (topKey) {
    const subParts = remainingPath.split(".");
    root[topKey] = root[topKey] && typeof root[topKey] === "object" ? { ...root[topKey] } : {};
    let curr = root[topKey];
    for (let i = 0; i < subParts.length - 1; i++) {
      const p = subParts[i];
      curr[p] = curr[p] && typeof curr[p] === "object" ? { ...curr[p] } : {};
      curr = curr[p];
    }
    curr[subParts[subParts.length - 1]] = value;
    return root;
  }

  // Standard dot path traversal
  const parts = path.split(".");
  let curr = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    curr[part] = curr[part] && typeof curr[part] === "object" ? { ...curr[part] } : {};
    curr = curr[part];
  }
  curr[parts[parts.length - 1]] = value;
  return root;
}

/**
 * Load User Settings from localStorage
 */
export function getUserSettings() {
  try {
    const raw = localStorage.getItem(USER_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_SETTINGS, parsed);
  } catch (e) {
    console.warn("Failed to parse user settings, using defaults", e);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save User Settings to localStorage
 */
export function saveUserSettings(settings) {
  try {
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings, null, 2));
    broadcastSettingsChange(settings, null);
  } catch (e) {
    console.error("Failed to save user settings", e);
  }
}

/**
 * Load Workspace-specific Settings overrides
 */
export function getWorkspaceOverrides(workspaceId) {
  if (!workspaceId) return {};
  try {
    const raw = localStorage.getItem(`${WORKSPACE_SETTINGS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to parse workspace settings", e);
    return {};
  }
}

/**
 * Save Workspace-specific Settings overrides
 */
export function saveWorkspaceOverrides(workspaceId, overrides) {
  if (!workspaceId) return;
  try {
    localStorage.setItem(
      `${WORKSPACE_SETTINGS_PREFIX}${workspaceId}`,
      JSON.stringify(overrides, null, 2)
    );
    const effective = getEffectiveSettings(workspaceId);
    broadcastSettingsChange(effective, workspaceId);
  } catch (e) {
    console.error("Failed to save workspace settings", e);
  }
}

/**
 * Get Effective Settings (User Settings merged with Workspace overrides)
 */
export function getEffectiveSettings(workspaceId) {
  const userSettings = getUserSettings();
  if (!workspaceId) return userSettings;
  const workspaceOverrides = getWorkspaceOverrides(workspaceId);
  return deepMerge(userSettings, workspaceOverrides);
}

/**
 * Apply live global runtime settings to document and environment
 */
export function applyRuntimeSettings(settings) {
  if (!settings) return;

  // 1. Theme
  const colorTheme = settings.workbench?.colorTheme;
  if (colorTheme) {
    document.documentElement.setAttribute("data-theme", colorTheme);
    localStorage.setItem("vocode_theme", colorTheme);
  }

  // 2. Zoom Level
  const zoomLevel = settings.workbench?.zoomLevel;
  if (zoomLevel !== undefined && zoomLevel !== null) {
    document.documentElement.style.zoom = `${zoomLevel}%`;
  }

  // 3. Layout Density
  const layoutDensity = settings.workbench?.layoutDensity;
  if (layoutDensity) {
    document.documentElement.setAttribute("data-density", layoutDensity);
  }
}

/**
 * Broadcast settings change to entire app
 */
export function broadcastSettingsChange(settings, workspaceId = null) {
  applyRuntimeSettings(settings);

  window.dispatchEvent(
    new CustomEvent("vocode-settings-changed", {
      detail: { settings, workspaceId },
    })
  );
}

// Automatically apply runtime settings on script evaluation
try {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    applyRuntimeSettings(getUserSettings());
  }
} catch (e) {
  console.warn("Could not apply initial runtime settings", e);
}

/**
 * Reset a setting to its default value
 */
export function resetSettingToDefault(keyPath, workspaceId = null, scope = "user") {
  const defaultValue = getNestedValue(DEFAULT_SETTINGS, keyPath);

  if (scope === "workspace" && workspaceId) {
    const overrides = getWorkspaceOverrides(workspaceId);
    // remove override
    const updated = setNestedValue(overrides, keyPath, undefined);
    saveWorkspaceOverrides(workspaceId, updated);
  } else {
    const userSettings = getUserSettings();
    const updated = setNestedValue(userSettings, keyPath, defaultValue);
    saveUserSettings(updated);
  }
}


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
 * Get nested property by dot notation path (e.g. 'editor.minimap.enabled')
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length; i++) {
    if (curr === undefined || curr === null) return undefined;
    // Check if parts up to end exist directly as a key with dot in it (e.g., 'vocode.ai')
    if (curr[parts.slice(i).join(".")] !== undefined) {
      return curr[parts.slice(i).join(".")];
    }
    // Check next slice combo
    const remaining = parts.slice(i).join(".");
    let matchedPrefix = null;
    for (const key of Object.keys(curr)) {
      if (remaining.startsWith(key + ".")) {
        matchedPrefix = key;
        break;
      }
    }
    if (matchedPrefix) {
      curr = curr[matchedPrefix];
      i += matchedPrefix.split(".").length - 1;
      continue;
    }

    curr = curr[parts[i]];
  }
  return curr;
}

/**
 * Set nested property by dot notation path
 */
export function setNestedValue(obj, path, value) {
  const root = { ...obj };
  const parts = path.split(".");

  // Check top-level section match first (e.g., 'vocode.ai', 'terminal.integrated')
  for (const topKey of Object.keys(DEFAULT_SETTINGS)) {
    if (path.startsWith(topKey + ".")) {
      const subPath = path.slice(topKey.length + 1);
      root[topKey] = { ...root[topKey], [subPath]: value };
      return root;
    }
  }

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
 * Broadcast settings change to entire app
 */
export function broadcastSettingsChange(settings, workspaceId = null) {
  // Sync theme attribute on <html> element if workbench.colorTheme is updated
  const colorTheme = settings.workbench?.colorTheme;
  if (colorTheme) {
    document.documentElement.setAttribute("data-theme", colorTheme);
    localStorage.setItem("vocode_theme", colorTheme);
  }

  window.dispatchEvent(
    new CustomEvent("vocode-settings-changed", {
      detail: { settings, workspaceId },
    })
  );
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


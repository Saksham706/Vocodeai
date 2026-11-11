/**
 * Theme Registry for VocodeAI Extensions
 * Defines custom Monaco editor themes and IDE CSS palettes
 */

export const THEME_DEFINITIONS = {
  "one-dark-pro": {
    id: "one-dark-pro",
    name: "One Dark Pro",
    publisher: "zhuangtongfa",
    category: "theme",
    palette: ["#282c34", "#61afef", "#98c379", "#e06c75", "#e5c07b"],
    cssVariables: {
      "--bg-app": "#21252b",
      "--bg-sidebar": "#21252b",
      "--bg-editor": "#282c34",
      "--border-color": "rgba(255, 255, 255, 0.08)",
      "--accent-color": "#61afef",
      "--accent-glow": "rgba(97, 175, 239, 0.25)",
      "--text-primary": "#abb2bf",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "abb2bf", background: "282c34" },
        { token: "comment", foreground: "5c6370", fontStyle: "italic" },
        { token: "keyword", foreground: "c678dd" },
        { token: "string", foreground: "98c379" },
        { token: "number", foreground: "d19a66" },
        { token: "regexp", foreground: "e06c75" },
        { token: "type", foreground: "e5c07b" },
        { token: "class", foreground: "e5c07b" },
        { token: "function", foreground: "61afef" },
        { token: "variable", foreground: "e06c75" },
        { token: "operator", foreground: "56b6c2" },
      ],
      colors: {
        "editor.background": "#282c34",
        "editor.foreground": "#abb2bf",
        "editorCursor.foreground": "#528bff",
        "editor.lineHighlightBackground": "#2c313a",
        "editorLineNumber.foreground": "#495162",
        "editorLineNumber.activeForeground": "#abb2bf",
        "editor.selectionBackground": "#3e4451",
        "editor.inactiveSelectionBackground": "#3e445180",
      },
    },
  },

  dracula: {
    id: "dracula",
    name: "Dracula Official",
    publisher: "Dracula Theme",
    category: "theme",
    palette: ["#282a36", "#bd93f9", "#ff79c6", "#50fa7b", "#8be9fd"],
    cssVariables: {
      "--bg-app": "#1e1f29",
      "--bg-sidebar": "#21222c",
      "--bg-editor": "#282a36",
      "--border-color": "rgba(189, 147, 249, 0.18)",
      "--accent-color": "#bd93f9",
      "--accent-glow": "rgba(189, 147, 249, 0.35)",
      "--text-primary": "#f8f8f2",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "f8f8f2", background: "282a36" },
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
        { token: "function", foreground: "50fa7b" },
        { token: "variable", foreground: "f8f8f2" },
        { token: "operator", foreground: "ff79c6" },
      ],
      colors: {
        "editor.background": "#282a36",
        "editor.foreground": "#f8f8f2",
        "editorCursor.foreground": "#f8f8f0",
        "editor.lineHighlightBackground": "#44475a75",
        "editorLineNumber.foreground": "#6272a4",
        "editorLineNumber.activeForeground": "#f8f8f2",
        "editor.selectionBackground": "#44475a",
      },
    },
  },

  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    publisher: "enkia",
    category: "theme",
    palette: ["#1a1b26", "#7aa2f7", "#bb9af7", "#7dcfff", "#9ece6a"],
    cssVariables: {
      "--bg-app": "#16161e",
      "--bg-sidebar": "#16161e",
      "--bg-editor": "#1a1b26",
      "--border-color": "rgba(122, 162, 247, 0.16)",
      "--accent-color": "#7aa2f7",
      "--accent-glow": "rgba(122, 162, 247, 0.3)",
      "--text-primary": "#c0caf5",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "c0caf5", background: "1a1b26" },
        { token: "comment", foreground: "565f89", fontStyle: "italic" },
        { token: "keyword", foreground: "bb9af7" },
        { token: "string", foreground: "9ece6a" },
        { token: "number", foreground: "ff9e64" },
        { token: "type", foreground: "2ac3de" },
        { token: "function", foreground: "7aa2f7" },
        { token: "variable", foreground: "c0caf5" },
        { token: "operator", foreground: "89ddff" },
      ],
      colors: {
        "editor.background": "#1a1b26",
        "editor.foreground": "#c0caf5",
        "editorCursor.foreground": "#c0caf5",
        "editor.lineHighlightBackground": "#292e42",
        "editorLineNumber.foreground": "#3b4261",
        "editorLineNumber.activeForeground": "#7aa2f7",
        "editor.selectionBackground": "#33467c",
      },
    },
  },

  "github-dark": {
    id: "github-dark",
    name: "GitHub Dark",
    publisher: "GitHub",
    category: "theme",
    palette: ["#0d1117", "#58a6ff", "#7ee787", "#ffa657", "#ff7b72"],
    cssVariables: {
      "--bg-app": "#010409",
      "--bg-sidebar": "#0d1117",
      "--bg-editor": "#0d1117",
      "--border-color": "rgba(240, 246, 252, 0.1)",
      "--accent-color": "#58a6ff",
      "--accent-glow": "rgba(88, 166, 255, 0.25)",
      "--text-primary": "#e6edf3",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "c9d1d9", background: "0d1117" },
        { token: "comment", foreground: "8b949e", fontStyle: "italic" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "string", foreground: "a5d6ff" },
        { token: "number", foreground: "79c0ff" },
        { token: "type", foreground: "ffa657" },
        { token: "function", foreground: "d2a8ff" },
        { token: "variable", foreground: "c9d1d9" },
        { token: "operator", foreground: "79c0ff" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editorCursor.foreground": "#58a6ff",
        "editor.lineHighlightBackground": "#161b22",
        "editorLineNumber.foreground": "#6e7681",
        "editorLineNumber.activeForeground": "#e6edf3",
        "editor.selectionBackground": "#1f6feb40",
      },
    },
  },

  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    publisher: "Endormi",
    category: "theme",
    palette: ["#120422", "#ffe600", "#ff0055", "#00ffcc", "#9900ff"],
    cssVariables: {
      "--bg-app": "#0a0114",
      "--bg-sidebar": "#0f021c",
      "--bg-editor": "#120422",
      "--border-color": "rgba(255, 230, 0, 0.25)",
      "--accent-color": "#ffe600",
      "--accent-glow": "rgba(255, 230, 0, 0.4)",
      "--text-primary": "#fefefe",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "fefefe", background: "120422" },
        { token: "comment", foreground: "372948", fontStyle: "italic" },
        { token: "keyword", foreground: "ff0055" },
        { token: "string", foreground: "00ffcc" },
        { token: "number", foreground: "ffe600" },
        { token: "type", foreground: "fbff00" },
        { token: "function", foreground: "00e8c6" },
        { token: "variable", foreground: "fefefe" },
        { token: "operator", foreground: "ff0055" },
      ],
      colors: {
        "editor.background": "#120422",
        "editor.foreground": "#fefefe",
        "editorCursor.foreground": "#ffe600",
        "editor.lineHighlightBackground": "#1d0838",
        "editorLineNumber.foreground": "#72298c",
        "editorLineNumber.activeForeground": "#ffe600",
        "editor.selectionBackground": "#ff005544",
      },
    },
  },

  nord: {
    id: "nord",
    name: "Nord",
    publisher: "arcticicestudio",
    category: "theme",
    palette: ["#2e3440", "#88c0d0", "#81a1c1", "#bf616a", "#a3be8c"],
    cssVariables: {
      "--bg-app": "#242933",
      "--bg-sidebar": "#292e39",
      "--bg-editor": "#2e3440",
      "--border-color": "rgba(136, 192, 208, 0.16)",
      "--accent-color": "#88c0d0",
      "--accent-glow": "rgba(136, 192, 208, 0.25)",
      "--text-primary": "#d8dee9",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "d8dee9", background: "2e3440" },
        { token: "comment", foreground: "4c566a", fontStyle: "italic" },
        { token: "keyword", foreground: "81a1c1" },
        { token: "string", foreground: "a3be8c" },
        { token: "number", foreground: "b48ead" },
        { token: "type", foreground: "8fbcbb" },
        { token: "function", foreground: "88c0d0" },
        { token: "variable", foreground: "d8dee9" },
        { token: "operator", foreground: "81a1c1" },
      ],
      colors: {
        "editor.background": "#2e3440",
        "editor.foreground": "#d8dee9",
        "editorCursor.foreground": "#d8dee9",
        "editor.lineHighlightBackground": "#3b4252",
        "editorLineNumber.foreground": "#4c566a",
        "editorLineNumber.activeForeground": "#88c0d0",
        "editor.selectionBackground": "#434c5e",
      },
    },
  },

  "monokai-pro": {
    id: "monokai-pro",
    name: "Monokai Pro",
    publisher: "monokai",
    category: "theme",
    palette: ["#2d2a2e", "#ffd866", "#a9dc76", "#78dce8", "#ff6188"],
    cssVariables: {
      "--bg-app": "#221f22",
      "--bg-sidebar": "#221f22",
      "--bg-editor": "#2d2a2e",
      "--border-color": "rgba(255, 216, 102, 0.16)",
      "--accent-color": "#ffd866",
      "--accent-glow": "rgba(255, 216, 102, 0.3)",
      "--text-primary": "#fcfcfa",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "fcfcfa", background: "2d2a2e" },
        { token: "comment", foreground: "727072", fontStyle: "italic" },
        { token: "keyword", foreground: "ff6188" },
        { token: "string", foreground: "ffd866" },
        { token: "number", foreground: "ab9df2" },
        { token: "type", foreground: "78dce8" },
        { token: "function", foreground: "a9dc76" },
        { token: "variable", foreground: "fcfcfa" },
        { token: "operator", foreground: "ff6188" },
      ],
      colors: {
        "editor.background": "#2d2a2e",
        "editor.foreground": "#fcfcfa",
        "editorCursor.foreground": "#ffd866",
        "editor.lineHighlightBackground": "#3a373b",
        "editorLineNumber.foreground": "#5b595c",
        "editorLineNumber.activeForeground": "#ffd866",
        "editor.selectionBackground": "#403e41",
      },
    },
  },

  synthwave84: {
    id: "synthwave84",
    name: "SynthWave '84",
    publisher: "RobbOwen",
    category: "theme",
    palette: ["#262335", "#ff7edb", "#36f9f6", "#fe4450", "#72f1b8"],
    cssVariables: {
      "--bg-app": "#1c1926",
      "--bg-sidebar": "#1c1926",
      "--bg-editor": "#262335",
      "--border-color": "rgba(255, 126, 219, 0.2)",
      "--accent-color": "#ff7edb",
      "--accent-glow": "rgba(255, 126, 219, 0.35)",
      "--text-primary": "#f92aad",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "ffffff", background: "262335" },
        { token: "comment", foreground: "614d85", fontStyle: "italic" },
        { token: "keyword", foreground: "fed829" },
        { token: "string", foreground: "ff7edb" },
        { token: "number", foreground: "f97e72" },
        { token: "type", foreground: "fe4450" },
        { token: "function", foreground: "36f9f6" },
        { token: "variable", foreground: "72f1b8" },
        { token: "operator", foreground: "fede5d" },
      ],
      colors: {
        "editor.background": "#262335",
        "editor.foreground": "#ffffff",
        "editorCursor.foreground": "#36f9f6",
        "editor.lineHighlightBackground": "#34294f45",
        "editorLineNumber.foreground": "#614d85",
        "editorLineNumber.activeForeground": "#ff7edb",
        "editor.selectionBackground": "#ffffff20",
      },
    },
  },
};

/**
 * Register all custom Monaco themes once
 */
export function registerMonacoThemes(monaco) {
  if (!monaco?.editor) return;
  Object.values(THEME_DEFINITIONS).forEach((themeDef) => {
    try {
      monaco.editor.defineTheme(themeDef.id, themeDef.monaco);
    } catch (e) {
      // Theme might already be defined
    }
  });
}

/**
 * Apply theme extension to both Monaco Editor and DOM CSS variables
 */
export function applyThemeExtension(themeId, monacoInstance) {
  const def = THEME_DEFINITIONS[themeId];
  if (!def) {
    // Reset to default
    document.documentElement.removeAttribute("data-theme-extension");
    localStorage.removeItem("vocode_active_theme_extension");
    if (monacoInstance?.editor) {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      monacoInstance.editor.setTheme(isLight ? "light" : "vs-dark");
    }
    window.dispatchEvent(
      new CustomEvent("vocode-theme-extension-changed", {
        detail: { themeId: null },
      })
    );
    return null;
  }

  // Set DOM attribute
  document.documentElement.setAttribute("data-theme-extension", themeId);
  localStorage.setItem("vocode_active_theme_extension", themeId);

  // Set CSS custom properties on root
  if (def.cssVariables) {
    Object.entries(def.cssVariables).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }

  // Register in Monaco if provided
  if (monacoInstance?.editor) {
    try {
      monacoInstance.editor.defineTheme(def.id, def.monaco);
      monacoInstance.editor.setTheme(def.id);
    } catch {}
  }

  // Dispatch global event for open editors and panels
  window.dispatchEvent(
    new CustomEvent("vocode-theme-extension-changed", {
      detail: { themeId, themeDef: def },
    })
  );

  return def;
}

/**
 * Get currently active theme extension
 */
export function getActiveThemeExtension() {
  const stored = localStorage.getItem("vocode_active_theme_extension");
  if (stored && THEME_DEFINITIONS[stored]) {
    return stored;
  }
  return null;
}


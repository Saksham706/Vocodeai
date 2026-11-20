/**
 * Theme Registry for VocodeAI Extensions
 * Defines custom Monaco editor themes and IDE CSS palettes
 * Applied across the entire IDE and website
 */

export const THEME_DEFINITIONS = {
  "vocodeai-default": {
    id: "vocodeai-default",
    name: "VocodeAI Obsidian (Default)",
    publisher: "VocodeAI Team",
    category: "theme",
    palette: ["#020708", "#43E65C", "#FF8B32", "#B7FF29", "#080F12"],
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "F3F8F4", background: "080F12" },
        { token: "comment", foreground: "608272", fontStyle: "italic" },
        { token: "keyword", foreground: "43E65C" },
        { token: "keyword.js", foreground: "43E65C" },
        { token: "keyword.ts", foreground: "43E65C" },
        { token: "string", foreground: "B7FF29" },
        { token: "number", foreground: "FF8B32" },
        { token: "type", foreground: "38BDF8", fontStyle: "italic" },
        { token: "type.identifier", foreground: "38BDF8" },
        { token: "function", foreground: "43E65C" },
        { token: "variable", foreground: "F3F8F4" },
        { token: "variable.parameter", foreground: "FF8B32" },
        { token: "operator", foreground: "FF8B32" },
        { token: "tag", foreground: "43E65C" },
        { token: "tag.id", foreground: "43E65C" },
        { token: "attribute.name", foreground: "FF8B32" },
        { token: "attribute.value", foreground: "B7FF29" },
        { token: "delimiter", foreground: "91A89B" },
        { token: "delimiter.bracket", foreground: "FF8B32" },
      ],
      colors: {
        "editor.background": "#080F12",
        "editor.foreground": "#F3F8F4",
        "editorCursor.foreground": "#43E65C",
        "editor.lineHighlightBackground": "#0d1a14",
        "editorLineNumber.foreground": "#4a6356",
        "editorLineNumber.activeForeground": "#43E65C",
        "editor.selectionBackground": "rgba(67, 230, 92, 0.22)",
        "editor.inactiveSelectionBackground": "rgba(67, 230, 92, 0.12)",
      },
    },
    cssVariables: {
      "--bg-app": "#020708",
      "--bg-sidebar": "#020B08",
      "--bg-editor": "#080F12",
      "--border-color": "rgba(66, 165, 104, 0.18)",
      "--accent-color": "#43E65C",
      "--accent-glow": "rgba(67, 230, 92, 0.35)",
      "--text-primary": "#F3F8F4",
      "--ide-bg": "#020708",
      "--ide-nav-bg": "rgba(2, 7, 8, 0.82)",
      "--ide-sidebar-bg": "rgba(2, 7, 8, 0.72)",
      "--ide-editor-bg": "#080F12",
      "--ide-terminal-bg": "#030C08",
      "--ide-card-bg": "#04100B",
      "--ide-border": "rgba(66, 165, 104, 0.18)",
      "--ide-border-hover": "rgba(67, 230, 92, 0.35)",
      "--ide-text-primary": "#F3F8F4",
      "--ide-text-secondary": "#C1D2C7",
      "--ide-text-muted": "#8BA195",
      "--ide-accent-green": "#43E65C",
      "--ide-accent-lime": "#B7FF29",
      "--ide-accent-orange": "#FF8B32",
      "--ide-accent-coral": "#FF5F45",
      "--ide-active-pill-bg": "rgba(255, 139, 50, 0.12)",
      "--ide-active-pill-border": "rgba(255, 139, 50, 0.45)",
      "--ide-active-pill-text": "#FF9B3D",
      "--ide-hover-bg": "rgba(67, 230, 92, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.5)",
      "--ide-glow-primary": "rgba(67, 230, 92, 0.15)",
      "--explorer-bg": "#020B08",
      "--explorer-surface": "#04150F",
      "--explorer-surface-hover": "#09271B",
      "--explorer-text": "#F3F8F4",
      "--explorer-text-muted": "#91A89B",
      "--explorer-border": "rgba(74, 190, 113, 0.22)",
      "--explorer-border-active": "#43E65C",
      "--explorer-accent": "#43E65C",
      "--explorer-accent-secondary": "#FF8B32",
      "--explorer-selection": "#08281B",
      "--explorer-guide-line": "rgba(74, 190, 113, 0.18)",
      "--terminal-bg": "#020B08",
      "--terminal-header-bg": "#020D09",
      "--terminal-tabs-bg": "#020B08",
      "--terminal-output-bg": "#020B08",
      "--terminal-border": "rgba(66, 165, 104, 0.25)",
      "--terminal-border-active": "rgba(255, 139, 50, 0.6)",
      "--terminal-divider": "rgba(66, 165, 104, 0.2)",
      "--terminal-text": "#E2E8F0",
      "--terminal-text-muted": "#94A3B8",
      "--terminal-prompt-user": "#43E65C",
      "--terminal-prompt-path": "#38BDF8",
      "--terminal-cmd": "#FFFFFF",
      "--terminal-link": "#38BDF8",
      "--terminal-cursor": "#43E65C",
      "--terminal-hover-bg": "rgba(67, 230, 92, 0.08)",
      "--terminal-active-tab-bg": "rgba(255, 139, 50, 0.14)",
      "--terminal-active-tab-border": "rgba(255, 139, 50, 0.5)",
      "--terminal-active-tab-text": "#FF8B32",
      "--activity-bg": "#020708",
      "--activity-border": "rgba(66, 165, 104, 0.18)",
      "--activity-icon": "#8BA195",
      "--activity-icon-hover": "#F3F8F4",
      "--activity-active-bg": "#04100B",
      "--activity-active-border": "#43E65C",
      "--activity-active-icon": "#43E65C",
      "--activity-active-glow": "0 0 12px rgba(67, 230, 92, 0.45)",
      "--ai-bg": "#020B08",
      "--ai-surface": "#04140F",
      "--ai-surface-secondary": "#061B13",
      "--ai-surface-hover": "#0B291D",
      "--ai-text": "#F3F8F4",
      "--ai-text-secondary": "#C1D2C7",
      "--ai-text-muted": "#91A89B",
      "--ai-border": "rgba(52, 174, 112, 0.22)",
      "--ai-border-strong": "rgba(43, 218, 127, 0.38)",
      "--ai-accent": "#FF9B3D",
      "--ai-accent-secondary": "#FF5F45",
      "--status-bar-bg": "#020B08",
      "--bg-primary": "#020708",
      "--bg-secondary": "#020B08",
      "--surface-primary": "#04100B",
      "--surface-secondary": "#020708",
      "--surface-hover": "#09271B",
      "--text-secondary": "#C1D2C7",
      "--text-muted": "#8BA195",
      "--border-primary": "rgba(66, 165, 104, 0.18)",
      "--border-secondary": "rgba(67, 230, 92, 0.35)",
      "--accent-primary": "#43E65C",
      "--accent-secondary": "#FF8B32",
      "--accent-soft": "rgba(67, 230, 92, 0.15)",
      "--bg-base": "#020708",
      "--bg-surface": "#04100B",
    },
  },
  "one-dark-pro": {
    id: "one-dark-pro",
    name: "One Dark Pro",
    publisher: "zhuangtongfa",
    category: "theme",
    palette: ["#282c34", "#61afef", "#98c379", "#e06c75", "#e5c07b"],
    cssVariables: {
      // General
      "--bg-app": "#21252b",
      "--bg-sidebar": "#21252b",
      "--bg-editor": "#282c34",
      "--border-color": "rgba(255, 255, 255, 0.1)",
      "--accent-color": "#61afef",
      "--accent-glow": "rgba(97, 175, 239, 0.35)",
      "--text-primary": "#abb2bf",

      // IDE Layout
      "--ide-bg": "#21252b",
      "--ide-nav-bg": "#1e2227",
      "--ide-sidebar-bg": "#21252b",
      "--ide-editor-bg": "#282c34",
      "--ide-terminal-bg": "#1e2227",
      "--ide-card-bg": "#282c34",
      "--ide-border": "rgba(255, 255, 255, 0.1)",
      "--ide-border-hover": "rgba(97, 175, 239, 0.45)",
      "--ide-text-primary": "#abb2bf",
      "--ide-text-secondary": "#828997",
      "--ide-text-muted": "#5c6370",
      "--ide-accent-green": "#98c379",
      "--ide-accent-lime": "#e5c07b",
      "--ide-accent-orange": "#d19a66",
      "--ide-accent-coral": "#e06c75",
      "--ide-active-pill-bg": "rgba(97, 175, 239, 0.15)",
      "--ide-active-pill-border": "rgba(97, 175, 239, 0.45)",
      "--ide-active-pill-text": "#61afef",
      "--ide-hover-bg": "rgba(255, 255, 255, 0.05)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.4)",
      "--ide-glow-primary": "rgba(97, 175, 239, 0.25)",

      // Explorer
      "--explorer-bg": "#21252b",
      "--explorer-surface": "#282c34",
      "--explorer-surface-hover": "#2c313a",
      "--explorer-text": "#abb2bf",
      "--explorer-text-muted": "#5c6370",
      "--explorer-border": "rgba(255, 255, 255, 0.08)",
      "--explorer-border-active": "#61afef",
      "--explorer-accent": "#61afef",
      "--explorer-accent-secondary": "#98c379",
      "--explorer-selection": "rgba(97, 175, 239, 0.15)",
      "--explorer-guide-line": "rgba(255, 255, 255, 0.08)",

      // Terminal
      "--terminal-bg": "#1e2227",
      "--terminal-header-bg": "#21252b",
      "--terminal-tabs-bg": "#1e2227",
      "--terminal-output-bg": "#1e2227",
      "--terminal-border": "rgba(255, 255, 255, 0.1)",
      "--terminal-border-active": "#61afef",
      "--terminal-divider": "rgba(255, 255, 255, 0.08)",
      "--terminal-text": "#abb2bf",
      "--terminal-text-muted": "#5c6370",
      "--terminal-prompt-user": "#98c379",
      "--terminal-prompt-path": "#61afef",
      "--terminal-cmd": "#abb2bf",
      "--terminal-link": "#61afef",
      "--terminal-cursor": "#528bff",
      "--terminal-hover-bg": "rgba(255, 255, 255, 0.05)",
      "--terminal-active-tab-bg": "rgba(97, 175, 239, 0.15)",
      "--terminal-active-tab-border": "#61afef",
      "--terminal-active-tab-text": "#61afef",

      // Activity Bar
      "--activity-bg": "#1e2227",
      "--activity-border": "rgba(255, 255, 255, 0.08)",
      "--activity-icon": "#5c6370",
      "--activity-icon-hover": "#abb2bf",
      "--activity-active-bg": "#282c34",
      "--activity-active-border": "#61afef",
      "--activity-active-icon": "#61afef",
      "--activity-active-glow": "0 0 12px rgba(97, 175, 239, 0.35)",

      // AI Chat
      "--ai-bg": "#21252b",
      "--ai-surface": "#282c34",
      "--ai-surface-secondary": "#1e2227",
      "--ai-surface-hover": "#2c313a",
      "--ai-text": "#abb2bf",
      "--ai-text-secondary": "#828997",
      "--ai-text-muted": "#5c6370",
      "--ai-border": "rgba(255, 255, 255, 0.1)",
      "--ai-border-strong": "rgba(97, 175, 239, 0.45)",
      "--ai-accent": "#61afef",
      "--ai-accent-secondary": "#98c379",

      // Status Bar
      "--status-bar-bg": "#1e2227",

      // Dashboard & Website Pages
      "--bg-primary": "#21252b",
      "--bg-secondary": "#1e2227",
      "--surface-primary": "#282c34",
      "--surface-secondary": "#21252b",
      "--surface-hover": "#2c313a",
      "--text-secondary": "#828997",
      "--text-muted": "#5c6370",
      "--border-primary": "rgba(255, 255, 255, 0.1)",
      "--border-secondary": "rgba(97, 175, 239, 0.3)",
      "--accent-primary": "#61afef",
      "--accent-secondary": "#98c379",
      "--accent-soft": "rgba(97, 175, 239, 0.15)",
      "--bg-base": "#21252b",
      "--bg-surface": "#282c34",
      "--bg-surface-elevated": "#2c313a",
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
      // General
      "--bg-app": "#1e1f29",
      "--bg-sidebar": "#21222c",
      "--bg-editor": "#282a36",
      "--border-color": "rgba(189, 147, 249, 0.22)",
      "--accent-color": "#bd93f9",
      "--accent-glow": "rgba(189, 147, 249, 0.45)",
      "--text-primary": "#f8f8f2",

      // IDE Layout
      "--ide-bg": "#1e1f29",
      "--ide-nav-bg": "#21222c",
      "--ide-sidebar-bg": "#21222c",
      "--ide-editor-bg": "#282a36",
      "--ide-terminal-bg": "#191a21",
      "--ide-card-bg": "#282a36",
      "--ide-border": "rgba(189, 147, 249, 0.22)",
      "--ide-border-hover": "rgba(189, 147, 249, 0.5)",
      "--ide-text-primary": "#f8f8f2",
      "--ide-text-secondary": "#e2e8f0",
      "--ide-text-muted": "#6272a4",
      "--ide-accent-green": "#50fa7b",
      "--ide-accent-lime": "#f1fa8c",
      "--ide-accent-orange": "#ffb86c",
      "--ide-accent-coral": "#ff79c6",
      "--ide-active-pill-bg": "rgba(189, 147, 249, 0.18)",
      "--ide-active-pill-border": "rgba(189, 147, 249, 0.55)",
      "--ide-active-pill-text": "#bd93f9",
      "--ide-hover-bg": "rgba(189, 147, 249, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.5)",
      "--ide-glow-primary": "rgba(189, 147, 249, 0.35)",

      // Explorer
      "--explorer-bg": "#21222c",
      "--explorer-surface": "#282a36",
      "--explorer-surface-hover": "#343746",
      "--explorer-text": "#f8f8f2",
      "--explorer-text-muted": "#6272a4",
      "--explorer-border": "rgba(189, 147, 249, 0.2)",
      "--explorer-border-active": "#bd93f9",
      "--explorer-accent": "#bd93f9",
      "--explorer-accent-secondary": "#ff79c6",
      "--explorer-selection": "rgba(189, 147, 249, 0.18)",
      "--explorer-guide-line": "rgba(189, 147, 249, 0.18)",

      // Terminal
      "--terminal-bg": "#191a21",
      "--terminal-header-bg": "#21222c",
      "--terminal-tabs-bg": "#191a21",
      "--terminal-output-bg": "#191a21",
      "--terminal-border": "rgba(189, 147, 249, 0.22)",
      "--terminal-border-active": "#bd93f9",
      "--terminal-divider": "rgba(189, 147, 249, 0.18)",
      "--terminal-text": "#f8f8f2",
      "--terminal-text-muted": "#6272a4",
      "--terminal-prompt-user": "#50fa7b",
      "--terminal-prompt-path": "#8be9fd",
      "--terminal-cmd": "#f8f8f2",
      "--terminal-link": "#8be9fd",
      "--terminal-cursor": "#f8f8f0",
      "--terminal-hover-bg": "rgba(189, 147, 249, 0.08)",
      "--terminal-active-tab-bg": "rgba(189, 147, 249, 0.18)",
      "--terminal-active-tab-border": "#bd93f9",
      "--terminal-active-tab-text": "#bd93f9",

      // Activity Bar
      "--activity-bg": "#1e1f29",
      "--activity-border": "rgba(189, 147, 249, 0.2)",
      "--activity-icon": "#6272a4",
      "--activity-icon-hover": "#f8f8f2",
      "--activity-active-bg": "#282a36",
      "--activity-active-border": "#bd93f9",
      "--activity-active-icon": "#bd93f9",
      "--activity-active-glow": "0 0 14px rgba(189, 147, 249, 0.4)",

      // AI Chat
      "--ai-bg": "#1e1f29",
      "--ai-surface": "#21222c",
      "--ai-surface-secondary": "#282a36",
      "--ai-surface-hover": "#343746",
      "--ai-text": "#f8f8f2",
      "--ai-text-secondary": "#e2e8f0",
      "--ai-text-muted": "#6272a4",
      "--ai-border": "rgba(189, 147, 249, 0.22)",
      "--ai-border-strong": "rgba(189, 147, 249, 0.45)",
      "--ai-accent": "#bd93f9",
      "--ai-accent-secondary": "#ff79c6",

      // Status Bar
      "--status-bar-bg": "#191a21",

      // Dashboard & Website Pages
      "--bg-primary": "#1e1f29",
      "--bg-secondary": "#21222c",
      "--surface-primary": "#282a36",
      "--surface-secondary": "#21222c",
      "--surface-hover": "#343746",
      "--text-secondary": "#e2e8f0",
      "--text-muted": "#6272a4",
      "--border-primary": "rgba(189, 147, 249, 0.22)",
      "--border-secondary": "rgba(189, 147, 249, 0.4)",
      "--accent-primary": "#bd93f9",
      "--accent-secondary": "#ff79c6",
      "--accent-soft": "rgba(189, 147, 249, 0.18)",
      "--bg-base": "#1e1f29",
      "--bg-surface": "#21222c",
      "--bg-surface-elevated": "#282a36",
    },
    monaco: {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "f8f8f2", background: "282a36" },
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "keyword.js", foreground: "ff79c6" },
        { token: "keyword.ts", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
        { token: "type.identifier", foreground: "8be9fd" },
        { token: "function", foreground: "50fa7b" },
        { token: "variable", foreground: "f8f8f2" },
        { token: "variable.parameter", foreground: "ffb86c" },
        { token: "operator", foreground: "ff79c6" },
        { token: "tag", foreground: "ff79c6" },
        { token: "tag.id", foreground: "50fa7b" },
        { token: "attribute.name", foreground: "50fa7b" },
        { token: "attribute.value", foreground: "f1fa8c" },
        { token: "delimiter", foreground: "f8f8f2" },
        { token: "delimiter.bracket", foreground: "ff79c6" },
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
      // General
      "--bg-app": "#16161e",
      "--bg-sidebar": "#16161e",
      "--bg-editor": "#1a1b26",
      "--border-color": "rgba(122, 162, 247, 0.2)",
      "--accent-color": "#7aa2f7",
      "--accent-glow": "rgba(122, 162, 247, 0.35)",
      "--text-primary": "#c0caf5",

      // IDE Layout
      "--ide-bg": "#16161e",
      "--ide-nav-bg": "#16161e",
      "--ide-sidebar-bg": "#16161e",
      "--ide-editor-bg": "#1a1b26",
      "--ide-terminal-bg": "#13141c",
      "--ide-card-bg": "#1a1b26",
      "--ide-border": "rgba(122, 162, 247, 0.18)",
      "--ide-border-hover": "rgba(122, 162, 247, 0.45)",
      "--ide-text-primary": "#c0caf5",
      "--ide-text-secondary": "#a9b1d6",
      "--ide-text-muted": "#565f89",
      "--ide-accent-green": "#9ece6a",
      "--ide-accent-lime": "#73daca",
      "--ide-accent-orange": "#ff9e64",
      "--ide-accent-coral": "#f7768e",
      "--ide-active-pill-bg": "rgba(122, 162, 247, 0.16)",
      "--ide-active-pill-border": "rgba(122, 162, 247, 0.5)",
      "--ide-active-pill-text": "#7aa2f7",
      "--ide-hover-bg": "rgba(122, 162, 247, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.5)",
      "--ide-glow-primary": "rgba(122, 162, 247, 0.3)",

      // Explorer
      "--explorer-bg": "#16161e",
      "--explorer-surface": "#1a1b26",
      "--explorer-surface-hover": "#24283b",
      "--explorer-text": "#c0caf5",
      "--explorer-text-muted": "#565f89",
      "--explorer-border": "rgba(122, 162, 247, 0.18)",
      "--explorer-border-active": "#7aa2f7",
      "--explorer-accent": "#7aa2f7",
      "--explorer-accent-secondary": "#bb9af7",
      "--explorer-selection": "rgba(122, 162, 247, 0.15)",
      "--explorer-guide-line": "rgba(122, 162, 247, 0.15)",

      // Terminal
      "--terminal-bg": "#13141c",
      "--terminal-header-bg": "#16161e",
      "--terminal-tabs-bg": "#13141c",
      "--terminal-output-bg": "#13141c",
      "--terminal-border": "rgba(122, 162, 247, 0.18)",
      "--terminal-border-active": "#7aa2f7",
      "--terminal-divider": "rgba(122, 162, 247, 0.15)",
      "--terminal-text": "#c0caf5",
      "--terminal-text-muted": "#565f89",
      "--terminal-prompt-user": "#9ece6a",
      "--terminal-prompt-path": "#7dcfff",
      "--terminal-cmd": "#c0caf5",
      "--terminal-link": "#7dcfff",
      "--terminal-cursor": "#c0caf5",
      "--terminal-hover-bg": "rgba(122, 162, 247, 0.08)",
      "--terminal-active-tab-bg": "rgba(122, 162, 247, 0.16)",
      "--terminal-active-tab-border": "#7aa2f7",
      "--terminal-active-tab-text": "#7aa2f7",

      // Activity Bar
      "--activity-bg": "#13141c",
      "--activity-border": "rgba(122, 162, 247, 0.18)",
      "--activity-icon": "#565f89",
      "--activity-icon-hover": "#c0caf5",
      "--activity-active-bg": "#1a1b26",
      "--activity-active-border": "#7aa2f7",
      "--activity-active-icon": "#7aa2f7",
      "--activity-active-glow": "0 0 14px rgba(122, 162, 247, 0.35)",

      // AI Chat
      "--ai-bg": "#16161e",
      "--ai-surface": "#1a1b26",
      "--ai-surface-secondary": "#13141c",
      "--ai-surface-hover": "#24283b",
      "--ai-text": "#c0caf5",
      "--ai-text-secondary": "#a9b1d6",
      "--ai-text-muted": "#565f89",
      "--ai-border": "rgba(122, 162, 247, 0.18)",
      "--ai-border-strong": "rgba(122, 162, 247, 0.45)",
      "--ai-accent": "#7aa2f7",
      "--ai-accent-secondary": "#bb9af7",

      // Status Bar
      "--status-bar-bg": "#13141c",

      // Dashboard & Website Pages
      "--bg-primary": "#16161e",
      "--bg-secondary": "#13141c",
      "--surface-primary": "#1a1b26",
      "--surface-secondary": "#16161e",
      "--surface-hover": "#24283b",
      "--text-secondary": "#a9b1d6",
      "--text-muted": "#565f89",
      "--border-primary": "rgba(122, 162, 247, 0.18)",
      "--border-secondary": "rgba(122, 162, 247, 0.35)",
      "--accent-primary": "#7aa2f7",
      "--accent-secondary": "#bb9af7",
      "--accent-soft": "rgba(122, 162, 247, 0.16)",
      "--bg-base": "#16161e",
      "--bg-surface": "#1a1b26",
      "--bg-surface-elevated": "#24283b",
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
      // General
      "--bg-app": "#010409",
      "--bg-sidebar": "#0d1117",
      "--bg-editor": "#0d1117",
      "--border-color": "#30363d",
      "--accent-color": "#58a6ff",
      "--accent-glow": "rgba(88, 166, 255, 0.3)",
      "--text-primary": "#c9d1d9",

      // IDE Layout
      "--ide-bg": "#010409",
      "--ide-nav-bg": "#0d1117",
      "--ide-sidebar-bg": "#010409",
      "--ide-editor-bg": "#0d1117",
      "--ide-terminal-bg": "#010409",
      "--ide-card-bg": "#0d1117",
      "--ide-border": "#30363d",
      "--ide-border-hover": "rgba(88, 166, 255, 0.45)",
      "--ide-text-primary": "#c9d1d9",
      "--ide-text-secondary": "#8b949e",
      "--ide-text-muted": "#6e7681",
      "--ide-accent-green": "#3fb950",
      "--ide-accent-lime": "#7ee787",
      "--ide-accent-orange": "#ffa657",
      "--ide-accent-coral": "#ff7b72",
      "--ide-active-pill-bg": "rgba(88, 166, 255, 0.15)",
      "--ide-active-pill-border": "rgba(88, 166, 255, 0.45)",
      "--ide-active-pill-text": "#58a6ff",
      "--ide-hover-bg": "rgba(255, 255, 255, 0.04)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.5)",
      "--ide-glow-primary": "rgba(88, 166, 255, 0.25)",

      // Explorer
      "--explorer-bg": "#010409",
      "--explorer-surface": "#0d1117",
      "--explorer-surface-hover": "#161b22",
      "--explorer-text": "#c9d1d9",
      "--explorer-text-muted": "#8b949e",
      "--explorer-border": "#30363d",
      "--explorer-border-active": "#58a6ff",
      "--explorer-accent": "#58a6ff",
      "--explorer-accent-secondary": "#3fb950",
      "--explorer-selection": "rgba(88, 166, 255, 0.15)",
      "--explorer-guide-line": "#21262d",

      // Terminal
      "--terminal-bg": "#010409",
      "--terminal-header-bg": "#0d1117",
      "--terminal-tabs-bg": "#010409",
      "--terminal-output-bg": "#010409",
      "--terminal-border": "#30363d",
      "--terminal-border-active": "#58a6ff",
      "--terminal-divider": "#21262d",
      "--terminal-text": "#c9d1d9",
      "--terminal-text-muted": "#8b949e",
      "--terminal-prompt-user": "#3fb950",
      "--terminal-prompt-path": "#58a6ff",
      "--terminal-cmd": "#c9d1d9",
      "--terminal-link": "#58a6ff",
      "--terminal-cursor": "#58a6ff",
      "--terminal-hover-bg": "rgba(255, 255, 255, 0.04)",
      "--terminal-active-tab-bg": "rgba(88, 166, 255, 0.15)",
      "--terminal-active-tab-border": "#58a6ff",
      "--terminal-active-tab-text": "#58a6ff",

      // Activity Bar
      "--activity-bg": "#010409",
      "--activity-border": "#30363d",
      "--activity-icon": "#8b949e",
      "--activity-icon-hover": "#c9d1d9",
      "--activity-active-bg": "#0d1117",
      "--activity-active-border": "#58a6ff",
      "--activity-active-icon": "#58a6ff",
      "--activity-active-glow": "0 0 12px rgba(88, 166, 255, 0.3)",

      // AI Chat
      "--ai-bg": "#010409",
      "--ai-surface": "#0d1117",
      "--ai-surface-secondary": "#161b22",
      "--ai-surface-hover": "#21262d",
      "--ai-text": "#c9d1d9",
      "--ai-text-secondary": "#8b949e",
      "--ai-text-muted": "#6e7681",
      "--ai-border": "#30363d",
      "--ai-border-strong": "rgba(88, 166, 255, 0.45)",
      "--ai-accent": "#58a6ff",
      "--ai-accent-secondary": "#3fb950",

      // Status Bar
      "--status-bar-bg": "#0d1117",

      // Dashboard & Website Pages
      "--bg-primary": "#010409",
      "--bg-secondary": "#0d1117",
      "--surface-primary": "#0d1117",
      "--surface-secondary": "#161b22",
      "--surface-hover": "#21262d",
      "--text-secondary": "#8b949e",
      "--text-muted": "#6e7681",
      "--border-primary": "#30363d",
      "--border-secondary": "rgba(88, 166, 255, 0.35)",
      "--accent-primary": "#58a6ff",
      "--accent-secondary": "#3fb950",
      "--accent-soft": "rgba(88, 166, 255, 0.15)",
      "--bg-base": "#010409",
      "--bg-surface": "#0d1117",
      "--bg-surface-elevated": "#161b22",
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
      // General
      "--bg-app": "#0a0114",
      "--bg-sidebar": "#0f021c",
      "--bg-editor": "#120422",
      "--border-color": "rgba(255, 230, 0, 0.28)",
      "--accent-color": "#ffe600",
      "--accent-glow": "rgba(255, 230, 0, 0.5)",
      "--text-primary": "#fefefe",

      // IDE Layout
      "--ide-bg": "#0a0114",
      "--ide-nav-bg": "#0f021c",
      "--ide-sidebar-bg": "#0f021c",
      "--ide-editor-bg": "#120422",
      "--ide-terminal-bg": "#08010f",
      "--ide-card-bg": "#120422",
      "--ide-border": "rgba(255, 230, 0, 0.28)",
      "--ide-border-hover": "rgba(255, 0, 85, 0.6)",
      "--ide-text-primary": "#fefefe",
      "--ide-text-secondary": "#d1c4e9",
      "--ide-text-muted": "#72298c",
      "--ide-accent-green": "#00ffcc",
      "--ide-accent-lime": "#ffe600",
      "--ide-accent-orange": "#ff7700",
      "--ide-accent-coral": "#ff0055",
      "--ide-active-pill-bg": "rgba(255, 230, 0, 0.18)",
      "--ide-active-pill-border": "rgba(255, 230, 0, 0.6)",
      "--ide-active-pill-text": "#ffe600",
      "--ide-hover-bg": "rgba(255, 230, 0, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.7)",
      "--ide-glow-primary": "rgba(255, 230, 0, 0.4)",

      // Explorer
      "--explorer-bg": "#0f021c",
      "--explorer-surface": "#120422",
      "--explorer-surface-hover": "#1d0838",
      "--explorer-text": "#fefefe",
      "--explorer-text-muted": "#72298c",
      "--explorer-border": "rgba(255, 230, 0, 0.25)",
      "--explorer-border-active": "#ffe600",
      "--explorer-accent": "#ffe600",
      "--explorer-accent-secondary": "#ff0055",
      "--explorer-selection": "rgba(255, 230, 0, 0.18)",
      "--explorer-guide-line": "rgba(255, 230, 0, 0.18)",

      // Terminal
      "--terminal-bg": "#08010f",
      "--terminal-header-bg": "#0f021c",
      "--terminal-tabs-bg": "#08010f",
      "--terminal-output-bg": "#08010f",
      "--terminal-border": "rgba(255, 230, 0, 0.25)",
      "--terminal-border-active": "#ffe600",
      "--terminal-divider": "rgba(255, 230, 0, 0.18)",
      "--terminal-text": "#fefefe",
      "--terminal-text-muted": "#72298c",
      "--terminal-prompt-user": "#00ffcc",
      "--terminal-prompt-path": "#ffe600",
      "--terminal-cmd": "#fefefe",
      "--terminal-link": "#00ffcc",
      "--terminal-cursor": "#ffe600",
      "--terminal-hover-bg": "rgba(255, 230, 0, 0.08)",
      "--terminal-active-tab-bg": "rgba(255, 230, 0, 0.18)",
      "--terminal-active-tab-border": "#ffe600",
      "--terminal-active-tab-text": "#ffe600",

      // Activity Bar
      "--activity-bg": "#08010f",
      "--activity-border": "rgba(255, 230, 0, 0.25)",
      "--activity-icon": "#72298c",
      "--activity-icon-hover": "#fefefe",
      "--activity-active-bg": "#120422",
      "--activity-active-border": "#ffe600",
      "--activity-active-icon": "#ffe600",
      "--activity-active-glow": "0 0 16px rgba(255, 230, 0, 0.5)",

      // AI Chat
      "--ai-bg": "#0a0114",
      "--ai-surface": "#0f021c",
      "--ai-surface-secondary": "#120422",
      "--ai-surface-hover": "#1d0838",
      "--ai-text": "#fefefe",
      "--ai-text-secondary": "#d1c4e9",
      "--ai-text-muted": "#72298c",
      "--ai-border": "rgba(255, 230, 0, 0.25)",
      "--ai-border-strong": "rgba(255, 0, 85, 0.55)",
      "--ai-accent": "#ffe600",
      "--ai-accent-secondary": "#ff0055",

      // Status Bar
      "--status-bar-bg": "#0f021c",

      // Dashboard & Website Pages
      "--bg-primary": "#0a0114",
      "--bg-secondary": "#0f021c",
      "--surface-primary": "#120422",
      "--surface-secondary": "#0f021c",
      "--surface-hover": "#1d0838",
      "--text-secondary": "#d1c4e9",
      "--text-muted": "#72298c",
      "--border-primary": "rgba(255, 230, 0, 0.25)",
      "--border-secondary": "rgba(255, 0, 85, 0.45)",
      "--accent-primary": "#ffe600",
      "--accent-secondary": "#ff0055",
      "--accent-soft": "rgba(255, 230, 0, 0.18)",
      "--bg-base": "#0a0114",
      "--bg-surface": "#0f021c",
      "--bg-surface-elevated": "#120422",
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
      // General
      "--bg-app": "#242933",
      "--bg-sidebar": "#292e39",
      "--bg-editor": "#2e3440",
      "--border-color": "rgba(136, 192, 208, 0.2)",
      "--accent-color": "#88c0d0",
      "--accent-glow": "rgba(136, 192, 208, 0.35)",
      "--text-primary": "#eceff4",

      // IDE Layout
      "--ide-bg": "#242933",
      "--ide-nav-bg": "#292e39",
      "--ide-sidebar-bg": "#292e39",
      "--ide-editor-bg": "#2e3440",
      "--ide-terminal-bg": "#1e222a",
      "--ide-card-bg": "#2e3440",
      "--ide-border": "rgba(136, 192, 208, 0.2)",
      "--ide-border-hover": "rgba(136, 192, 208, 0.5)",
      "--ide-text-primary": "#eceff4",
      "--ide-text-secondary": "#d8dee9",
      "--ide-text-muted": "#4c566a",
      "--ide-accent-green": "#a3be8c",
      "--ide-accent-lime": "#ebcb8b",
      "--ide-accent-orange": "#d08770",
      "--ide-accent-coral": "#bf616a",
      "--ide-active-pill-bg": "rgba(136, 192, 208, 0.16)",
      "--ide-active-pill-border": "rgba(136, 192, 208, 0.5)",
      "--ide-active-pill-text": "#88c0d0",
      "--ide-hover-bg": "rgba(136, 192, 208, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.4)",
      "--ide-glow-primary": "rgba(136, 192, 208, 0.3)",

      // Explorer
      "--explorer-bg": "#292e39",
      "--explorer-surface": "#2e3440",
      "--explorer-surface-hover": "#3b4252",
      "--explorer-text": "#eceff4",
      "--explorer-text-muted": "#4c566a",
      "--explorer-border": "rgba(136, 192, 208, 0.18)",
      "--explorer-border-active": "#88c0d0",
      "--explorer-accent": "#88c0d0",
      "--explorer-accent-secondary": "#81a1c1",
      "--explorer-selection": "rgba(136, 192, 208, 0.15)",
      "--explorer-guide-line": "rgba(136, 192, 208, 0.15)",

      // Terminal
      "--terminal-bg": "#1e222a",
      "--terminal-header-bg": "#292e39",
      "--terminal-tabs-bg": "#1e222a",
      "--terminal-output-bg": "#1e222a",
      "--terminal-border": "rgba(136, 192, 208, 0.18)",
      "--terminal-border-active": "#88c0d0",
      "--terminal-divider": "rgba(136, 192, 208, 0.15)",
      "--terminal-text": "#eceff4",
      "--terminal-text-muted": "#4c566a",
      "--terminal-prompt-user": "#a3be8c",
      "--terminal-prompt-path": "#88c0d0",
      "--terminal-cmd": "#eceff4",
      "--terminal-link": "#88c0d0",
      "--terminal-cursor": "#eceff4",
      "--terminal-hover-bg": "rgba(136, 192, 208, 0.08)",
      "--terminal-active-tab-bg": "rgba(136, 192, 208, 0.16)",
      "--terminal-active-tab-border": "#88c0d0",
      "--terminal-active-tab-text": "#88c0d0",

      // Activity Bar
      "--activity-bg": "#1e222a",
      "--activity-border": "rgba(136, 192, 208, 0.18)",
      "--activity-icon": "#4c566a",
      "--activity-icon-hover": "#eceff4",
      "--activity-active-bg": "#2e3440",
      "--activity-active-border": "#88c0d0",
      "--activity-active-icon": "#88c0d0",
      "--activity-active-glow": "0 0 14px rgba(136, 192, 208, 0.35)",

      // AI Chat
      "--ai-bg": "#242933",
      "--ai-surface": "#292e39",
      "--ai-surface-secondary": "#2e3440",
      "--ai-surface-hover": "#3b4252",
      "--ai-text": "#eceff4",
      "--ai-text-secondary": "#d8dee9",
      "--ai-text-muted": "#4c566a",
      "--ai-border": "rgba(136, 192, 208, 0.18)",
      "--ai-border-strong": "rgba(136, 192, 208, 0.45)",
      "--ai-accent": "#88c0d0",
      "--ai-accent-secondary": "#81a1c1",

      // Status Bar
      "--status-bar-bg": "#1e222a",

      // Dashboard & Website Pages
      "--bg-primary": "#242933",
      "--bg-secondary": "#1e222a",
      "--surface-primary": "#2e3440",
      "--surface-secondary": "#292e39",
      "--surface-hover": "#3b4252",
      "--text-secondary": "#d8dee9",
      "--text-muted": "#4c566a",
      "--border-primary": "rgba(136, 192, 208, 0.18)",
      "--border-secondary": "rgba(136, 192, 208, 0.4)",
      "--accent-primary": "#88c0d0",
      "--accent-secondary": "#81a1c1",
      "--accent-soft": "rgba(136, 192, 208, 0.16)",
      "--bg-base": "#242933",
      "--bg-surface": "#2e3440",
      "--bg-surface-elevated": "#3b4252",
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
      // General
      "--bg-app": "#221f22",
      "--bg-sidebar": "#221f22",
      "--bg-editor": "#2d2a2e",
      "--border-color": "rgba(255, 216, 102, 0.2)",
      "--accent-color": "#ffd866",
      "--accent-glow": "rgba(255, 216, 102, 0.4)",
      "--text-primary": "#fcfcfa",

      // IDE Layout
      "--ide-bg": "#221f22",
      "--ide-nav-bg": "#221f22",
      "--ide-sidebar-bg": "#221f22",
      "--ide-editor-bg": "#2d2a2e",
      "--ide-terminal-bg": "#19181a",
      "--ide-card-bg": "#2d2a2e",
      "--ide-border": "rgba(255, 216, 102, 0.2)",
      "--ide-border-hover": "rgba(255, 216, 102, 0.5)",
      "--ide-text-primary": "#fcfcfa",
      "--ide-text-secondary": "#c1c0c0",
      "--ide-text-muted": "#727072",
      "--ide-accent-green": "#a9dc76",
      "--ide-accent-lime": "#ffd866",
      "--ide-accent-orange": "#fc9867",
      "--ide-accent-coral": "#ff6188",
      "--ide-active-pill-bg": "rgba(255, 216, 102, 0.16)",
      "--ide-active-pill-border": "rgba(255, 216, 102, 0.55)",
      "--ide-active-pill-text": "#ffd866",
      "--ide-hover-bg": "rgba(255, 216, 102, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.5)",
      "--ide-glow-primary": "rgba(255, 216, 102, 0.35)",

      // Explorer
      "--explorer-bg": "#221f22",
      "--explorer-surface": "#2d2a2e",
      "--explorer-surface-hover": "#3a373b",
      "--explorer-text": "#fcfcfa",
      "--explorer-text-muted": "#727072",
      "--explorer-border": "rgba(255, 216, 102, 0.18)",
      "--explorer-border-active": "#ffd866",
      "--explorer-accent": "#ffd866",
      "--explorer-accent-secondary": "#ff6188",
      "--explorer-selection": "rgba(255, 216, 102, 0.16)",
      "--explorer-guide-line": "rgba(255, 216, 102, 0.16)",

      // Terminal
      "--terminal-bg": "#19181a",
      "--terminal-header-bg": "#221f22",
      "--terminal-tabs-bg": "#19181a",
      "--terminal-output-bg": "#19181a",
      "--terminal-border": "rgba(255, 216, 102, 0.18)",
      "--terminal-border-active": "#ffd866",
      "--terminal-divider": "rgba(255, 216, 102, 0.16)",
      "--terminal-text": "#fcfcfa",
      "--terminal-text-muted": "#727072",
      "--terminal-prompt-user": "#a9dc76",
      "--terminal-prompt-path": "#78dce8",
      "--terminal-cmd": "#fcfcfa",
      "--terminal-link": "#78dce8",
      "--terminal-cursor": "#ffd866",
      "--terminal-hover-bg": "rgba(255, 216, 102, 0.08)",
      "--terminal-active-tab-bg": "rgba(255, 216, 102, 0.16)",
      "--terminal-active-tab-border": "#ffd866",
      "--terminal-active-tab-text": "#ffd866",

      // Activity Bar
      "--activity-bg": "#19181a",
      "--activity-border": "rgba(255, 216, 102, 0.18)",
      "--activity-icon": "#727072",
      "--activity-icon-hover": "#fcfcfa",
      "--activity-active-bg": "#2d2a2e",
      "--activity-active-border": "#ffd866",
      "--activity-active-icon": "#ffd866",
      "--activity-active-glow": "0 0 14px rgba(255, 216, 102, 0.4)",

      // AI Chat
      "--ai-bg": "#221f22",
      "--ai-surface": "#2d2a2e",
      "--ai-surface-secondary": "#19181a",
      "--ai-surface-hover": "#3a373b",
      "--ai-text": "#fcfcfa",
      "--ai-text-secondary": "#c1c0c0",
      "--ai-text-muted": "#727072",
      "--ai-border": "rgba(255, 216, 102, 0.18)",
      "--ai-border-strong": "rgba(255, 97, 136, 0.45)",
      "--ai-accent": "#ffd866",
      "--ai-accent-secondary": "#ff6188",

      // Status Bar
      "--status-bar-bg": "#19181a",

      // Dashboard & Website Pages
      "--bg-primary": "#221f22",
      "--bg-secondary": "#19181a",
      "--surface-primary": "#2d2a2e",
      "--surface-secondary": "#221f22",
      "--surface-hover": "#3a373b",
      "--text-secondary": "#c1c0c0",
      "--text-muted": "#727072",
      "--border-primary": "rgba(255, 216, 102, 0.18)",
      "--border-secondary": "rgba(255, 97, 136, 0.4)",
      "--accent-primary": "#ffd866",
      "--accent-secondary": "#ff6188",
      "--accent-soft": "rgba(255, 216, 102, 0.16)",
      "--bg-base": "#221f22",
      "--bg-surface": "#2d2a2e",
      "--bg-surface-elevated": "#3a373b",
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
      // General
      "--bg-app": "#1c1926",
      "--bg-sidebar": "#1c1926",
      "--bg-editor": "#262335",
      "--border-color": "rgba(255, 126, 219, 0.25)",
      "--accent-color": "#ff7edb",
      "--accent-glow": "rgba(255, 126, 219, 0.45)",
      "--text-primary": "#f92aad",

      // IDE Layout
      "--ide-bg": "#1c1926",
      "--ide-nav-bg": "#1c1926",
      "--ide-sidebar-bg": "#1c1926",
      "--ide-editor-bg": "#262335",
      "--ide-terminal-bg": "#15131e",
      "--ide-card-bg": "#262335",
      "--ide-border": "rgba(255, 126, 219, 0.25)",
      "--ide-border-hover": "rgba(54, 249, 246, 0.5)",
      "--ide-text-primary": "#ffffff",
      "--ide-text-secondary": "#d8bee5",
      "--ide-text-muted": "#848bbd",
      "--ide-accent-green": "#72f1b8",
      "--ide-accent-lime": "#fede5d",
      "--ide-accent-orange": "#fe4450",
      "--ide-accent-coral": "#ff7edb",
      "--ide-active-pill-bg": "rgba(255, 126, 219, 0.18)",
      "--ide-active-pill-border": "rgba(255, 126, 219, 0.6)",
      "--ide-active-pill-text": "#ff7edb",
      "--ide-hover-bg": "rgba(255, 126, 219, 0.08)",
      "--ide-card-shadow": "0 10px 30px rgba(0, 0, 0, 0.6)",
      "--ide-glow-primary": "rgba(255, 126, 219, 0.4)",

      // Explorer
      "--explorer-bg": "#1c1926",
      "--explorer-surface": "#262335",
      "--explorer-surface-hover": "#342e48",
      "--explorer-text": "#ffffff",
      "--explorer-text-muted": "#848bbd",
      "--explorer-border": "rgba(255, 126, 219, 0.22)",
      "--explorer-border-active": "#ff7edb",
      "--explorer-accent": "#ff7edb",
      "--explorer-accent-secondary": "#36f9f6",
      "--explorer-selection": "rgba(255, 126, 219, 0.18)",
      "--explorer-guide-line": "rgba(255, 126, 219, 0.18)",

      // Terminal
      "--terminal-bg": "#15131e",
      "--terminal-header-bg": "#1c1926",
      "--terminal-tabs-bg": "#15131e",
      "--terminal-output-bg": "#15131e",
      "--terminal-border": "rgba(255, 126, 219, 0.22)",
      "--terminal-border-active": "#ff7edb",
      "--terminal-divider": "rgba(255, 126, 219, 0.18)",
      "--terminal-text": "#ffffff",
      "--terminal-text-muted": "#848bbd",
      "--terminal-prompt-user": "#72f1b8",
      "--terminal-prompt-path": "#36f9f6",
      "--terminal-cmd": "#ffffff",
      "--terminal-link": "#36f9f6",
      "--terminal-cursor": "#36f9f6",
      "--terminal-hover-bg": "rgba(255, 126, 219, 0.08)",
      "--terminal-active-tab-bg": "rgba(255, 126, 219, 0.18)",
      "--terminal-active-tab-border": "#ff7edb",
      "--terminal-active-tab-text": "#ff7edb",

      // Activity Bar
      "--activity-bg": "#15131e",
      "--activity-border": "rgba(255, 126, 219, 0.22)",
      "--activity-icon": "#848bbd",
      "--activity-icon-hover": "#ffffff",
      "--activity-active-bg": "#262335",
      "--activity-active-border": "#ff7edb",
      "--activity-active-icon": "#ff7edb",
      "--activity-active-glow": "0 0 16px rgba(255, 126, 219, 0.5)",

      // AI Chat
      "--ai-bg": "#1c1926",
      "--ai-surface": "#262335",
      "--ai-surface-secondary": "#15131e",
      "--ai-surface-hover": "#342e48",
      "--ai-text": "#ffffff",
      "--ai-text-secondary": "#d8bee5",
      "--ai-text-muted": "#848bbd",
      "--ai-border": "rgba(255, 126, 219, 0.22)",
      "--ai-border-strong": "rgba(54, 249, 246, 0.5)",
      "--ai-accent": "#ff7edb",
      "--ai-accent-secondary": "#36f9f6",

      // Status Bar
      "--status-bar-bg": "#15131e",

      // Dashboard & Website Pages
      "--bg-primary": "#1c1926",
      "--bg-secondary": "#15131e",
      "--surface-primary": "#262335",
      "--surface-secondary": "#1c1926",
      "--surface-hover": "#342e48",
      "--text-secondary": "#d8bee5",
      "--text-muted": "#848bbd",
      "--border-primary": "rgba(255, 126, 219, 0.25)",
      "--border-secondary": "rgba(54, 249, 246, 0.45)",
      "--accent-primary": "#ff7edb",
      "--accent-secondary": "#36f9f6",
      "--accent-soft": "rgba(255, 126, 219, 0.18)",
      "--bg-base": "#1c1926",
      "--bg-surface": "#262335",
      "--bg-surface-elevated": "#342e48",
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

const DYNAMIC_STYLE_ID = "vocode-theme-extension-dynamic-css";

/**
 * Apply theme extension to both Monaco Editor and DOM CSS variables across the whole website
 */
export function applyThemeExtension(themeId, monacoInstance) {
  let styleEl = typeof document !== "undefined" ? document.getElementById(DYNAMIC_STYLE_ID) : null;
  const def = THEME_DEFINITIONS[themeId];

  if (!def) {
    // Reset to default
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-theme-extension");
      if (styleEl) {
        styleEl.remove();
      }
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("vocode_active_theme_extension");
    }

    const activeMonaco = monacoInstance || (typeof window !== "undefined" ? window.monaco : null);
    if (activeMonaco?.editor && typeof document !== "undefined") {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      activeMonaco.editor.setTheme(isLight ? "light" : "vs-dark");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vocode-theme-extension-changed", {
          detail: { themeId: null },
        })
      );
    }
    return null;
  }

  // Set DOM attribute and persist in storage
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme-extension", themeId);
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("vocode_active_theme_extension", themeId);
  }

  // Set CSS custom properties directly on root (only in dark mode so light mode is never overridden)
  if (typeof document !== "undefined" && def.cssVariables) {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    if (!isLight) {
      Object.entries(def.cssVariables).forEach(([key, val]) => {
        document.documentElement.style.setProperty(key, val);
      });
    } else {
      Object.keys(def.cssVariables).forEach((key) => {
        document.documentElement.style.removeProperty(key);
      });
    }
  }

  // Inject or update stylesheet for high-specificity cascade across entire website
  if (typeof document !== "undefined") {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = DYNAMIC_STYLE_ID;
      document.head.appendChild(styleEl);
    }

    const varDeclarations = Object.entries(def.cssVariables || {})
      .map(([k, v]) => `  ${k}: ${v} !important;`)
      .join("\n");

    styleEl.textContent = `
/* ========================================================
   VOCODEAI THEME EXTENSION: ${def.name} (${themeId})
   Cascades across the ENTIRE website and IDE
   ======================================================== */
html[data-theme-extension="${themeId}"]:not([data-theme="light"]),
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) body,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-app,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-app.dark,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-layout,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-layout.dark,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .vocode-app,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-activity-bar,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-nav,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-sidebar-left,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-sidebar-right,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-terminal-dock,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-welcome-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .explorer-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ext-panel-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ai-assistant-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-header,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-sidebar {
${varDeclarations}
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) body {
  background-color: var(--ide-bg, var(--bg-primary)) !important;
  color: var(--text-primary, #f8f8f2) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-app {
  background-color: var(--ide-bg) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-nav {
  background-color: var(--ide-nav-bg) !important;
  border-bottom: 1px solid var(--ide-border) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-activity-bar {
  background-color: var(--activity-bg) !important;
  border-right: 1px solid var(--activity-border) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-sidebar-left,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .explorer-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ext-panel-container {
  background-color: var(--ide-sidebar-bg) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ext-panel-header {
  background-color: var(--ide-nav-bg, var(--ide-sidebar-bg)) !important;
  border-bottom: 1px solid var(--ide-border) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-terminal-dock {
  background-color: var(--terminal-bg) !important;
  border-top: 1px solid var(--terminal-border) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-welcome-container {
  background-color: var(--ide-bg) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-welcome-action-card {
  background-color: var(--ide-card-bg, var(--explorer-surface)) !important;
  border-color: var(--ide-border) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .welcome-dashboard-container {
  --welcome-bg: var(--ide-bg, var(--bg-primary)) !important;
  --welcome-title-color: var(--text-primary, #ffffff) !important;
  --welcome-subtitle-color: var(--text-muted, #828997) !important;
  --welcome-primary-bg: var(--accent-primary, #61afef) !important;
  --welcome-primary-border: var(--border-secondary, var(--accent-primary)) !important;
  --welcome-primary-text: #ffffff !important;
  --welcome-primary-hover: var(--accent-secondary, var(--accent-primary)) !important;
  --welcome-sec-bg: var(--ide-card-bg, var(--surface-primary, #282c34)) !important;
  --welcome-sec-border: var(--ide-border, var(--border-primary, rgba(255, 255, 255, 0.1))) !important;
  --welcome-sec-text: var(--text-primary, #abb2bf) !important;
  --welcome-sec-hover: var(--surface-hover, var(--ide-hover-bg, rgba(255, 255, 255, 0.08))) !important;
  --welcome-sec-hover-border: var(--accent-primary, #61afef) !important;
  --welcome-sec-shortcut: var(--text-muted, #5c6370) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .welcome-btn-primary {
  background: var(--welcome-primary-bg, var(--accent-primary, #61afef)) !important;
  border: 1px solid var(--welcome-primary-border, var(--border-secondary, var(--accent-primary))) !important;
  color: var(--welcome-primary-text, #ffffff) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .welcome-btn-secondary {
  background: var(--welcome-sec-bg, var(--ide-card-bg, #282c34)) !important;
  border: 1px solid var(--welcome-sec-border, rgba(255, 255, 255, 0.1)) !important;
  color: var(--welcome-sec-text, #abb2bf) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .welcome-btn-secondary:hover {
  background: var(--welcome-sec-hover, rgba(255, 255, 255, 0.08)) !important;
  border-color: var(--welcome-sec-hover-border, var(--accent-primary, #61afef)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.selected {
  background-color: var(--explorer-selection, rgba(255, 255, 255, 0.12)) !important;
  border: 1px solid var(--explorer-border-active, var(--accent-primary, #61afef)) !important;
  box-shadow: 0 0 10px var(--accent-soft, rgba(97, 175, 239, 0.2)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.selected .folder-name-label,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.selected .file-name-label,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.selected .root-label {
  color: var(--explorer-text, #ffffff) !important;
  font-weight: 600 !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.root-row {
  border-color: transparent !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-row.root-row.selected {
  background-color: var(--explorer-selection, rgba(255, 255, 255, 0.12)) !important;
  border: 1px solid var(--explorer-border-active, var(--accent-primary, #61afef)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sidebar-explorer-header {
  background-color: var(--ide-sidebar-bg, var(--explorer-bg)) !important;
  border-bottom: 1px solid var(--explorer-border, var(--ide-border)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sidebar-tree-container {
  background-color: var(--ide-sidebar-bg, var(--explorer-bg)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-status-bar {
  background-color: var(--status-bar-bg, #191a21) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-layout {
  background-color: var(--bg-primary) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-sidebar {
  background-color: var(--surface-primary) !important;
  border-right: 1px solid var(--border-primary) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dashboard-header {
  background-color: var(--surface-primary) !important;
  border-bottom: 1px solid var(--border-primary) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .workspace-card {
  background-color: var(--surface-primary) !important;
  border: 1px solid var(--border-primary) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .settings-main-container {
  background-color: var(--bg-primary) !important;
}

/* All Modals, Popups, and Dialogs across the entire website */
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-card,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-card,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .import-ws-modal,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .create-ws-modal,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .cmd-palette-container,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-quickopen-card,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .global-search-modal,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-settings-modal {
  background: var(--surface-primary, var(--ide-card-bg, #282a36)) !important;
  border: 1px solid var(--border-primary, var(--ide-border, rgba(189, 147, 249, 0.4))) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 32px var(--accent-soft, rgba(189, 147, 249, 0.15)) !important;
  color: var(--text-primary, #ffffff) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-header,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-header {
  border-bottom: 1px solid var(--border-primary, var(--ide-border, rgba(255, 255, 255, 0.1))) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-footer,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-footer {
  border-top: 1px solid var(--border-primary, var(--ide-border, rgba(255, 255, 255, 0.1))) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-input,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .cmd-palette-input,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-quickopen-input,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .import-path-input,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ws-name-input {
  background: var(--surface-secondary, var(--ide-bg, #1e1f29)) !important;
  border: 1px solid var(--border-primary, var(--ide-border, rgba(255, 255, 255, 0.15))) !important;
  color: var(--text-primary, #ffffff) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-input:focus,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .cmd-palette-input:focus,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ide-quickopen-input:focus {
  border-color: var(--accent-primary, #bd93f9) !important;
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(189, 147, 249, 0.2)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-btn-primary,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-btn-primary,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .btn-create-workspace-primary,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-btn-github-oauth,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-publish-btn {
  background: var(--accent-primary, #bd93f9) !important;
  border-color: var(--accent-primary, #bd93f9) !important;
  color: #ffffff !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-btn-cancel,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-btn-cancel {
  background: var(--surface-secondary, var(--ide-hover-bg, rgba(255, 255, 255, 0.05))) !important;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1)) !important;
  color: var(--text-secondary, #abb2bf) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-modal-icon-wrap,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .dash-modal-icon {
  background: var(--accent-soft, rgba(189, 147, 249, 0.15)) !important;
  border: 1px solid var(--border-secondary, var(--accent-primary)) !important;
  color: var(--accent-primary, #bd93f9) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-clone-tab.active {
  color: var(--accent-primary, #bd93f9) !important;
  border-bottom: 2px solid var(--accent-primary, #bd93f9) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-template-card.active,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-template-card:hover {
  border-color: var(--accent-primary, #bd93f9) !important;
  background: var(--accent-soft, rgba(189, 147, 249, 0.12)) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-clone-type-badge {
  background: var(--accent-soft, rgba(189, 147, 249, 0.15)) !important;
  border-color: var(--border-secondary, rgba(189, 147, 249, 0.3)) !important;
  color: var(--text-primary, #ffffff) !important;
}

/* Dropdown Context Menus */
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .tree-context-menu,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-menu-dropdown,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .explorer-dropdown-menu,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .nav-dropdown-menu {
  background-color: var(--surface-primary, var(--ide-card-bg, #282a36)) !important;
  border: 1px solid var(--border-primary, var(--ide-border, rgba(255, 255, 255, 0.15))) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
  color: var(--text-primary, #abb2bf) !important;
}

html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .context-menu-item:hover,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .sc-menu-item:hover,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .ws-dropdown-item:hover,
html[data-theme-extension="${themeId}"]:not([data-theme="light"]) .nav-dropdown-item:hover {
  background-color: var(--accent-soft, rgba(189, 147, 249, 0.15)) !important;
  color: var(--text-primary, #ffffff) !important;
}
`;
  }

  // Register and set in Monaco
  const activeMonaco = monacoInstance || (typeof window !== "undefined" ? window.monaco : null);
  if (activeMonaco?.editor) {
    try {
      activeMonaco.editor.defineTheme(def.id, def.monaco);
      activeMonaco.editor.setTheme(def.id);
    } catch {}
  }

  // Dispatch global event for open editors and panels
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vocode-theme-extension-changed", {
        detail: { themeId, themeDef: def },
      })
    );
  }

  return def;
}

/**
 * Get currently active theme extension
 */
export function getActiveThemeExtension() {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem("vocode_active_theme_extension");
  if (stored && THEME_DEFINITIONS[stored]) {
    return stored;
  }
  return null;
}

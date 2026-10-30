/**
 * Default VS Code-style Settings Schema & Defaults for VocodeAI
 */

export const DEFAULT_SETTINGS = {
  // 1. Text Editor Settings (Monaco Editor)
  editor: {
    fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
    fontSize: 14,
    lineHeight: 22,
    fontLigatures: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "on",
    minimap: {
      enabled: true,
      scale: 1,
    },
    lineNumbers: "on",
    cursorStyle: "line",
    cursorBlinking: "smooth",
    autoClosingBrackets: true,
    autoClosingQuotes: true,
    formatOnSave: true,
    bracketPairColorization: true,
    renderWhitespace: "selection",
    smoothScrolling: true,
    scrollBeyondLastLine: false,
  },

  // 2. Preview & Multi-File Editing Settings
  preview: {
    enabled: true,
    mode: "normal", // 'normal' (multi-file tabs) | 'preview' (live rendered preview focus)
    splitViewMode: "horizontal", // 'horizontal' | 'vertical'
    maxOpenFiles: 12,
    autoRefresh: "debounce", // 'onSave' | 'debounce' | 'manual'
    debounceDelay: 300,
    fileTypes: ["html", "htm", "md", "markdown", "svg"],
    openInNewTab: false,
    allowScripts: true,
    defaultZoom: 100,
    showLineNumbersInMarkdown: false,
  },

  // 3. Vocode AI & Voice Assistant Settings
  "vocode.ai": {
    defaultModel: "gemini-1.5-flash",
    temperature: 0.4,
    maxTokens: 2048,
    topP: 0.9,
    safeMode: "prompt", // 'prompt' (confirm changes) | 'autoApply'
    geminiApiKey: "",
    openaiApiKey: "",
    groqApiKey: "",
    anthropicApiKey: "",
    voiceRecognitionEngine: "browser", // 'browser' | 'whisper'
    voiceInputHotkey: "Space (Hold)",
    textToSpeech: false,
    ttsVoice: "en-US-Standard-C",
    ttsRate: 1.0,
    ttsPitch: 1.0,
    streaming: true,
    contextWindowKB: 8,
  },

  // 4. Integrated Cloud Terminal Settings (xterm.js + Docker backend)
  "terminal.integrated": {
    shell: "/bin/bash",
    fontFamily: "'Fira Code', Consolas, 'Courier New', monospace",
    fontSize: 13,
    cursorStyle: "block", // 'block' | 'underline' | 'bar'
    cursorBlink: true,
    scrollback: 5000,
    copyOnSelection: true,
    rightClickPaste: true,
    bellStyle: "visual", // 'visual' | 'sound' | 'none'
  },

  // 5. Runner & Sandbox Settings
  runner: {
    autoDetectProject: true,
    customCommand: "",
    executionTimeoutSec: 60,
    cpuLimit: 1,
    memoryLimitMiB: 2048,
    maxConcurrentRuns: 3,
    allowNetworkAccess: false,
    livePreviewPort: 5173,
    livePreviewAutoReload: "debounce",
  },

  // 6. Files & Workspace Storage Settings
  files: {
    exclude: [
      "**/node_modules",
      "**/.git",
      "**/dist",
      "**/.DS_Store",
      "**/build",
      "**/.next",
    ],
    maxUploadSizeMB: 25,
    autoSave: "afterDelay", // 'off' | 'afterDelay' | 'onFocusChange'
    autoSaveDelayMs: 1000,
    defaultEncoding: "utf8",
    recycledBinRetentionDays: 30,
    confirmDelete: true,
    showHiddenFiles: false,
  },

  // 7. Keyboard Shortcuts / Profiles
  keybindings: {
    profile: "vscode", // 'vscode' | 'vim' | 'sublime' | 'emacs'
  },

  // 8. Workbench & Appearance Settings
  workbench: {
    colorTheme: "dark", // 'dark' | 'light'
    iconTheme: "Seti", // 'Seti' | 'Material' | 'Minimal'
    activityBarVisible: true,
    statusBarVisible: true,
    tabSizing: "fit", // 'fit' | 'shrink' | 'compact'
    layoutDensity: "default", // 'compact' | 'default' | 'comfortable'
    zoomLevel: 100,
  },

  // 9. Account & Security Settings
  account: {
    displayName: "",
    syncSettings: true,
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 120,
  },

  // 10. Telemetry & Diagnostics
  telemetry: {
    enabled: false,
    logErrors: true,
  },
};

/**
 * Metadata definition for each setting category, used by the VS Code settings GUI
 */
export const SETTINGS_METADATA = [
  {
    id: "editor",
    label: "Text Editor",
    icon: "Code2",
    description: "Fonts, indentation, word wrap, and Monaco editor behavior",
    items: [
      {
        key: "editor.fontFamily",
        label: "Font Family",
        description: "Controls the font family used in the code editor.",
        type: "string",
      },
      {
        key: "editor.fontSize",
        label: "Font Size",
        description: "Controls the font size in pixels.",
        type: "number",
        min: 10,
        max: 32,
        step: 1,
      },
      {
        key: "editor.lineHeight",
        label: "Line Height",
        description: "Controls the line height in pixels (0 for default calculation).",
        type: "number",
        min: 16,
        max: 48,
        step: 1,
      },
      {
        key: "editor.fontLigatures",
        label: "Font Ligatures",
        description: "Enables or disables font ligatures ('=>', '===', '!=') for supported fonts.",
        type: "boolean",
      },
      {
        key: "editor.tabSize",
        label: "Tab Size",
        description: "The number of spaces a tab is equal to.",
        type: "select",
        options: [
          { value: 2, label: "2 Spaces" },
          { value: 4, label: "4 Spaces" },
          { value: 8, label: "8 Spaces" },
        ],
      },
      {
        key: "editor.wordWrap",
        label: "Word Wrap",
        description: "Controls how lines should wrap in the code editor.",
        type: "select",
        options: [
          { value: "off", label: "off (lines will not wrap)" },
          { value: "on", label: "on (wrap at viewport width)" },
          { value: "wordWrapColumn", label: "wordWrapColumn" },
          { value: "bounded", label: "bounded" },
        ],
      },
      {
        key: "editor.minimap.enabled",
        label: "Minimap",
        description: "Controls whether the minimap code overview is shown on the right.",
        type: "boolean",
      },
      {
        key: "editor.lineNumbers",
        label: "Line Numbers",
        description: "Controls the display of line numbers.",
        type: "select",
        options: [
          { value: "on", label: "on (render line numbers)" },
          { value: "off", label: "off (do not render)" },
          { value: "relative", label: "relative (relative to cursor)" },
        ],
      },
      {
        key: "editor.cursorStyle",
        label: "Cursor Style",
        description: "Controls the cursor style.",
        type: "select",
        options: [
          { value: "line", label: "line (standard vertical line)" },
          { value: "block", label: "block (terminal style block)" },
          { value: "underline", label: "underline" },
        ],
      },
      {
        key: "editor.cursorBlinking",
        label: "Cursor Blinking",
        description: "Controls the cursor animation style.",
        type: "select",
        options: [
          { value: "smooth", label: "smooth (fade in and out smoothly)" },
          { value: "blink", label: "blink" },
          { value: "phase", label: "phase" },
          { value: "solid", label: "solid (always visible)" },
        ],
      },
      {
        key: "editor.formatOnSave",
        label: "Format On Save",
        description: "Format a file on save automatically when possible.",
        type: "boolean",
      },
      {
        key: "editor.bracketPairColorization",
        label: "Bracket Pair Colorization",
        description: "Controls whether bracket pair colorization is enabled.",
        type: "boolean",
      },
      {
        key: "editor.autoClosingBrackets",
        label: "Auto Closing Brackets",
        description: "Controls whether the editor automatically closes brackets after typing an opening bracket.",
        type: "boolean",
      },
      {
        key: "editor.autoClosingQuotes",
        label: "Auto Closing Quotes",
        description: "Controls whether the editor automatically closes quotes after typing an opening quote.",
        type: "boolean",
      },
      {
        key: "editor.smoothScrolling",
        label: "Smooth Scrolling",
        description: "Controls whether the editor scrolls using an animation.",
        type: "boolean",
      },
    ],
  },

  {
    id: "preview",
    label: "Preview & Multi-File",
    icon: "Eye",
    description: "Multi-file editor layout, split view, live web preview, and markdown rendering",
    items: [
      {
        key: "preview.mode",
        label: "Editor View Mode",
        description: "Switch between Normal mode (multiple open file tabs) and Preview mode (live rendered view focused).",
        type: "select",
        options: [
          { value: "normal", label: "Normal (Standard multi-file editing tabs)" },
          { value: "preview", label: "Preview Mode (Rendered live web/doc preview focused)" },
        ],
      },
      {
        key: "preview.splitViewMode",
        label: "Split View Orientation",
        description: "Controls whether split editor panes are arranged side-by-side (horizontal) or top-to-bottom (vertical).",
        type: "select",
        options: [
          { value: "horizontal", label: "Horizontal (Side-by-side columns)" },
          { value: "vertical", label: "Vertical (Stacked rows)" },
        ],
      },
      {
        key: "preview.maxOpenFiles",
        label: "Maximum Open Tabs",
        description: "Cap the maximum number of tabs open simultaneously to prevent UI clutter.",
        type: "number",
        min: 3,
        max: 30,
        step: 1,
      },
      {
        key: "preview.autoRefresh",
        label: "Preview Auto-Refresh Strategy",
        description: "How and when the live preview pane reloads its rendered output.",
        type: "select",
        options: [
          { value: "debounce", label: "Instant Debounced (Reload as you type with delay)" },
          { value: "onSave", label: "On Save (Reload only when file is saved)" },
          { value: "manual", label: "Manual (Reload only on clicking refresh button)" },
        ],
      },
      {
        key: "preview.debounceDelay",
        label: "Preview Debounce Delay (ms)",
        description: "Milliseconds of inactivity before triggering live preview reload.",
        type: "number",
        min: 100,
        max: 2000,
        step: 50,
      },
      {
        key: "preview.allowScripts",
        label: "Allow Scripts in HTML Preview",
        description: "Permit execution of JavaScript in rendered HTML preview iframe (sandboxed).",
        type: "boolean",
      },
      {
        key: "preview.openInNewTab",
        label: "Open Preview In New Browser Tab",
        description: "By default open the live preview in a detached full browser tab instead of embedded iframe.",
        type: "boolean",
      },
      {
        key: "preview.defaultZoom",
        label: "Default Preview Zoom (%)",
        description: "Initial zoom scale percentage for preview viewports.",
        type: "number",
        min: 50,
        max: 200,
        step: 10,
      },
    ],
  },

  {
    id: "vocode.ai",
    label: "AI & Voice Assistant",
    icon: "Sparkles",
    description: "Model selection, API keys (BYOK), voice input, text-to-speech, and generation parameters",
    items: [
      {
        key: "vocode.ai.defaultModel",
        label: "Default AI Model",
        description: "The primary generative model for code assistance, explanations, and automated refactoring.",
        type: "select",
        options: [
          { value: "gemini-1.5-flash", label: "Google Gemini 1.5 Flash (Ultra Fast & Free)" },
          { value: "gemini-1.5-pro", label: "Google Gemini 1.5 Pro (High Reasoning)" },
          { value: "gpt-4o", label: "OpenAI GPT-4o" },
          { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
          { value: "claude-3-5-sonnet", label: "Anthropic Claude 3.5 Sonnet" },
          { value: "llama-3.3-70b-versatile", label: "Groq Llama 3.3 70B (High Speed)" },
        ],
      },
      {
        key: "vocode.ai.safeMode",
        label: "AI Action Safety Mode",
        description: "Whether file modifications suggested by the AI are previewed before applying.",
        type: "select",
        options: [
          { value: "prompt", label: "Prompt before applying (Inspect diffs)" },
          { value: "autoApply", label: "Auto-apply changes directly" },
        ],
      },
      {
        key: "vocode.ai.temperature",
        label: "Model Temperature",
        description: "Controls randomness: lower values are more deterministic and precise for code syntax.",
        type: "number",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "vocode.ai.maxTokens",
        label: "Max Generation Tokens",
        description: "Upper bound on tokens generated per AI completion.",
        type: "number",
        min: 256,
        max: 8192,
        step: 256,
      },
      {
        key: "vocode.ai.geminiApiKey",
        label: "Custom Gemini API Key",
        description: "Your own Google Gemini API key (Leave empty to use server default).",
        type: "password",
      },
      {
        key: "vocode.ai.openaiApiKey",
        label: "Custom OpenAI API Key",
        description: "Your own OpenAI key (e.g. sk-...).",
        type: "password",
      },
      {
        key: "vocode.ai.groqApiKey",
        label: "Custom Groq API Key",
        description: "Your Groq cloud API key (e.g. gsk_...).",
        type: "password",
      },
      {
        key: "vocode.ai.voiceRecognitionEngine",
        label: "Voice Recognition Engine",
        description: "Speech-to-text engine used when clicking or holding the microphone.",
        type: "select",
        options: [
          { value: "browser", label: "Browser Native Web Speech API" },
          { value: "whisper", label: "Cloud Whisper Engine" },
        ],
      },
      {
        key: "vocode.ai.voiceInputHotkey",
        label: "Voice Input Hotkey",
        description: "Keyboard shortcut to toggle microphone recording.",
        type: "string",
      },
      {
        key: "vocode.ai.textToSpeech",
        label: "Text-to-Speech (Spoken Responses)",
        description: "Read AI responses aloud automatically using natural voice synthesis.",
        type: "boolean",
      },
      {
        key: "vocode.ai.ttsRate",
        label: "Speech Rate (Playback Speed)",
        description: "Pace of text-to-speech audio.",
        type: "number",
        min: 0.5,
        max: 2.0,
        step: 0.1,
      },
    ],
  },

  {
    id: "terminal",
    label: "Integrated Terminal",
    icon: "SquareTerminal",
    description: "Xterm.js shell, scrollback buffer, fonts, and terminal behavior",
    items: [
      {
        key: "terminal.integrated.shell",
        label: "Default Shell Path",
        description: "Shell executable launched inside the sandbox execution container.",
        type: "select",
        options: [
          { value: "/bin/bash", label: "/bin/bash (Default Linux Shell)" },
          { value: "/bin/sh", label: "/bin/sh (POSIX Shell)" },
          { value: "/bin/zsh", label: "/bin/zsh (Z Shell)" },
        ],
      },
      {
        key: "terminal.integrated.fontFamily",
        label: "Terminal Font Family",
        description: "Font family stack for terminal text.",
        type: "string",
      },
      {
        key: "terminal.integrated.fontSize",
        label: "Terminal Font Size",
        description: "Font size in pixels for the integrated terminal.",
        type: "number",
        min: 10,
        max: 24,
        step: 1,
      },
      {
        key: "terminal.integrated.scrollback",
        label: "Scrollback Buffer Lines",
        description: "Number of historical output lines maintained in terminal memory.",
        type: "number",
        min: 500,
        max: 20000,
        step: 500,
      },
      {
        key: "terminal.integrated.cursorStyle",
        label: "Terminal Cursor Style",
        description: "Visual appearance of the terminal cursor.",
        type: "select",
        options: [
          { value: "block", label: "block" },
          { value: "underline", label: "underline" },
          { value: "bar", label: "bar" },
        ],
      },
      {
        key: "terminal.integrated.cursorBlink",
        label: "Terminal Cursor Blink",
        description: "Controls whether the terminal cursor blinks.",
        type: "boolean",
      },
      {
        key: "terminal.integrated.copyOnSelection",
        label: "Copy On Selection",
        description: "Automatically copy selected terminal text to system clipboard.",
        type: "boolean",
      },
      {
        key: "terminal.integrated.rightClickPaste",
        label: "Right-Click Paste",
        description: "Right-clicking inside the terminal immediately pastes clipboard text.",
        type: "boolean",
      },
    ],
  },

  {
    id: "runner",
    label: "Runner & Sandbox",
    icon: "Play",
    description: "Project auto-detection, execution limits, and custom run commands",
    items: [
      {
        key: "runner.autoDetectProject",
        label: "Auto-Detect Project",
        description: "Automatically infer execution commands from package.json, requirements.txt, etc.",
        type: "boolean",
      },
      {
        key: "runner.customCommand",
        label: "Custom Workspace Run Command",
        description: "Optional custom shell command triggered by the green Run button (e.g. 'npm run dev').",
        type: "string",
      },
      {
        key: "runner.executionTimeoutSec",
        label: "Execution Timeout (Seconds)",
        description: "Maximum continuous run time before halting a sandboxed process to prevent runaway loops.",
        type: "number",
        min: 10,
        max: 300,
        step: 5,
      },
      {
        key: "runner.maxConcurrentRuns",
        label: "Max Concurrent Runs",
        description: "Maximum simultaneous background tasks/scripts permitted.",
        type: "number",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        key: "runner.livePreviewPort",
        label: "Live Preview Port",
        description: "Default local development port targeted by Live Preview.",
        type: "number",
        min: 1000,
        max: 65535,
        step: 1,
      },
    ],
  },

  {
    id: "files",
    label: "Files & Storage",
    icon: "Folder",
    description: "Auto-save, file exclusions, upload limits, and recycle bin retention",
    items: [
      {
        key: "files.autoSave",
        label: "Auto Save Mode",
        description: "Controls how dirty files are saved to workspace disk.",
        type: "select",
        options: [
          { value: "afterDelay", label: "afterDelay (save after configured delay)" },
          { value: "onFocusChange", label: "onFocusChange (save when switching tabs/windows)" },
          { value: "off", label: "off (manual save via Ctrl+S)" },
        ],
      },
      {
        key: "files.autoSaveDelayMs",
        label: "Auto Save Delay (ms)",
        description: "Delay in milliseconds before saving after typing stops.",
        type: "number",
        min: 200,
        max: 5000,
        step: 100,
      },
      {
        key: "files.exclude",
        label: "Files Exclude Patterns",
        description: "Glob patterns for files/folders hidden from file tree and search.",
        type: "stringArray",
      },
      {
        key: "files.maxUploadSizeMB",
        label: "Max Upload Size (MB)",
        description: "Upper limit in Megabytes for individual file imports.",
        type: "number",
        min: 1,
        max: 100,
        step: 1,
      },
      {
        key: "files.recycledBinRetentionDays",
        label: "Recycle Bin Retention (Days)",
        description: "Days before items in the recycle bin are permanently purged.",
        type: "select",
        options: [
          { value: 7, label: "7 Days" },
          { value: 14, label: "14 Days" },
          { value: 30, label: "30 Days" },
          { value: 90, label: "90 Days" },
        ],
      },
      {
        key: "files.confirmDelete",
        label: "Confirm File Deletion",
        description: "Display confirmation modal before moving files to Recycle Bin.",
        type: "boolean",
      },
      {
        key: "files.showHiddenFiles",
        label: "Show Hidden Dot-Files",
        description: "Show files beginning with '.' (.env, .gitignore, etc.) in the explorer.",
        type: "boolean",
      },
    ],
  },

  {
    id: "workbench",
    label: "Workbench & Appearance",
    icon: "Palette",
    description: "Theme, icons, activity bar, and layout density",
    items: [
      {
        key: "workbench.colorTheme",
        label: "Color Theme",
        description: "Overall UI aesthetic and contrast mode.",
        type: "select",
        options: [
          { value: "dark", label: "Vocode Dark (Cyber Emerald)" },
          { value: "light", label: "Vocode Light (Warm Cream)" },
        ],
      },
      {
        key: "workbench.iconTheme",
        label: "File Icon Theme",
        description: "Icon set rendered in file explorer tabs and tree items.",
        type: "select",
        options: [
          { value: "Seti", label: "Seti (Official VS Code icons)" },
          { value: "Material", label: "Material Design Icons" },
          { value: "Minimal", label: "Minimalist Mono" },
        ],
      },
      {
        key: "workbench.tabSizing",
        label: "Editor Tab Sizing",
        description: "Behavior of tabs when multiple files are opened.",
        type: "select",
        options: [
          { value: "fit", label: "fit (always show full file name)" },
          { value: "shrink", label: "shrink (compress tabs to fit bar)" },
          { value: "compact", label: "compact" },
        ],
      },
      {
        key: "workbench.layoutDensity",
        label: "Layout Density",
        description: "Controls spacing between items across navigation and toolbars.",
        type: "select",
        options: [
          { value: "compact", label: "Compact (Higher density)" },
          { value: "default", label: "Default" },
          { value: "comfortable", label: "Comfortable (More breathing room)" },
        ],
      },
    ],
  },

  {
    id: "keybindings",
    label: "Keyboard Shortcuts",
    icon: "Keyboard",
    description: "Keymap profiles (VS Code, Vim, Sublime) and shortcut definitions",
    items: [
      {
        key: "keybindings.profile",
        label: "Keymap Emulation Profile",
        description: "Select keymap shortcuts matching your preferred editor muscle memory.",
        type: "select",
        options: [
          { value: "vscode", label: "VS Code Standard (Ctrl+S, Ctrl+P, Ctrl+`, Ctrl+,)" },
          { value: "vim", label: "Vim Modal Editing (hjkl, :w, :q, Normal/Insert)" },
          { value: "sublime", label: "Sublime Text" },
          { value: "emacs", label: "Emacs" },
        ],
      },
    ],
  },

  {
    id: "account",
    label: "Account & Security",
    icon: "User",
    description: "User profile, session timeout, and cloud settings synchronization",
    items: [
      {
        key: "account.displayName",
        label: "Display Name",
        description: "Name displayed across collaboration headers and profile badge.",
        type: "string",
      },
      {
        key: "account.syncSettings",
        label: "Sync Settings to Cloud",
        description: "Automatically synchronize your preferences across all your browsers and machines.",
        type: "boolean",
      },
      {
        key: "account.sessionTimeoutMinutes",
        label: "Session Inactivity Timeout (Minutes)",
        description: "Duration of idle time before requiring session re-authentication.",
        type: "number",
        min: 15,
        max: 1440,
        step: 15,
      },
    ],
  },

  {
    id: "telemetry",
    label: "Telemetry & Diagnostics",
    icon: "Activity",
    description: "Anonymous crash reporting and performance monitoring",
    items: [
      {
        key: "telemetry.enabled",
        label: "Enable Anonymous Usage Telemetry",
        description: "Sends anonymous diagnostics to help improve VocodeAI.",
        type: "boolean",
      },
      {
        key: "telemetry.logErrors",
        label: "Capture Client-Side Errors",
        description: "Logs unhandled editor exceptions to aid debugging.",
        type: "boolean",
      },
    ],
  },
];


/**
 * VOCA COMPREHENSIVE KNOWLEDGE ENGINE
 * Encyclopedic built-in knowledge base for VocodeAI.
 * Powers instant, zero-latency, 100% offline-resilient responses
 * covering every feature, architecture detail, shortcut, and real-time page analysis.
 */

export const VOCA_SUGGESTIONS = [
  { label: "📍 Analyze Current Page", query: "Tell me the name of my current page and what I can do here." },
  { label: "🌟 What is VocodeAI?", query: "What is VocodeAI and how does it work?" },
  { label: "🎙️ Voice-to-Code", query: "How does the Voice-to-Code speech engine work?" },
  { label: "☁️ Cloud Storage Sync", query: "How does continuous cloud storage persistence work?" },
  { label: "📱 Code on iPad / Phone", query: "Can I use VocodeAI on an iPad, phone, or Chromebook?" },
  { label: "🚀 Create a Workspace", query: "How do I create a new workspace and choose a stack?" },
  { label: "⌨️ Keyboard Shortcuts", query: "What keyboard shortcuts are supported in VocodeAI?" },
  { label: "💻 Cloud Terminal", query: "How does the cloud terminal and container execution work?" },
];

/**
 * Real-time Current Page Analyzer:
 * Inspects URL pathname, document title, and live DOM elements
 * to provide context-aware answers about the user's active screen.
 */
export function analyzeCurrentPage(pathname = (typeof window !== "undefined" ? window.location.pathname : "/")) {
  const path = (pathname || "/").toLowerCase();

  // Try to inspect live DOM state if in browser
  let visibleHeading = "";
  let visibleWorkspaces = [];
  if (typeof document !== "undefined") {
    try {
      const h1 = document.querySelector("h1, .dashboard-title, .auth-hero-title, .docs-title");
      if (h1 && h1.textContent) visibleHeading = h1.textContent.trim().replace(/\s+/g, " ");

      // Detect any active workspace cards (e.g. "hehe")
      const wsCards = document.querySelectorAll(
        ".workspace-card, .workspace-item, [class*='workspace'], [class*='Workspace']"
      );
      wsCards.forEach((c) => {
        const text = c.textContent || "";
        // Look for common words like "Updated" or card headings
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines[0].length < 35 && !lines[0].includes("Workspaces") && !lines[0].includes("Create")) {
          if (!visibleWorkspaces.includes(lines[0])) {
            visibleWorkspaces.push(lines[0]);
          }
        }
      });
    } catch {}
  }

  // 1. Dashboard Page
  if (path === "/dashboard" || path.startsWith("/dashboard")) {
    return {
      pageName: "Workspace Dashboard",
      route: "/dashboard",
      heading: visibleHeading || "Your Workspaces",
      summary: "This is your personal developer workspace hub where all your cloud projects live.",
      features: [
        "View and launch all your created cloud workspaces",
        visibleWorkspaces.length > 0
          ? `Active workspaces visible on screen: **${visibleWorkspaces.slice(0, 3).join(", ")}**`
          : "Workspaces list with real-time update timestamps",
        "**+ Create Workspace**: Launch a new cloud container (Node.js, Python, Java, C++, React, Web)",
        "**Global Quick Search**: Press `Ctrl + K` to search through workspaces and templates",
        "**Import & Export**: Backup or upload projects anytime",
        "**Left Sidebar**: Quick navigation to Templates, Cloud Terminal, Settings, and Recycle Bin",
      ],
      actions: "Click on any workspace card to open Monaco Editor, or click '+ Create Workspace' in the top-right to spin up a new project.",
    };
  }

  // 2. Documentation Page
  if (path === "/docs" || path.startsWith("/docs")) {
    return {
      pageName: "Documentation & Knowledge Base",
      route: "/docs",
      heading: visibleHeading || "VocodeAI Documentation",
      summary: "The official technical manual, API reference, and architectural guides for VocodeAI.",
      features: [
        "**Left Sidebar**: Knowledge Base directory divided into Getting Started, Cloud Architecture, AI Capabilities, and Infrastructure",
        "**Center Reader**: Focused single-topic reader (Quickstart, Zero Setup, Cloud Persistence)",
        "**Right Table of Contents**: Real-time subheadings of the current active topic with jump links",
        "Search bar with `Cmd + K` shortcut filter",
      ],
      actions: "Browse topics using the left navigation or search for guides in the top search bar.",
    };
  }

  // 3. Landing Page
  if (path === "/" || path === "") {
    return {
      pageName: "Landing Page",
      route: "/",
      heading: visibleHeading || "VocodeAI Homepage",
      summary: "The main presentation page highlighting VocodeAI's voice-native cloud developer studio.",
      features: [
        "Interactive Studio Simulator (Voice, Cloud Editor, Sync, Live Preview)",
        "Any Device Matrix: zero-setup benchmarks for Mac/Win, iPad, Smartphones, and Chromebooks",
        "Feature Bento Grid: Sub-second persistence, Monaco multi-file tabs, and sandboxed containers",
        "Developer Personas and FAQ Accordion",
      ],
      actions: "Click 'Enter VocodeAI' or 'Enter Studio' to sign in and access your workspace dashboard.",
    };
  }

  // 4. Login Page
  if (path === "/login" || path.startsWith("/login")) {
    return {
      pageName: "Login Page",
      route: "/login",
      heading: visibleHeading || "Log in to your workspace",
      summary: "The secure authentication gateway for returning developers.",
      features: [
        "One-tap Google OAuth sign-in",
        "Email & Password credentials with password visibility toggle",
        "Theme toggle between Dark Obsidian and Warm Light mode",
        "Direct link to 'Forgot Password' recovery",
      ],
      actions: "Enter your email & password or click 'Continue with Google' to sign in.",
    };
  }

  // 5. Sign Up Page
  if (path === "/signup" || path.startsWith("/signup")) {
    return {
      pageName: "Sign Up Page",
      route: "/signup",
      heading: visibleHeading || "Create your VocodeAI account",
      summary: "The onboarding registration portal for new developers.",
      features: [
        "First & Last Name registration",
        "Real-time dynamic password strength meter",
        "Google OAuth single sign-on",
        "Zero-credit-card, instant cloud provisioning upon completion",
      ],
      actions: "Fill in your details and click 'Create Account' to start coding immediately.",
    };
  }

  // 6. Forgot Password Page
  if (path === "/forgot-password" || path.startsWith("/forgot-password")) {
    return {
      pageName: "Forgot Password Page",
      route: "/forgot-password",
      heading: visibleHeading || "Recover Your Account",
      summary: "The zero-lockout account recovery portal.",
      features: [
        "Submits an encrypted verification reset code directly to your email",
        "Security-first identity verification",
      ],
      actions: "Enter your registered email address and click 'Send Reset Code'.",
    };
  }

  // 7. Reset Password Page
  if (path === "/reset-password" || path.startsWith("/reset-password")) {
    return {
      pageName: "Reset Password Page",
      route: "/reset-password",
      heading: visibleHeading || "Set New Password",
      summary: "The OTP verification and password update portal.",
      features: [
        "6-digit verification code input",
        "New password input with strength requirements",
        "Instant auto-redirect to login upon success",
      ],
      actions: "Enter your OTP code and new password, then click 'Update Password'.",
    };
  }

  // 8. Active Workspace IDE
  if (path.startsWith("/workspace")) {
    return {
      pageName: "Cloud Coding Workspace",
      route: path,
      heading: visibleHeading || "VocodeAI Workspace IDE",
      summary: "Your live cloud development environment.",
      features: [
        "Monaco Code Editor with multi-tab support and syntax formatting",
        "xterm.js Cloud Terminal running inside a dedicated Docker micro-VM",
        "Live web preview iframe with instant hot reload",
        "Voice-to-code microphone dictation bar",
      ],
      actions: "Write code, run terminal commands, or dictate instructions using the microphone.",
    };
  }

  // 9. Settings View
  if (path.startsWith("/settings")) {
    return {
      pageName: "Settings View",
      route: "/settings",
      heading: visibleHeading || "User Settings",
      summary: "Account, theme preferences, and developer environment configuration.",
      features: [
        "Dark / Light theme preferences",
        "Default workspace template selection",
        "Account profile and API configuration",
      ],
      actions: "Modify your preferences and click 'Save Changes'.",
    };
  }

  // Default Fallback
  return {
    pageName: visibleHeading || "VocodeAI Platform",
    route: path,
    heading: visibleHeading || "VocodeAI App",
    summary: `You are currently viewing the '${path}' section of VocodeAI.`,
    features: [
      "Autonomous cloud developer studio running inside any modern browser",
      "Sub-second cloud storage persistence",
    ],
    actions: "Navigate to Dashboard or Documentation to explore features.",
  };
}

export const VOCA_KNOWLEDGE = [
  {
    id: "about_voca",
    keywords: ["who are you", "what is your name", "who is voca", "tell me about yourself", "your name", "who made you"],
    title: "Meet Voca",
    answer: `Hey! I'm **Voca**, the official robotic owl mascot and intelligent assistant for **VocodeAI**! 🦉✨

Here's how I can help you:
- 📍 **Page Analysis**: Ask *"what page am I on?"* or *"explain this page"* and I'll analyze your current screen!
- 🎙️ **Voice-to-Code**: Learn how to dictate code and refactor hands-free.
- ☁️ **Cloud Storage**: Understand our sub-second persistence system.
- 📱 **Any Device**: Tips on coding from iPads, smartphones, and Chromebooks.
- ⚡ **Workspaces & Terminal**: Guidance on Docker containers and keybindings.

Feel free to ask me anything or drag me anywhere on your screen!`,
  },
  {
    id: "what_is_vocodeai",
    keywords: ["what is vocode", "what is vocodeai", "overview", "what does this website do", "project overview", "about project", "purpose of this website", "explain project"],
    title: "What is VocodeAI?",
    answer: `**VocodeAI** is an autonomous, cloud-native developer studio and voice-driven pair programmer engineered for **zero local setup** and complete **hardware freedom**. 🚀

### Core Pillars:
1. **🎙️ Voice-to-Code Intelligence**: Speak naturally to generate, refactor, or debug code hands-free.
2. **☁️ Continuous Cloud Storage**: Every keystroke is saved sub-second to cloud storage—never lose your work.
3. **🌐 Zero Local Installation**: No Node.js, no Python, no Docker Desktop required on your machine. Everything executes in secure cloud micro-VMs.
4. **📱 Hardware Agnostic**: Runs with full desktop IDE power on Chromebooks, iPads, tablets, smartphones, and low-spec laptops.
5. **⚡ Full Developer Suite**: Includes Monaco Editor, an integrated xterm.js cloud terminal, live web preview, and multi-file project trees.`,
  },
  {
    id: "voice_to_code",
    keywords: ["voice", "voice to code", "speech", "microphone", "dictate", "speak", "voice coding", "voice engine", "audio"],
    title: "Voice-to-Code Intelligence",
    answer: `VocodeAI's **Voice-to-Code** engine turns developer speech directly into syntax-validated production code! 🎙️⚡

### How It Works:
- **Multimodal AI Transcription**: Powered by Google Gemini 2.5 Flash / Web Audio streaming.
- **Background Noise Suppression**: The audio pipeline scrubs room noise, keyboard clicks, and speech hesitations.
- **Intent Extraction**: Say *"create a FastAPI route that accepts JSON and validates user IDs"*, and the engine generates the exact syntax and inserts it at your cursor in Monaco Editor.
- **Hands-Free Editing**: Say *"wrap this function in a try-catch block"* or *"add docstrings"* without touching your keyboard.

You can click the microphone icon in any workspace or chat input to start dictating!`,
  },
  {
    id: "cloud_storage",
    keywords: ["cloud storage", "persistence", "save", "saving", "auto save", "autosave", "data loss", "storage sync", "keystroke"],
    title: "Continuous Cloud Persistence",
    answer: `Traditional web editors risk losing work when tabs crash or laptops run out of battery. **VocodeAI** solves this with **sub-second cloud persistence**! ☁️🔒

### Persistence Architecture:
- **Sub-Second Keystroke Sync**: Every keystroke and file modification is automatically synced to cloud MongoDB/Redis containers.
- **Zero Local Footprint**: No storage space taken up on your physical device.
- **Seamless Cross-Device Handoff**: Start coding on your office desktop, close the lid, open your iPad on the train, and your code and cursor position are instantly restored.
- **Version Integrity**: Built-in state tracking with automated snapshots and Recycle Bin protection.`,
  },
  {
    id: "device_support",
    keywords: ["device", "devices", "ipad", "phone", "mobile", "tablet", "chromebook", "android", "iphone", "hardware", "mac", "windows", "linux", "setup", "install"],
    title: "Hardware Agnostic: Code on Any Device",
    answer: `VocodeAI was designed from the ground up to liberate developers from expensive hardware! 💻📱✨

### Supported Platforms:
- **Apple iPad / Tablets**: Full keyboard & touch gesture support. Pair with Magic Keyboard for a desktop-class dev studio.
- **Mobile Phones (Android & iOS)**: Review code, execute hotfixes, and dictate voice commands on the go.
- **Chromebooks & Budget Laptops**: Run heavy Python AI scripts or C++ builds without your fan spinning or battery draining.
- **Desktop (Mac, Windows, Linux)**: Works natively in Chrome, Safari, Edge, and Firefox.

**Why?** Because 100% of compute, compilers, package managers, and container runners execute inside isolated cloud micro-VMs!`,
  },
  {
    id: "workspaces",
    keywords: ["workspace", "workspaces", "create workspace", "new project", "template", "templates", "stacks", "delete workspace", "import", "export"],
    title: "Workspaces & Tech Stacks",
    answer: `Workspaces are isolated cloud environments equipped with pre-configured developer toolchains. 🛠️

### Pre-Configured Templates:
- 🟢 **Node.js / Express**: Modern JavaScript runtime with npm/yarn support.
- 🐍 **Python 3**: Preloaded with Python, pip, and data science libraries.
- 🌐 **Web / HTML5**: HTML, CSS, JavaScript with live interactive iframe preview.
- ☕ **Java**: Full JDK environment for Java development and compilation.
- ⚙️ **C / C++**: GCC/Clang toolchains for systems programming and algorithms.
- ⚛️ **React**: Vite-powered modern front-end workflow.

### Managing Workspaces:
- **Create**: From the Dashboard, click **+ Create Workspace** and choose a template.
- **Import/Export**: Easily import zip bundles or export your entire workspace at any time!`,
  },
  {
    id: "terminal",
    keywords: ["terminal", "bash", "shell", "xterm", "command line", "pty", "run code", "compile", "execute"],
    title: "Cloud Terminal & Execution",
    answer: `VocodeAI features an enterprise-grade **Cloud Terminal** embedded directly in your workspace! ⚡

### Highlights:
- **xterm.js Integration**: Real-time terminal emulation with full ANSI colors, cursor positioning, and tab completion.
- **Docker PTY Backend**: Each terminal is bound to an isolated micro-container.
- **Install Packages**: Run \`npm install <package>\` or \`pip install <library>\` just like a local machine.
- **Shortcut**: Press \`Ctrl + \`\` (or \`Cmd + \`\`) to toggle the terminal open or closed instantly.`,
  },
  {
    id: "shortcuts",
    keywords: ["shortcut", "shortcuts", "hotkeys", "keybindings", "keys", "commands", "ctrl k"],
    title: "Keyboard Shortcuts Quick Reference",
    answer: `Boost your speed with these official VocodeAI keybindings! ⌨️⚡

| Shortcut | Action |
| :--- | :--- |
| **Ctrl + K** / **Cmd + K** | Open Command Palette / Quick Search |
| **Ctrl + S** / **Cmd + S** | Manual Cloud Sync / Force Save |
| **Ctrl + \`** | Toggle Cloud Terminal drawer |
| **Ctrl + Enter** | Execute Active File / Run Code |
| **Ctrl + B** / **Cmd + B** | Toggle File Explorer sidebar |
| **Esc** | Close active modals & menus |

*Tip: You can also use voice to trigger actions like "run my code" or "open terminal"!*`,
  },
  {
    id: "architecture",
    keywords: ["architecture", "tech stack", "technologies", "frontend", "backend", "how it is built", "built with", "monaco", "docker"],
    title: "System Architecture & Tech Stack",
    answer: `VocodeAI is built with modern, high-performance web and cloud technologies: 🏗️

### 🖥️ Frontend:
- **Framework**: React 19 + Vite for sub-millisecond HMR.
- **Editor**: Monaco Editor (the open-source core behind VS Code).
- **Terminal**: xterm.js with WebSocket streaming.
- **Icons & Styling**: Lucide React + custom MNC Glassmorphism CSS system (Dual Theme: Deep Obsidian & Warm Alabaster).

### ⚙️ Backend & Cloud:
- **API Server**: Node.js & Express REST architecture.
- **Execution Sandbox**: Docker micro-containers with PTY multiplexing.
- **Database & Cache**: MongoDB (workspaces, metadata) + Redis (session caching).
- **AI Core**: Google Gemini 2.5 Flash multimodal intelligence.`,
  },
  {
    id: "documentation",
    keywords: ["docs", "documentation", "guide", "tutorial", "help", "manual", "quickstart"],
    title: "Documentation & Guides",
    answer: `Want to dive deeper into VocodeAI? Check out our official **Documentation page**! 📚

- **Direct URL**: Navigate to \`/docs\` from your browser.
- **Sections Available**:
  1. *What is VocodeAI?* (Philosophy & Features)
  2. *Quickstart Guide* (Up and running in 30 seconds)
  3. *Zero Setup & Any Device* (iPad, Chromebook, mobile tips)
  4. *Cloud Storage & Persistence* (Deep-dive into sync mechanics)
  5. *AI Pair Programmer & Voice* (Voice prompts and commands)
  6. *Architecture & API Reference* (Under-the-hood specs)

The documentation features fixed multi-column navigation, subtopic tracking, and copyable code snippets!`,
  },
];

/**
 * Intelligent query resolver:
 * Matches user query against knowledge base intents AND current page context.
 */
export function queryVocaKnowledge(rawQuery, pageContext = null) {
  if (!rawQuery || typeof rawQuery !== "string") return null;

  const q = rawQuery.toLowerCase().trim();
  const page = pageContext || analyzeCurrentPage();

  // 1. Current Page Analysis Intent (Highest Priority when asked about page/screen)
  const isPageAnalysisQuery =
    q.includes("current page") ||
    q.includes("name of my current page") ||
    q.includes("what page") ||
    q.includes("which page") ||
    q.includes("where am i") ||
    q.includes("name of this page") ||
    q.includes("this page") ||
    q.includes("explain this page") ||
    q.includes("analyze this page") ||
    q.includes("what is on my screen") ||
    q.includes("what is this screen") ||
    q.includes("what can i do here") ||
    q.includes("what screen is this");

  if (isPageAnalysisQuery) {
    return {
      title: page.pageName,
      answer: `You are currently on the **${page.pageName}** (route: \`${page.route}\`)! 📍✨

### 🔎 Page Summary:
${page.summary}

### 💡 Key Features on this Screen:
${page.features.map((f) => `- ${f}`).join("\n")}

### 🎯 What You Can Do Right Now:
${page.actions}`,
    };
  }

  // 2. Direct Greetings
  if (/^(hi|hello|hey|hola|greetings|sup|yo|good morning|good evening|good afternoon)\b/i.test(q)) {
    return {
      title: "Hello from Voca!",
      answer: `Hello! 👋 I'm **Voca**, your VocodeAI guide. You're currently on the **${page.pageName}** (\`${page.route}\`).

What can I help you with? You can ask me:
- *"Tell me the name of my current page"*
- *"What is VocodeAI?"*
- *"How does Voice-to-Code work?"*
- *"Can I code on my iPad or smartphone?"*
- *"How does cloud persistence work?"*
- *"What are the keyboard shortcuts?"*`,
    };
  }

  // 3. Exact keyword matches across knowledge entries
  for (const entry of VOCA_KNOWLEDGE) {
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        return entry;
      }
    }
  }

  // 4. Fuzzy topic scoring
  let bestEntry = null;
  let highestScore = 0;

  for (const entry of VOCA_KNOWLEDGE) {
    let score = 0;
    const words = q.split(/\s+/);
    for (const word of words) {
      if (word.length <= 2) continue;
      for (const kw of entry.keywords) {
        if (kw.includes(word) || word.includes(kw)) {
          score += 1;
        }
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && highestScore >= 1) {
    return bestEntry;
  }

  // 5. Intelligent Fallback (Context-Aware)
  return {
    title: "VocodeAI Assistant",
    answer: `Great question! You are currently on the **${page.pageName}** (\`${page.route}\`). 🚀

**VocodeAI** is an autonomous cloud developer studio that requires zero local setup. Here are key things I can explain:
- 📍 **This Screen**: Ask *"explain my current page"* for a breakdown of what you can do here.
- 🎙️ **Voice-to-Code**: Dictate functions, speak architecture, and edit code hands-free.
- ☁️ **Cloud Storage**: Automatic sub-second keystroke persistence across all devices.
- 📱 **Any Device**: Coding smoothly on iPads, Chromebooks, and smartphones.
- 🛠️ **Workspaces**: Templates for Node.js, Python, Java, C++, and Web.
- ⌨️ **Keyboard Shortcuts**: Speed up your workflow with hotkeys.

What would you like to explore?`,
  };
}

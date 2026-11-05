import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Mic,
  Code2,
  Cpu,
  Database,
  Server,
  Globe,
  Zap,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  Sun,
  Moon,
  ChevronRight,
  Terminal,
  Eye,
  FileCode2,
  FolderTree,
  ExternalLink,
  Layers,
  ShieldCheck,
  Menu,
  X,
  HardDrive,
  RefreshCw,
  Hash,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  CheckCircle2,
} from "lucide-react";
import "../styles/Documentation.css";

const DOCS_TOPICS = [
  {
    id: "overview",
    label: "What is VocodeAI?",
    category: "GETTING STARTED",
    icon: Sparkles,
    badge: "v2.0 Production",
    readTime: "5 min read",
    subheadings: [
      { id: "core-philosophy", label: "Core Philosophy" },
      { id: "autonomous-pair", label: "Autonomous AI Pair" },
      { id: "hardware-agnostic", label: "Hardware Agnostic Engine" },
      { id: "cloud-storage-preview", label: "Continuous Persistence" },
    ],
  },
  {
    id: "quickstart",
    label: "Quickstart Guide",
    category: "GETTING STARTED",
    icon: Zap,
    badge: "30-Sec Setup",
    readTime: "4 min read",
    subheadings: [
      { id: "step-1-browser", label: "1. Open in Any Browser" },
      { id: "step-2-workspace", label: "2. Create Workspace" },
      { id: "step-3-code", label: "3. Speak or Code" },
      { id: "step-4-execute", label: "4. Run in Cloud VM" },
    ],
  },
  {
    id: "any-device",
    label: "Zero Setup & Any Device",
    category: "CLOUD ARCHITECTURE",
    icon: Globe,
    badge: "Hardware Agnostic",
    readTime: "6 min read",
    subheadings: [
      { id: "device-matrix", label: "Device Capability Matrix" },
      { id: "zero-disk-footprint", label: "Why 0 MB Local Storage Matters" },
      { id: "browser-tech", label: "In-Browser Execution Stack" },
    ],
  },
  {
    id: "cloud-storage",
    label: "Cloud Storage & Persistence",
    category: "CLOUD ARCHITECTURE",
    icon: HardDrive,
    badge: "Distributed Storage",
    readTime: "5 min read",
    subheadings: [
      { id: "keystroke-sync", label: "Continuous Keystroke Sync" },
      { id: "recycle-bin", label: "Soft-Delete Recycle Bin" },
      { id: "session-handoff", label: "Cross-Device Handoff" },
      { id: "export-zip", label: "One-Click Repo Export" },
    ],
  },
  {
    id: "ai-engine",
    label: "How AI Engine Works",
    category: "AI CAPABILITIES",
    icon: Cpu,
    badge: "Gemini 2.5 + AST",
    readTime: "7 min read",
    subheadings: [
      { id: "execution-loop", label: "Bidirectional Execution Loop" },
      { id: "action-protocol", label: "Structured Action Protocol" },
      { id: "file-tree-updates", label: "Multi-File AST Context" },
    ],
  },
  {
    id: "voice-multimodal",
    label: "Voice & Vision Support",
    category: "AI CAPABILITIES",
    icon: Mic,
    badge: "Multimodal Audio",
    readTime: "6 min read",
    subheadings: [
      { id: "speech-engine", label: "Voice Engine & Wake Commands" },
      { id: "commands-cheatsheet", label: "Spoken Commands Cheatsheet" },
      { id: "vision-debugging", label: "Visual Bug & Screenshot Fixes" },
    ],
  },
  {
    id: "architecture",
    label: "System Architecture",
    category: "INFRASTRUCTURE",
    icon: Server,
    badge: "Microservices",
    readTime: "8 min read",
    subheadings: [
      { id: "arch-frontend", label: "Frontend & Monaco Editor" },
      { id: "arch-gateway", label: "WebSocket Gateway & node-pty" },
      { id: "arch-persistence", label: "MongoDB & Distributed Storage" },
      { id: "arch-sandbox", label: "Docker Micro-VM Sandboxes" },
    ],
  },
  {
    id: "api-reference",
    label: "Code & API Reference",
    category: "DEVELOPER REFERENCE",
    icon: Code2,
    badge: "REST + WebSocket",
    readTime: "6 min read",
    subheadings: [
      { id: "api-ai-endpoint", label: "POST /api/ai Execution" },
      { id: "api-multilang-examples", label: "SDK Code Samples" },
      { id: "api-preview-routes", label: "GET /preview Live URLs" },
    ],
  },
  {
    id: "shortcuts",
    label: "Keyboard Shortcuts",
    category: "DEVELOPER REFERENCE",
    icon: Terminal,
    badge: "Cheat Sheet",
    readTime: "3 min read",
    subheadings: [
      { id: "shortcuts-global", label: "Global IDE Hotkeys" },
      { id: "shortcuts-editor", label: "Monaco Editor Shortcuts" },
      { id: "shortcuts-terminal", label: "Terminal & Drawer Toggles" },
    ],
  },
  {
    id: "best-practices",
    label: "Tips & Best Practices",
    category: "GUIDELINES",
    icon: Lightbulb,
    badge: "Pro Tips",
    readTime: "5 min read",
    subheadings: [
      { id: "prompt-targeting", label: "Target Filenames in Prompts" },
      { id: "recycle-recovery", label: "Recycle Bin Recovery Workflow" },
      { id: "stacktrace-screenshots", label: "Visual Stack Trace Debugging" },
    ],
  },
];

export default function Documentation() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Dual Theme Support matching Landing & Dashboard
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  const [activeTopicId, setActiveTopicId] = useState("overview");
  const [activeSubheadingId, setActiveSubheadingId] = useState("");
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeApiLang, setActiveApiLang] = useState("javascript");
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [pageShareCopied, setPageShareCopied] = useState(false);

  const mainContentRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  const handleEnterApp = () => {
    if (accessToken) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  // Middle scrolling container reading progress handler
  const handleContentScroll = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const docHeight = el.scrollHeight - el.clientHeight;
    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setProgress(Math.min(100, Math.max(0, scrolled)));
  };

  // When changing topics, scroll the middle content area cleanly to the TOP
  const handleSelectTopic = (topicId) => {
    setActiveTopicId(topicId);
    setActiveSubheadingId("");
    setMobileSidebarOpen(false);

    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll to sub-heading inside the middle scrolling content area
  const handleScrollToSubheading = (subId) => {
    setActiveSubheadingId(subId);
    const el = document.getElementById(subId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyCode = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSharePage = () => {
    navigator.clipboard.writeText(window.location.href);
    setPageShareCopied(true);
    setTimeout(() => setPageShareCopied(false), 2000);
  };

  // Group topics by category
  const categories = Array.from(new Set(DOCS_TOPICS.map((s) => s.category)));

  // Filter topics based on search query
  const filteredTopics = DOCS_TOPICS.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Current active topic metadata
  const currentTopic = DOCS_TOPICS.find((t) => t.id === activeTopicId) || DOCS_TOPICS[0];
  const currentIndex = DOCS_TOPICS.findIndex((s) => s.id === activeTopicId);
  const prevTopic = currentIndex > 0 ? DOCS_TOPICS[currentIndex - 1] : null;
  const nextTopic = currentIndex < DOCS_TOPICS.length - 1 ? DOCS_TOPICS[currentIndex + 1] : null;

  return (
    <div className={`docs-page-container ${theme}`}>
      {/* Background Ambience Orbs */}
      <div className="docs-ambient-glow glow-top-left" aria-hidden="true" />
      <div className="docs-ambient-glow glow-top-right" aria-hidden="true" />

      {/* Reading Progress Top Bar */}
      <div
        className="docs-reading-progress-bar"
        style={{ width: `${progress}%` }}
      />

      {/* =========================================================
         1. TOPBAR HEADER (Glassmorphic & Dual-Themed)
         ========================================================= */}
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <button type="button" className="dash-back-arrow-btn docs-back-btn" onClick={() => navigate(-1)} title="Back" aria-label="Back"><ArrowLeft size={16} /></button>
          {/* Logo & Docs Badge */}
          <div className="docs-brand-left" onClick={() => navigate("/")} role="button" tabIndex={0} title="VocodeAI Home">
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="docs-brand-logo"
            />
            <span className="docs-brand-pill">Docs</span>
            <span className="docs-version-chip">v2.0</span>
          </div>

          {/* Quick Search Bar */}
          <div className="docs-topbar-search">
            <Search size={14} className="docs-search-icon" />
            <input
              type="text"
              placeholder="Search guides, APIs, commands (e.g. cloud storage, voice)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="docs-search-input"
            />
            {searchQuery ? (
              <button className="docs-search-clear" onClick={() => setSearchQuery("")}>
                <X size={13} />
              </button>
            ) : (
              <kbd className="docs-search-kbd">⌘K</kbd>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="docs-topbar-actions">
            <button
              className="docs-theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              className="docs-enter-cta-btn"
              onClick={handleEnterApp}
            >
              <span>{accessToken ? "Go to Dashboard" : "Enter VocodeAI"}</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="docs-mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation"
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
         2. MAIN DOCUMENTATION THREE-COLUMN LAYOUT
         ========================================================= */}
      <div className="docs-body-layout">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="docs-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* -------------------------------------------------------
           A. LEFT STICKY TOPIC NAVIGATION (Guide Tree)
           ------------------------------------------------------- */}
        <aside className={`docs-sidebar-nav ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          <div className="docs-sidebar-header">
            <BookOpen size={15} className="docs-sidebar-icon" />
            <span>KNOWLEDGE BASE</span>
          </div>

          <div className="docs-sidebar-categories">
            {categories.map((cat) => {
              const items = (searchQuery ? filteredTopics : DOCS_TOPICS).filter(
                (s) => s.category === cat
              );
              if (items.length === 0) return null;

              return (
                <div key={cat} className="docs-category-group">
                  <span className="docs-category-title">{cat}</span>
                  <div className="docs-category-links">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTopicId === item.id;
                      return (
                        <button
                          key={item.id}
                          className={`docs-nav-link ${isActive ? "active" : ""}`}
                          onClick={() => handleSelectTopic(item.id)}
                        >
                          <Icon size={14} className="docs-nav-icon" />
                          <span>{item.label}</span>
                          {isActive && <span className="active-indicator" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="docs-sidebar-footer">
            <div className="docs-footer-card">
              <Sparkles size={16} className="docs-card-glow-icon" />
              <div className="docs-card-text">
                <strong>VocodeAI Studio</strong>
                <p>Zero-setup cloud environment with voice pair programming.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* -------------------------------------------------------
           B. CENTER ARTICLE VIEW (Current Active Document - Middle Scrolling Area)
           ------------------------------------------------------- */}
        <main
          className="docs-content-area"
          ref={mainContentRef}
          onScroll={handleContentScroll}
        >
          {/* Breadcrumbs */}
          <nav className="docs-breadcrumb" aria-label="Breadcrumb">
            <span className="crumb-item" onClick={() => navigate("/")}>VocodeAI</span>
            <ChevronRight size={13} className="crumb-sep" />
            <span className="crumb-item" onClick={() => handleSelectTopic("overview")}>Documentation</span>
            <ChevronRight size={13} className="crumb-sep" />
            <span className="crumb-item cat-label">{currentTopic.category}</span>
            <ChevronRight size={13} className="crumb-sep" />
            <span className="crumb-item active">{currentTopic.label}</span>
          </nav>

          {/* Article Header */}
          <div className="docs-active-header">
            <div className="docs-section-tag">
              <currentTopic.icon size={13} />
              <span>{currentTopic.category}</span>
            </div>
            <h1 className="docs-h1">{currentTopic.label}</h1>
            <div className="docs-meta-bar">
              <span className="meta-badge">{currentTopic.badge}</span>
              <span className="meta-dot">•</span>
              <span>{currentTopic.readTime}</span>
              <span className="meta-dot">•</span>
              <span>Zero Local Dependencies</span>
            </div>
          </div>

          {/* ================= RENDER DEDICATED TOPIC CONTENT ================= */}

          {/* TOPIC 1: OVERVIEW */}
          {activeTopicId === "overview" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                VocodeAI is an autonomous, cloud-native developer studio engineered for maximum speed and hardware freedom.
                It unites speech-to-code synthesis, persistent cloud storage, zero-setup execution, and multimodal AI inside any modern web browser.
              </p>

              <div className="docs-glass-callout" id="core-philosophy">
                <div className="callout-indicator-bar" />
                <div>
                  <h4 className="callout-title">Core Philosophy: Zero Local Setup, Infinite Cloud Scaling</h4>
                  <p className="callout-desc">
                    Traditional web editors force developers to install local compilers, configure complex PATH variables, or burn gigabytes on bloated <code>node_modules</code>.
                    VocodeAI provisions instant cloud micro-VMs, saves every edit continuously to cloud storage, and streams results directly into Monaco Editor and xterm.js in sub-milliseconds.
                  </p>
                </div>
              </div>

              <div className="docs-subheading-anchor" id="autonomous-pair">
                <h2 className="docs-h2">Autonomous AI Pair Programmer</h2>
                <p className="docs-paragraph">
                  Unlike passive autocompletion plugins, VocodeAI acts as a full-fledged autonomous pair programmer. It can read entire repositories, create new microservices, refactor algorithms, and execute builds.
                </p>
              </div>

              <div className="docs-features-grid">
                <div className="docs-card">
                  <div className="docs-card-icon-wrap green">
                    <Sparkles size={20} />
                  </div>
                  <h3>Multi-File Scaffolding</h3>
                  <p>
                    Generates production-grade code across frontend, backend, and configuration files simultaneously with structured JSON actions.
                  </p>
                </div>

                <div className="docs-card" id="hardware-agnostic">
                  <div className="docs-card-icon-wrap coral">
                    <Globe size={20} />
                  </div>
                  <h3>Hardware Agnostic & Universal</h3>
                  <p>
                    Run full-scale development on Mac, Windows, Linux, iPads, Chromebooks, and smartphones with <strong>0 MB local storage footprint</strong>.
                  </p>
                </div>

                <div className="docs-card">
                  <div className="docs-card-icon-wrap blue">
                    <Mic size={20} />
                  </div>
                  <h3>Voice-Assisted Engineering</h3>
                  <p>
                    Speak natural language requests, dictate code, and control your cloud workspace completely hands-free with low-latency AI speech models.
                  </p>
                </div>

                <div className="docs-card" id="cloud-storage-preview">
                  <div className="docs-card-icon-wrap yellow">
                    <HardDrive size={20} />
                  </div>
                  <h3>Continuous Cloud Storage</h3>
                  <p>
                    Every keystroke is version-controlled and streamed to multi-region cloud databases. Never fear losing progress to a dead laptop battery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TOPIC 2: QUICKSTART */}
          {activeTopicId === "quickstart" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                Spin up your first cloud workspace in under 30 seconds with no command line installation required.
              </p>

              <div className="docs-steps-timeline">
                <div className="timeline-step" id="step-1-browser">
                  <div className="step-badge">1</div>
                  <div className="step-content">
                    <h3>Open VocodeAI in Any Browser</h3>
                    <p>
                      Navigate to the app URL on Chrome, Safari, Edge, or Firefox. No downloads, no Docker desktop daemon, and no license keys needed.
                    </p>
                  </div>
                </div>

                <div className="timeline-step" id="step-2-workspace">
                  <div className="step-badge">2</div>
                  <div className="step-content">
                    <h3>Create Workspace & Select Stack</h3>
                    <p>
                      From your <strong>Dashboard</strong>, click <code>+ Create Workspace</code>, choose a template (such as Python, Node.js, Web, Java, or C++), and name your workspace.
                    </p>
                  </div>
                </div>

                <div className="timeline-step" id="step-3-code">
                  <div className="step-badge">3</div>
                  <div className="step-content">
                    <h3>Speak or Code in Monaco Editor</h3>
                    <p>
                      Type directly or click the microphone icon to speak. The AI assistant scaffolds files, organizes directory trees, and auto-completes logic.
                    </p>
                  </div>
                </div>

                <div className="timeline-step" id="step-4-execute">
                  <div className="step-badge">4</div>
                  <div className="step-content">
                    <h3>Run in Cloud Container (<kbd>F5</kbd>)</h3>
                    <p>
                      Click the green <strong>Run</strong> button or press <kbd>F5</kbd> to compile and execute your code in an isolated cloud container with real-time logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOPIC 3: ZERO SETUP & ANY DEVICE */}
          {activeTopicId === "any-device" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                VocodeAI was architected to eliminate hardware barriers. By executing all compilers, language servers, and AI reasoning inside remote cloud clusters, your device functions as a lightweight, zero-latency viewport.
              </p>

              <div className="docs-subheading-anchor" id="device-matrix">
                <h2 className="docs-h2">Device Capability Matrix</h2>
                <p className="docs-paragraph">
                  Whether using high-end workstations or budget tablets, you get the exact same compute horsepower:
                </p>
              </div>

              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Device Category</th>
                      <th>Supported Environment</th>
                      <th>Local RAM Usage</th>
                      <th>Ideal Developer Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Mac, Windows & Linux</strong></td>
                      <td>Chrome, Safari, Brave, Firefox</td>
                      <td>~180 MB</td>
                      <td>Full desktop engineering without fan noise or battery drain.</td>
                    </tr>
                    <tr>
                      <td><strong>iPads & Android Tablets</strong></td>
                      <td>Safari / Mobile Chrome + Keyboard</td>
                      <td>~150 MB</td>
                      <td>Lightweight travel coding, algorithmic practice, and code review.</td>
                    </tr>
                    <tr>
                      <td><strong>Smartphones (iOS & Android)</strong></td>
                      <td>Mobile Safari, Chrome</td>
                      <td>~110 MB</td>
                      <td>Emergency on-call hotfixes, voice dictation, and PR reviews.</td>
                    </tr>
                    <tr>
                      <td><strong>Chromebooks & Budget PCs</strong></td>
                      <td>ChromeOS, Ubuntu, Windows 10/11</td>
                      <td>~160 MB</td>
                      <td>Heavy compilation and ML models on \$150 hardware with 0 MB disk burden.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="docs-glass-callout pro-tip" id="zero-disk-footprint">
                <div className="callout-indicator-bar green" />
                <div>
                  <h4 className="callout-title">Why 0 MB Local Storage Matters</h4>
                  <p className="callout-desc">
                    Traditional development environments consume upwards of 20GB to 50GB of disk space for Node toolchains, Python virtual environments, and Docker caches.
                    With VocodeAI, your machine stores <strong>0 MB</strong> of project dependencies. Close your browser and your local drive remains completely clean.
                  </p>
                </div>
              </div>

              <div className="docs-subheading-anchor" id="browser-tech">
                <h2 className="docs-h2">In-Browser Execution Stack</h2>
                <p className="docs-paragraph">
                  VocodeAI achieves native desktop responsiveness by offloading heavy language servers to cloud workers, streaming Monaco Editor tokens over optimized WebSockets, and rendering live terminal output at 60fps via xterm.js.
                </p>
              </div>
            </div>
          )}

          {/* TOPIC 4: CLOUD STORAGE & PERSISTENCE */}
          {activeTopicId === "cloud-storage" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                All files, directory trees, chat sessions, and terminal states are continuously synchronized to resilient cloud storage. You never need to worry about losing uncommitted work or manually pushing to Git before closing your machine.
              </p>

              <div className="docs-subheading-anchor" id="keystroke-sync">
                <h2 className="docs-h2">Continuous Keystroke Sync</h2>
                <p className="docs-paragraph">
                  Keystroke changes are debounced at 400ms intervals and streamed over secure WebSockets to MongoDB FileNodes. Even during browser tab crashes, your cursor position and uncommitted edits are instantly recovered.
                </p>
              </div>

              <div className="docs-features-grid">
                <div className="docs-card" id="recycle-bin">
                  <div className="docs-card-icon-wrap coral">
                    <ShieldCheck size={20} />
                  </div>
                  <h3>Soft-Delete Recycle Bin</h3>
                  <p>
                    Accidentally deleted a module? Files are moved to your workspace Recycle Bin where they can be restored with 1-click.
                  </p>
                </div>

                <div className="docs-card" id="session-handoff">
                  <div className="docs-card-icon-wrap blue">
                    <Layers size={20} />
                  </div>
                  <h3>Cross-Device Session Handoff</h3>
                  <p>
                    Start writing an algorithm on your desktop, shut the lid, and immediately open your tablet on the train to find your exact cursor position.
                  </p>
                </div>
              </div>

              <div className="docs-subheading-anchor" id="export-zip">
                <h2 className="docs-h2">One-Click Workspace Export</h2>
                <p className="docs-paragraph">
                  Need an offline bundle or GitHub push? From the workspace toolbar, click <code>Export ZIP</code> to download your entire project repository as a clean archive with all folders, dependencies, and dotfiles preserved.
                </p>
              </div>
            </div>
          )}

          {/* TOPIC 5: HOW AI ENGINE WORKS */}
          {activeTopicId === "ai-engine" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                VocodeAI's pair programmer operates on an autonomous bidirectional action loop that directly interfaces with the virtual file system and execution runtime.
              </p>

              <div className="docs-subheading-anchor" id="execution-loop">
                <h2 className="docs-h2">Bidirectional Execution Loop</h2>
                <p className="docs-paragraph">
                  When you prompt VocodeAI, the system resolves your project AST, inspects active editor tabs, and dispatches structured actions:
                </p>
              </div>

              <div className="docs-workflow-flowchart">
                <div className="flow-step">
                  <div className="flow-circle">1</div>
                  <span>Voice / Text Prompt</span>
                </div>
                <div className="flow-connector">→</div>
                <div className="flow-step">
                  <div className="flow-circle">2</div>
                  <span>AST & Repo Context</span>
                </div>
                <div className="flow-connector">→</div>
                <div className="flow-step">
                  <div className="flow-circle">3</div>
                  <span>Action Protocol Engine</span>
                </div>
                <div className="flow-connector">→</div>
                <div className="flow-step highlight">
                  <div className="flow-circle">4</div>
                  <span>Multi-File CRUD Execution</span>
                </div>
                <div className="flow-connector">→</div>
                <div className="flow-step">
                  <div className="flow-circle">5</div>
                  <span>Live Container Run</span>
                </div>
              </div>

              <div className="docs-glass-callout info" id="action-protocol">
                <div className="callout-indicator-bar info" />
                <div>
                  <h4 className="callout-title">Structured Action Protocol</h4>
                  <p className="callout-desc">
                    Unlike traditional chatbots that merely output conversational text, VocodeAI emits structured JSON action payloads (such as <code>create_file</code>, <code>write_file</code>, <code>delete_file</code>, and <code>run_code</code>).
                    The server validates and applies these changes directly to the cloud filesystem, seamlessly updating your editor tabs.
                  </p>
                </div>
              </div>

              <div className="docs-subheading-anchor" id="file-tree-updates">
                <h2 className="docs-h2">Multi-File AST Context</h2>
                <p className="docs-paragraph">
                  VocodeAI traverses module imports, type definitions, and sibling files so that renaming a function in one file automatically updates references across your whole codebase.
                </p>
              </div>
            </div>
          )}

          {/* TOPIC 6: VOICE & VISION SUPPORT */}
          {activeTopicId === "voice-multimodal" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                VocodeAI enables natural developer speech and visual debugging. You can attach terminal screenshots, mockups, or speak technical commands naturally.
              </p>

              <div className="docs-subheading-anchor" id="speech-engine">
                <h2 className="docs-h2">Voice Engine & Wake Commands</h2>
                <p className="docs-paragraph">
                  Click the microphone icon in the chat bar to dictate instructions. The audio pipeline cleans background noise, detects code syntax, and streams speech tokens to Gemini 2.5 with sub-200ms latency.
                </p>
              </div>

              <div className="docs-subheading-anchor" id="commands-cheatsheet">
                <h2 className="docs-h2">Spoken Commands Cheatsheet</h2>
              </div>

              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Spoken Voice Command</th>
                      <th>Automated Platform Action</th>
                      <th>Context Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>"Create a REST API with Express and JWT"</code></td>
                      <td>Scaffolds <code>server.ts</code>, <code>auth.ts</code>, installs dependencies, and tests server.</td>
                      <td>New or existing workspace</td>
                    </tr>
                    <tr>
                      <td><code>"Fix compiler error on line 42"</code></td>
                      <td>Inspects stack trace, locates syntax or type bug, and replaces faulty block.</td>
                      <td>Active open file</td>
                    </tr>
                    <tr>
                      <td><code>"Write unit tests with Jest for this module"</code></td>
                      <td>Generates <code>module.test.ts</code> with 100% boundary test coverage.</td>
                      <td>Active file + exports</td>
                    </tr>
                    <tr>
                      <td><code>"Explain what this regex does step-by-step"</code></td>
                      <td>Analyzes token by token and displays formatted breakdown in AI chat.</td>
                      <td>Selected code block</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="docs-subheading-anchor" id="vision-debugging">
                <h2 className="docs-h2">Visual Bug & Screenshot Fixes</h2>
                <p className="docs-paragraph">
                  Paste or drag an error screenshot from your terminal, browser console, or Figma layout into the prompt box. The vision model extracts stack traces, pinpoints erroneous lines, and outputs a one-click diff.
                </p>
              </div>
            </div>
          )}

          {/* TOPIC 7: SYSTEM ARCHITECTURE */}
          {activeTopicId === "architecture" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                Engineered with a high-concurrency microservices stack designed for zero latency and hardened sandbox isolation.
              </p>

              <div className="docs-arch-grid">
                <div className="arch-card" id="arch-frontend">
                  <div className="arch-header">
                    <Code2 size={18} className="arch-icon green" />
                    <h3>Frontend Viewport</h3>
                  </div>
                  <p>React 18 + Vite SPA paired with Monaco Editor (VS Code engine) and xterm.js for zero-lag terminal emulation.</p>
                  <div className="arch-tags">
                    <span>React 18</span>
                    <span>Monaco Editor</span>
                    <span>xterm.js</span>
                    <span>Vite</span>
                  </div>
                </div>

                <div className="arch-card" id="arch-gateway">
                  <div className="arch-header">
                    <Server size={18} className="arch-icon coral" />
                    <h3>WebSocket Gateway</h3>
                  </div>
                  <p>Node.js & Express orchestration server handling authentication, JWT tokens, file streaming, and pty terminal sockets.</p>
                  <div className="arch-tags">
                    <span>Express</span>
                    <span>WebSocket</span>
                    <span>node-pty</span>
                    <span>JWT Auth</span>
                  </div>
                </div>

                <div className="arch-card" id="arch-persistence">
                  <div className="arch-header">
                    <Database size={18} className="arch-icon blue" />
                    <h3>Persistence Layer</h3>
                  </div>
                  <p>MongoDB Atlas stores workspace metadata, hierarchical FileNodes, chats, and soft-delete archives with continuous sync.</p>
                  <div className="arch-tags">
                    <span>MongoDB Atlas</span>
                    <span>Mongoose</span>
                    <span>Recycle Bin</span>
                    <span>Redis Cache</span>
                  </div>
                </div>

                <div className="arch-card" id="arch-sandbox">
                  <div className="arch-header">
                    <Cpu size={18} className="arch-icon yellow" />
                    <h3>Cloud Container Sandboxes</h3>
                  </div>
                  <p>Isolated Docker containers with strict cgroups, memory caps, and automated idle container reaping for security.</p>
                  <div className="arch-tags">
                    <span>Dockerode</span>
                    <span>Alpine / Ubuntu</span>
                    <span>Sandbox Reaper</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOPIC 8: CODE & API REFERENCE */}
          {activeTopicId === "api-reference" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                Key endpoints for programmatically executing AI tasks or streaming live HTML preview sessions.
              </p>

              <div className="docs-subheading-anchor" id="api-ai-endpoint">
                <h2 className="docs-h2">POST /api/ai Execution</h2>
                <p className="docs-paragraph">
                  Send requests with your JWT bearer token to execute code generation or refactoring tasks programmatically:
                </p>
              </div>

              {/* Language Switcher on Code Block */}
              <div className="docs-code-container" id="api-multilang-examples">
                <div className="code-top-header">
                  <div className="code-title-group">
                    <span className="code-method-badge post">POST</span>
                    <span className="code-endpoint">/api/ai</span>
                  </div>

                  <div className="code-lang-selector">
                    <button
                      className={`lang-tab-btn ${activeApiLang === "javascript" ? "active" : ""}`}
                      onClick={() => setActiveApiLang("javascript")}
                    >
                      JavaScript
                    </button>
                    <button
                      className={`lang-tab-btn ${activeApiLang === "python" ? "active" : ""}`}
                      onClick={() => setActiveApiLang("python")}
                    >
                      Python
                    </button>
                    <button
                      className={`lang-tab-btn ${activeApiLang === "curl" ? "active" : ""}`}
                      onClick={() => setActiveApiLang("curl")}
                    >
                      cURL
                    </button>
                  </div>

                  <button
                    className="code-copy-btn"
                    onClick={() => {
                      const snippet =
                        activeApiLang === "javascript"
                          ? `const res = await fetch("/api/ai", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    Authorization: \`Bearer \${token}\`\n  },\n  body: JSON.stringify({\n    message: "Create a binary search function",\n    workspaceId: "6ae2e83a...",\n    activeFile: "Search.java"\n  })\n});\nconst data = await res.json();`
                          : activeApiLang === "python"
                          ? `import httpx\n\nres = httpx.post(\n    "https://api.vocode.ai/api/ai",\n    headers={"Authorization": f"Bearer {token}"},\n    json={\n        "message": "Create a binary search function",\n        "workspaceId": "6ae2e83a...",\n        "activeFile": "Search.java"\n    }\n)\ndata = res.json()`
                          : `curl -X POST https://api.vocode.ai/api/ai \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "message": "Create a binary search function",\n    "workspaceId": "6ae2e83a...",\n    "activeFile": "Search.java"\n  }'`;
                      handleCopyCode("api-code", snippet);
                    }}
                  >
                    {copiedId === "api-code" ? (
                      <>
                        <Check size={14} className="copied-check" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="docs-pre-code">
                  {activeApiLang === "javascript" && (
                    <code>{`// Execute AI action request via JavaScript
const res = await fetch("/api/ai", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${token}\`
  },
  body: JSON.stringify({
    message: "Create a binary search function",
    workspaceId: "6ae2e83a3e419acbb9a26a49",
    activeFile: "Search.java",
    attachments: []
  })
});

const data = await res.json();
console.log("Actions executed:", data.ai?.actions);`}</code>
                  )}

                  {activeApiLang === "python" && (
                    <code>{`# Execute AI action request via Python
import httpx

res = httpx.post(
    "https://api.vocode.ai/api/ai",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "message": "Create a binary search function",
        "workspaceId": "6ae2e83a3e419acbb9a26a49",
        "activeFile": "Search.java",
        "attachments": []
    }
)

data = res.json()
print("Actions executed:", data.get("ai", {}).get("actions"))`}</code>
                  )}

                  {activeApiLang === "curl" && (
                    <code>{`# Execute AI action request via cURL
curl -X POST https://api.vocode.ai/api/ai \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Create a binary search function",
    "workspaceId": "6ae2e83a3e419acbb9a26a49",
    "activeFile": "Search.java",
    "attachments": []
  }'`}</code>
                  )}
                </pre>
              </div>

              <div className="docs-subheading-anchor" id="api-preview-routes">
                <h2 className="docs-h2">GET /preview Live URLs</h2>
                <p className="docs-paragraph">
                  Any static web project can be previewed live at:
                </p>
                <div className="docs-url-pill">
                  <code>https://api.vocode.ai/preview/:userId/:workspaceId/index.html</code>
                </div>
              </div>
            </div>
          )}

          {/* TOPIC 9: KEYBOARD SHORTCUTS */}
          {activeTopicId === "shortcuts" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                Fly through your code editor and terminal with native desktop-grade key combinations.
              </p>

              <div className="docs-subheading-anchor" id="shortcuts-global">
                <h2 className="docs-h2">Global IDE Hotkeys</h2>
              </div>

              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Shortcut</th>
                      <th>Action</th>
                      <th>Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><kbd>F5</kbd></td>
                      <td>Run active code file in Docker container</td>
                      <td>Global IDE</td>
                    </tr>
                    <tr id="shortcuts-editor">
                      <td><kbd>Alt</kbd> + <kbd>P</kbd></td>
                      <td>Open Live HTML Preview in new browser tab</td>
                      <td>Code Editor</td>
                    </tr>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>S</kbd> / <kbd>⌘</kbd> + <kbd>S</kbd></td>
                      <td>Force sync current file to database and disk</td>
                      <td>Code Editor</td>
                    </tr>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd></td>
                      <td>Focus Search bar in Workspace & Dashboard</td>
                      <td>Global</td>
                    </tr>
                    <tr id="shortcuts-terminal">
                      <td><kbd>Ctrl</kbd> + <kbd>`</kbd></td>
                      <td>Toggle Cloud Terminal drawer</td>
                      <td>Global IDE</td>
                    </tr>
                    <tr>
                      <td><kbd>Right Click</kbd></td>
                      <td>Show Live Preview & Monaco editing actions</td>
                      <td>Code Editor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TOPIC 10: BEST PRACTICES */}
          {activeTopicId === "best-practices" && (
            <div className="docs-topic-body animate-fade-in">
              <p className="docs-lead-text">
                Guidelines to maximize productivity, avoid common pitfalls, and leverage AI pair programming effectively.
              </p>

              <div className="docs-tips-list">
                <div className="tip-box green" id="prompt-targeting">
                  <div className="tip-icon-col">
                    <Lightbulb size={20} />
                  </div>
                  <div className="tip-body">
                    <h4>Target Filenames in Spoken Prompts</h4>
                    <p>
                      When speaking or typing prompts, mention the specific target file (e.g., <code>"write a quicksort function in Sort.java"</code>).
                      This directs VocodeAI to edit the exact file in place rather than generating unnecessary new modules.
                    </p>
                  </div>
                </div>

                <div className="tip-box coral" id="recycle-recovery">
                  <div className="tip-icon-col">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="tip-body">
                    <h4>Recycle Bin File Recovery</h4>
                    <p>
                      Deleted files and directories are never wiped immediately; they are safely stored in your <strong>Recycle Bin</strong>.
                      You can restore complete folder structures with a single click.
                    </p>
                  </div>
                </div>

                <div className="tip-box blue" id="stacktrace-screenshots">
                  <div className="tip-icon-col">
                    <Info size={20} />
                  </div>
                  <div className="tip-body">
                    <h4>Attach Screenshots for Instant Stack Trace Fixes</h4>
                    <p>
                      Instead of copying hundreds of lines of stack traces from terminal or browser consoles, drag or paste the screenshot directly into the chat.
                      The multimodal vision model pinpoints line numbers and generates direct patches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Feedback & Navigation Buttons */}
          <div className="docs-feedback-card">
            <div className="feedback-text-col">
              <strong>Was this documentation helpful?</strong>
              <p>Your feedback helps our team improve the VocodeAI experience.</p>
            </div>
            <div className="feedback-buttons-row">
              <button
                className={`feedback-btn ${feedbackGiven === "yes" ? "active" : ""}`}
                onClick={() => setFeedbackGiven("yes")}
              >
                <ThumbsUp size={14} />
                <span>Yes</span>
              </button>
              <button
                className={`feedback-btn ${feedbackGiven === "no" ? "active" : ""}`}
                onClick={() => setFeedbackGiven("no")}
              >
                <ThumbsDown size={14} />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Prev / Next Pagination (Topic to Topic) */}
          <div className="docs-pagination-row">
            {prevTopic ? (
              <button className="pag-btn prev" onClick={() => handleSelectTopic(prevTopic.id)}>
                <span className="pag-dir">← Previous Topic</span>
                <span className="pag-title">{prevTopic.label}</span>
              </button>
            ) : <div />}

            {nextTopic && (
              <button className="pag-btn next" onClick={() => handleSelectTopic(nextTopic.id)}>
                <span className="pag-dir">Next Topic →</span>
                <span className="pag-title">{nextTopic.label}</span>
              </button>
            )}
          </div>

          {/* Documentation Footer */}
          <footer className="docs-article-footer">
            <div className="docs-footer-row">
              <div>
                <h4>Ready to start building?</h4>
                <p>Launch your cloud workspace with integrated AI assistance now.</p>
              </div>
              <button className="docs-enter-cta-btn" onClick={handleEnterApp}>
                <span>Get Started with VocodeAI</span>
                <ArrowRight size={15} />
              </button>
            </div>
            <div className="docs-footer-bottom">
              <span>© {new Date().getFullYear()} VocodeAI Inc. All rights reserved.</span>
              <div className="docs-footer-links">
                <a href="/">Home</a>
                <a href="/docs">Docs</a>
                <a href="/login">Sign In</a>
              </div>
            </div>
          </footer>
        </main>

        {/* -------------------------------------------------------
           C. RIGHT STICKY "ON THIS PAGE" (Current Topic Subheadings)
           ------------------------------------------------------- */}
        <aside className="docs-toc-sidebar">
          <div className="toc-sticky-container">
            <div className="toc-header">
              <Hash size={14} className="toc-header-icon" />
              <span>ON THIS PAGE</span>
            </div>

            {/* List ONLY the sub-sections of the CURRENT active topic */}
            <nav className="toc-links-list">
              {currentTopic.subheadings && currentTopic.subheadings.length > 0 ? (
                currentTopic.subheadings.map((sub) => (
                  <button
                    key={sub.id}
                    className={`toc-link-item ${activeSubheadingId === sub.id ? "active" : ""}`}
                    onClick={() => handleScrollToSubheading(sub.id)}
                  >
                    <span className="toc-bullet">•</span>
                    <span>{sub.label}</span>
                  </button>
                ))
              ) : (
                <span className="toc-empty-msg">Section overview</span>
              )}
            </nav>

            {/* Quick Actions & Community Box */}
            <div className="toc-community-box">
              <span className="community-title">Quick Actions</span>
              <button className="toc-action-pill-btn" onClick={handleSharePage}>
                {pageShareCopied ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Share This Guide</span>
                  </>
                )}
              </button>

              <button className="toc-action-pill-btn" onClick={handleEnterApp}>
                <Zap size={13} />
                <span>Launch Cloud Studio</span>
              </button>

              <div className="toc-divider" />
              <span className="community-sub">Need help?</span>
              <a
                href="mailto:supportvocodeai@gmail.com"
                className="toc-community-link"
              >
                <span>Contact Engineering</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

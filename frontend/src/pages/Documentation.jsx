import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Mic,
  Bug,
  Code2,
  Cpu,
  Database,
  Server,
  Globe,
  Wrench,
  Zap,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  ArrowRight,
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
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import "../styles/Documentation.css";

const DOCS_SECTIONS = [
  { id: "overview", label: "What is VocodeAI?", category: "GETTING STARTED", icon: Sparkles },
  { id: "quickstart", label: "Quickstart Guide", category: "GETTING STARTED", icon: Zap },
  { id: "ai-engine", label: "How AI Engine Works", category: "AI CAPABILITIES", icon: Cpu },
  { id: "voice-multimodal", label: "Voice & Vision Support", category: "AI CAPABILITIES", icon: Mic },
  { id: "architecture", label: "System Architecture", category: "ARCHITECTURE", icon: Server },
  { id: "api-reference", label: "Code & API Reference", category: "DEVELOPER REFERENCE", icon: Code2 },
  { id: "shortcuts", label: "Keyboard Shortcuts", category: "DEVELOPER REFERENCE", icon: Terminal },
  { id: "best-practices", label: "Tips & Best Practices", category: "GUIDELINES", icon: Lightbulb },
];

export default function Documentation() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Dual Theme Support matching Landing & Dashboard
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  const [activeSection, setActiveSection] = useState("overview");
  const [progress, setProgress] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sectionRefs = useRef({});

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

  // Scroll spy & reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrolled)));

      const scrollPos = window.scrollY + 180;
      for (let i = DOCS_SECTIONS.length - 1; i >= 0; i--) {
        const item = DOCS_SECTIONS[i];
        const el = sectionRefs.current[item.id];
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    setMobileSidebarOpen(false);
    const el = sectionRefs.current[id];
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleCopyCode = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group sections by category
  const categories = Array.from(new Set(DOCS_SECTIONS.map((s) => s.category)));

  // Filter sections based on search query
  const filteredSections = DOCS_SECTIONS.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`docs-page-container ${theme}`}>
      {/* Reading Progress Top Bar */}
      <div
        className="docs-reading-progress-bar"
        style={{ width: `${progress}%` }}
      />

      {/* Top Technical Navbar */}
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <div className="docs-brand-left" onClick={() => navigate("/")} role="button" tabIndex={0}>
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="docs-brand-logo"
            />
            <span className="docs-brand-pill">Docs</span>
          </div>

          <div className="docs-topbar-search">
            <Search size={15} className="docs-search-icon" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="docs-search-input"
            />
            <kbd className="docs-search-kbd">⌘K</kbd>
          </div>

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

      {/* Main Documentation Layout (Sticky Sidebar + Article Body) */}
      <div className="docs-body-layout">
        {/* Backdrop for mobile sidebar */}
        {mobileSidebarOpen && (
          <div
            className="docs-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sticky Sidebar */}
        <aside className={`docs-sidebar-nav ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          <div className="docs-sidebar-header">
            <BookOpen size={16} className="docs-sidebar-icon" />
            <span>DOCUMENTATION</span>
          </div>

          <div className="docs-sidebar-categories">
            {categories.map((cat) => {
              const items = (searchQuery ? filteredSections : DOCS_SECTIONS).filter(
                (s) => s.category === cat
              );
              if (items.length === 0) return null;

              return (
                <div key={cat} className="docs-category-group">
                  <span className="docs-category-title">{cat}</span>
                  <div className="docs-category-links">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          className={`docs-nav-link ${isActive ? "active" : ""}`}
                          onClick={() => scrollTo(item.id)}
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
                <strong>VocodeAI Assistant</strong>
                <p>Autonomous AI pair programmer with cloud sandbox.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Article Content Area */}
        <main className="docs-content-area">
          {/* ================= 1. OVERVIEW ================= */}
          <section
            id="overview"
            ref={(el) => (sectionRefs.current["overview"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Sparkles size={13} />
              <span>OVERVIEW</span>
            </div>

            <h1 className="docs-h1">
              VocodeAI <span className="accent-highlight">Documentation</span>
            </h1>

            <p className="docs-lead-text">
              VocodeAI is an autonomous, AI-powered cloud IDE engineered for high-speed software development.
              It unites real-time code generation, multimodal vision, voice commands, and zero-latency Docker execution in a single browser workspace.
            </p>

            <div className="docs-meta-bar">
              <span className="meta-badge">v1.2.0 Production</span>
              <span className="meta-dot">•</span>
              <span>10 min read</span>
              <span className="meta-dot">•</span>
              <span>Updated for Node 20, Python 3, OpenJDK 17 & GCC</span>
            </div>

            <div className="docs-glass-callout">
              <div className="callout-indicator-bar" />
              <div>
                <h4 className="callout-title">Core Philosophy: Zero Setup, Instant Execution</h4>
                <p className="callout-desc">
                  Traditional web editors force developers to configure local environments, container daemons, or complex toolchains. VocodeAI handles sandbox provisioning, file persistence in MongoDB, and compiler execution automatically inside secure Linux containers.
                </p>
              </div>
            </div>

            <div className="docs-features-grid">
              <div className="docs-card">
                <div className="docs-card-icon-wrap green">
                  <Sparkles size={20} />
                </div>
                <h3>Autonomous AI Pair Programmer</h3>
                <p>
                  Generates production-ready code, refactors legacy methods, and performs multi-file operations across your workspace.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap coral">
                  <Globe size={20} />
                </div>
                <h3>Isolated Cloud Sandboxes</h3>
                <p>
                  Every workspace runs within a secure Docker container supporting Java, Python, C++, Node.js, and Bash terminals.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap blue">
                  <Mic size={20} />
                </div>
                <h3>Voice-Assisted Coding</h3>
                <p>
                  Speak natural language commands or dictate complex programming algorithms directly into the AI assistant hands-free.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap yellow">
                  <Eye size={20} />
                </div>
                <h3>Live Web & HTML Preview</h3>
                <p>
                  Instantly preview HTML, CSS, and client-side JavaScript pages with full asset rendering in a dedicated browser tab.
                </p>
              </div>
            </div>
          </section>

          {/* ================= 2. QUICKSTART ================= */}
          <section
            id="quickstart"
            ref={(el) => (sectionRefs.current["quickstart"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Zap size={13} />
              <span>GETTING STARTED</span>
            </div>

            <h2 className="docs-h2">Quickstart Guide</h2>
            <p className="docs-paragraph">
              Spin up your first cloud workspace in under 30 seconds with no command line installation required.
            </p>

            <div className="docs-steps-timeline">
              <div className="timeline-step">
                <div className="step-badge">1</div>
                <div className="step-content">
                  <h3>Create or Select a Workspace</h3>
                  <p>
                    From your <strong>Dashboard</strong>, click <code>+ Create Workspace</code>, choose a template (such as Java, Python, Web, or Fullstack), and name your project.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-badge">2</div>
                <div className="step-content">
                  <h3>Edit Files in Monaco Editor</h3>
                  <p>
                    Use the left-hand Explorer to create, rename, or organize files. The editor includes full VS Code keybindings, syntax highlighting, and auto-completion.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-badge">3</div>
                <div className="step-content">
                  <h3>Run Code in 1-Click</h3>
                  <p>
                    Press the green <strong>Run</strong> button in the top navigation bar (or press <kbd>F5</kbd>) to compile and execute your code in an isolated Docker container.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-badge">4</div>
                <div className="step-content">
                  <h3>Live HTML Preview</h3>
                  <p>
                    When editing any <code>.html</code> file, the Run button automatically converts into <strong>Preview</strong>. Click it or right-click anywhere in the editor and choose <strong>Live Preview</strong> to inspect your page in a new browser tab.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= 3. AI ENGINE ================= */}
          <section
            id="ai-engine"
            ref={(el) => (sectionRefs.current["ai-engine"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Cpu size={13} />
              <span>CORE ARCHITECTURE</span>
            </div>

            <h2 className="docs-h2">How the AI Engine Works</h2>
            <p className="docs-paragraph">
              VocodeAI's pair programmer operates on a bidirectional multi-action execution loop that directly interfaces with the virtual file system and execution runtime.
            </p>

            <div className="docs-workflow-flowchart">
              <div className="flow-step">
                <div className="flow-circle">1</div>
                <span>Prompt & Voice Input</span>
              </div>
              <div className="flow-connector">→</div>
              <div className="flow-step">
                <div className="flow-circle">2</div>
                <span>AST & Workspace Context</span>
              </div>
              <div className="flow-connector">→</div>
              <div className="flow-step">
                <div className="flow-circle">3</div>
                <span>Autonomous Action Parser</span>
              </div>
              <div className="flow-connector">→</div>
              <div className="flow-step highlight">
                <div className="flow-circle">4</div>
                <span>Multi-File CRUD Execution</span>
              </div>
              <div className="flow-connector">→</div>
              <div className="flow-step">
                <div className="flow-circle">5</div>
                <span>Live Container Output</span>
              </div>
            </div>

            <div className="docs-glass-callout info">
              <div className="callout-indicator-bar info" />
              <div>
                <h4 className="callout-title">Structured Action Protocol</h4>
                <p className="callout-desc">
                  Unlike traditional chatbots that simply print raw text, VocodeAI emits structured JSON action payloads (such as <code>create_file</code>, <code>write_file</code>, <code>delete_file</code>, and <code>run_code</code>). The backend safely executes these changes across MongoDB and the local filesystem, automatically refreshing editor tabs.
                </p>
              </div>
            </div>
          </section>

          {/* ================= 4. VISION & MULTIMODAL ================= */}
          <section
            id="voice-multimodal"
            ref={(el) => (sectionRefs.current["voice-multimodal"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Mic size={13} />
              <span>MULTIMODAL INTELLIGENCE</span>
            </div>

            <h2 className="docs-h2">Voice Commands & Multimodal Vision</h2>
            <p className="docs-paragraph">
              VocodeAI is equipped with multimodal reasoning capabilities, allowing you to attach screenshots, visual bugs, and entire directory structures directly to the prompt.
            </p>

            <div className="docs-features-grid">
              <div className="docs-card">
                <div className="docs-card-icon-wrap coral">
                  <Eye size={20} />
                </div>
                <h3>Screenshot & Visual Bug Debugging</h3>
                <p>
                  Paste or attach an error screenshot from your terminal, browser console, or UI mockup. The vision engine analyzes stack traces and fixes the code instantly.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap green">
                  <FolderTree size={20} />
                </div>
                <h3>Directory & Workspace Attachment</h3>
                <p>
                  Attach entire workspace folders using the <code>+</code> paperclip button. The AI recursively inspects file dependencies, import paths, and module hierarchies.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap blue">
                  <Mic size={20} />
                </div>
                <h3>Natural Voice Dictation</h3>
                <p>
                  Click the microphone icon in the chat bar to dictate code requests, algorithms, or refactoring requirements using real-time speech-to-text.
                </p>
              </div>

              <div className="docs-card">
                <div className="docs-card-icon-wrap yellow">
                  <FileCode2 size={20} />
                </div>
                <h3>Chat History Archival</h3>
                <p>
                  Save any conversation directly into your project as a Markdown file (<code>chats/*.chat.md</code>) or clear sessions from MongoDB with one click.
                </p>
              </div>
            </div>
          </section>

          {/* ================= 5. ARCHITECTURE ================= */}
          <section
            id="architecture"
            ref={(el) => (sectionRefs.current["architecture"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Server size={13} />
              <span>INFRASTRUCTURE</span>
            </div>

            <h2 className="docs-h2">System Architecture</h2>
            <p className="docs-paragraph">
              Built with a modern microservices-inspired architecture designed for high concurrency, zero latency, and strict security isolation.
            </p>

            <div className="docs-arch-grid">
              <div className="arch-card">
                <div className="arch-header">
                  <Code2 size={18} className="arch-icon green" />
                  <h3>Frontend Layer</h3>
                </div>
                <p>React 18 + Vite SPA paired with Monaco Editor (VS Code core) and xterm.js for zero-lag terminal emulation.</p>
                <div className="arch-tags">
                  <span>React</span>
                  <span>Monaco</span>
                  <span>xterm.js</span>
                  <span>Vite</span>
                </div>
              </div>

              <div className="arch-card">
                <div className="arch-header">
                  <Server size={18} className="arch-icon coral" />
                  <h3>API & WebSocket Gateway</h3>
                </div>
                <p>Node.js & Express orchestration server handling authentication, JWT tokens, file streaming, and bidirectional terminal WebSockets.</p>
                <div className="arch-tags">
                  <span>Express</span>
                  <span>WebSocket (ws)</span>
                  <span>node-pty</span>
                  <span>Passport</span>
                </div>
              </div>

              <div className="arch-card">
                <div className="arch-header">
                  <Database size={18} className="arch-icon blue" />
                  <h3>Persistence & Storage</h3>
                </div>
                <p>MongoDB Atlas stores users, workspace metadata, hierarchical FileNodes, chat sessions, and a soft-delete Recycle Bin.</p>
                <div className="arch-tags">
                  <span>MongoDB</span>
                  <span>Mongoose</span>
                  <span>RecycleBin</span>
                  <span>Redis</span>
                </div>
              </div>

              <div className="arch-card">
                <div className="arch-header">
                  <Cpu size={18} className="arch-icon yellow" />
                  <h3>Container Sandbox</h3>
                </div>
                <p>Dockerized sandboxes with resource limits, cgroups, and automatic idle container reaping for safe script execution.</p>
                <div className="arch-tags">
                  <span>Dockerode</span>
                  <span>Alpine Linux</span>
                  <span>Sandbox Reaper</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================= 6. CODE & API ================= */}
          <section
            id="api-reference"
            ref={(el) => (sectionRefs.current["api-reference"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Code2 size={13} />
              <span>DEVELOPER REFERENCE</span>
            </div>

            <h2 className="docs-h2">Code & API Reference</h2>
            <p className="docs-paragraph">
              Key endpoints and example integration snippets for programmatically interacting with the VocodeAI platform.
            </p>

            {/* Example 1: AI Chat Execution */}
            <div className="docs-code-container">
              <div className="code-top-header">
                <div className="code-title-group">
                  <span className="code-method-badge post">POST</span>
                  <span className="code-endpoint">/api/ai</span>
                  <span className="code-lang-label">JavaScript</span>
                </div>
                <button
                  className="code-copy-btn"
                  onClick={() =>
                    handleCopyCode(
                      "api-ai",
                      `const res = await fetch("/api/ai", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    Authorization: \`Bearer \${token}\`\n  },\n  body: JSON.stringify({\n    message: "Create a binary search function",\n    workspaceId: "6ae2e83a...",\n    activeFile: "Search.java",\n    attachments: []\n  })\n});\nconst data = await res.json();`
                    )
                  }
                >
                  {copiedId === "api-ai" ? (
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
                <code>{`// Execute AI action request
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
    attachments: [
      {
        type: "image",
        name: "spec.png",
        previewUrl: "data:image/png;base64,..."
      }
    ]
  })
});

const data = await res.json();
console.log("Actions executed:", data.ai?.actions);`}</code>
              </pre>
            </div>

            {/* Example 2: Live HTML Preview Route */}
            <div className="docs-code-container">
              <div className="code-top-header">
                <div className="code-title-group">
                  <span className="code-method-badge get">GET</span>
                  <span className="code-endpoint">/preview/:userId/:workspaceId/:file</span>
                  <span className="code-lang-label">Browser URL</span>
                </div>
                <button
                  className="code-copy-btn"
                  onClick={() =>
                    handleCopyCode(
                      "preview-url",
                      `http://localhost:8000/preview/<userId>/<workspaceId>/index.html`
                    )
                  }
                >
                  {copiedId === "preview-url" ? (
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
                <code>{`<!-- Preview any live workspace HTML, CSS, or JS file -->
http://localhost:8000/preview/6ae1942c/6ae2e83a/index.html

Features:
✔ Automatically serves latest content saved in MongoDB FileNode
✔ Relaxes strict CSP headers for inline scripts and styles
✔ Supports linked CSS, client-side JS, SVGs, and images`}</code>
              </pre>
            </div>
          </section>

          {/* ================= 7. SHORTCUTS ================= */}
          <section
            id="shortcuts"
            ref={(el) => (sectionRefs.current["shortcuts"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Terminal size={13} />
              <span>PRODUCTIVITY</span>
            </div>

            <h2 className="docs-h2">Keyboard Shortcuts & Cheatsheet</h2>
            <p className="docs-paragraph">
              Supercharge your development workflow with native editor and workspace key combinations.
            </p>

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
                    <td>Run active code file in Docker terminal</td>
                    <td>Global IDE</td>
                  </tr>
                  <tr>
                    <td><kbd>Alt</kbd> + <kbd>P</kbd></td>
                    <td>Open Live HTML Preview in new browser tab</td>
                    <td>Code Editor</td>
                  </tr>
                  <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>S</kbd> / <kbd>⌘</kbd> + <kbd>S</kbd></td>
                    <td>Save current file to database and disk</td>
                    <td>Code Editor</td>
                  </tr>
                  <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd></td>
                    <td>Focus Search bar in Workspace & Dashboard</td>
                    <td>Global</td>
                  </tr>
                  <tr>
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
          </section>

          {/* ================= 8. BEST PRACTICES ================= */}
          <section
            id="best-practices"
            ref={(el) => (sectionRefs.current["best-practices"] = el)}
            className="docs-article-section"
          >
            <div className="docs-section-tag">
              <Lightbulb size={13} />
              <span>PRO TIPS</span>
            </div>

            <h2 className="docs-h2">Tips & Best Practices</h2>
            <p className="docs-paragraph">
              Guidelines to maximize code quality, avoid common pitfalls, and leverage AI pair programming effectively.
            </p>

            <div className="docs-tips-list">
              <div className="tip-box green">
                <div className="tip-icon-col">
                  <Lightbulb size={20} />
                </div>
                <div className="tip-body">
                  <h4>Precise Prompting with Target Filenames</h4>
                  <p>
                    When asking the assistant to write algorithms or create components, specify the filename (e.g., <code>"write a quicksort function in Sort.java"</code>). This allows VocodeAI to target and patch the exact file directly without creating redundant temporary files.
                  </p>
                </div>
              </div>

              <div className="tip-box coral">
                <div className="tip-icon-col">
                  <AlertTriangle size={20} />
                </div>
                <div className="tip-body">
                  <h4>Recycle Bin Recovery</h4>
                  <p>
                    Deleted files and folders are never permanently destroyed immediately; they are moved to your <strong>Dashboard Recycle Bin</strong>. You can restore them with their entire folder hierarchy intact at any time.
                  </p>
                </div>
              </div>

              <div className="tip-box blue">
                <div className="tip-icon-col">
                  <Info size={20} />
                </div>
                <div className="tip-body">
                  <h4>Attach Screenshots for Instant Stack Trace Fixes</h4>
                  <p>
                    Instead of manually transcribing long terminal compiler exceptions or browser errors, simply copy or drag-and-drop the screenshot into the chat. The multimodal AI will parse the line numbers and generate the required bug fix.
                  </p>
                </div>
              </div>
            </div>
          </section>

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
              <span>© {new Date().getFullYear()} VocodeAI. All rights reserved.</span>
              <div className="docs-footer-links">
                <a href="/">Home</a>
                <a href="/docs">Docs</a>
                <a href="/login">Sign In</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

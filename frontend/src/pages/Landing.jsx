import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Rocket,
  ArrowRight,
  Play,
  BookOpen,
  Bot,
  Code2,
  Cloud,
  Mic,
  GraduationCap,
  Users,
  Trophy,
  Sun,
  Moon,
  Sparkles,
  FileCode2,
  FolderTree,
  Search,
  GitBranch,
  Settings,
  Menu,
  X,
  Check,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  HardDrive,
  ShieldCheck,
  Zap,
  Share2,
  Terminal,
  Cpu,
  Globe,
  RefreshCw,
  CheckCircle2,
  Volume2,
  ChevronRight,
  Layers,
  Lock,
  ChevronDown,
  Flame,
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Dark mode by default for premium developer aesthetic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState("voice");
  const [activeDeviceTab, setActiveDeviceTab] = useState("laptop");
  const [activePersona, setActivePersona] = useState("developers");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isVoiceSimulating, setIsVoiceSimulating] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Voice simulation pulse timer
  useEffect(() => {
    const timer = setInterval(() => {
      setIsVoiceSimulating((prev) => !prev);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  const handleEnter = () => {
    if (accessToken) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Device comparison data
  const deviceShowcases = {
    laptop: {
      title: "MacBook, Windows & Linux Laptops",
      subtitle: "Desktop-class power without the fan noise or battery drain",
      badge: "Full Desktop IDE",
      icon: Laptop,
      specs: [
        { label: "Local RAM Usage", value: "~180 MB (vs 4GB+ VS Code)" },
        { label: "Install Required", value: "Zero (Runs in any browser)" },
        { label: "Cloud Sync", value: "Instant, sub-millisecond" },
        { label: "Battery Impact", value: "Up to 3x longer battery life" },
      ],
      description:
        "Open your workspace on Chrome, Safari, or Brave. All compilation, AI indexing, and heavy language servers run in high-performance cloud clusters. Your laptop stays ice cold and dead quiet.",
      command: "$ vocode run --cloud-cluster us-east-1",
    },
    tablet: {
      title: "iPad & Android Tablets",
      subtitle: "Turn your ultra-portable tablet into a serious engineering studio",
      badge: "Touch & Keyboard Ready",
      icon: Tablet,
      specs: [
        { label: "Supported Browsers", value: "Safari, Chrome, Firefox" },
        { label: "External Keyboard", value: "Full keybinding & shortcut support" },
        { label: "Voice Mode", value: "Optimized dual-mic array intake" },
        { label: "Cloud Storage", value: "All files preserved in real-time" },
      ],
      description:
        "Pair your iPad with Magic Keyboard or use full touch controls. No need for complex jailbreaks or sideloading. You have a full Linux shell, Node/Python runtime, and AI pair programmer in Safari.",
      command: "VocodeAI Tablet OS • 100% Responsive Grid",
    },
    phone: {
      title: "Smartphones (iOS & Android)",
      subtitle: "Review code, debug emergency bugs & deploy on the move",
      badge: "Pocket Cloud IDE",
      icon: Smartphone,
      specs: [
        { label: "Voice Command", value: "Dictate fixes directly into code" },
        { label: "Emergency Hotfix", value: "Commit, test & deploy in 30 seconds" },
        { label: "Offline Resilience", value: "Cloud-queued auto-reconnection" },
        { label: "Setup Time", value: "0 sec — Just tap your bookmark" },
      ],
      description:
        "Stuck in a cab or walking when production triggers an alert? Open VocodeAI on your phone, speak the fix to the AI assistant, review the generated diff, run cloud tests, and deploy instantly.",
      command: "🎤 'Refactor auth middleware to handle null tokens'",
    },
    chromebook: {
      title: "Chromebooks & Lightweight PCs",
      subtitle: "Enterprise-grade compute on budget hardware with 0 MB disk footprint",
      badge: "Hardware Agnostic",
      icon: Monitor,
      specs: [
        { label: "Storage Required", value: "0 MB on local disk" },
        { label: "Heavy AI Compute", value: "Offloaded 100% to Cloud GPU/TPU" },
        { label: "Docker/Containers", value: "Runs in remote cloud micro-VMs" },
        { label: "OS Compatibility", value: "ChromeOS, Ubuntu, Windows 10/11" },
      ],
      description:
        "Schools, hackathons, and emerging developers often don't have $2,000 laptops. VocodeAI bridges the gap: run multi-gigabyte models and full-stack containers on a $150 Chromebook without breaking a sweat.",
      command: "Cloud Container: 8 vCPUs • 16GB RAM • Persistent SSD",
    },
  };

  // Persona data
  const personas = {
    developers: {
      title: "For Senior Engineers & Full-Stack Developers",
      tagline: "Cut the setup tax. Code at the speed of thought with voice & cloud compute.",
      points: [
        "Eliminate 'it works on my machine' forever with reproducible cloud environments.",
        "Voice-driven refactoring: tell the AI to rename variables, write unit tests, or restructure folders.",
        "Instant scratchpads: spin up temporary micro-environments in seconds for experimentation.",
        "Zero local disk clutter: keep your personal machine clean of gigabytes of dependency bloat.",
      ],
      metric: "4.8 hrs/week",
      metricLabel: "Saved on local environment troubleshooting",
      icon: Code2,
    },
    students: {
      title: "For Students & Computer Science Beginners",
      tagline: "Skip the 3-day environment setup agony. Start learning algorithms on Day 1.",
      points: [
        "No complex terminal configuration, compiler installations, or PATH environment nightmares.",
        "Interactive AI explanations: select any complex function and ask VocodeAI to explain line-by-line.",
        "Study from university computer labs, library loaner laptops, or personal tablets seamlessly.",
        "Built-in cloud storage ensures your coursework is never lost if your laptop battery dies.",
      ],
      metric: "98%",
      metricLabel: "Faster onboarding to first working Python/JS code",
      icon: GraduationCap,
    },
    hackathons: {
      title: "For Hackathon Teams & Startup Founders",
      tagline: "Ship production-ready MVPs before the countdown clock runs out.",
      points: [
        "Rapid multimodal scaffolding: generate boilerplate schemas, APIs, and client logic in minutes.",
        "Collaborative cloud workspace: share live links with teammates for zero-latency pair programming.",
        "Instant live web preview: demo your project to judges straight from the browser tab.",
        "Pre-installed packages: popular libraries (React, Express, FastAPI, PyTorch) ready out of the box.",
      ],
      metric: "10x",
      metricLabel: "Faster MVP prototyping from scratch to deploy",
      icon: Trophy,
    },
    nomads: {
      title: "For Digital Nomads & Remote Tech Teams",
      tagline: "Travel light. Your entire development workstation lives securely in the cloud.",
      points: [
        "Switch devices on the fly: begin on your home workstation, continue on your iPad in a cafe.",
        "End-to-end encrypted cloud storage with automatic version control and branch checkpoints.",
        "Low-bandwidth optimized streaming protocol ensures smooth editing even on spotty airport Wi-Fi.",
        "Enterprise-grade security isolation: zero client code stored on local unencrypted drives.",
      ],
      metric: "100%",
      metricLabel: "Cloud-synchronized state across unlimited devices",
      icon: Users,
    },
  };

  // FAQ items
  const faqs = [
    {
      q: "Can I really code from any device without installing anything?",
      a: "Yes! VocodeAI is a 100% browser-native cloud development environment. All you need is a modern web browser (Chrome, Safari, Edge, Firefox, or Brave). Whether you are on an Apple Silicon MacBook, a Windows desktop, an iPad with keyboard, an Android phone, or a low-cost Chromebook, you get the exact same powerful IDE, terminal, and AI pair programmer instantly.",
    },
    {
      q: "How does cloud storage and persistence work?",
      a: "Every keystroke, file change, dependency, and configuration is automatically backed up in real-time to resilient, distributed cloud storage. If your browser crashes, your laptop runs out of battery, or you close your tablet lid, you can immediately open VocodeAI on another device and resume with your cursor in the exact same position.",
    },
    {
      q: "Does VocodeAI eat up storage on my local computer?",
      a: "Zero megabytes! Traditional local development requires downloading Node.js, Python, compiler toolchains, Docker, and massive node_modules folders that consume 20GB+ of local disk space. VocodeAI executes everything in remote high-speed cloud containers, keeping your local machine completely spotless.",
    },
    {
      q: "How does the voice coding capability work?",
      a: "VocodeAI features a dedicated multimodal voice engine that understands natural developer speech. You can dictate code, describe architecture ('generate an async function that queries the Postgres user table and caches with Redis'), trigger builds, and navigate files without touching the keyboard. It filters background noise and supports technical jargon.",
    },
    {
      q: "Is there a free plan for students and solo developers?",
      a: "Yes! VocodeAI offers a generous Free Forever tier that gives you full access to the cloud editor, cloud storage, AI assistance, and instant cloud runtimes with zero credit card required.",
    },
  ];

  return (
    <div className={`vocode-app ${theme}`}>
      {/* Background Ambience Mesh & Grid Overlay */}
      <div className="background-grid" aria-hidden="true" />
      <div className="ambient-aurora ambient-aurora-1" />
      <div className="ambient-aurora ambient-aurora-2" />
      <div className="ambient-aurora ambient-aurora-3" />

      {/* =========================================================
         1. NAVIGATION BAR (MNC Glassmorphic Header)
         ========================================================= */}
      <header className="site-header">
        <div className="header-inner">
          {/* Logo & Brand Identity */}
          <div
            className="brand-identity"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Vocodeai — Home"
          >
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="brand-icon navbar-logo"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-menu" aria-label="Main Navigation">
            <button className="nav-item-link" onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button className="nav-item-link" onClick={() => scrollToSection("any-device")}>
              Any Device
            </button>
            <button className="nav-item-link" onClick={() => scrollToSection("cloud-storage")}>
              Cloud Storage
            </button>
            <button className="nav-item-link" onClick={() => scrollToSection("use-cases")}>
              Use Cases
            </button>
            <button className="nav-item-link" onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
            <button className="nav-item-link" onClick={() => navigate("/docs")}>
              Docs
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="header-actions">
            <button
              className="theme-switch-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle dark and light mode"
            >
              {theme === "dark" ? <Sun size={17} className="theme-icon-sun" /> : <Moon size={17} className="theme-icon-moon" />}
            </button>

            <button className="btn-enter-app" onClick={handleEnter}>
              <span className="btn-enter-text-desktop">Enter VocodeAI</span>
              <span className="btn-enter-text-mobile">Enter</span>
              <ArrowRight size={14} className="btn-arrow-icon" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button className="mobile-nav-link" onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("any-device")}>
              Any Device & Zero Setup
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("cloud-storage")}>
              Cloud Storage & Sync
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("use-cases")}>
              Use Cases
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("faq")}>
              FAQ
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/docs");
              }}
            >
              Documentation
            </button>
            <div className="mobile-drawer-cta">
              <button className="mobile-cta-btn" onClick={handleEnter}>
                Launch VocodeAI Studio
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        {/* =========================================================
           2. HERO SECTION: HIGH-IMPACT TYPOGRAPHY & INTERACTIVE STUDIO
           ========================================================= */}
        <section className="hero-block">
          <div className="hero-inner-container">
            {/* Top Eyebrow Badge */}
            <div className="hero-announcement-pill">
              <span className="live-pulse-dot" />
              <Sparkles size={13} className="pill-sparkle" />
              <span className="pill-text">Zero Setup • Cloud Powered • Voice Native</span>
              <span className="pill-badge-tag">NEW</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="hero-heading">
              Code with your voice.{" "}
              <br className="hero-title-break" />
              <span className="headline-gradient-shimmer">Run on any device.</span>{" "}
              <br className="hero-title-break" />
              Saved in the cloud forever.
            </h1>

            {/* Sub-headline / Value Proposition */}
            <p className="hero-lead">
              VocodeAI is the next-generation intelligent developer studio built entirely for the modern web.
              No complex installations, no disk space wasted, and no configuration headaches.
              Simply open your browser on any laptop, tablet, or phone — speak, build, and deploy.
            </p>

            {/* Call-to-Action Row */}
            <div className="hero-button-row">
              <button className="primary-glow-btn" onClick={handleEnter}>
                <Rocket size={16} />
                <span>Start Coding Free</span>
                <ArrowRight size={15} className="cta-arrow" />
              </button>
              <button className="secondary-glass-btn" onClick={() => navigate("/docs")}>
                <BookOpen size={15} />
                <span>Interactive Docs</span>
              </button>
            </div>

            {/* Fast Value Signals */}
            <div className="hero-value-signals">
              <div className="signal-item">
                <CheckCircle2 size={14} className="signal-check" />
                <span>Zero local install required</span>
              </div>
              <div className="signal-divider" />
              <div className="signal-item">
                <CheckCircle2 size={14} className="signal-check" />
                <span>100% Real-time Cloud Storage</span>
              </div>
              <div className="signal-divider" />
              <div className="signal-item">
                <CheckCircle2 size={14} className="signal-check" />
                <span>Works on Mac, PC, iPad & Phone</span>
              </div>
              <div className="signal-divider" />
              <div className="signal-item">
                <CheckCircle2 size={14} className="signal-check" />
                <span>Free Forever Tier</span>
              </div>
            </div>

            {/* =========================================================
               3. INTERACTIVE STUDIO DEMO SHOWCASE
               ========================================================= */}
            <div className="interactive-studio-wrapper">
              <div className="studio-outer-glow" />
              
              <div className="studio-card-container">
                {/* Studio Header Toolbar & Tabs */}
                <div className="studio-topbar">
                  <div className="window-dots-group">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                    <span className="window-brand-label">vocode-cloud-session: active</span>
                  </div>

                  {/* Interactive Feature Simulator Tabs */}
                  <div className="studio-feature-tabs">
                    <button
                      className={`studio-tab-btn ${activeStudioTab === "voice" ? "active" : ""}`}
                      onClick={() => setActiveStudioTab("voice")}
                    >
                      <Mic size={13} />
                      <span>Voice Pair Programmer</span>
                    </button>
                    <button
                      className={`studio-tab-btn ${activeStudioTab === "editor" ? "active" : ""}`}
                      onClick={() => setActiveStudioTab("editor")}
                    >
                      <Code2 size={13} />
                      <span>Cloud Editor</span>
                    </button>
                    <button
                      className={`studio-tab-btn ${activeStudioTab === "storage" ? "active" : ""}`}
                      onClick={() => setActiveStudioTab("storage")}
                    >
                      <Cloud size={13} />
                      <span>Continuous Cloud Sync</span>
                    </button>
                    <button
                      className={`studio-tab-btn ${activeStudioTab === "preview" ? "active" : ""}`}
                      onClick={() => setActiveStudioTab("preview")}
                    >
                      <Globe size={13} />
                      <span>Live Preview</span>
                    </button>
                  </div>

                  {/* Live Status Badge */}
                  <div className="studio-live-badge">
                    <span className="live-status-light" />
                    <span>Cloud VM 0.12s</span>
                  </div>
                </div>

                {/* Studio Body Content Dependent on Active Tab */}
                <div className="studio-body-viewport">
                  {/* TAB 1: VOICE PAIR PROGRAMMER */}
                  {activeStudioTab === "voice" && (
                    <div className="studio-tab-content tab-voice-mode">
                      <div className="voice-visualizer-panel">
                        <div className="voice-status-header">
                          <div className="voice-mic-active-pill">
                            <Mic size={14} className="mic-pulsing-icon" />
                            <span>VOICE ENGINE LISTENING</span>
                          </div>
                          <span className="voice-model-tag">Gemini Multimodal 2.5 • Ultra-Low Latency</span>
                        </div>

                        {/* Animated Sound Wave Bars */}
                        <div className="soundwave-container" aria-hidden="true">
                          {[30, 65, 40, 85, 95, 60, 45, 90, 100, 75, 50, 95, 80, 40, 70, 90, 55, 35].map(
                            (height, i) => (
                              <span
                                key={i}
                                className={`wave-bar ${isVoiceSimulating ? "pulse" : ""}`}
                                style={{
                                  height: `${height}%`,
                                  animationDelay: `${i * 0.08}s`,
                                }}
                              />
                            )
                          )}
                        </div>

                        {/* Speech Bubble / Transcript */}
                        <div className="voice-transcript-card">
                          <div className="transcript-user-line">
                            <span className="user-tag">You spoke:</span>
                            <span className="user-quote">
                              "Vocode, write an async Express middleware in TypeScript that verifies JWT tokens and checks user roles."
                            </span>
                          </div>
                          <div className="transcript-ai-response">
                            <Bot size={14} className="ai-quote-icon" />
                            <span>
                              Understood. Generating secure TypeScript auth middleware with role-based guardrails...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Code Output Result */}
                      <div className="voice-generated-code-box">
                        <div className="code-box-header">
                          <div className="file-badge">
                            <FileCode2 size={13} />
                            <span>src/middleware/auth.ts</span>
                          </div>
                          <span className="generated-tag">AI Generated in 180ms</span>
                        </div>
                        <pre className="code-pre-block">
                          <code>
                            <span className="tok-keyword">import</span>{" "}
                            <span className="tok-var">&#123; Request, Response, NextFunction &#125;</span>{" "}
                            <span className="tok-keyword">from</span>{" "}
                            <span className="tok-string">'express'</span>;{"\n"}
                            <span className="tok-keyword">import</span>{" "}
                            <span className="tok-var">&#123; verifyToken &#125;</span>{" "}
                            <span className="tok-keyword">from</span>{" "}
                            <span className="tok-string">'../utils/jwt'</span>;{"\n\n"}
                            <span className="tok-comment">// Auto-generated via VocodeAI voice prompt</span>{"\n"}
                            <span className="tok-keyword">export const</span>{" "}
                            <span className="tok-func">requireRole</span> = (
                            <span className="tok-param">roles: string[]</span>) =&gt; &#123;{"\n"}
                            {"  "}<span className="tok-keyword">return async</span> (req: Request, res: Response, next: NextFunction) =&gt; &#123;{"\n"}
                            {"    "}<span className="tok-keyword">const</span> token = req.headers.authorization?.split(<span className="tok-string">' '</span>)[1];{"\n"}
                            {"    "}<span className="tok-keyword">if</span> (!token) <span className="tok-keyword">return</span> res.status(401).json(&#123; error: <span className="tok-string">'Unauthorized'</span> &#125;);{"\n"}
                            {"    "}<span className="tok-keyword">const</span> user = <span className="tok-keyword">await</span> verifyToken(token);{"\n"}
                            {"    "}<span className="tok-keyword">if</span> (!roles.includes(user.role)) <span className="tok-keyword">return</span> res.status(403).json(&#123; error: <span className="tok-string">'Forbidden'</span> &#125;);{"\n"}
                            {"    "}req.user = user; next();{"\n"}
                            {"  "}&#125;;{"\n"}
                            &#125;;
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CLOUD EDITOR */}
                  {activeStudioTab === "editor" && (
                    <div className="studio-tab-content tab-editor-mode">
                      <div className="editor-layout-split">
                        {/* Sidebar tree */}
                        <div className="mini-explorer-pane">
                          <div className="explorer-title">
                            <FolderTree size={12} />
                            <span>CLOUD WORKSPACE</span>
                          </div>
                          <div className="file-tree-list">
                            <div className="tree-file active">
                              <FileCode2 size={13} className="tree-file-icon" />
                              <span>main.py</span>
                            </div>
                            <div className="tree-file">
                              <FileCode2 size={13} className="tree-file-icon" />
                              <span>server.js</span>
                            </div>
                            <div className="tree-file">
                              <FileCode2 size={13} className="tree-file-icon" />
                              <span>schema.sql</span>
                            </div>
                            <div className="tree-file">
                              <Settings size={13} className="tree-file-icon" />
                              <span>vocode.json</span>
                            </div>
                          </div>
                          <div className="storage-meter-pill">
                            <HardDrive size={11} />
                            <span>Cloud Storage: 14.2 MB / 10 GB</span>
                          </div>
                        </div>

                        {/* Monaco-style code area */}
                        <div className="editor-code-pane">
                          <pre className="code-pre-block">
                            <code>
                              <span className="tok-comment"># VocodeAI Cloud Engine • Zero Setup Needed</span>{"\n"}
                              <span className="tok-keyword">from</span> fastapi <span className="tok-keyword">import</span> FastAPI, Depends{"\n"}
                              <span className="tok-keyword">from</span> pydantic <span className="tok-keyword">import</span> BaseModel{"\n\n"}
                              app = FastAPI(title=<span className="tok-string">"VocodeAI Cloud Microservice"</span>){"\n\n"}
                              <span className="tok-keyword">@app.get</span>(<span className="tok-string">"/api/predict"</span>){"\n"}
                              <span className="tok-keyword">async def</span> <span className="tok-func">predict_stream</span>(query: str):{"\n"}
                              {"    "}<span className="tok-comment"># Offloaded to cloud-hosted tensor runtime</span>{"\n"}
                              {"    "}<span className="tok-keyword">return</span> &#123;<span className="tok-string">"status"</span>: <span className="tok-string">"ok"</span>, <span className="tok-string">"runtime_ms"</span>: 12.4, <span className="tok-string">"query"</span>: query&#125;
                            </code>
                          </pre>

                          <div className="editor-terminal-subpanel">
                            <div className="term-sub-header">
                              <Terminal size={12} />
                              <span>vocode-cloud-terminal (Ubuntu 24.04 LTS Container)</span>
                            </div>
                            <div className="term-log-stream">
                              <p className="log-line">$ uvicorn main:app --host 0.0.0.0 --port 8000 --reload</p>
                              <p className="log-line log-success">INFO: Application startup complete. Cloud port 8000 exposed.</p>
                              <p className="log-line log-info">INFO: Remote hot-reload active via WebSocket stream.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CONTINUOUS CLOUD STORAGE */}
                  {activeStudioTab === "storage" && (
                    <div className="studio-tab-content tab-storage-mode">
                      <div className="storage-dashboard-grid">
                        <div className="storage-card-item">
                          <div className="storage-card-icon">
                            <Cloud size={20} />
                          </div>
                          <h4>Continuous Auto-Save</h4>
                          <p>
                            Every keystroke is version-controlled and streamed to multi-region cloud storage. Zero risk of losing work if your browser closes.
                          </p>
                          <div className="sync-status-indicator">
                            <CheckCircle2 size={14} className="sync-check" />
                            <span>All changes synced 2s ago</span>
                          </div>
                        </div>

                        <div className="storage-card-item">
                          <div className="storage-card-icon">
                            <HardDrive size={20} />
                          </div>
                          <h4>0 MB Local Disk Burden</h4>
                          <p>
                            No more deleting photos or videos to free up room for bloated SDKs, Gradle caches, or 12GB virtual machines.
                          </p>
                          <div className="sync-status-indicator">
                            <Zap size={14} className="sync-check" />
                            <span>Local Disk Space Used: 0 KB</span>
                          </div>
                        </div>

                        <div className="storage-card-item">
                          <div className="storage-card-icon">
                            <RefreshCw size={20} />
                          </div>
                          <h4>Instant Multi-Device Sync</h4>
                          <p>
                            Start a project on your office desktop, test it on your iPad during your commute, and review PRs from your phone.
                          </p>
                          <div className="sync-status-indicator">
                            <Globe size={14} className="sync-check" />
                            <span>Active sessions: 3 devices connected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: LIVE PREVIEW */}
                  {activeStudioTab === "preview" && (
                    <div className="studio-tab-content tab-preview-mode">
                      <div className="browser-mockup-frame">
                        <div className="browser-address-bar">
                          <div className="url-input-pill">
                            <Lock size={12} className="url-lock" />
                            <span>https://vocode-sandbox-preview.run/app</span>
                          </div>
                          <span className="live-preview-pill">Hot Reload 60fps</span>
                        </div>
                        <div className="browser-rendered-preview">
                          <div className="preview-mini-app">
                            <div className="preview-nav">
                              <span className="preview-logo-dot" />
                              <span className="preview-brand">Analytics Dashboard</span>
                              <span className="preview-status-tag">Connected</span>
                            </div>
                            <div className="preview-stat-cards">
                              <div className="p-card">
                                <span className="p-title">Active Users</span>
                                <span className="p-val">14,290</span>
                                <span className="p-growth">+24.8%</span>
                              </div>
                              <div className="p-card">
                                <span className="p-title">API Response</span>
                                <span className="p-val">12ms</span>
                                <span className="p-growth">Optimal</span>
                              </div>
                              <div className="p-card">
                                <span className="p-title">Cloud Storage</span>
                                <span className="p-val">100% Synced</span>
                                <span className="p-growth">Encrypted</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Studio Footer Floating Pill */}
                <div className="studio-bottom-ribbon">
                  <div className="ribbon-metric">
                    <Zap size={13} className="ribbon-icon" />
                    <span>Boot Time: <strong>120ms</strong></span>
                  </div>
                  <div className="ribbon-metric">
                    <HardDrive size={13} className="ribbon-icon" />
                    <span>Local Footprint: <strong>0 MB</strong></span>
                  </div>
                  <div className="ribbon-metric">
                    <Cloud size={13} className="ribbon-icon" />
                    <span>Cloud Storage: <strong>Encrypted & Persistent</strong></span>
                  </div>
                  <div className="ribbon-metric">
                    <Globe size={13} className="ribbon-icon" />
                    <span>Compatibility: <strong>Every Modern Browser</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           4. "RUN ON ANY DEVICE — ZERO SETUP REQUIRED" SHOWCASE
           ========================================================= */}
        <section className="any-device-block" id="any-device">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <Globe size={13} />
                <span>Universal Device Portability</span>
              </div>
              <h2 className="section-title">
                Open in any browser.{" "}
                <span className="gradient-highlight">Zero setup required.</span>
              </h2>
              <p className="section-subtitle">
                No brew install, no path configuration, no Docker desktop crashes, and no gigabyte downloads.
                Just visit VocodeAI from any computer, tablet, or phone and code immediately.
              </p>
            </div>

            {/* Interactive Device Selector Tabs */}
            <div className="device-tabs-row">
              <button
                className={`device-pill-btn ${activeDeviceTab === "laptop" ? "active" : ""}`}
                onClick={() => setActiveDeviceTab("laptop")}
              >
                <Laptop size={16} />
                <span>Laptops (Mac/Win/Linux)</span>
              </button>
              <button
                className={`device-pill-btn ${activeDeviceTab === "tablet" ? "active" : ""}`}
                onClick={() => setActiveDeviceTab("tablet")}
              >
                <Tablet size={16} />
                <span>iPads & Tablets</span>
              </button>
              <button
                className={`device-pill-btn ${activeDeviceTab === "phone" ? "active" : ""}`}
                onClick={() => setActiveDeviceTab("phone")}
              >
                <Smartphone size={16} />
                <span>Smartphones (iOS/Android)</span>
              </button>
              <button
                className={`device-pill-btn ${activeDeviceTab === "chromebook" ? "active" : ""}`}
                onClick={() => setActiveDeviceTab("chromebook")}
              >
                <Monitor size={16} />
                <span>Chromebooks & Budget PCs</span>
              </button>
            </div>

            {/* Active Device Detailed Showcase Card */}
            <div className="device-detail-card">
              <div className="device-detail-content">
                <div className="device-card-header">
                  <div className="device-badge-row">
                    <span className="device-chip-badge">
                      {React.createElement(deviceShowcases[activeDeviceTab].icon, { size: 14 })}
                      <span>{deviceShowcases[activeDeviceTab].badge}</span>
                    </span>
                    <span className="zero-setup-tag">
                      <Check size={12} strokeWidth={3} /> No Installation Required
                    </span>
                  </div>
                  <h3 className="device-card-title">{deviceShowcases[activeDeviceTab].title}</h3>
                  <p className="device-card-lead">{deviceShowcases[activeDeviceTab].subtitle}</p>
                </div>

                <p className="device-description">{deviceShowcases[activeDeviceTab].description}</p>

                {/* 4 Key Specs for Current Device */}
                <div className="device-specs-grid">
                  {deviceShowcases[activeDeviceTab].specs.map((spec, i) => (
                    <div key={i} className="spec-item-box">
                      <span className="spec-label">{spec.label}</span>
                      <span className="spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <div className="device-action-footer">
                  <div className="device-command-preview">
                    <Terminal size={13} className="cmd-icon" />
                    <code>{deviceShowcases[activeDeviceTab].command}</code>
                  </div>
                  <button className="device-try-btn" onClick={handleEnter}>
                    <span>Try on this device</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           5. CLOUD STORAGE & ARCHITECTURE HIGHLIGHT SECTION
           ========================================================= */}
        <section className="cloud-storage-block" id="cloud-storage">
          <div className="section-inner-container">
            <div className="cloud-storage-banner-card">
              <div className="cloud-glow-effect" />
              
              <div className="cloud-banner-grid">
                <div className="cloud-text-column">
                  <div className="section-pill-tag">
                    <Cloud size={13} />
                    <span>Distributed Cloud Storage</span>
                  </div>
                  <h2 className="cloud-banner-title">
                    Your code is always safe. <br />
                    <span className="coral-gradient-text">Synced across every screen you own.</span>
                  </h2>
                  <p className="cloud-banner-lead">
                    Forget USB drives, email attachments, or manual git commits just to resume your work on another machine.
                    VocodeAI preserves your exact workspace state — open tabs, terminal output, installed packages, and uncommitted edits — in real-time distributed cloud storage.
                  </p>

                  <div className="cloud-features-checklist">
                    <div className="cloud-check-item">
                      <div className="check-icon-circle">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong>Sub-second Keystroke Sync:</strong> Seamless background saving without lag or latency.
                      </div>
                    </div>

                    <div className="cloud-check-item">
                      <div className="check-icon-circle">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong>Zero Local Storage Footprint:</strong> Keep 100% of your laptop disk free for media and games.
                      </div>
                    </div>

                    <div className="cloud-check-item">
                      <div className="check-icon-circle">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong>Cross-Session State Recovery:</strong> Re-open the tab next week and pick up in mid-thought.
                      </div>
                    </div>

                    <div className="cloud-check-item">
                      <div className="check-icon-circle">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong>Enterprise End-to-End Encryption:</strong> Industry-standard TLS 1.3 and AES-256 cloud encryption.
                      </div>
                    </div>
                  </div>

                  <div className="cloud-cta-group">
                    <button className="primary-glow-btn" onClick={handleEnter}>
                      <span>Explore Cloud Storage Free</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Cloud Visual Graphic Diagram */}
                <div className="cloud-visual-column">
                  <div className="cloud-sync-diagram-card">
                    <div className="diagram-center-hub">
                      <div className="hub-cloud-icon">
                        <Cloud size={32} />
                      </div>
                      <span className="hub-label">VocodeAI Cloud Core</span>
                      <span className="hub-sub">Active Replication</span>
                    </div>

                    {/* Satellite Device Nodes */}
                    <div className="diagram-satellite sat-laptop">
                      <Laptop size={16} />
                      <span>MacBook</span>
                    </div>

                    <div className="diagram-satellite sat-tablet">
                      <Tablet size={16} />
                      <span>iPad Pro</span>
                    </div>

                    <div className="diagram-satellite sat-phone">
                      <Smartphone size={16} />
                      <span>Mobile</span>
                    </div>

                    <div className="diagram-satellite sat-pc">
                      <Monitor size={16} />
                      <span>Desktop PC</span>
                    </div>

                    {/* Visual Pulse Wave Lines */}
                    <div className="radar-circle circle-1" />
                    <div className="radar-circle circle-2" />
                    <div className="radar-circle circle-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           6. FEATURE BENTO GRID (Linear / Vercel Modern Aesthetic)
           ========================================================= */}
        <section className="features-block" id="features">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <Sparkles size={13} />
                <span>Supercharged Architecture</span>
              </div>
              <h2 className="section-title">
                Engineered for speed. <br />
                <span className="gradient-highlight">Crafted for developer delight.</span>
              </h2>
              <p className="section-subtitle">
                Everything you need to write, test, debug, and ship production-grade code without friction.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="bento-grid">
              {/* Card 1: Large Voice-Native Card */}
              <div className="bento-tile bento-col-2 tile-voice">
                <div className="tile-ambient-glow" />
                <div className="tile-icon-box box-voice">
                  <Mic size={22} />
                </div>
                <div className="tile-badge-pill">Speech-to-Code</div>
                <h3 className="tile-title">Voice-Driven Engineering</h3>
                <p className="tile-description">
                  Dictate logic, describe algorithms, or refactor functions hands-free. VocodeAI translates natural spoken speech into clean, idiomatic code with zero keyboard friction.
                </p>
                <div className="tile-interactive-snippet">
                  <span className="snippet-prompt">🗣️ "Generate a retry wrapper for Axios requests"</span>
                  <span className="snippet-arrow">→</span>
                  <span className="snippet-result">TypeScript Helper Created</span>
                </div>
              </div>

              {/* Card 2: Serverless Cloud Runtime */}
              <div className="bento-tile tile-runtime">
                <div className="tile-ambient-glow" />
                <div className="tile-icon-box box-terminal">
                  <Terminal size={22} />
                </div>
                <div className="tile-badge-pill">Cloud VM</div>
                <h3 className="tile-title">Instant Cloud Runtime</h3>
                <p className="tile-description">
                  Execute Python, Node.js, C++, Java, and Go in isolated sandboxed micro-containers that boot in under 120ms.
                </p>
              </div>

              {/* Card 3: Multimodal AI Copilot */}
              <div className="bento-tile tile-ai">
                <div className="tile-ambient-glow" />
                <div className="tile-icon-box box-ai">
                  <Bot size={22} />
                </div>
                <div className="tile-badge-pill">Smart Context</div>
                <h3 className="tile-title">Multimodal AI Copilot</h3>
                <p className="tile-description">
                  Context-aware assistant that reads your full project directory, pinpoints runtime errors, and generates unit tests on demand.
                </p>
              </div>

              {/* Card 4: Persistent Cloud Storage */}
              <div className="bento-tile tile-storage">
                <div className="tile-ambient-glow" />
                <div className="tile-icon-box box-cloud">
                  <Cloud size={22} />
                </div>
                <div className="tile-badge-pill">Continuous Sync</div>
                <h3 className="tile-title">Always-On Cloud Storage</h3>
                <p className="tile-description">
                  Never press Ctrl+S again. All code, files, and project assets are continuously preserved with snapshot rollbacks.
                </p>
              </div>

              {/* Card 5: Large Zero-Setup & Hardware Freedom */}
              <div className="bento-tile bento-col-2 tile-portability">
                <div className="tile-ambient-glow" />
                <div className="tile-icon-box box-device">
                  <Laptop size={22} />
                </div>
                <div className="tile-badge-pill">Hardware Agnostic</div>
                <h3 className="tile-title">Zero Installation. Zero Disk Usage.</h3>
                <p className="tile-description">
                  Eliminate 30GB dependency folders and endless PATH debugging. Whether on an iPad at a coffee shop or a low-spec Chromebook, you harness high-end cloud compute seamlessly.
                </p>
                <div className="tile-badges-strip">
                  <span className="chip-tag">No Local Node.js</span>
                  <span className="chip-tag">No Local Python</span>
                  <span className="chip-tag">No Local Docker</span>
                  <span className="chip-tag">100% In Browser</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           7. TRADITIONAL SETUP VS VOCODEAI COMPARISON TABLE
           ========================================================= */}
        <section className="comparison-block">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <Zap size={13} />
                <span>The Modern Shift</span>
              </div>
              <h2 className="section-title">
                Traditional Local IDE vs. <span className="coral-gradient-text">VocodeAI Cloud</span>
              </h2>
              <p className="section-subtitle">
                Why modern developers are leaving heavy local desktop software behind.
              </p>
            </div>

            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>Legacy Desktop Setup (VS Code, Local)</th>
                    <th className="highlight-column">VocodeAI Cloud Studio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Setup & Onboarding Time</strong></td>
                    <td className="text-muted">45 - 90 minutes (installing SDKs, PATHs, tools)</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>&lt; 2 seconds</strong> (instant browser link)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Local Disk Storage Required</strong></td>
                    <td className="text-muted">20GB - 50GB (node_modules, SDKs, Docker images)</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>0 MB</strong> (100% cloud-hosted storage)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Hardware / Device Support</strong></td>
                    <td className="text-muted">High-end laptops only; struggles on cheap PCs</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>Any Device</strong> (PC, Mac, iPad, Phone, Chromebook)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Voice-to-Code Integration</strong></td>
                    <td className="text-muted">Clunky third-party extensions with latency</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>Native Multimodal AI</strong> with real-time waveform
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Data Loss & Sync Risk</strong></td>
                    <td className="text-muted">High (lost if laptop crashes or uncommitted)</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>0% Risk</strong> (continuous cloud replication)
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Battery & Thermals</strong></td>
                    <td className="text-muted">Heavy fan noise, rapid battery drain from compilers</td>
                    <td className="highlight-column text-accent">
                      <CheckCircle2 size={15} className="inline-check" /> <strong>Ice Cold</strong> (cloud executes all heavy compute)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================
           8. USE CASES: "MADE FOR EVERY DEVELOPER JOURNEY"
           ========================================================= */}
        <section className="usecases-block" id="use-cases">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <Users size={13} />
                <span>Tailored Personas</span>
              </div>
              <h2 className="section-title">
                Made for every <span className="gradient-highlight">stage & journey</span>
              </h2>
              <p className="section-subtitle">
                Whether you're writing your first function or running global infrastructure.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="persona-tabs-nav">
              <button
                className={`persona-nav-tab ${activePersona === "developers" ? "active" : ""}`}
                onClick={() => setActivePersona("developers")}
              >
                <Code2 size={16} />
                <span>Engineers & Developers</span>
              </button>
              <button
                className={`persona-nav-tab ${activePersona === "students" ? "active" : ""}`}
                onClick={() => setActivePersona("students")}
              >
                <GraduationCap size={16} />
                <span>Students & Educators</span>
              </button>
              <button
                className={`persona-nav-tab ${activePersona === "hackathons" ? "active" : ""}`}
                onClick={() => setActivePersona("hackathons")}
              >
                <Trophy size={16} />
                <span>Hackathons & Startups</span>
              </button>
              <button
                className={`persona-nav-tab ${activePersona === "nomads" ? "active" : ""}`}
                onClick={() => setActivePersona("nomads")}
              >
                <Globe size={16} />
                <span>Digital Nomads & Travelers</span>
              </button>
            </div>

            {/* Persona Content Panel */}
            <div className="persona-display-card">
              <div className="persona-card-grid">
                <div className="persona-info-col">
                  <div className="persona-badge-pill">
                    {React.createElement(personas[activePersona].icon, { size: 14 })}
                    <span>Recommended Workflow</span>
                  </div>
                  <h3 className="persona-main-title">{personas[activePersona].title}</h3>
                  <p className="persona-tagline">{personas[activePersona].tagline}</p>

                  <div className="persona-points-list">
                    {personas[activePersona].points.map((pt, i) => (
                      <div key={i} className="persona-point-item">
                        <span className="point-bullet">✓</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  <button className="primary-glow-btn mt-6" onClick={handleEnter}>
                    <span>Launch as {personas[activePersona].title.split(" ")[1]}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="persona-stat-col">
                  <div className="persona-highlight-box">
                    <span className="highlight-big-number">{personas[activePersona].metric}</span>
                    <span className="highlight-number-caption">
                      {personas[activePersona].metricLabel}
                    </span>
                    <div className="highlight-pill-sub">
                      <Sparkles size={13} />
                      <span>Verified User Benefit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           9. HOW IT WORKS (3-Step Connected Pathway)
           ========================================================= */}
        <section className="workflow-block" id="how-it-works">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <Play size={12} fill="currentColor" />
                <span>Instant Onboarding</span>
              </div>
              <h2 className="section-title">
                How It Works in <span className="coral-gradient-text">3 Simple Steps</span>
              </h2>
              <p className="section-subtitle">
                From opening your browser to deploying production code in under 60 seconds.
              </p>
            </div>

            <div className="workflow-steps-grid">
              {/* Step 1 */}
              <div className="workflow-step-card">
                <div className="step-number-circle">01</div>
                <div className="step-icon-bubble">
                  <Globe size={22} />
                </div>
                <h3 className="step-card-title">Open URL in Any Browser</h3>
                <p className="step-card-desc">
                  No installers, no account approval waitlists, and no dependency setup. Visit VocodeAI from any PC, tablet, or phone.
                </p>
                <div className="step-meta-badge">Boot: 120ms</div>
              </div>

              {/* Step 2 */}
              <div className="workflow-step-card">
                <div className="step-number-circle">02</div>
                <div className="step-icon-bubble">
                  <Mic size={22} />
                </div>
                <h3 className="step-card-title">Speak or Type Your Code</h3>
                <p className="step-card-desc">
                  Dictate architectures or write code in Python, TypeScript, or Go. Multimodal AI guides you with real-time autocompletion.
                </p>
                <div className="step-meta-badge">Voice + AI Assisted</div>
              </div>

              {/* Step 3 */}
              <div className="workflow-step-card">
                <div className="step-number-circle">03</div>
                <div className="step-icon-bubble">
                  <Cloud size={22} />
                </div>
                <h3 className="step-card-title">Auto-Saved in the Cloud</h3>
                <p className="step-card-desc">
                  Every file change is instantly persisted in cloud storage. Run tests in remote containers and pick up from any other device.
                </p>
                <div className="step-meta-badge">100% Persisted</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           10. FREQUENTLY ASKED QUESTIONS (Interactive Accordion)
           ========================================================= */}
        <section className="faq-block" id="faq">
          <div className="section-inner-container">
            <div className="section-heading-wrapper text-center">
              <div className="section-pill-tag">
                <BookOpen size={13} />
                <span>Got Questions?</span>
              </div>
              <h2 className="section-title">
                Frequently Asked <span className="gradient-highlight">Questions</span>
              </h2>
              <p className="section-subtitle">
                Everything you need to know about VocodeAI, device compatibility, and cloud storage.
              </p>
            </div>

            <div className="faq-accordion-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`faq-accordion-item ${isOpen ? "open" : ""}`}
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  >
                    <button
                      className="faq-question-btn"
                      aria-expanded={isOpen}
                    >
                      <span className="faq-q-text">{faq.q}</span>
                      <ChevronDown size={18} className={`faq-chevron ${isOpen ? "rotated" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="faq-answer-panel">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
           11. FINAL HIGH-CONVERSION CTA BANNER
           ========================================================= */}
        <section className="final-cta-block">
          <div className="section-inner-container">
            <div className="final-cta-card">
              <div className="cta-glow-bg" />
              
              <div className="cta-content-inner">
                <div className="cta-pill">
                  <Flame size={14} className="flame-icon" />
                  <span>Start Coding in Seconds</span>
                </div>
                <h2 className="cta-heading">
                  Ready to code with your voice <br />
                  on any device you own?
                </h2>
                <p className="cta-subtext">
                  Join developers, students, and creators building the future with zero local setup and persistent cloud storage.
                </p>

                <div className="cta-buttons-row">
                  <button className="primary-glow-btn cta-large-btn" onClick={handleEnter}>
                    <Rocket size={17} />
                    <span>Launch VocodeAI Now — Free</span>
                    <ArrowRight size={16} />
                  </button>
                  <button className="secondary-glass-btn cta-large-btn" onClick={() => navigate("/docs")}>
                    <BookOpen size={16} />
                    <span>Read Documentation</span>
                  </button>
                </div>

                <div className="cta-trust-strip">
                  <span>✓ No Credit Card Required</span>
                  <span>•</span>
                  <span>✓ Works in Any Browser</span>
                  <span>•</span>
                  <span>✓ 100% Free Forever Tier</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
         12. FOOTER (MNC-Grade Enterprise Standards)
         ========================================================= */}
      <footer className="site-footer">
        <div className="footer-inner-container">
          {/* Brand Column */}
          <div className="footer-identity-col">
            <div
              className="brand-identity footer-brand-identity"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              role="button"
              tabIndex={0}
              title="Vocodeai — Back to Top"
            >
              <img
                src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                alt="Vocodeai Logo"
                className="brand-icon footer-logo"
              />
            </div>

            <p className="footer-mission-statement">
              The intelligent voice & cloud developer studio. Code on any device with zero installation and continuous cloud storage persistence.
            </p>

            <div className="footer-social-links">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-circle-btn" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-circle-btn" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-circle-btn" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
              <a href="mailto:supportvocodeai@gmail.com" className="social-circle-btn" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-col">
            <h4 className="footer-col-header">Product</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => scrollToSection("features")}>Features</button></li>
              <li><button onClick={() => scrollToSection("any-device")}>Any Device</button></li>
              <li><button onClick={() => scrollToSection("cloud-storage")}>Cloud Storage</button></li>
              <li><button onClick={() => scrollToSection("use-cases")}>Use Cases</button></li>
              <li><button onClick={() => navigate("/docs")}>Documentation</button></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-header">Platforms</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => { scrollToSection("any-device"); setActiveDeviceTab("laptop"); }}>Mac & Windows</button></li>
              <li><button onClick={() => { scrollToSection("any-device"); setActiveDeviceTab("tablet"); }}>iPad & Android</button></li>
              <li><button onClick={() => { scrollToSection("any-device"); setActiveDeviceTab("phone"); }}>Mobile Studio</button></li>
              <li><button onClick={() => { scrollToSection("any-device"); setActiveDeviceTab("chromebook"); }}>Chromebook</button></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-header">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="mailto:supportvocodeai@gmail.com">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-col-header">Legal</h4>
            <ul className="footer-links-list">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security Overview</a></li>
              <li><a href="#cookies">Cookie Settings</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Vocodeai Inc. All rights reserved. Built for developers worldwide.
          </p>
          <div className="footer-system-status">
            <span className="status-indicator-green" />
            <span>All Cloud Systems Operational (99.99%)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

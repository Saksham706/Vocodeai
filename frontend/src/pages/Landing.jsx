import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config/apiConfig";
import VocodeLogo from "../components/common/VocodeLogo";
import AuthPopupModal from "../auth/AuthPopupModal";
import {
  Rocket,
  ArrowRight,
  ArrowUp,
  Play,
  BookOpen,
  Bot,
  Code2,
  Cloud,
  Mic,
  GraduationCap,
  Users,
  User,
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
  ChevronLeft,
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [activeScene, setActiveScene] = useState(0);
  const TOTAL_SCENES = 4;
  const activeSceneRef = React.useRef(0);
  const sceneLockRef = React.useRef(false);
  const lockTimerRef = React.useRef(null);
  const touchStartYRef = React.useRef(null);
  const [mobileScrolled, setMobileScrolled] = useState(false);

  const isHeaderScrolled = activeScene > 0 || mobileScrolled;

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  const goToScene = (index) => {
    const clamped = Math.max(0, Math.min(TOTAL_SCENES - 1, index));
    if (clamped === activeSceneRef.current || sceneLockRef.current) return;
    sceneLockRef.current = true;
    activeSceneRef.current = clamped;
    setActiveScene(clamped);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      sceneLockRef.current = false;
    }, 950);
  };

  useEffect(() => {
    const onWheel = (e) => {
      if (mobileMenuOpen || authModalOpen) return;
      if (Math.abs(e.deltaY) < 12) return;
      if (sceneLockRef.current) return;
      e.preventDefault();
      const current = activeSceneRef.current;
      goToScene(e.deltaY > 0 ? current + 1 : current - 1);
    };

    const onKeyDown = (e) => {
      if (authModalOpen) return;
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        return;
      }
      if (mobileMenuOpen) return;
      const current = activeSceneRef.current;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        goToScene(current + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        goToScene(current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToScene(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToScene(TOTAL_SCENES - 1);
      }
    };

    const onTouchStart = (e) => {
      touchStartYRef.current = e.touches?.[0]?.clientY ?? null;
    };
    const onTouchEnd = (e) => {
      if (mobileMenuOpen || authModalOpen || touchStartYRef.current === null) return;
      const endY = e.changedTouches?.[0]?.clientY ?? touchStartYRef.current;
      const diff = touchStartYRef.current - endY;
      touchStartYRef.current = null;
      if (Math.abs(diff) < 35) return;

      // If the active scene has internal vertical scroll on small mobile viewports,
      // allow scrolling inside it before advancing to the next/prev scene.
      const activeEl = document.querySelector(".pagani-scene.is-in-view");
      if (activeEl && activeEl.scrollHeight > activeEl.clientHeight + 4) {
        const atTop = activeEl.scrollTop <= 2;
        const atBottom = activeEl.scrollTop + activeEl.clientHeight >= activeEl.scrollHeight - 2;
        if (diff > 0 && !atBottom) return;
        if (diff < 0 && !atTop) return;
      }

      const current = activeSceneRef.current;
      goToScene(diff > 0 ? current + 1 : current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [mobileMenuOpen, authModalOpen]);
  const [activeDeviceTab, setActiveDeviceTab] = useState("laptop");
  const [activePersona, setActivePersona] = useState("developers");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const workflowSteps = [
    {
      num: "01",
      tab: "01 · OPEN IN BROWSER",
      eyebrow: "INSTANT ACCESS",
      headline: "OPEN URL IN ANY BROWSER",
      desc: "No installers, no account approval waitlists, and no dependency setup. Visit VocodeAI from any PC, tablet, or phone.",
      badge: "Boot: 120ms",
      icon: Globe,
    },
    {
      num: "02",
      tab: "02 · SPEAK OR TYPE",
      eyebrow: "VOICE & COPILOT",
      headline: "SPEAK OR TYPE YOUR CODE",
      desc: "Dictate architectures or write code in Python, TypeScript, Java, or C++. Multimodal AI guides you with real-time autocompletion.",
      badge: "Voice + AI Assisted",
      icon: Mic,
    },
    {
      num: "03",
      tab: "03 · CLOUD PERSISTED",
      eyebrow: "ALWAYS SYNCED",
      headline: "AUTO-SAVED IN THE CLOUD",
      desc: "Every file change is instantly persisted in cloud storage. Run tests in remote containers and pick up from any other device.",
      badge: "100% Persisted",
      icon: Cloud,
    },
  ];
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vocode_theme", nextTheme);
  };

  const handleEnter = (initialMode = "login") => {
    if (accessToken) {
      navigate("/dashboard");
    } else {
      setAuthModalMode(typeof initialMode === "string" ? initialMode : "login");
      setAuthModalOpen(true);
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const sceneMap = {
      top: 0,
      "any-device": 1,
      "how-it-works": 2,
      footer: 3,
    };
    if (id in sceneMap) {
      sceneLockRef.current = false;
      setActiveScene(sceneMap[id]);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Device comparison data
  const deviceShowcases = {
    laptop: {
      tabLabel: "Laptops",
      category: "MacBook, Windows & Linux",
      headline: "Serious compute. Zero local weight.",
      badge: "Full Desktop IDE",
      icon: Laptop,
      specs: [
        { label: "Local Memory", value: "~180 MB" },
        { label: "Installation", value: "Zero" },
        { label: "Cloud Sync", value: "< 1 ms" },
        { label: "Battery", value: "Up to 3×" },
      ],
      description:
        "Open your workspace in any modern browser. Compilation, AI indexing, and language servers run across high-performance cloud clusters, so your laptop stays cool, fast, and quiet.",
      command: "vocode run --cloud-cluster us-east-1",
    },
    tablet: {
      tabLabel: "Tablets",
      category: "iPad & Android Tablets",
      headline: "Desktop IDE power in a featherweight slate.",
      badge: "Touch & Keyboard Ready",
      icon: Tablet,
      specs: [
        { label: "Browsers", value: "All Modern" },
        { label: "Keybinding", value: "Full Support" },
        { label: "Voice Mode", value: "Dual-Mic" },
        { label: "Storage", value: "Real-Time" },
      ],
      description:
        "Pair with any keyboard or navigate by touch. Access a full Linux shell, Node and Python runtimes, and your AI voice copilot directly in Safari or Chrome.",
      command: "vocode attach --surface tablet-pro",
    },
    phone: {
      tabLabel: "Smartphones",
      category: "iOS & Android",
      headline: "Ship hotfixes by voice from anywhere.",
      badge: "Pocket Cloud IDE",
      icon: Smartphone,
      specs: [
        { label: "Voice Command", value: "Native" },
        { label: "Hotfix", value: "30 Sec" },
        { label: "Resilience", value: "Auto-Reconnect" },
        { label: "Setup Time", value: "0 Sec" },
      ],
      description:
        "Speak architectural changes, inspect live diffs, run cloud tests, and deploy production fixes in seconds — right from your pocket with zero local footprint.",
      command: 'vocode voice "fix auth null token"',
    },
    chromebook: {
      tabLabel: "Lightweight PCs",
      category: "Chromebooks & Budget PCs",
      headline: "Supercomputer performance on any machine.",
      badge: "Hardware Agnostic",
      icon: Monitor,
      specs: [
        { label: "Local Disk", value: "0 MB" },
        { label: "AI Compute", value: "100% Cloud" },
        { label: "Containers", value: "Micro-VMs" },
        { label: "Compatibility", value: "Universal" },
      ],
      description:
        "Offload compilation, Docker micro-VMs, and multi-gigabyte AI models to cloud GPUs. Run enterprise-grade workloads effortlessly on any lightweight laptop.",
      command: "vocode vm --tier gpu-cloud-8vcpu",
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
         1. MINIMAL LUXURY STICKY GLASSY NAVBAR
         ========================================================= */}
      <header className={`site-header rr-navbar bugatti-navbar ${isHeaderScrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner rr-header-inner">
          {/* Left: Circular Animated Hamburger / Close Menu Button */}
          <div className="rr-nav-left">
            <button
              type="button"
              className={`rr-menu-btn bugatti-menu-circle ${mobileMenuOpen ? "is-open" : ""}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-morph" aria-hidden="true">
                <span className="hm-line hm-line-top" />
                <span className="hm-line hm-line-bot" />
              </span>
            </button>
          </div>

          {/* Center: Small VocodeAI wordmark -> Logo emblem on scroll */}
          <div
            className="rr-nav-center"
            onClick={() => scrollToSection("top")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && scrollToSection("top")}
            title="VocodeAI — Home"
          >
            <span className={`rr-center-wordmark bugatti-nav-wordmark ${isHeaderScrolled ? "is-hidden" : "is-visible"}`}>
              VOCODEAI
            </span>
            <span className={`rr-center-emblem ${isHeaderScrolled ? "is-visible" : "is-hidden"}`}>
              <VocodeLogo size={28} glow={true} />
            </span>
          </div>

          {/* Right: Theme Switch + Enter Experience */}
          <div className="header-actions rr-nav-right">
            <button
              className="theme-switch-btn bugatti-theme-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle dark and light mode"
            >
              {theme === "dark" ? <Sun size={15} className="theme-icon-sun" /> : <Moon size={15} className="theme-icon-moon" />}
            </button>

            <button
              type="button"
              className="bugatti-enter-link bugatti-user-btn"
              onClick={() => handleEnter("login")}
              title={accessToken ? "Dashboard" : "Log in / Sign up"}
              aria-label={accessToken ? "Go to Dashboard" : "Log in or Sign up"}
            >
              <User size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Glassy Navigation Overlay */}
      <div
        className={`bugatti-nav-overlay ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="bugatti-overlay-inner" onClick={(e) => e.stopPropagation()}>
          <nav className="bugatti-overlay-nav" aria-label="Site Navigation">
            <ul className="bugatti-overlay-links">
              <li style={{ "--i": 0 }}>
                <button
                  type="button"
                  className={`bugatti-overlay-link ${activeScene === 0 ? "is-active" : ""}`}
                  onClick={() => scrollToSection("top")}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <span className="overlay-link-index">01</span>
                  <span className="overlay-link-label">OVERVIEW</span>
                </button>
              </li>
              <li style={{ "--i": 1 }}>
                <button
                  type="button"
                  className={`bugatti-overlay-link ${activeScene === 1 ? "is-active" : ""}`}
                  onClick={() => scrollToSection("any-device")}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <span className="overlay-link-index">02</span>
                  <span className="overlay-link-label">ANY DEVICE &amp; ZERO SETUP</span>
                </button>
              </li>
              <li style={{ "--i": 2 }}>
                <button
                  type="button"
                  className={`bugatti-overlay-link ${activeScene === 2 ? "is-active" : ""}`}
                  onClick={() => scrollToSection("how-it-works")}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <span className="overlay-link-index">03</span>
                  <span className="overlay-link-label">HOW IT WORKS</span>
                </button>
              </li>
              <li style={{ "--i": 3 }}>
                <button
                  type="button"
                  className="bugatti-overlay-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/docs");
                  }}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <span className="overlay-link-index">04</span>
                  <span className="overlay-link-label">DOCUMENTATION</span>
                </button>
              </li>
              <li style={{ "--i": 4 }}>
                <button
                  type="button"
                  className="bugatti-overlay-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleEnter("login");
                  }}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <span className="overlay-link-index">05</span>
                  <span className="overlay-link-label">ENTER VOCODEAI</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="bugatti-overlay-footer">
            <span className="overlay-status-dot" />
            <span>VOCODEAI • VOICE-FIRST INTELLIGENCE</span>
          </div>
        </div>
      </div>

      <div className="pagani-viewport">
        <div className="pagani-track">
          <main className="main-content pagani-main">
            {/* =========================================================
           2. HERO SECTION: CINEMATIC BUGATTI-INSPIRED FULL-VIEWPORT HERO
           ========================================================= */}
            <section
              className={`hero-block pagani-scene bugatti-hero-scene ${activeScene === 0 ? "is-in-view" : activeScene > 0 ? "is-past" : "is-future"}`}
              style={{ zIndex: 1 }}
            >
              {/* Immersive Bugatti-Inspired Animated Background */}
              <div className="bugatti-hero-backdrop" aria-hidden="true">
                <div className="bugatti-tech-grid" />
                <div className="bugatti-film-grain" />
                <div className="bugatti-glow-teal-left" />
                <div className="bugatti-glow-orange-right" />
                <div className="bugatti-light-beam" />

                {/* Concentric Elliptical Rings */}
                <div className="bugatti-rings-stage">
                  <div className="bugatti-ring bugatti-ring-1" />
                  <div className="bugatti-ring bugatti-ring-2" />
                  <div className="bugatti-ring bugatti-ring-3" />
                  <div className="bugatti-ring bugatti-ring-4" />
                </div>

                {/* Sparse Floating Particles */}
                <div className="bugatti-particles">
                  <span className="bugatti-particle p1" />
                  <span className="bugatti-particle p2" />
                  <span className="bugatti-particle p3" />
                  <span className="bugatti-particle p4" />
                  <span className="bugatti-particle p5" />
                  <span className="bugatti-particle p6" />
                  <span className="bugatti-particle p7" />
                </div>
              </div>

              {/* Centered Brand Composition */}
              <div className="bugatti-hero-center">
                <p className="bugatti-tagline">THE FUTURE SPEAKS FOR ITSELF</p>

                <h1 className="bugatti-hero-wordmark" data-text="VOCODEAI">
                  VOCODEAI
                </h1>

                <p className="bugatti-subcopy">
                  Intelligence in motion. A new voice-first world, engineered without limits.
                </p>

                <div className="bugatti-cta-wrap">
                  <button
                    type="button"
                    className="bugatti-cta-pill"
                    onClick={() => scrollToSection("any-device")}
                  >
                    <span>Discover VocodeAI</span>
                    <ArrowRight size={15} className="bugatti-cta-arrow" />
                  </button>
                </div>
              </div>

              {/* Minimal Hero Footer Rail */}
              <div className="bugatti-hero-footer-rail">
                <div className="rail-left">
                  <span className="rail-status-dot" />
                  <span>Systems Online</span>
                </div>

                <button
                  type="button"
                  className="rail-center-scroll"
                  onClick={() => scrollToSection("any-device")}
                >
                  <span>Scroll to Explore</span>
                  <ChevronDown size={14} className="rail-scroll-chevron" />
                </button>

                <div className="rail-right">
                  <span>0{activeScene + 1} / 0{TOTAL_SCENES}</span>
                </div>
              </div>
            </section>

            {/* =========================================================
           4. "UNIVERSAL ACCESS" DEVICE COMPATIBILITY SHOWCASE
           ========================================================= */}
            <section
              className={`any-device-block pagani-scene lux-device-scene ${activeScene === 1 ? "is-in-view" : activeScene > 1 ? "is-past" : "is-future"}`}
              id="any-device"
              style={{ zIndex: 2 }}
            >
              <div className="lux-device-container">
                {/* Main Introduction */}
                <header className="lux-device-intro">
                  <span className="lux-section-eyebrow">02 — UNIVERSAL ACCESS</span>
                  <h2 className="lux-device-heading">
                    <span className="lux-heading-white">Open anywhere.</span>{" "}
                    <span className="lux-heading-teal">Built for every screen.</span>
                  </h2>
                  <p className="lux-device-sub">
                    No installs. No setup rituals. Just a complete AI workspace in your browser.
                  </p>
                </header>

                {/* Interactive Device Navigation Tabs */}
                <div className="lux-device-tabs" role="tablist" aria-label="Compatible devices">
                  {Object.entries(deviceShowcases).map(([key, item]) => {
                    const IconComp = item.icon;
                    const isSelected = activeDeviceTab === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`device-panel-${key}`}
                        id={`device-tab-${key}`}
                        className={`lux-device-tab ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setActiveDeviceTab(key)}
                      >
                        <IconComp size={15} aria-hidden="true" />
                        <span>{item.tabLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Device Showcase Panel */}
                <div
                  key={activeDeviceTab}
                  id={`device-panel-${activeDeviceTab}`}
                  role="tabpanel"
                  aria-labelledby={`device-tab-${activeDeviceTab}`}
                  className="lux-device-panel"
                >
                  <div className="lux-panel-grid">
                    {/* Left Column */}
                    <div className="lux-panel-left">
                      <div className="lux-panel-badges">
                        <span className="lux-feature-badge">
                          {React.createElement(deviceShowcases[activeDeviceTab].icon, { size: 13 })}
                          <span>{deviceShowcases[activeDeviceTab].badge}</span>
                        </span>
                        <span className="lux-cloud-online">
                          <span className="lux-online-dot" />
                          <span>Cloud Online</span>
                        </span>
                      </div>

                      <div className="lux-device-category">
                        {deviceShowcases[activeDeviceTab].category}
                      </div>

                      <h3 className="lux-device-title">
                        {deviceShowcases[activeDeviceTab].headline}
                      </h3>

                      <p className="lux-device-desc">
                        {deviceShowcases[activeDeviceTab].description}
                      </p>

                      <div className="lux-terminal-cta-row">
                        <div className="lux-terminal-cmd" title={deviceShowcases[activeDeviceTab].command}>
                          <Terminal size={13} className="lux-cmd-icon" aria-hidden="true" />
                          <span className="lux-cmd-prompt">$</span>
                          <code>{deviceShowcases[activeDeviceTab].command}</code>
                          <span className="lux-terminal-cursor" aria-hidden="true" />
                        </div>

                        <button
                          type="button"
                          className="lux-try-btn"
                          onClick={() => handleEnter("login")}
                        >
                          <span>Try on This Device</span>
                          <ArrowRight size={14} className="lux-try-arrow" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Abstract Animated Device Visualization */}
                    <div className="lux-panel-right" aria-hidden="true">
                      <div className="lux-viz-rings">
                        <span className="lux-viz-ring r1" />
                        <span className="lux-viz-ring r2" />
                        <span className="lux-viz-ring r3" />
                      </div>

                      <div className={`lux-device-chassis chassis-${activeDeviceTab}`}>
                        <div className="lux-browser-chrome">
                          <div className="lux-chrome-dots">
                            <span />
                            <span />
                            <span />
                          </div>
                          <div className="lux-chrome-url">vocode.cloud/workspace</div>
                          <div className="lux-synced-badge">
                            <span className="synced-dot" />
                            <span>Synced Now</span>
                          </div>
                        </div>

                        <div className="lux-ide-body">
                          <div className="lux-ide-sidebar">
                            <span className="sb-item active" />
                            <span className="sb-item" />
                            <span className="sb-item" />
                            <span className="sb-item short" />
                          </div>

                          <div className="lux-ide-editor">
                            <div className="code-line">
                              <span className="tok-teal w-16" />
                              <span className="tok-muted w-24" />
                            </div>
                            <div className="code-line indent-1">
                              <span className="tok-cyan w-20" />
                              <span className="tok-white w-28" />
                            </div>
                            <div className="code-line indent-2">
                              <span className="tok-teal w-14" />
                              <span className="tok-cyan w-20" />
                              <span className="tok-muted w-12" />
                            </div>
                            <div className="code-line indent-2">
                              <span className="tok-white w-24" />
                              <span className="tok-teal w-16" />
                            </div>
                            <div className="code-line indent-1">
                              <span className="tok-muted w-10" />
                            </div>

                            {/* Animated Voice Waveform */}
                            <div className="lux-voice-wave-bar">
                              <Mic size={11} className="wave-mic-icon" />
                              <div className="lux-waveform">
                                <span style={{ "--d": "0s" }} />
                                <span style={{ "--d": "0.15s" }} />
                                <span style={{ "--d": "0.3s" }} />
                                <span style={{ "--d": "0.45s" }} />
                                <span style={{ "--d": "0.2s" }} />
                                <span style={{ "--d": "0.35s" }} />
                                <span style={{ "--d": "0.1s" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom 4 Metrics Strip */}
                  <div className="lux-metrics-strip">
                    {deviceShowcases[activeDeviceTab].specs.map((spec, i) => (
                      <div key={i} className="lux-metric-cell">
                        <span className="lux-metric-label">{spec.label}</span>
                        <span className="lux-metric-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================
           9. HOW IT WORKS (3-Step Connected Pathway)
           ========================================================= */}
            <section className={`workflow-block pagani-scene ${activeScene === 2 ? "is-in-view" : activeScene > 2 ? "is-past" : "is-future"}`} id="how-it-works" style={{ zIndex: 3 }}>
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

                <div className="lambo-showcase-wrap">
                  {/* Top Row: Left Arrow + Centered Step Headline + Right Arrow */}
                  <div className="lambo-top-bar">
                    <button
                      type="button"
                      className="lambo-hex-arrow"
                      onClick={() =>
                        setActiveStepIndex((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length)
                      }
                      aria-label="Previous step"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="lambo-headline-center">
                      <span className="lambo-step-eyebrow">
                        STEP {workflowSteps[activeStepIndex].num} — {workflowSteps[activeStepIndex].eyebrow}
                      </span>
                      <h3 className="lambo-step-big-title">
                        {workflowSteps[activeStepIndex].headline}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="lambo-hex-arrow"
                      onClick={() =>
                        setActiveStepIndex((prev) => (prev + 1) % workflowSteps.length)
                      }
                      aria-label="Next step"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Center Stage: Active Card + Peeking Adjacent Cards */}
                  <div className="lambo-carousel-stage">
                    {workflowSteps.map((step, idx) => {
                      const IconComp = step.icon;
                      const offset = idx - activeStepIndex;
                      const isActive = offset === 0;
                      const isPrev =
                        offset === -1 || (activeStepIndex === 0 && idx === workflowSteps.length - 1);
                      const isNext =
                        offset === 1 || (activeStepIndex === workflowSteps.length - 1 && idx === 0);

                      let posClass = "is-hidden";
                      if (isActive) posClass = "is-active";
                      else if (isPrev) posClass = "is-prev";
                      else if (isNext) posClass = "is-next";

                      return (
                        <div
                          key={step.num}
                          className={`workflow-step-card lambo-step-card ${posClass}`}
                          onClick={() => !isActive && setActiveStepIndex(idx)}
                          role={!isActive ? "button" : undefined}
                          tabIndex={!isActive ? 0 : undefined}
                        >
                          <div className="step-number-circle">{step.num}</div>
                          <div className="step-icon-bubble">
                            <IconComp size={22} />
                          </div>
                          <h3 className="step-card-title">{step.headline}</h3>
                          <p className="step-card-desc">{step.desc}</p>
                          <div className="step-meta-badge">{step.badge}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Selector Tabs (Lamborghini Underline Style) */}
                  <div className="lambo-bottom-tabs">
                    {workflowSteps.map((step, idx) => (
                      <button
                        key={step.num}
                        type="button"
                        className={`lambo-tab-btn ${activeStepIndex === idx ? "active" : ""}`}
                        onClick={() => setActiveStepIndex(idx)}
                      >
                        {step.tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* =========================================================
         12. FOOTER (Scene 4 — Bugatti Spotlight)
         ========================================================= */}
          <footer className={`site-footer pagani-scene pagani-footer-scene ${activeScene === 3 ? "is-in-view" : "is-future"}`} style={{ zIndex: 4 }}>
            {/* Giant Bugatti-style Cursor-Spotlight Wordmark */}
            <div
              className="footer-wordmark-wrap"
              onClick={() => scrollToSection("top")}
              onMouseMove={(e) => {
                const wordmark = e.currentTarget.querySelector(".footer-giant-wordmark");
                if (!wordmark) return;
                const rect = wordmark.getBoundingClientRect();
                wordmark.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                wordmark.style.setProperty("--my", `${e.clientY - rect.top}px`);
                wordmark.style.setProperty("--spot-opacity", "1");
              }}
              onMouseLeave={(e) => {
                const wordmark = e.currentTarget.querySelector(".footer-giant-wordmark");
                if (wordmark) wordmark.style.setProperty("--spot-opacity", "0");
              }}
              role="button"
              tabIndex={0}
              title="VocodeAI — Back to Top"
            >
              <span className="footer-giant-wordmark" data-text="VOCODEAI">
                VOCODEAI
              </span>
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
      </div>

      {/* Pagani Right-Side Scene Indicator */}
      <div className="pagani-scene-dots" aria-label="Page sections">
        {["Hero", "Devices", "Workflow", "VocodeAI"].map((label, idx) => (
          <button
            key={label}
            type="button"
            className={`pagani-dot-btn ${activeScene === idx ? "active" : ""}`}
            onClick={() => {
              sceneLockRef.current = false;
              setActiveScene(idx);
            }}
            title={label}
            aria-label={`Jump to ${label}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="landing-scroll-top-btn"
        onClick={() => scrollToSection("top")}
        title="Back to top"
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>

      <AuthPopupModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}

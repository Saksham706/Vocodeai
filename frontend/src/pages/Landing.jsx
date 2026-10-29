import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Rocket,
  ArrowRight,
  Play,
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
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Dark mode by default for the futuristic dark theme experience
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("vocode_theme") || "dark";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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

  return (
    <div className={`vocode-app ${theme}`}>
      {/* Background Technical Grid Pattern */}
      <div className="background-grid" aria-hidden="true" />

      {/* Layered Background Radial Atmosphere */}
      <div className="ambient-glow ambient-glow-top-center" />
      <div className="ambient-glow ambient-glow-top-right" />
      <div className="ambient-glow ambient-glow-top-left" />
      <div className="ambient-glow ambient-glow-center" />
      <div className="ambient-glow ambient-glow-bottom-right" />

      {/* =========================================================
         A. NAVIGATION BAR
         ========================================================= */}
      <header className="site-header">
        <div className="header-inner">
          {/* Official Vocodeai Logo */}
          <div
            className="brand-identity brand-logo-only"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Vocodeai"
          >
            <img
              src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
              alt="Vocodeai Logo"
              className="brand-icon navbar-logo"
            />
          </div>

          {/* Right Controls: Theme Toggle & Primary CTA Button */}
          <div className="header-actions">
            <button
              className="theme-switch-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle dark and light mode"
            >
              {theme === "dark" ? <Moon size={18} className="theme-icon-moon" /> : <Sun size={18} className="theme-icon-sun" />}
            </button>

            <button className="btn-enter-app" onClick={handleEnter}>
              Enter VocodeAI
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button className="mobile-nav-link" onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("use-cases")}>
              Use Cases
            </button>
            <button className="mobile-nav-link" onClick={() => scrollToSection("how-it-works")}>
              Pricing
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/docs");
              }}
            >
              Docs
            </button>
            <button className="mobile-cta-btn" onClick={handleEnter}>
              Enter VocodeAI
            </button>
          </div>
        )}
      </header>

      <main className="main-content">
        {/* =========================================================
           B. HERO SECTION
           ========================================================= */}
        <section className="hero-block">
          <div className="hero-content-grid">
            {/* Left Column: Headlines, Call to Actions, Benefit Labels */}
            <div className="hero-text-col">
              <div className="hero-pill-badge">
                <Rocket size={13} className="badge-rocket" />
                <span>AI-Powered Coding Platform</span>
              </div>

              <h1 className="hero-heading">
                Build, Code, and<br />
                Execute with AI —<br />
                <span className="coral-gradient-text hero-highlight">All in One Workspace</span>
              </h1>

              <p className="hero-lead">
                A futuristic AI workspace with smart coding, voice commands, and cloud execution.
              </p>

              <div className="hero-button-row">
                <button className="primary-coral-btn" onClick={handleEnter}>
                  Get Started <ArrowRight size={15} />
                </button>
                <button className="secondary-outline-btn" onClick={() => scrollToSection("features")}>
                  <Play size={13} fill="currentColor" /> View Demo
                </button>
              </div>

              {/* Three Compact Benefit Items */}
              <div className="hero-benefits-row">
                <div className="benefit-item">
                  <span className="benefit-circle-icon">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span>No Setup Required</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-circle-icon">
                    <Play size={9} fill="currentColor" />
                  </span>
                  <span>Free Forever Plan</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-circle-icon">
                    <Sparkles size={9} />
                  </span>
                  <span>Works on Any Device</span>
                </div>
              </div>
            </div>

            {/* Right Column: Code Editor Preview Window & Glowing Orbital Lines */}
            <div className="hero-editor-col">
              {/* Asymmetrical Layered Orbital Curves with Glow & Nodes */}
              <svg
                className="hero-orbital-curves"
                viewBox="0 0 740 640"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <filter id="orbit-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="node-amber-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFA652" stopOpacity="1" />
                    <stop offset="60%" stopColor="#FF784D" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FF784D" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="node-green-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#68F26A" stopOpacity="1" />
                    <stop offset="70%" stopColor="#3BDC7E" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3BDC7E" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="node-cyan-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#18E5D0" stopOpacity="1" />
                    <stop offset="70%" stopColor="#18E5D0" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#18E5D0" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* 1. Large amber-orange arc sweeping high above the editor */}
                <path
                  d="M 70 170 C 190 50, 440 20, 660 110"
                  className="orbit-glow-amber"
                  stroke="rgba(255, 151, 71, 0.42)"
                  strokeWidth="4"
                />
                <path
                  d="M 70 170 C 190 50, 440 20, 660 110"
                  className="orbit-line"
                  stroke="rgba(255, 151, 71, 0.75)"
                  strokeWidth="1.2"
                />

                {/* 2. Wide elliptical curve wrapping around the right edge */}
                <path
                  d="M 420 40 C 640 60, 730 240, 640 440 C 590 530, 460 590, 300 580"
                  className="orbit-glow-orange"
                  stroke="rgba(255, 105, 61, 0.28)"
                  strokeWidth="3.5"
                />
                <path
                  d="M 420 40 C 640 60, 730 240, 640 440 C 590 530, 460 590, 300 580"
                  className="orbit-line"
                  stroke="rgba(255, 105, 61, 0.52)"
                  strokeWidth="1"
                />

                {/* 3. Curved path sweeping from upper-left toward lower-right */}
                <path
                  d="M 50 110 C 150 190, 370 370, 670 420"
                  className="orbit-line"
                  stroke="rgba(59, 220, 126, 0.45)"
                  strokeWidth="1.1"
                />

                {/* 4. Long low-opacity emerald curve extending behind the editor */}
                <path
                  d="M 20 250 C 90 150, 300 90, 560 170 C 670 210, 710 330, 630 420"
                  className="orbit-glow-green"
                  stroke="rgba(59, 220, 126, 0.3)"
                  strokeWidth="3"
                />
                <path
                  d="M 20 250 C 90 150, 300 90, 560 170 C 670 210, 710 330, 630 420"
                  className="orbit-line"
                  stroke="rgba(59, 220, 126, 0.55)"
                  strokeWidth="0.9"
                />

                {/* 5. Cyan-green curve near the left side of the illustration */}
                <path
                  d="M 120 40 C 40 150, 30 350, 170 490 C 250 560, 390 590, 530 570"
                  className="orbit-line"
                  stroke="rgba(24, 229, 208, 0.4)"
                  strokeWidth="1"
                />

                {/* 6. Subtle lower arc extending beneath the terminal area */}
                <path
                  d="M 130 490 C 270 570, 490 560, 650 460"
                  className="orbit-glow-amber"
                  stroke="rgba(255, 151, 71, 0.32)"
                  strokeWidth="3.5"
                />
                <path
                  d="M 130 490 C 270 570, 490 560, 650 460"
                  className="orbit-line"
                  stroke="rgba(255, 151, 71, 0.65)"
                  strokeWidth="1.1"
                />

                {/* 7. Partial orbital loop near right edge */}
                <path
                  d="M 500 150 C 640 190, 680 310, 600 410"
                  className="orbit-line"
                  stroke="rgba(185, 255, 57, 0.35)"
                  strokeWidth="0.85"
                  strokeDasharray="4 3"
                />

                {/* 8. Fine secondary technical depth ellipses */}
                <ellipse cx="400" cy="290" rx="320" ry="250" stroke="rgba(80, 188, 139, 0.14)" strokeWidth="0.8" />
                <ellipse cx="380" cy="280" rx="250" ry="195" stroke="rgba(255, 151, 71, 0.16)" strokeWidth="0.75" strokeDasharray="3 3" />

                {/* Illuminated Nodes / Luminous Dots */}
                <circle cx="70" cy="170" r="5" fill="url(#node-amber-glow)" />
                <circle cx="70" cy="170" r="2.2" fill="#FFA652" />

                <circle cx="660" cy="110" r="6" fill="url(#node-amber-glow)" />
                <circle cx="660" cy="110" r="2.5" fill="#FFA652" />

                <circle cx="670" cy="420" r="5" fill="url(#node-green-glow)" />
                <circle cx="670" cy="420" r="2.2" fill="#68F26A" />

                <circle cx="120" cy="40" r="5" fill="url(#node-cyan-glow)" />
                <circle cx="120" cy="40" r="2" fill="#18E5D0" />

                <circle cx="650" cy="460" r="5" fill="url(#node-amber-glow)" />
                <circle cx="650" cy="460" r="2.2" fill="#FFA652" />
              </svg>

              <div className="editor-frame-container">
                <div className="editor-mockup-frame">
                  {/* Window Title Bar */}
                  <div className="frame-titlebar">
                    <div className="window-dots">
                      <span className="dot dot-close" />
                      <span className="dot dot-minimize" />
                      <span className="dot dot-maximize" />
                    </div>

                    <div className="active-file-tab">
                      <FileCode2 size={13} className="tab-icon" />
                      <span>main.js</span>
                    </div>

                    <div className="lang-tag-pill">
                      <span>Python</span>
                    </div>
                  </div>

                  {/* Window Body */}
                  <div className="frame-body">
                    {/* Left Mini Activity Sidebar */}
                    <div className="frame-activity-bar">
                      <div className="sidebar-icon-wrap active">
                        <FolderTree size={14} className="active-icon" />
                      </div>
                      <div className="sidebar-icon-wrap">
                        <Search size={14} />
                      </div>
                      <div className="sidebar-icon-wrap">
                        <GitBranch size={14} />
                      </div>
                      <div className="sidebar-icon-wrap">
                        <Settings size={14} />
                      </div>
                    </div>

                    {/* Code & Terminal Area */}
                    <div className="frame-editor-pane">
                      {/* Code Panel */}
                      <div className="code-box-wrapper">
                        <pre className="code-text-display">
                          <code>
                            <span className="syntax-comment">// Fibonacci using recursion</span>{"\n"}
                            <span className="syntax-keyword">function</span>{" "}
                            <span className="syntax-function">fibonacci</span>(
                            <span className="syntax-param">n</span>) {"{"}{"\n"}
                            {"  "}<span className="syntax-keyword">if</span> (n &lt;={" "}
                            <span className="syntax-number">1</span>) <span className="syntax-keyword">return</span> n;{"\n"}
                            {"  "}<span className="syntax-keyword">return</span>{" "}
                            <span className="syntax-function">fibonacci</span>(n -{" "}
                            <span className="syntax-number">1</span>) +{" "}
                            <span className="syntax-function">fibonacci</span>(n -{" "}
                            <span className="syntax-number">2</span>);{"\n"}
                            {"}"}
                          </code>
                        </pre>
                      </div>

                      {/* Terminal Output Panel */}
                      <div className="frame-terminal-output">
                        <div className="term-line-cmd">$ node main.js</div>
                        <div className="term-line-running">Running...</div>
                        <div className="term-line-success">✓ Executed successfully!</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating AI Assistant Notification Card */}
                <div className="floating-assistant-card">
                  <div className="assistant-card-head">
                    <div className="assistant-sparkle-badge">
                      <Sparkles size={14} className="star-icon" />
                    </div>
                    <span className="assistant-title">AI Assistant</span>
                  </div>
                  <p className="assistant-card-body">
                    Optimized your code for better performance!
                  </p>
                  <Sparkles size={12} className="assistant-card-deco-star" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           C. FOUR FEATURE CARDS (Equal Width Row)
           ========================================================= */}
        <section className="features-block" id="features">
          <div className="section-inner-container">
            <div className="feature-cards-row">
              {/* Card 1: AI Assistant */}
              <div className="feature-tile">
                <div className="tile-icon-box box-ai">
                  <Bot size={22} />
                </div>
                <h3 className="tile-title">AI Assistant</h3>
                <p className="tile-description">
                  Get intelligent code suggestions and instant answers.
                </p>
              </div>

              {/* Card 2: Smart Code Editor */}
              <div className="feature-tile">
                <div className="tile-icon-box box-editor">
                  <Code2 size={22} />
                </div>
                <h3 className="tile-title">Smart Code Editor</h3>
                <p className="tile-description">
                  Syntax highlighting, auto-completion, and real-time collaboration.
                </p>
              </div>

              {/* Card 3: Cloud Terminal */}
              <div className="feature-tile">
                <div className="tile-icon-box box-terminal">
                  <Cloud size={22} />
                </div>
                <h3 className="tile-title">Cloud Terminal</h3>
                <p className="tile-description">
                  Run scripts and build projects directly in the cloud.
                </p>
              </div>

              {/* Card 4: Voice Control */}
              <div className="feature-tile">
                <div className="tile-icon-box box-voice">
                  <Mic size={22} />
                </div>
                <h3 className="tile-title">Voice Control</h3>
                <p className="tile-description">
                  Code with your voice. Dictate commands and control your workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           D. USE CASES CONTAINER ("Made For Everyone")
           ========================================================= */}
        <section className="usecases-block" id="use-cases">
          <div className="section-inner-container">
            <div className="made-for-everyone-box">
              {/* Header Row */}
              <div className="box-top-bar">
                <div className="box-headings">
                  <h2 className="box-main-title">
                    Made For <span className="coral-gradient-text">Everyone</span>
                  </h2>
                  <p className="box-sub-title">From beginners to professionals</p>
                </div>

                <button className="btn-explore-cases" onClick={handleEnter}>
                  Explore Use Cases <ArrowRight size={14} />
                </button>
              </div>

              {/* 4 Audience Cards in a Row */}
              <div className="audience-pills-row">
                <div className="audience-chip">
                  <div className="chip-icon-box chip-students">
                    <GraduationCap size={18} />
                  </div>
                  <span className="chip-text">Students</span>
                </div>

                <div className="audience-chip">
                  <div className="chip-icon-box chip-developers">
                    <Code2 size={18} />
                  </div>
                  <span className="chip-text">Developers</span>
                </div>

                <div className="audience-chip">
                  <div className="chip-icon-box chip-teams">
                    <Users size={18} />
                  </div>
                  <span className="chip-text">Teams</span>
                </div>

                <div className="audience-chip">
                  <div className="chip-icon-box chip-builders">
                    <Trophy size={18} />
                  </div>
                  <span className="chip-text">Hackathon Builders</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
           E. HOW IT WORKS (Three-Step Connected Timeline)
           ========================================================= */}
        <section className="workflow-block" id="how-it-works">
          <div className="section-inner-container">
            <div className="workflow-header-center">
              <h2 className="workflow-title">
                How It <span className="coral-gradient-text">Works</span>
              </h2>
              <p className="workflow-subtitle">Get started in three simple steps</p>
            </div>

            <div className="workflow-timeline">
              <div className="timeline-connector-bar" />

              {/* Step 1 */}
              <div className="timeline-step">
                <div className="step-circle-badge">1</div>
                <h3 className="step-heading">Create Workspace</h3>
                <p className="step-detail">
                  Set up your coding environment in seconds.
                </p>
              </div>

              {/* Step 2 */}
              <div className="timeline-step">
                <div className="step-circle-badge">2</div>
                <h3 className="step-heading">Write or Speak Code</h3>
                <p className="step-detail">
                  Type naturally or use voice commands.
                </p>
              </div>

              {/* Step 3 */}
              <div className="timeline-step">
                <div className="step-circle-badge">3</div>
                <h3 className="step-heading">Run & Build Instantly</h3>
                <p className="step-detail">
                  Execute and deploy with one click.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
         F. FOOTER
         ========================================================= */}
      <footer className="site-footer">
        {/* Delicate Corner Decorative Curves */}
        <svg
          className="footer-edge-curves footer-curves-left"
          viewBox="0 0 320 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M -20 180 C 80 160, 160 110, 220 20" stroke="rgba(59, 220, 126, 0.28)" strokeWidth="1" />
          <path d="M 0 240 C 120 220, 210 160, 280 40" stroke="rgba(24, 229, 208, 0.22)" strokeWidth="0.8" />
          <path d="M -40 210 C 60 190, 130 140, 180 60" stroke="rgba(255, 151, 71, 0.18)" strokeWidth="0.7" strokeDasharray="3 3" />
        </svg>

        <svg
          className="footer-edge-curves footer-curves-right"
          viewBox="0 0 320 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M 340 180 C 240 160, 160 100, 100 10" stroke="rgba(255, 151, 71, 0.25)" strokeWidth="1" />
          <path d="M 320 240 C 200 210, 110 140, 40 30" stroke="rgba(59, 220, 126, 0.22)" strokeWidth="0.8" />
          <path d="M 360 210 C 260 180, 180 130, 130 50" stroke="rgba(185, 255, 57, 0.16)" strokeWidth="0.7" strokeDasharray="4 2" />
        </svg>

        <div className="footer-inner-container">
          {/* Column 1: Brand Logo, Tagline, Social Links */}
          <div className="footer-identity-col">
            <div
              className="brand-identity footer-brand-identity"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              role="button"
              tabIndex={0}
              title="Vocodeai"
            >
              <img
                src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
                alt="Vocodeai Logo"
                className="brand-icon footer-logo"
              />
            </div>

            <p className="footer-mission-statement">
              Build, code, and execute with AI —<br />
              all in one workspace.
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

          {/* Column 2: Product */}
          <div className="footer-nav-col">
            <h4 className="footer-col-header">Product</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => scrollToSection("features")}>Features</button></li>
              <li><button onClick={() => scrollToSection("how-it-works")}>Pricing</button></li>
              <li><button onClick={() => scrollToSection("use-cases")}>Use Cases</button></li>
              <li><button onClick={() => navigate("/docs")}>Docs</button></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="footer-nav-col">
            <h4 className="footer-col-header">Company</h4>
            <ul className="footer-links-list">
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="mailto:supportvocodeai@gmail.com">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="footer-nav-col">
            <h4 className="footer-col-header">Legal</h4>
            <ul className="footer-links-list">
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#cookies">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Vocodeai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

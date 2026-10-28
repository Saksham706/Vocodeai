import "../styles/landing.css";
import { useEffect, useState } from "react";
import {
  FaFolderPlus,
  FaCommentDots,
  FaRocket,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Landing = () => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [visible, setVisible] = useState([]);
  const navigate = useNavigate();
  const login = () => {
    navigate("/login");
  };

  const codeLines = [
    "function fibonacci(n) {",
    "  if (n <= 1) return n;",
    "  return fibonacci(n-1) + fibonacci(n-2);",
    "}",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedLines((prev) => [...prev, codeLines[i]]);
      i++;
      if (i === codeLines.length) clearInterval(interval);
    }, 600); // speed of typing

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delays = [0, 300, 600, 900];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, index]);
      }, delay);
    });
  }, []);

  const features = [
    {
      title: "AI Assistant",
      desc: "Get intelligent code suggestions, debugging help, and instant answers powered by advanced AI.",
      icon: "🤖",
    },
    {
      title: "Smart Code Editor",
      desc: "Syntax highlighting, auto-completion, and real-time collaboration in a beautiful interface.",
      icon: "</>",
    },
    {
      title: "Cloud Terminal",
      desc: "Execute commands, run scripts, and build projects directly in the cloud with instant feedback.",
      icon: ">_",
    },
    {
      title: "Voice Control",
      desc: "Code with your voice. Dictate commands, write code, and control your workspace hands-free.",
      icon: "🎤",
    },
  ];

  useEffect(() => {
    const delays = [0, 300, 600, 900];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, index]);
      }, delay);
    });
  }, []);

  const data = [
    {
      title: "Students",
      desc: "Learn coding with AI guidance",
      icon: "🎓",
    },
    {
      title: "Developers",
      desc: "Build projects faster with AI",
      icon: "</>",
    },
    {
      title: "Teams",
      desc: "Collaborate in real-time",
      icon: "👥",
    },
    {
      title: "Hackathon Builders",
      desc: "Ship MVPs in hours",
      icon: "🏆",
    },
  ];

  useEffect(() => {
    const delays = [0, 300, 600, 900];

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, index]);
      }, delay);
    });
  }, []);

  const items = [
    {
      title: "Rapid Prototyping",
      desc: "Build and test ideas in minutes with AI-assisted coding and instant deployment.",
      icon: "⚡",
    },
    {
      title: "Learning Coding",
      desc: "Interactive tutorials, AI explanations, and real-time feedback for beginners.",
      icon: "📘",
    },
    {
      title: "AI Development",
      desc: "Experiment with AI models, train algorithms, and integrate machine learning.",
      icon: "🧠",
    },
    {
      title: "Remote Coding",
      desc: "Access your workspace anywhere with cloud-based development environment.",
      icon: "☁️",
    },
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* LEFT: Logo */}
          <div className="mainlogo">
            <img src="/Nlogo.png" alt="VocodeAI Logo" className="mainlogo-img" />
          </div>

          {/* RIGHT: Links + Button */}
          <div className="right-group">
            <ul className="links">
              <li>Features</li>
              <li>Use Cases</li>
              <li>Pricing</li>
              <li>Docs</li>
            </ul>

            <button className="btn" onClick={login}>
              Enter VocodeAI
            </button>
          </div>
        </div>
      </nav>
      <section className="hero">
        {/* LEFT */}
        <div className="hero-left">
          <div className="badges">🚀 AI-Powered Coding Platform</div>

          <h1>
            Build, Code, and <br />
            Execute with AI —
            <span className="highlight"> All in One Workspace</span>
          </h1>

          <p>
            A futuristic AI workspace with smart coding, voice commands, and
            cloud execution.
          </p>

          <div className="buttons">
            <button className="primary" onClick={login}>Get Started</button>
            <button className="secondary">View Demo</button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          {/* Code Editor */}
          <div className="code-box">
            <div className="code-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
              <span className="file">main.js</span>
            </div>

            <div className="code-content">
              {displayedLines.map((line, index) => (
                <div key={index} className="code-line">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Terminal */}
          <div className="terminal">
            <p>$ node main.js</p>
            <p className="running">Running...</p>
            <p className="success">✓ Executed successfully</p>
          </div>

          {/* AI Assistant */}
          <div className="assistants">
            <strong>✨ AI Assistant</strong>
            <p>I optimized your code for better performance!</p>
          </div>
        </div>
      </section>
      <section className="features">
        {/* Heading */}
        <div className="features-header">
          <h2>
            Powerful Features for <span>Modern Developers</span>
          </h2>
          <p>Everything you need to code faster and smarter</p>
        </div>

        {/* Cards */}
        <div className="features-grid">
          {features.map((item, index) => (
            <div
              key={index}
              className={`card ${visible.includes(index) ? "show" : ""}`}
            >
              <div className="icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="audience">
        {/* HEADER */}
        <div className="audience-header">
          <h2>Made For Everyone</h2>
          <p>From beginners to professionals</p>
        </div>

        {/* CARDS */}
        <div className="audience-grid">
          {data.map((item, index) => (
            <div
              key={index}
              className={`audience-card ${
                visible.includes(index) ? "show" : ""
              }`}
            >
              <div className="icon-circle">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="possibilities">
        {/* HEADER */}
        <div className="poss-header">
          <h2>
            Endless <span>Possibilities</span>
          </h2>
          <p>See what you can build with VocodeAI</p>
        </div>

        {/* GRID */}
        <div className="poss-grid">
          {items.map((item, index) => (
            <div
              key={index}
              className={`poss-card ${visible.includes(index) ? "show" : ""}`}
            >
              <div className="icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="how-container">
        <h1 className="title">How It Works</h1>
        <p className="subtitle">Get started in three simple steps</p>

        <div className="steps-wrapper">
          {/* Horizontal Line */}

          {/* Step 1 */}
          <div className="step">
            <div className="circle">1</div>

            <div className="icon-box">
              <FaFolderPlus />
            </div>

            <h3>Create Workspace</h3>
            <p>Set up your coding environment in seconds</p>
          </div>

          {/* Step 2 */}
          <div className="step">
            <div className="circle">2</div>

            <div className="icon-box">
              <FaCommentDots />
            </div>

            <h3>Write or Speak Code</h3>
            <p>Type naturally or use voice commands</p>
          </div>

          {/* Step 3 */}
          <div className="step">
            <div className="circle">3</div>

            <div className="icon-box">
              <FaRocket />
            </div>

            <h3>Run & Build Instantly</h3>
            <p>Execute and deploy with one click</p>
          </div>
        </div>
      </section>

      <section className="pricing">
        {/* HEADER */}
        <div className="pricing-header">
          <h2>
            Simple, <span>Transparent Pricing</span>
          </h2>
          <p>Choose the plan that fits your needs</p>
        </div>

        {/* CARDS */}
        <div className="pricing-grid">
          {/* FREE */}
          <div className="pricing-card">
            <h3>Free</h3>
            <p className="subtitle">Perfect for getting started</p>

            <div className="price">
              ₹0 <span>/month</span>
            </div>

            <ul>
              <li>✔ Limited AI usage</li>
              <li>✔ 1 workspace</li>
              <li>✔ Basic code editor</li>
              <li>✔ Community support</li>
            </ul>

            <button className="btn-outline">Get Started</button>
          </div>

          {/* PRO (Highlighted) */}
          <div className="pricing-card active">
            <div className="badge">⭐ MOST POPULAR</div>

            <h3>Pro</h3>
            <p className="subtitle">For serious developers</p>

            <div className="price">
              ₹499 <span>/month</span>
            </div>

            <ul>
              <li>✔ Unlimited AI usage</li>
              <li>✔ Unlimited workspaces</li>
              <li>✔ Cloud execution</li>
              <li>✔ Advanced code editor</li>
              <li>✔ Priority support</li>
              <li>✔ Voice commands</li>
            </ul>

            <button className="btn-fill">Get Started</button>
          </div>

          {/* TEAM */}
          <div className="pricing-card">
            <h3>Team</h3>
            <p className="subtitle">For collaborative teams</p>

            <div className="price">
              ₹999 <span>/month</span>
            </div>

            <ul>
              <li>✔ Everything in Pro</li>
              <li>✔ Team collaboration</li>
              <li>✔ Shared workspaces</li>
              <li>✔ Admin dashboard</li>
              <li>✔ SSO integration</li>
              <li>✔ 24/7 support</li>
            </ul>

            <button className="btn-outline" onClick={login}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          {/* ICON */}
          <div className="cta-icon">✨</div>

          {/* HEADING */}
          <h2>
            Start Building with AI <span>Today</span>
          </h2>

          {/* SUBTEXT */}
          <p>
            Join thousands of developers who are building faster and smarter
            with VocodeAI's AI-powered workspace.
          </p>

          {/* BUTTON */}
          <button className="cta-btn">Enter VocodeAI →</button>

          {/* FOOT TEXT */}
          <div className="cta-footer">
            No credit card required • Free forever plan available
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          {/* LEFT */}
          <div className="footer-left">
            <div className="mainlogo">
            <img src="/Nlogo.png" alt="VocodeAI Logo" className="mainlogos-img" />
          </div>

            <p>Build, code, and execute with AI — all in one workspace.</p>

            <div className="socials">
              <FaGithub />
              <FaTwitter />
              <FaLinkedin />
              <FaEnvelope />
            </div>
          </div>

          {/* COLUMN 1 */}
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>Features</li>
              <li>Pricing</li>
              <li>Use Cases</li>
              <li>Docs</li>
            </ul>
          </div>

          {/* COLUMN 2 */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* COLUMN 3 */}
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <span>© 2026 VocodeAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

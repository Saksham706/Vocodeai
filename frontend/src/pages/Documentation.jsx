import React, { useEffect, useRef, useState } from "react";
import "../styles/Documentation.css";
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
  Play,
  Copy,
  Lightbulb,
  AlertTriangle,
  Info,
} from "lucide-react";

const Documentation = () => {
  const sections = [
    "What is VocodeAI?",
    "How AI Works",
    "Workspace Architecture",
    "Code Examples",
    "AI Features",
    "Video Tutorials",
    "API Documentation",
    "Tips & Best Practices",
  ];

  const [activeSection, setActiveSection] = useState(sections[0]);
  const [progress, setProgress] = useState(0);

  const refs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const scrolled = (scrollTop / docHeight) * 100;
      setProgress(scrolled);

      sections.forEach((section) => {
        const element = refs.current[section];

        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (section) => {
    refs.current[section]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="docs-wrapper">
      <div className="docs-main">
        {/* HERO */}
        <section
          ref={(el) => (refs.current["What is VocodeAI?"] = el)}
          className="docs-section hero-section"
        >
          <span className="docs-badge">Developer Docs</span>

          <h1>VocodeAI Documentation</h1>

          <p className="hero-text">
            Learn how the AI-powered coding workspace works, from intelligent
            code generation to cloud execution and voice-assisted development.
          </p>

          <div className="hero-meta">
            <span>15 min read</span>
            <span>Last updated: May 12, 2026</span>
          </div>

          <h2>What is VocodeAI?</h2>

          <div className="glass-card large-card">
            <p>
              VocodeAI is a next-generation AI-powered coding workspace that
              combines voice commands, intelligent code generation, and
              cloud-based execution to revolutionize software development.
            </p>
          </div>

          <div className="feature-grid">
            <div className="glass-card">
              <Sparkles className="feature-icon" />
              <h3>AI-Powered Development</h3>
              <p>
                Generate, refactor, and optimize code using advanced AI models.
              </p>
            </div>

            <div className="glass-card">
              <Globe className="feature-icon" />
              <h3>Cloud Execution</h3>
              <p>Run code in isolated and secure cloud containers.</p>
            </div>

            <div className="glass-card">
              <Mic className="feature-icon" />
              <h3>Voice-Assisted Coding</h3>
              <p>Write code using natural language voice commands.</p>
            </div>

            <div className="glass-card">
              <Bug className="feature-icon" />
              <h3>Real-Time Debugging</h3>
              <p>AI detects and fixes syntax and logic issues instantly.</p>
            </div>
          </div>
        </section>

        {/* HOW AI WORKS */}
        <section
          ref={(el) => (refs.current["How AI Works"] = el)}
          className="docs-section"
        >
          <h2>How AI Works</h2>

          <div className="timeline-card">
            {[
              "User Prompt",
              "AI Processing",
              "Code Generation",
              "Error Detection",
              "Optimization",
              "Runtime Execution",
              "Final Output",
            ].map((item, index) => (
              <div className="timeline-item" key={index}>
                <div className="timeline-number">
                  {(index + 1).toString().padStart(2, "0")}
                </div>

                <div>
                  <h3>{item}</h3>
                  <p>
                    {
                      [
                        "Natural language or voice input",
                        "Intent recognition and context analysis",
                        "Production-ready code creation",
                        "Syntax and logic validation",
                        "Performance and best practice checks",
                        "Cloud-based code execution",
                        "Results delivered to workspace",
                      ][index]
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section
          ref={(el) => (refs.current["Workspace Architecture"] = el)}
          className="docs-section"
        >
          <h2>Workspace Architecture</h2>

          <div className="feature-grid">
            <div className="glass-card">
              <Code2 className="feature-icon" />
              <h3>React Frontend</h3>
              <p>Modern UI with Monaco Editor.</p>
            </div>

            <div className="glass-card">
              <Server className="feature-icon" />
              <h3>Node.js Backend</h3>
              <p>Express APIs & WebSocket integration.</p>
            </div>

            <div className="glass-card">
              <Database className="feature-icon" />
              <h3>MongoDB</h3>
              <p>Stores projects, users, and AI history.</p>
            </div>

            <div className="glass-card">
              <Cpu className="feature-icon" />
              <h3>Docker Runtime</h3>
              <p>Isolated execution environments.</p>
            </div>

            <div className="glass-card">
              <Sparkles className="feature-icon" />
              <h3>AI Engine</h3>
              <p>Code generation, debugging, and optimization.</p>
            </div>

            <div className="glass-card">
              <Zap className="feature-icon" />
              <h3>WebSocket</h3>
              <p>Real-time updates and collaboration.</p>
            </div>
          </div>
        </section>

        {/* CODE EXAMPLES */}
        <section
          ref={(el) => (refs.current["Code Examples"] = el)}
          className="docs-section"
        >
          <h2>Code Examples</h2>

          <div className="code-block">
            <div className="code-header">
              <span>AI Code Generation Example</span>
              <button>
                <Copy size={18} />
                Copy
              </button>
            </div>

            <pre>
{`// AI-generated function
async function generateCode(prompt, fileName, changes) {

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      prompt,
      fileName,
      changes
    })
  });

  return await response.json();
}

// Example
generateCode(
  "Improve authentication flow",
  "AuthController.js",
  "Add JWT refresh token support"
);`}
            </pre>
          </div>

          <div className="code-block">
            <div className="code-header">
              <span>Voice Command Handler</span>
              <button>
                <Copy size={18} />
                Copy
              </button>
            </div>

            <pre>
{`# Voice-to-code processing

def process_voice_command(audio_input):

    transcription = ai_engine.transcribe(audio_input)

    result = ai_engine.generate_code({
        "fileName": "server.js",
        "changes": "Add websocket authentication"
    })

    return result`}
            </pre>
          </div>
        </section>

        {/* AI FEATURES */}
        <section
          ref={(el) => (refs.current["AI Features"] = el)}
          className="docs-section"
        >
          <h2>AI Features</h2>

          <div className="feature-grid">
            {[
              {
                title: "AI Code Generation",
                desc: "Generate functions, APIs, and modules from prompts.",
                icon: <Code2 className="feature-icon" />,
              },
              {
                title: "AI Refactoring",
                desc: "Automatically improve readability and structure.",
                icon: <Wrench className="feature-icon" />,
              },
              {
                title: "AI Debugging",
                desc: "Context-aware error detection and suggestions.",
                icon: <Bug className="feature-icon" />,
              },
              {
                title: "Voice-to-Code",
                desc: "Convert natural language into production code.",
                icon: <Mic className="feature-icon" />,
              },
              {
                title: "Smart Suggestions",
                desc: "Real-time optimization and code completion.",
                icon: <Zap className="feature-icon" />,
              },
              {
                title: "Multi-language Support",
                desc: "JavaScript, Python, Go, Rust and more.",
                icon: <Cpu className="feature-icon" />,
              },
            ].map((item, index) => (
              <div className="glass-card" key={index}>
                {item.icon}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VIDEOS */}
        <section
          ref={(el) => (refs.current["Video Tutorials"] = el)}
          className="docs-section"
        >
          <h2>Video Tutorials</h2>

          <div className="video-grid">
            {[
              "Getting Started with VocodeAI",
              "AI Assistant Deep Dive",
              "Voice Coding Tutorial",
              "Deploying Cloud Containers",
            ].map((title, index) => (
              <div className="video-card" key={index}>
                <div className="video-thumbnail">
                  <Play fill="#00ffb3" size={38} />
                </div>

                <h3>{title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* API */}
        <section
          ref={(el) => (refs.current["API Documentation"] = el)}
          className="docs-section"
        >
          <h2>API Documentation</h2>

          <div className="api-card">
            <div className="api-top">
              <span className="method">POST</span>
              <span>/api/ai/generate</span>
            </div>

            <p>
              Generate code from a natural language prompt and selected file.
            </p>

            <div className="api-code">
{`{
  "prompt": "Optimize authentication flow",
  "fileName": "AuthController.js",
  "changes": "Add refresh token logic",
  "language": "javascript"
}`}
            </div>

            <div className="api-code">
{`{
  "success": true,
  "updatedFile": "AuthController.js",
  "message": "JWT refresh token added successfully"
}`}
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section
          ref={(el) => (refs.current["Tips & Best Practices"] = el)}
          className="docs-section"
        >
          <h2>Tips & Best Practices</h2>

          <div className="tips-container">
            <div className="tip-card green">
              <Lightbulb />
              <div>
                <h3>Prompt Optimization</h3>
                <p>
                  Define the exact file name and clearly mention the required
                  changes for more accurate AI-generated code.
                </p>
              </div>
            </div>

            <div className="tip-card purple">
              <Info />
              <div>
                <h3>Code Review</h3>
                <p>
                  Always review generated code before production deployment.
                </p>
              </div>
            </div>

            <div className="tip-card yellow">
              <AlertTriangle />
              <div>
                <h3>API Limits</h3>
                <p>
                  Free tier accounts have limited AI requests per day.
                </p>
              </div>
            </div>

            <div className="tip-card blue">
              <Info />
              <div>
                <h3>Cloud Runtime Timeout</h3>
                <p>
                  Long-running tasks should be split into smaller operations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SIDEBAR */}
      <aside className="docs-sidebar">
        <h3>ON THIS PAGE</h3>

        <div className="sidebar-links">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(section)}
              className={activeSection === section ? "active" : ""}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="progress-wrapper">
          <p>Reading Progress</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Documentation;
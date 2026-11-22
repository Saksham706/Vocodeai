/**
 * VocodeAI Starter Templates Configuration
 * Curated project starters with full pre-configured file scaffolding.
 */

export const STARTER_TEMPLATES = [
  {
    id: "ai-voice-assistant",
    title: "AI Voice Assistant",
    subtitle: "Real-time speech recognition & synthesis web app",
    description: "Interactive voice assistant utilizing the Web Speech API and an AI query loop with voice visualizer animations.",
    category: "ai",
    badge: "Featured AI",
    icon: "Mic",
    color: "#10B981",
    tags: ["Voice", "Speech Recognition", "Gemini", "Web Audio"],
    recommendedFile: "index.html",
    files: [
      {
        path: "index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VocodeAI Voice Assistant</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="assistant-container">
    <div class="header">
      <div class="logo-badge">VOCODEAI</div>
      <h1>Voice AI Companion</h1>
      <p>Speak naturally or type your command below.</p>
    </div>

    <!-- Visualizer Orb -->
    <div class="orb-wrapper">
      <div id="orb" class="voice-orb"></div>
      <div class="pulse-ring"></div>
    </div>

    <!-- Live Status -->
    <div id="status" class="status-indicator">Ready • Click Mic to Start</div>

    <!-- Transcript Box -->
    <div class="transcript-card">
      <div class="transcript-header">
        <span>Conversation Feed</span>
        <button id="clearBtn" class="clear-btn">Clear</button>
      </div>
      <div id="conversationLog" class="conversation-log">
        <div class="msg bot">
          <strong>VocodeAI:</strong> Hello! How can I assist your coding today?
        </div>
      </div>
    </div>

    <!-- Control Actions -->
    <div class="controls-row">
      <button id="micBtn" class="mic-button" title="Toggle Microphone">
        <span class="mic-icon">🎙️</span>
        <span id="micLabel">Start Listening</span>
      </button>
      <div class="input-fallback">
        <input type="text" id="textInput" placeholder="Or type a question..." />
        <button id="sendBtn">Send</button>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`
      },
      {
        path: "style.css",
        type: "file",
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #020b08;
  color: #f3f8f4;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.assistant-container {
  width: 100%;
  max-width: 680px;
  background: #061710;
  border: 1px solid rgba(104, 185, 124, 0.25);
  border-radius: 20px;
  padding: 36px 30px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.header {
  text-align: center;
}

.logo-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.header h1 {
  font-size: 26px;
  font-weight: 750;
  color: #ffffff;
}

.header p {
  font-size: 14px;
  color: #8ba195;
  margin-top: 4px;
}

/* Voice Orb Animation */
.orb-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.voice-orb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #10b981 0%, #059669 60%, #022c22 100%);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.6);
  transition: all 0.3s ease;
}

.voice-orb.listening {
  transform: scale(1.15);
  box-shadow: 0 0 45px rgba(255, 155, 61, 0.85);
  background: radial-gradient(circle, #ff9b3d 0%, #ea580c 60%, #431407 100%);
  animation: pulseOrb 1.4s infinite alternate;
}

.voice-orb.speaking {
  box-shadow: 0 0 45px rgba(59, 130, 246, 0.8);
  background: radial-gradient(circle, #38bdf8 0%, #2563eb 60%, #1e1b4b 100%);
  animation: waveOrb 0.8s infinite alternate;
}

@keyframes pulseOrb {
  0% { transform: scale(1); }
  100% { transform: scale(1.22); }
}

@keyframes waveOrb {
  0% { transform: scale(1.05); filter: hue-rotate(0deg); }
  100% { transform: scale(1.18); filter: hue-rotate(45deg); }
}

.status-indicator {
  font-size: 13.5px;
  font-weight: 500;
  color: #c1d2c7;
  background: #092018;
  padding: 6px 16px;
  border-radius: 12px;
  border: 1px solid rgba(104, 185, 124, 0.2);
}

.transcript-card {
  width: 100%;
  background: #030e0a;
  border: 1px solid rgba(104, 185, 124, 0.18);
  border-radius: 14px;
  overflow: hidden;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #071912;
  font-size: 12px;
  font-weight: 600;
  color: #8ba195;
  border-bottom: 1px solid rgba(104, 185, 124, 0.12);
}

.clear-btn {
  background: none;
  border: none;
  color: #8ba195;
  cursor: pointer;
  font-size: 11px;
}

.clear-btn:hover {
  color: #f87171;
}

.conversation-log {
  max-height: 220px;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg {
  font-size: 13.5px;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 85%;
}

.msg.user {
  align-self: flex-end;
  background: #ff9b3d;
  color: #101c24;
  font-weight: 500;
}

.msg.bot {
  align-self: flex-start;
  background: #0c271e;
  color: #e5e7eb;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.controls-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mic-button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(100deg, #10b981 0%, #059669 100%);
  border: none;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.mic-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.mic-button.active {
  background: linear-gradient(100deg, #ff9b3d 0%, #ff6347 100%);
  box-shadow: 0 4px 16px rgba(255, 99, 71, 0.45);
}

.input-fallback {
  display: flex;
  gap: 8px;
}

.input-fallback input {
  flex: 1;
  background: #030e0a;
  border: 1px solid rgba(104, 185, 124, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  color: #f3f8f4;
  font-size: 13.5px;
  outline: none;
}

.input-fallback input:focus {
  border-color: #10b981;
}

.input-fallback button {
  padding: 0 20px;
  background: #0d2a1d;
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
}

.input-fallback button:hover {
  background: #10b981;
  color: #020b08;
}`
      },
      {
        path: "app.js",
        type: "file",
        content: `// VocodeAI Voice Assistant Logic
const orb = document.getElementById("orb");
const statusText = document.getElementById("status");
const micBtn = document.getElementById("micBtn");
const micLabel = document.getElementById("micLabel");
const conversationLog = document.getElementById("conversationLog");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

let isListening = false;
let recognition = null;

// Initialize Speech Recognition if supported
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isListening = true;
    orb.className = "voice-orb listening";
    micBtn.classList.add("active");
    micLabel.textContent = "Listening... Speak now";
    statusText.textContent = "🎙️ Listening to your voice...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserInput(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopListening();
    statusText.textContent = "Recognition error: " + event.error;
  };

  recognition.onend = () => {
    stopListening();
  };
} else {
  statusText.textContent = "Voice input unsupported in this browser (use text below)";
}

function startListening() {
  if (!recognition) return;
  try {
    recognition.start();
  } catch (err) {
    console.warn("Recognition already active", err);
  }
}

function stopListening() {
  isListening = false;
  orb.className = "voice-orb";
  micBtn.classList.remove("active");
  micLabel.textContent = "Start Listening";
  statusText.textContent = "Ready • Click Mic to Start";
}

micBtn.addEventListener("click", () => {
  if (isListening) {
    if (recognition) recognition.stop();
    stopListening();
  } else {
    startListening();
  }
});

sendBtn.addEventListener("click", () => {
  const query = textInput.value.trim();
  if (query) {
    handleUserInput(query);
    textInput.value = "";
  }
});

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

clearBtn.addEventListener("click", () => {
  conversationLog.innerHTML = "";
});

function appendMessage(text, role) {
  const div = document.createElement("div");
  div.className = \`msg \${role}\`;
  div.innerHTML = role === "user" ? \`<strong>You:</strong> \${text}\` : \`<strong>VocodeAI:</strong> \${text}\`;
  conversationLog.appendChild(div);
  conversationLog.scrollTop = conversationLog.scrollHeight;
}

// Simulated intelligent response generator
async function handleUserInput(text) {
  appendMessage(text, "user");
  statusText.textContent = "Thinking...";

  // Bot response with speech synthesis
  setTimeout(() => {
    const reply = generateAIResponse(text);
    appendMessage(reply, "bot");
    speakReply(reply);
  }, 600);
}

function generateAIResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Greetings! I am your VocodeAI companion. You can ask me to debug code, explain concepts, or brainstorm features.";
  } else if (lower.includes("weather")) {
    return "The local weather is clear and optimal for coding!";
  } else if (lower.includes("help") || lower.includes("template")) {
    return "This template provides instant voice I/O, speech synthesis, and extensible AI agent hooks.";
  } else if (lower.includes("time")) {
    return "The current time is " + new Date().toLocaleTimeString();
  } else {
    return \`I received: "\${input}". Connect this function to Google Gemini for full agentic intelligence!\`;
  }
}

function speakReply(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    orb.className = "voice-orb speaking";
    statusText.textContent = "🔊 Speaking...";
  };

  utterance.onend = () => {
    orb.className = "voice-orb";
    statusText.textContent = "Ready • Click Mic to Start";
  };

  window.speechSynthesis.speak(utterance);
}
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# VocodeAI Voice Assistant Starter 🎙️

Welcome to the **VocodeAI Voice Assistant** template!

## 🚀 Overview
This template provides an end-to-end voice companion interface featuring:
- **Speech-to-Text**: Converts live microphone speech into text via \`SpeechRecognition\`.
- **Holographic Voice Orb**: Dynamic CSS animations responding to Listening & Speaking states.
- **Text-to-Speech**: Natural voice readouts via the browser \`speechSynthesis\` API.
- **AI Extension Point**: Connect your backend or Gemini API to \`generateAIResponse()\` in \`app.js\`.

## 🖥️ Live Preview
Click **👁 Preview** in the top bar to run and test this app directly in VocodeAI's live preview!
`
      }
    ]
  },
  {
    id: "react-vite",
    title: "React + Vite SPA",
    subtitle: "High performance modern React 18 frontend",
    description: "Modern React setup with Vite, fast HMR, component structure, and responsive styling ready for instant preview.",
    category: "frontend",
    badge: "Popular",
    icon: "Atom",
    color: "#61DAFB",
    tags: ["React 18", "Vite", "JavaScript", "Live Preview"],
    recommendedFile: "src/App.jsx",
    files: [
      {
        path: "package.json",
        type: "file",
        content: `{
  "name": "vocode-react-starter",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}`
      },
      {
        path: "vite.config.js",
        type: "file",
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});`
      },
      {
        path: "index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VocodeAI React Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      },
      {
        path: "src/main.jsx",
        type: "file",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      {
        path: "src/App.jsx",
        type: "file",
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <div className="badge">VOCODEAI REACT</div>
      <h1>Interactive React Starter</h1>
      <p className="subtitle">
        Edit <code>src/App.jsx</code> and preview your changes instantly.
      </p>

      <div className="card">
        <button className="counter-btn" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
        <button className="reset-btn" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-item">
          <h3>⚡ Vite Fast HMR</h3>
          <p>Instant hot module replacement for ultra-fast development.</p>
        </div>
        <div className="feature-item">
          <h3>⚛️ React 18</h3>
          <p>Clean functional components with React Hooks ready to build.</p>
        </div>
        <div className="feature-item">
          <h3>🎨 Vocode Theme</h3>
          <p>Pre-styled with modern dark SaaS design tokens.</p>
        </div>
      </div>
    </div>
  );
}`
      },
      {
        path: "src/index.css",
        type: "file",
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #020b08;
  color: #f3f8f4;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 640px;
  width: 90%;
  text-align: center;
  padding: 40px 20px;
}

.badge {
  display: inline-block;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  border-radius: 20px;
  background: rgba(97, 218, 251, 0.12);
  color: #61dafb;
  border: 1px solid rgba(97, 218, 251, 0.3);
  margin-bottom: 14px;
}

h1 {
  font-size: 32px;
  font-weight: 750;
  margin-bottom: 8px;
}

.subtitle {
  color: #8ba195;
  font-size: 15px;
  margin-bottom: 28px;
}

code {
  background: #092018;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ff9b3d;
  font-family: monospace;
}

.card {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 36px;
}

.counter-btn {
  background: linear-gradient(100deg, #ff9b3d 0%, #ff6347 100%);
  border: none;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 99, 71, 0.35);
  transition: transform 0.2s ease;
}

.counter-btn:hover {
  transform: translateY(-2px);
}

.reset-btn {
  background: #071912;
  border: 1px solid rgba(104, 185, 124, 0.25);
  color: #c1d2c7;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  text-align: left;
}

.feature-item {
  background: #061710;
  border: 1px solid rgba(104, 185, 124, 0.2);
  border-radius: 12px;
  padding: 18px;
}

.feature-item h3 {
  font-size: 15px;
  color: #ffffff;
  margin-bottom: 6px;
}

.feature-item p {
  font-size: 12.5px;
  color: #8ba195;
  line-height: 1.5;
}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# React + Vite Starter

Quickly build modern reactive web applications inside VocodeAI.

## 🛠️ Commands
- Run in Cloud Terminal:
\`\`\`bash
npm install
npm run dev
\`\`\`
`
      }
    ]
  },
  {
    id: "node-express",
    title: "Node.js & Express REST API",
    subtitle: "Modular backend server with JSON routing & CORS",
    description: "Production-ready Express.js boilerplate with structured routing, environment configuration, and health diagnostics.",
    category: "backend",
    badge: "Backend",
    icon: "Server",
    color: "#339933",
    tags: ["Node 20", "Express", "REST", "JSON API"],
    recommendedFile: "server.js",
    files: [
      {
        path: "package.json",
        type: "file",
        content: `{
  "name": "vocode-express-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}`
      },
      {
        path: "server.js",
        type: "file",
        content: `import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

// Root & Health Check
app.get("/", (req, res) => {
  res.json({
    service: "VocodeAI Express API",
    status: "online",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      items: "/api/items"
    }
  });
});

// Mount modular API routes
app.use("/api", apiRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(\`🚀 VocodeAI API Server running at http://localhost:\${PORT}\`);
});`
      },
      {
        path: "routes/api.js",
        type: "file",
        content: `import express from "express";

const router = express.Router();

let items = [
  { id: 1, title: "Initialize Cloud Sandbox", completed: true },
  { id: 2, title: "Design Voice Workflow", completed: false },
  { id: 3, title: "Deploy API Endpoint", completed: false },
];

// Health Check
router.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// List items
router.get("/items", (req, res) => {
  res.json(items);
});

// Create item
router.post("/items", (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newItem = {
    id: items.length + 1,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

export default router;`
      },
      {
        path: ".env.example",
        type: "file",
        content: `PORT=5000
NODE_ENV=development`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Node.js Express REST API 🚀

A modular Node.js API server configured with Express and ES Modules.

## 🏃 Running the Server
Click **▶ Run File** on \`server.js\` or run:
\`\`\`bash
npm install
node server.js
\`\`\`

## 📡 Endpoints
- \`GET /\` - System status
- \`GET /api/health\` - Health check
- \`GET /api/items\` - Get all sample items
- \`POST /api/items\` - Create new item \`{ "title": "Example" }\`
`
      }
    ]
  },
  {
    id: "python-fastapi",
    title: "Python FastAPI Server",
    subtitle: "High-performance async REST API with auto Swagger UI",
    description: "FastAPI application with auto-generated documentation, Pydantic type safety, and CORS middleware.",
    category: "backend",
    badge: "High Performance",
    icon: "Zap",
    color: "#009688",
    tags: ["FastAPI", "Python 3", "Async", "Swagger"],
    recommendedFile: "main.py",
    files: [
      {
        path: "requirements.txt",
        type: "file",
        content: `fastapi>=0.110.0
uvicorn>=0.28.0
pydantic>=2.6.0`
      },
      {
        path: "main.py",
        type: "file",
        content: `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(
    title="VocodeAI FastAPI Service",
    description="High performance asynchronous API running inside VocodeAI cloud runner.",
    version="1.0.0"
)

# Enable CORS for web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskItem(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False

# In-memory storage
database: List[TaskItem] = [
    TaskItem(id=1, title="Configure Python Environment", completed=True),
    TaskItem(id=2, title="Connect VocodeAI Voice Assistant", completed=False),
]

@app.get("/")
def read_root():
    return {
        "service": "VocodeAI FastAPI Server",
        "docs_url": "/docs",
        "status": "online",
        "timestamp": time.time()
    }

@app.get("/items", response_model=List[TaskItem])
def get_items():
    return database

@app.post("/items", response_model=TaskItem, status_code=201)
def create_item(item: TaskItem):
    item.id = len(database) + 1
    database.append(item)
    return item

@app.get("/items/{item_id}", response_model=TaskItem)
def get_item(item_id: int):
    for item in database:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python FastAPI Starter 🐍

Modern, fast (high-performance) web API with Python 3 and FastAPI.

## 🚀 How to Run
In the Cloud Terminal:
\`\`\`bash
pip install -r requirements.txt
python3 main.py
\`\`\`

Interactive API Documentation is available at:
\`http://localhost:8000/docs\`
`
      }
    ]
  },
  {
    id: "python-ai",
    title: "Python AI & Agent Script",
    subtitle: "AI task runner and data automation pipeline",
    description: "Script for automated task execution, CLI prompts, JSON data pipelines, and AI agent chaining in Python.",
    category: "ai",
    badge: "AI Ready",
    icon: "Cpu",
    color: "#3776AB",
    tags: ["Python 3", "AI Agent", "CLI", "Automation"],
    recommendedFile: "main.py",
    files: [
      {
        path: "main.py",
        type: "file",
        content: `#!/usr/bin/env python3
"""
VocodeAI Python AI Agent Runner
Interactive task processing and pipeline execution.
"""
import sys
import json
import time

def banner():
    print("=" * 55)
    print("  🤖 VOCODEAI PYTHON AGENT PIPELINE")
    print("=" * 55)

class CodeAgent:
    def __init__(self, name="VocodeAgent"):
        self.name = name
        self.memory = []

    def log_thought(self, thought: str):
        print(f"🧠 [{self.name} Thinking]: {thought}")
        self.memory.append({"type": "thought", "content": thought, "time": time.time()})

    def execute_task(self, query: str) -> dict:
        self.log_thought(f"Decomposing task: '{query}'")
        time.sleep(0.4)
        
        self.log_thought("Synthesizing solution plan and validating AST...")
        time.sleep(0.4)
        
        result = {
            "query": query,
            "status": "success",
            "output": f"Executed agent task successfully for: '{query}'",
            "artifacts_generated": ["pipeline.log", "report.json"]
        }
        return result

def main():
    banner()
    agent = CodeAgent()
    
    sample_queries = [
        "Inspect repository structure",
        "Generate automated tests for Python controllers",
        "Optimize Docker memory profile"
    ]
    
    print("\\n[+] Running scheduled agent workflow:")
    for q in sample_queries:
        print(f"\\n--- Task: {q} ---")
        res = agent.execute_task(q)
        print(f"✅ Result: {res['output']}")
    
    print("\\n" + "=" * 55)
    print("Pipeline completed successfully! Customize main.py for your AI workflow.")

if __name__ == "__main__":
    main()`
      },
      {
        path: "requirements.txt",
        type: "file",
        content: `# Optional Python packages
requests>=2.31.0
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python AI & Agent Script 🤖

A Python automation starter designed for CLI runners and AI task pipelines.

## 🚀 Running
Click **▶ Run File** on \`main.py\` or run:
\`\`\`bash
python3 main.py
\`\`\`
`
      }
    ]
  },
  {
    id: "web-starter",
    title: "Vanilla Web App",
    subtitle: "Pure HTML5, CSS3, & JS with zero build step",
    description: "Lightweight, beautiful web starter with responsive glassmorphism UI, interactive tabs, and instant Live Preview.",
    category: "frontend",
    badge: "Zero Config",
    icon: "Layout",
    color: "#E34F26",
    tags: ["HTML5", "CSS3", "JavaScript", "Instant Preview"],
    recommendedFile: "index.html",
    files: [
      {
        path: "index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VocodeAI Web Application</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-card">
    <div class="top-tag">VANILLA STACK</div>
    <h1>Modern Web Application</h1>
    <p class="description">Instant live preview with zero compile time or dependencies.</p>

    <div class="stat-boxes">
      <div class="stat-card">
        <span class="stat-value" id="runtimeVal">Node 20</span>
        <span class="stat-label">Sandbox Engine</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" id="clicksVal">0</span>
        <span class="stat-label">Interactions</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">60 FPS</span>
        <span class="stat-label">Rendering</span>
      </div>
    </div>

    <div class="actions">
      <button id="actionBtn" class="primary-btn">Test Interaction</button>
      <button id="themeBtn" class="secondary-btn">Toggle Mood</button>
    </div>

    <div id="toast" class="toast hidden">Button clicked! Interactive state synced.</div>
  </div>

  <script src="script.js"></script>
</body>
</html>`
      },
      {
        path: "style.css",
        type: "file",
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #020b08;
  color: #f3f8f4;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.app-card {
  width: 100%;
  max-width: 520px;
  background: #061710;
  border: 1px solid rgba(104, 185, 124, 0.25);
  border-radius: 18px;
  padding: 36px 30px;
  text-align: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
}

.top-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #ff9b3d;
  background: rgba(255, 155, 61, 0.12);
  border: 1px solid rgba(255, 155, 61, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

h1 {
  font-size: 26px;
  font-weight: 750;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #8ba195;
  margin-bottom: 24px;
}

.stat-boxes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card {
  background: #092018;
  border: 1px solid rgba(104, 185, 124, 0.15);
  border-radius: 12px;
  padding: 14px 10px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.stat-label {
  font-size: 11px;
  color: #8ba195;
  margin-top: 4px;
  display: block;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.primary-btn {
  background: linear-gradient(100deg, #ff9b3d 0%, #ff6347 100%);
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

.secondary-btn {
  background: #0c271e;
  color: #c1d2c7;
  border: 1px solid rgba(104, 185, 124, 0.25);
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.toast {
  margin-top: 20px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  border-radius: 8px;
  font-size: 13px;
  transition: opacity 0.3s ease;
}

.toast.hidden {
  opacity: 0;
  pointer-events: none;
}`
      },
      {
        path: "script.js",
        type: "file",
        content: `let clickCount = 0;
const actionBtn = document.getElementById("actionBtn");
const themeBtn = document.getElementById("themeBtn");
const clicksVal = document.getElementById("clicksVal");
const toast = document.getElementById("toast");

actionBtn.addEventListener("click", () => {
  clickCount++;
  clicksVal.textContent = clickCount;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
});

let isAlt = false;
themeBtn.addEventListener("click", () => {
  isAlt = !isAlt;
  document.body.style.background = isAlt ? "#0a131f" : "#020b08";
});`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Vanilla Web App Starter

Lightweight HTML5, CSS3, and JavaScript project.

## 👁 Live Preview
Click the **👁 Preview** button in the VocodeAI run bar to see this page render instantly!
`
      }
    ]
  },
  {
    id: "cpp-algorithms",
    title: "C++ Competitive & Algorithms",
    subtitle: "High-performance C++17 solution structure with Makefile",
    description: "Template for algorithmic problem solving and systems programming with fast I/O setup and compilation script.",
    category: "languages",
    badge: "High Speed",
    icon: "Cpu",
    color: "#00599C",
    tags: ["C++17", "GCC", "Algorithms", "Terminal"],
    recommendedFile: "main.cpp",
    files: [
      {
        path: "main.cpp",
        type: "file",
        content: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

// Fast I/O Optimization
void init_io() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
}

class Solution {
public:
    void solve() {
        cout << "========================================" << endl;
        cout << "  🚀 VocodeAI C++ High-Performance Runner" << endl;
        cout << "========================================" << endl;

        vector<int> numbers = {42, 17, 89, 3, 56, 99, 12};
        cout << "\\n[+] Original data: ";
        for (int n : numbers) cout << n << " ";
        cout << endl;

        sort(numbers.begin(), numbers.end());
        cout << "[+] Sorted data:   ";
        for (int n : numbers) cout << n << " ";
        cout << endl;

        cout << "\\n[*] Ready for algorithm execution.\\n";
    }
};

int main() {
    init_io();
    Solution solution;
    solution.solve();
    return 0;
}`
      },
      {
        path: "Makefile",
        type: "file",
        content: `CXX = g++
CXXFLAGS = -O2 -std=c++17 -Wall

all: main

main: main.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o solution

run: main
	./solution

clean:
	rm -f solution`
      },
      {
        path: "README.md",
        type: "file",
        content: `# C++ Competitive & Systems Starter 🚀

Configured for C++17 compilation with GCC in VocodeAI's container sandbox.

## 🛠️ Execution
Click **▶ Run File** on \`main.cpp\` or use the Cloud Terminal:
\`\`\`bash
g++ -O2 -std=c++17 main.cpp -o solution
./solution
\`\`\`
`
      }
    ]
  },
  {
    id: "java-maven",
    title: "Java 17 & Maven Starter",
    subtitle: "Enterprise Java environment with Maven build configuration",
    description: "Standard Java 17 application structure configured with Maven pom.xml and OpenJDK runtime.",
    category: "languages",
    badge: "Enterprise",
    icon: "Coffee",
    color: "#ED8B00",
    tags: ["Java 17", "Maven", "OOP", "OpenJDK"],
    recommendedFile: "src/main/java/com/vocodeai/App.java",
    files: [
      {
        path: "pom.xml",
        type: "file",
        content: `<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.vocodeai</groupId>
    <artifactId>vocode-java-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Standard JUnit 5 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`
      },
      {
        path: "src/main/java/com/vocodeai/App.java",
        type: "file",
        content: `package com.vocodeai;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class App {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("  ☕ VocodeAI Java 17 Enterprise Starter");
        System.out.println("=========================================");
        
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        System.out.println("[*] Application Initialized at: " + now);
        System.out.println("[+] Java Version: " + System.getProperty("java.version"));
        System.out.println("[+] Runtime Vendor: " + System.getProperty("java.vendor"));
        System.out.println("\\nJava environment is compiled and ready!");
    }
}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Java 17 & Maven Starter ☕

Run and build Java applications inside VocodeAI's container sandbox.

## 🛠️ Execution
Click **▶ Run File** on \`App.java\` or in Cloud Terminal:
\`\`\`bash
mvn compile exec:java -Dexec.mainClass="com.vocodeai.App"
\`\`\`
`
      }
    ]
  },
  {
    id: "mern-stack",
    title: "MERN Stack Full-Stack",
    subtitle: "MongoDB, Express, React 18 & Node.js with live API",
    description: "Complete full-stack MERN application structure featuring an Express REST API backend on Port 5000 and a responsive React Vite frontend on Port 3000.",
    category: "fullstack",
    badge: "Full-Stack",
    icon: "Atom",
    color: "#00ED64",
    tags: ["MERN", "React 18", "Express", "Node.js", "MongoDB"],
    recommendedFile: "client/src/App.jsx",
    files: [
      {
        path: "package.json",
        type: "file",
        content: `{
  "name": "vocode-mern-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server/server.js",
    "server": "node server/server.js",
    "client": "npm --prefix client run dev -- --host 0.0.0.0",
    "dev": "(cd server && npm start) & (cd client && npm run dev -- --host 0.0.0.0)"
  }
}`
      },
      {
        path: "server/package.json",
        type: "file",
        content: `{
  "name": "mern-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  }
}`
      },
      {
        path: "server/.env",
        type: "file",
        content: "PORT=5000\nNODE_ENV=development\n"
      },
      {
        path: "server/server.js",
        type: "file",
        content: `import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let items = [
  { id: 1, name: "Master MERN Stack in VocodeAI", done: true },
  { id: 2, name: "Deploy full-stack micro-VM containers", done: true },
  { id: 3, name: "Build realtime AI features", done: false }
];

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", service: "MERN Express API", port: PORT });
});

app.get("/api/items", (req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name || "Untitled Item",
    done: false
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`🚀 MERN Server running on http://0.0.0.0:\${PORT}\`);
});
`
      },
      {
        path: "client/package.json",
        type: "file",
        content: `{
  "name": "mern-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}`
      },
      {
        path: "client/vite.config.js",
        type: "file",
        content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});
`
      },
      {
        path: "client/index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MERN Stack - VocodeAI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
      },
      {
        path: "client/src/main.jsx",
        type: "file",
        content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
      },
      {
        path: "client/src/App.jsx",
        type: "file",
        content: `import React, { useState, useEffect } from "react";

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Connecting to Express API...");

  useEffect(() => {
    fetch("http://localhost:5000/api/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setStatus("Connected to Express API (Port 5000)");
      })
      .catch(() => {
        setStatus("Running in standalone preview mode");
        setItems([
          { id: 1, name: "Sample Item 1", done: true },
          { id: 2, name: "Sample Item 2", done: false }
        ]);
      });
  }, []);

  const addItem = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newItem = { id: Date.now(), name: input, done: false };
    setItems([...items, newItem]);
    setInput("");
  };

  return (
    <div className="container">
      <header>
        <span className="badge">MERN STACK</span>
        <h1>VocodeAI MERN App</h1>
        <p className="status">{status}</p>
      </header>

      <form onSubmit={addItem} className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add new task or item..."
        />
        <button type="submit">Add Item</button>
      </form>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className={item.done ? "done" : ""}>
            <span>{item.done ? "✅" : "⏳"}</span>
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
`
      },
      {
        path: "client/src/App.css",
        type: "file",
        content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.container {
  width: 100%;
  max-width: 540px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
}
header { text-align: center; margin-bottom: 24px; }
.badge {
  display: inline-block;
  background: rgba(0, 237, 100, 0.15);
  color: #00ed64;
  border: 1px solid rgba(0, 237, 100, 0.3);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 16px;
  margin-bottom: 8px;
}
h1 { font-size: 24px; color: #f0f6fc; margin-bottom: 6px; }
.status { font-size: 13px; color: #8b949e; }
.input-group { display: flex; gap: 8px; margin-bottom: 20px; }
input {
  flex: 1;
  background: #0d1117;
  border: 1px solid #30363d;
  color: #f0f6fc;
  padding: 10px 14px;
  border-radius: 8px;
  outline: none;
}
input:focus { border-color: #00ed64; }
button {
  background: #00ed64;
  color: #0d1117;
  border: none;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}
.item-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.item-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0d1117;
  border: 1px solid #21262d;
  padding: 12px 16px;
  border-radius: 8px;
}
.item-list li.done { opacity: 0.6; text-decoration: line-through; }
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# MERN Stack Starter 🚀

Full-stack application featuring:
- **Client**: React 18 + Vite running on port 3000
- **Server**: Node.js & Express API running on port 5000

## 🛠️ Run Project
Click **▶ Run Project** in the IDE, which starts both backend and client automatically.
`
      }
    ]
  },
  {
    id: "spring-boot-api",
    title: "Spring Boot 3 REST API",
    subtitle: "Enterprise Java 17, Spring Web MVC & Maven",
    description: "Production-ready Spring Boot 3 web application with REST controllers, JSON endpoints, and dynamic port configuration on Port 8080.",
    category: "backend",
    badge: "Spring Boot",
    icon: "Coffee",
    color: "#6DB33F",
    tags: ["Spring Boot 3", "Java 17", "Maven", "REST API"],
    recommendedFile: "src/main/java/com/vocodeai/controller/ApiController.java",
    files: [
      {
        path: "pom.xml",
        type: "file",
        content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.vocodeai</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <version>1.0.0</version>
    <name>vocode-spring-boot</name>
    <description>VocodeAI Spring Boot Starter</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
      },
      {
        path: "src/main/resources/application.properties",
        type: "file",
        content: "server.port=8080\nspring.application.name=vocode-spring-boot\nserver.address=0.0.0.0\n"
      },
      {
        path: "src/main/java/com/vocodeai/Application.java",
        type: "file",
        content: `package com.vocodeai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("🚀 VocodeAI Spring Boot Server online at http://0.0.0.0:8080");
    }
}
`
      },
      {
        path: "src/main/java/com/vocodeai/controller/ApiController.java",
        type: "file",
        content: `package com.vocodeai.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("framework", "Spring Boot 3.2.4");
        res.put("timestamp", LocalDateTime.now().toString());
        return res;
    }

    @GetMapping("/hello")
    public Map<String, String> hello(@RequestParam(defaultValue = "Developer") String name) {
        return Collections.singletonMap("message", "Hello " + name + "! Welcome to VocodeAI Spring Boot.");
    }

    @GetMapping("/items")
    public List<Map<String, Object>> getItems() {
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> i1 = new HashMap<>();
        i1.put("id", 1);
        i1.put("name", "Spring Boot Microservice Container");
        i1.put("status", "ACTIVE");
        items.add(i1);
        return items;
    }
}
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Spring Boot 3 REST API ☕

High performance Spring Boot service running on **Port 8080**.

## 🛠️ Run Project
Click **▶ Run Project** to start:
\`\`\`bash
mvn spring-boot:run
\`\`\`
Endpoints available:
- \`http://localhost:8080/api/health\`
- \`http://localhost:8080/api/hello\`
- \`http://localhost:8080/api/items\`
`
      }
    ]
  },
  {
    id: "python-flask",
    title: "Python Flask REST & Web App",
    subtitle: "Lightweight Flask API with CORS & JSON responses",
    description: "Production-ready Flask application featuring JSON REST routes, CORS enabled, and clean HTML frontend template running on Port 5000.",
    category: "backend",
    badge: "Flask",
    icon: "Zap",
    color: "#38BDF8",
    tags: ["Python 3.11", "Flask", "REST API", "JSON"],
    recommendedFile: "app.py",
    files: [
      {
        path: "requirements.txt",
        type: "file",
        content: "Flask>=3.0.0\nflask-cors>=4.0.0\npython-dotenv>=1.0.0\n"
      },
      {
        path: ".env",
        type: "file",
        content: "PORT=5000\nFLASK_ENV=development\n"
      },
      {
        path: "app.py",
        type: "file",
        content: `import os
from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.environ.get("PORT", 5000))

items = [
    {"id": 1, "title": "Setup Flask in VocodeAI", "status": "completed"},
    {"id": 2, "title": "Expose micro-VM container port 5000", "status": "active"},
    {"id": 3, "title": "Connect Python AI Agent", "status": "pending"}
]

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <title>VocodeAI Flask Service</title>
  <style>
    body { background: #0b0f19; color: #e2e8f0; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155; max-width: 500px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { background: #38bdf8; color: #0f172a; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 12px; }
    h1 { margin-top: 10px; font-size: 22px; }
    ul { list-style: none; padding: 0; margin-top: 20px; }
    li { background: #0f172a; margin-bottom: 8px; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; }
    a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">FLASK SERVICE ONLINE</span>
    <h1>VocodeAI Flask API</h1>
    <p>Running live on <strong>Port {{ port }}</strong> inside Docker container.</p>
    <ul>
      {% for item in items %}
        <li><span>{{ item.title }}</span> <em>{{ item.status }}</em></li>
      {% endfor %}
    </ul>
    <p><a href="/api/items">View JSON API: /api/items</a></p>
  </div>
</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML_TEMPLATE, port=PORT, items=items)

@app.route("/api/health")
def health():
    return jsonify({"status": "healthy", "service": "Flask API", "port": PORT})

@app.route("/api/items", methods=["GET"])
def get_items():
    return jsonify(items)

@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json() or {}
    new_item = {
        "id": len(items) + 1,
        "title": data.get("title", "Untitled"),
        "status": "active"
    }
    items.append(new_item)
    return jsonify(new_item), 201

if __name__ == "__main__":
    print(f"🔥 Flask starting on http://0.0.0.0:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python Flask REST & Web App 🌶️

Lightweight Python Flask service running on **Port 5000**.

## 🛠️ Execution
Click **▶ Run Project** to start:
\`\`\`bash
pip3 install -r requirements.txt && python3 app.py
\`\`\`
`
      }
    ]
  },
  {
    id: "flutter-web",
    title: "Flutter Web Application",
    subtitle: "Cross-platform Dart & Flutter responsive UI",
    description: "Modern Flutter Web starter configured with Material 3, responsive layout, reactive state, and live web preview support on Port 8080.",
    category: "mobile",
    badge: "Flutter",
    icon: "Layout",
    color: "#02569B",
    tags: ["Flutter", "Dart", "Material 3", "Web Server"],
    recommendedFile: "lib/main.dart",
    files: [
      {
        path: "pubspec.yaml",
        type: "file",
        content: `name: vocode_flutter_app
description: "VocodeAI Flutter Web Application"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true
`
      },
      {
        path: "lib/main.dart",
        type: "file",
        content: `import 'package:flutter/material.dart';

void main() {
  runApp(const VocodeApp());
}

class VocodeApp extends StatelessWidget {
  const VocodeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VocodeAI Flutter Web',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF02569B),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const DashboardPage(),
    );
  }
}

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _counter = 0;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('⚡ VocodeAI Flutter Web'),
        centerTitle: true,
        elevation: 2,
      ),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Icon(Icons.flutter_dash, size: 80, color: Color(0xFF02569B)),
              const SizedBox(height: 16),
              const Text(
                'Flutter Running in Cloud Container',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'Interactive Flutter application served over Web Server on Port 8080.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 32),
                  child: Column(
                    children: [
                      const Text('Action Counter', style: TextStyle(fontSize: 14)),
                      const SizedBox(height: 8),
                      Text('$_counter', style: Theme.of(context).textTheme.headlineMedium),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _increment,
                icon: const Icon(Icons.add),
                label: const Text('Increment Counter'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`
      },
      {
        path: "web/index.html",
        type: "file",
        content: `<!DOCTYPE html>
<html>
<head>
  <base href="/">
  <meta charset="UTF-8">
  <title>VocodeAI Flutter Web</title>
  <meta name="description" content="A new Flutter project.">
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <script src="flutter.js" defer></script>
</body>
</html>
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Flutter Web App 💙

Cross-platform Flutter application running inside VocodeAI's container sandbox.

## 🛠️ Run Project
Click **▶ Run Project** to start:
\`\`\`bash
flutter run -d web-server --web-port=8080 --web-hostname=0.0.0.0
\`\`\`
`
      }
    ]
  },
  {
    id: "mean-stack",
    title: "MEAN Stack Full-Stack",
    subtitle: "MongoDB, Express, Angular & Node.js",
    description: "Enterprise MEAN stack application configured with Angular frontend on Port 4200 and Express API on Port 5000.",
    category: "fullstack",
    badge: "Full-Stack",
    icon: "Layout",
    color: "#DD0031",
    tags: ["MEAN", "Angular", "Express", "Node.js", "MongoDB"],
    recommendedFile: "client/src/index.html",
    files: [
      {
        path: "package.json",
        type: "file",
        content: `{
  "name": "vocode-mean-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node server/server.js",
    "server": "node server/server.js",
    "client": "npm --prefix client start",
    "dev": "(cd server && npm start) & (cd client && npx ng serve --host 0.0.0.0 --port 4200)"
  }
}`
      },
      {
        path: "server/package.json",
        type: "file",
        content: `{
  "name": "mean-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  }
}`
      },
      {
        path: "server/server.js",
        type: "file",
        content: `import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const records = [
  { id: 1, title: "Angular Component Architecture", status: "Active" },
  { id: 2, title: "Express REST Endpoint Integration", status: "Active" },
  { id: 3, title: "MongoDB Schemas & Collections", status: "Ready" }
];

app.get("/api/health", (req, res) => {
  res.json({ service: "MEAN Backend API", status: "online", port: PORT });
});

app.get("/api/records", (req, res) => {
  res.json(records);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(\`🚀 MEAN Express API running on http://0.0.0.0:\${PORT}\`);
});
`
      },
      {
        path: "client/package.json",
        type: "file",
        content: `{
  "name": "mean-client",
  "version": "1.0.0",
  "scripts": {
    "start": "ng serve --host 0.0.0.0 --port 4200",
    "build": "ng build"
  },
  "dependencies": {
    "@angular/core": "^17.3.0",
    "@angular/common": "^17.3.0",
    "@angular/platform-browser": "^17.3.0"
  },
  "devDependencies": {
    "@angular/cli": "^17.3.0"
  }
}`
      },
      {
        path: "client/angular.json",
        type: "file",
        content: `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "mean-client": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist",
            "index": "src/index.html",
            "main": "src/main.ts"
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "port": 4200,
            "host": "0.0.0.0"
          }
        }
      }
    }
  }
}`
      },
      {
        path: "client/src/index.html",
        type: "file",
        content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MEAN Stack - VocodeAI</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; }
    .badge { background: #dd0031; color: #ffffff; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 12px; }
    h1 { margin-top: 12px; font-size: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">ANGULAR 17 + EXPRESS</span>
    <h1>MEAN Stack Application</h1>
    <p>Running Angular frontend on <strong>Port 4200</strong> and Express API on <strong>Port 5000</strong>.</p>
  </div>
</body>
</html>
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# MEAN Stack Starter 🅰️

Enterprise full-stack MEAN architecture:
- **Client**: Angular on **Port 4200**
- **Server**: Express on **Port 5000**

## 🛠️ Run Project
Click **▶ Run Project** to start both client and server:
\`\`\`bash
npm run dev
\`\`\`
`
      }
    ]
  },
  {
    id: "python-ai-agent",
    title: "AI Agent & LLM Companion",
    subtitle: "FastAPI + Gemini / OpenAI AI assistant with web interface",
    description: "Production-grade AI agent powered by FastAPI, Google Gemini, and OpenAI SDKs with streaming inference and conversational UI on Port 8000.",
    category: "ai",
    badge: "AI Agent",
    icon: "Cpu",
    color: "#8B5CF6",
    tags: ["Gemini 3.8", "FastAPI", "Python 3.11", "AI Agent", "LLM"],
    recommendedFile: "main.py",
    files: [
      {
        path: "requirements.txt",
        type: "file",
        content: "fastapi>=0.111.0\nuvicorn[standard]>=0.30.0\ngoogle-genai>=0.1.1\nopenai>=1.35.0\npython-dotenv>=1.0.0\n"
      },
      {
        path: ".env",
        type: "file",
        content: "PORT=8000\nGEMINI_API_KEY=\nOPENAI_API_KEY=\n"
      },
      {
        path: "main.py",
        type: "file",
        content: `import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VocodeAI AI Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.environ.get("PORT", 8000))

class ChatRequest(BaseModel):
    message: str

@app.get("/", response_class=HTMLResponse)
async def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Agent Interface</title>
      <style>
        body { background: #090d16; color: #f1f5f9; font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .chat-box { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 28px; width: 100%; max-width: 580px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
        .badge { background: rgba(139, 92, 246, 0.2); color: #a78bfa; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 20px; }
        h1 { font-size: 22px; margin: 10px 0; }
        .log { background: #090d16; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; min-height: 140px; margin: 16px 0; font-size: 14px; line-height: 1.5; }
        .row { display: flex; gap: 8px; }
        input { flex: 1; background: #090d16; border: 1px solid #334155; color: #fff; padding: 10px 14px; border-radius: 8px; outline: none; }
        button { background: #8b5cf6; color: #fff; border: none; font-weight: bold; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="chat-box">
        <span class="badge">GEMINI 3.8 & FASTAPI</span>
        <h1>AI Coding Agent Service</h1>
        <p style="color: #94a3b8; font-size: 13px;">Online on Port 8000</p>
        <div id="log" class="log"><strong>AI:</strong> Hello! Ask me any coding question or instruct me to generate code.</div>
        <div class="row">
          <input id="prompt" placeholder="Ask AI agent..." />
          <button onclick="send()">Send</button>
        </div>
      </div>
      <script>
        async function send() {
          const input = document.getElementById("prompt");
          const log = document.getElementById("log");
          const text = input.value.trim();
          if (!text) return;
          log.innerHTML += "<br/><strong>You:</strong> " + text;
          input.value = "";
          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            log.innerHTML += "<br/><strong>AI:</strong> " + data.reply;
          } catch(e) {
            log.innerHTML += "<br/><em>Error connecting to AI backend</em>";
          }
        }
      </script>
    </body>
    </html>
    """

@app.post("/api/chat")
async def chat(req: ChatRequest):
    return {
        "reply": f"AI Agent processed: '{req.message}'. Container runtime is active and responsive!",
        "status": "success"
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "AI Agent FastAPI", "port": PORT}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python AI Agent Starter 🤖

Production AI agent backend running on **Port 8000**.

## 🛠️ Run Project
Click **▶ Run Project** to start:
\`\`\`bash
pip3 install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`
`
      }
    ]
  }
];

export function getTemplateById(templateId) {
  return STARTER_TEMPLATES.find((t) => t.id === templateId) || null;
}


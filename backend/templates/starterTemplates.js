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
    tags: ["Voice", "Speech Recognition", "OpenAI", "Web Audio"],
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
    return \`I received: "\${input}". Connect this function to your OpenAI or Gemini endpoint for full agentic intelligence!\`;
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
  }
];

export function getTemplateById(templateId) {
  return STARTER_TEMPLATES.find((t) => t.id === templateId) || null;
}


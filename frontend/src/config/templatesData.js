/**
 * VocodeAI Starter Templates (Client Data & Fallback)
 */

export const STARTER_TEMPLATES = [
  {
    id: "ai-voice-assistant",
    title: "AI Voice Assistant",
    subtitle: "Real-time speech recognition & synthesis web app",
    description: "Interactive voice assistant utilizing the Web Speech API and an AI query loop with dynamic visualizer animations.",
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
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
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
.header { text-align: center; }
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
.header h1 { font-size: 26px; font-weight: 750; color: #ffffff; }
.header p { font-size: 14px; color: #8ba195; margin-top: 4px; }
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
}
.voice-orb.speaking {
  box-shadow: 0 0 45px rgba(59, 130, 246, 0.8);
  background: radial-gradient(circle, #38bdf8 0%, #2563eb 60%, #1e1b4b 100%);
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
.clear-btn { background: none; border: none; color: #8ba195; cursor: pointer; font-size: 11px; }
.conversation-log { max-height: 200px; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.msg { font-size: 13.5px; line-height: 1.5; padding: 8px 12px; border-radius: 10px; max-width: 85%; }
.msg.user { align-self: flex-end; background: #ff9b3d; color: #101c24; font-weight: 500; }
.msg.bot { align-self: flex-start; background: #0c271e; color: #e5e7eb; border: 1px solid rgba(16, 185, 129, 0.2); }
.controls-row { width: 100%; display: flex; flex-direction: column; gap: 12px; }
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
}
.mic-button.active {
  background: linear-gradient(100deg, #ff9b3d 0%, #ff6347 100%);
}
.input-fallback { display: flex; gap: 8px; }
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
.input-fallback button {
  padding: 0 20px;
  background: #0d2a1d;
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
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
  statusText.textContent = "Voice input unsupported in browser (use text below)";
}

function startListening() {
  if (!recognition) return;
  try { recognition.start(); } catch (err) {}
}

function stopListening() {
  isListening = false;
  orb.className = "voice-orb";
  micBtn.classList.remove("active");
  micLabel.textContent = "Start Listening";
  statusText.textContent = "Ready • Click Mic to Start";
}

micBtn?.addEventListener("click", () => {
  if (isListening) {
    if (recognition) recognition.stop();
    stopListening();
  } else {
    startListening();
  }
});

sendBtn?.addEventListener("click", () => {
  const query = textInput.value.trim();
  if (query) {
    handleUserInput(query);
    textInput.value = "";
  }
});

textInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

clearBtn?.addEventListener("click", () => {
  conversationLog.innerHTML = "";
});

function appendMessage(text, role) {
  const div = document.createElement("div");
  div.className = \`msg \${role}\`;
  div.innerHTML = role === "user" ? \`<strong>You:</strong> \${text}\` : \`<strong>VocodeAI:</strong> \${text}\`;
  conversationLog.appendChild(div);
  conversationLog.scrollTop = conversationLog.scrollHeight;
}

async function handleUserInput(text) {
  appendMessage(text, "user");
  statusText.textContent = "Thinking...";

  setTimeout(() => {
    const reply = generateAIResponse(text);
    appendMessage(reply, "bot");
    speakReply(reply);
  }, 500);
}

function generateAIResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Greetings! I am your VocodeAI companion. How can I assist your coding today?";
  } else if (lower.includes("time")) {
    return "The current time is " + new Date().toLocaleTimeString();
  } else {
    return \`I received: "\${input}". Connect this to Google Gemini for full reasoning!\`;
  }
}

function speakReply(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => { orb.className = "voice-orb speaking"; statusText.textContent = "🔊 Speaking..."; };
  utterance.onend = () => { orb.className = "voice-orb"; statusText.textContent = "Ready • Click Mic to Start"; };
  window.speechSynthesis.speak(utterance);
}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# VocodeAI Voice Assistant Starter 🎙️\n\nClick **👁 Preview** in the top bar to run this interactive voice application!`
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
        content: `{\n  "name": "vocode-react-starter",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.2.1",\n    "vite": "^5.2.0"\n  }\n}`
      },
      {
        path: "index.html",
        type: "file",
        content: `<!DOCTYPE html>\n<html>\n  <head><meta charset="UTF-8" /><title>React Starter</title></head>\n  <body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>\n</html>`
      },
      {
        path: "src/main.jsx",
        type: "file",
        content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`
      },
      {
        path: "src/App.jsx",
        type: "file",
        content: `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <div style={{ textAlign: 'center', padding: 40, fontFamily: 'sans-serif' }}>\n      <h1>React + Vite Starter</h1>\n      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n    </div>\n  );\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# React + Vite Starter\n\nRun \`npm run dev\` in the Cloud Terminal.`
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
        content: `{\n  "name": "vocode-express-api",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": { "start": "node server.js" },\n  "dependencies": { "express": "^4.19.2", "cors": "^2.8.5", "dotenv": "^16.4.5" }\n}`
      },
      {
        path: "server.js",
        type: "file",
        content: `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.get('/', (req, res) => res.json({ status: 'online', service: 'VocodeAI Express API' }));\n\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => console.log('API running on port ' + PORT));`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Node.js Express API\n\nClick **▶ Run File** on \`server.js\` to start.`
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
        content: `fastapi>=0.110.0\nuvicorn>=0.28.0\npydantic>=2.6.0`
      },
      {
        path: "main.py",
        type: "file",
        content: `from fastapi import FastAPI\n\napp = FastAPI(title="VocodeAI FastAPI")\n\n@app.get("/")\ndef index():\n    return {"message": "Hello from FastAPI on VocodeAI", "docs": "/docs"}\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run(app, host="0.0.0.0", port=8000)`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python FastAPI Starter\n\nRun \`python3 main.py\` to start the server.`
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
        content: `print("=== VocodeAI Python AI Agent ===")\nprint("Ready for automated task execution.")`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python AI Script\n\nClick **▶ Run File** to execute.`
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
        content: `<!DOCTYPE html>\n<html>\n<head><title>Web App</title></head>\n<body><h1>Hello from VocodeAI</h1></body>\n</html>`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Vanilla Web App\n\nClick **👁 Preview** to view in the live preview iframe.`
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
    icon: "Code2",
    color: "#00599C",
    tags: ["C++17", "GCC", "Algorithms", "Terminal"],
    recommendedFile: "main.cpp",
    files: [
      {
        path: "main.cpp",
        type: "file",
        content: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "VocodeAI C++ High-Speed Runner\\n";\n    return 0;\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# C++ Algorithmic Starter\n\nClick **▶ Run File** to compile and execute.`
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
        path: "src/main/java/com/vocodeai/App.java",
        type: "file",
        content: `package com.vocodeai;\n\npublic class App {\n    public static void main(String[] args) {\n        System.out.println("VocodeAI Java 17 Environment Initialized!");\n    }\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Java 17 Starter\n\nRun with Maven or Java runner.`
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
        content: `{\n  "name": "vocode-mern-app",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "start": "node server/server.js",\n    "server": "node server/server.js",\n    "client": "npm --prefix client run dev -- --host 0.0.0.0",\n    "dev": "(cd server && npm start) & (cd client && npm run dev -- --host 0.0.0.0)"\n  }\n}`
      },
      {
        path: "server/server.js",
        type: "file",
        content: `import express from "express";\nimport cors from "cors";\nimport dotenv from "dotenv";\n\ndotenv.config();\nconst app = express();\nconst PORT = process.env.PORT || 5000;\napp.use(cors());\napp.use(express.json());\n\nlet items = [\n  { id: 1, name: "Master MERN Stack in VocodeAI", done: true },\n  { id: 2, name: "Deploy full-stack micro-VM containers", done: true }\n];\n\napp.get("/api/items", (req, res) => res.json(items));\napp.listen(PORT, "0.0.0.0", () => console.log(\`🚀 Server running on port \${PORT}\`));`
      },
      {
        path: "client/src/App.jsx",
        type: "file",
        content: `import React, { useState, useEffect } from "react";\n\nexport default function App() {\n  const [items, setItems] = useState([]);\n  useEffect(() => {\n    fetch("http://localhost:5000/api/items")\n      .then(r => r.json())\n      .then(setItems)\n      .catch(() => setItems([{ id: 1, name: "MERN Stack Demo", done: true }]));\n  }, []);\n  return (\n    <div style={{ padding: 30, background: "#0d1117", color: "#fff", minHeight: "100vh" }}>\n      <h1>🚀 VocodeAI MERN App</h1>\n      <p>Express API on Port 5000 & React on Port 3000</p>\n      <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>\n    </div>\n  );\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# MERN Stack Starter\n\nClick **▶ Run Project** to start both client and server.`
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
        content: `<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0"\n         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">\n    <modelVersion>4.0.0</modelVersion>\n    <parent>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-parent</artifactId>\n        <version>3.2.4</version>\n        <relativePath/>\n    </parent>\n    <groupId>com.vocodeai</groupId>\n    <artifactId>spring-boot-starter</artifactId>\n    <version>1.0.0</version>\n    <properties>\n        <java.version>17</java.version>\n    </properties>\n    <dependencies>\n        <dependency>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-web</artifactId>\n        </dependency>\n    </dependencies>\n</project>`
      },
      {
        path: "src/main/resources/application.properties",
        type: "file",
        content: `server.port=8080\nspring.application.name=vocode-spring-boot\nserver.address=0.0.0.0\n`
      },
      {
        path: "src/main/java/com/vocodeai/Application.java",
        type: "file",
        content: `package com.vocodeai;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class Application {\n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n}`
      },
      {
        path: "src/main/java/com/vocodeai/controller/ApiController.java",
        type: "file",
        content: `package com.vocodeai.controller;\n\nimport org.springframework.web.bind.annotation.*;\nimport java.util.*;\n\n@RestController\n@RequestMapping("/api")\n@CrossOrigin(origins = "*")\npublic class ApiController {\n    @GetMapping("/health")\n    public Map<String, String> health() {\n        return Collections.singletonMap("status", "UP");\n    }\n    @GetMapping("/hello")\n    public Map<String, String> hello() {\n        return Collections.singletonMap("message", "Hello from Spring Boot 3 on Port 8080!");\n    }\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Spring Boot 3 REST API\n\nRun with \`mvn spring-boot:run\` on Port 8080.`
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
        content: `Flask>=3.0.0\nflask-cors>=4.0.0\npython-dotenv>=1.0.0\n`
      },
      {
        path: "app.py",
        type: "file",
        content: `import os\nfrom flask import Flask, jsonify\nfrom flask_cors import CORS\n\napp = Flask(__name__)\nCORS(app)\nPORT = int(os.environ.get("PORT", 5000))\n\n@app.route("/")\ndef index():\n    return jsonify({"service": "Flask API", "status": "online", "port": PORT})\n\nif __name__ == "__main__":\n    app.run(host="0.0.0.0", port=PORT, debug=True)\n`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python Flask REST API\n\nRun on Port 5000 with \`python3 app.py\`.`
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
        content: `name: vocode_flutter_app\ndescription: "VocodeAI Flutter Web Application"\nversion: 1.0.0\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\nflutter:\n  uses-material-design: true\n`
      },
      {
        path: "lib/main.dart",
        type: "file",
        content: `import 'package:flutter/material.dart';\n\nvoid main() => runApp(const VocodeApp());\n\nclass VocodeApp extends StatelessWidget {\n  const VocodeApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'VocodeAI Flutter',\n      theme: ThemeData.dark(useMaterial3: true),\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Flutter Web in Cloud')), \n        body: const Center(child: Text('⚡ Flutter Running on Port 8080')),\n      ),\n    );\n  }\n}`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Flutter Web Application\n\nRun with \`flutter run -d web-server --web-port=8080 --web-hostname=0.0.0.0\`.`
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
        content: `{\n  "name": "vocode-mean-app",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node server/server.js",\n    "dev": "(cd server && npm start) & (cd client && npx ng serve --host 0.0.0.0 --port 4200)"\n  }\n}`
      },
      {
        path: "server/server.js",
        type: "file",
        content: `import express from "express";\nimport cors from "cors";\nconst app = express();\nconst PORT = process.env.PORT || 5000;\napp.use(cors());\napp.use(express.json());\napp.get("/api/health", (req, res) => res.json({ service: "MEAN API", port: PORT }));\napp.listen(PORT, "0.0.0.0", () => console.log(\`MEAN server running on \${PORT}\`));`
      },
      {
        path: "README.md",
        type: "file",
        content: `# MEAN Stack Starter\n\nAngular on Port 4200 and Express on Port 5000.`
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
        content: `fastapi>=0.111.0\nuvicorn[standard]>=0.30.0\ngoogle-genai>=0.1.1\nopenai>=1.35.0\npython-dotenv>=1.0.0\n`
      },
      {
        path: "main.py",
        type: "file",
        content: `import os\nfrom fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI(title="AI Agent")\napp.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])\nPORT = int(os.environ.get("PORT", 8000))\n\n@app.get("/")\nasync def home():\n    return {"message": "AI Agent Online", "port": PORT}\n\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)\n`
      },
      {
        path: "README.md",
        type: "file",
        content: `# Python AI Agent Starter\n\nRun on Port 8000 with FastAPI and uvicorn.`
      }
    ]
  }
];


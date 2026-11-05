<div align="center">

<img width="140" height="140" alt="VocodeAI Logo" src="https://github.com/user-attachments/assets/5e238dae-7c27-4aaa-9761-19f27f1e63c9" />

# ⚡ VOCODEAI

### **AI-Powered Cloud IDE, Voice Companion & Containerized Micro-VM Development Platform**

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=00FF66&center=true&vCenter=true&width=900&lines=Full-Featured+Cloud+IDE+Powered+by+Monaco+Editor;Real-Time+Docker+Container+Micro-VM+Sandboxes;Interactive+PTY+Terminal+via+node-pty+%2B+xterm.js;Voca+AI+Voice+Coding+Companion+%26+Automation;VS+Code-Grade+Settings+%26+Reactive+Visual+Profiles;Enterprise+JWT+%2B+Google+%26+GitHub+OAuth" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React_19_|_Vite_5-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Editor-Monaco_Editor-007ACC?style=for-the-badge&logo=visualstudiocode" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Terminal-node--pty_+_xterm.js-43E65C?style=for-the-badge&logo=gnometerminal" alt="xterm.js" />
  <img src="https://img.shields.io/badge/Containers-Docker_Sandboxes-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Backend-Node.js_|_Express_4-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB_Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Worker-BullMQ_+_Redis-DC382D?style=for-the-badge&logo=redis" alt="Redis / BullMQ" />
</p>

> **Code from anywhere, run code in isolated cloud micro-VM containers, command your environment with voice, and build faster with an intelligent AI companion.**

</div>

---

## 📑 Table of Contents

- [🌟 What is VocodeAI?](#-what-is-vocodeai)
- [✨ Core Capabilities](#-core-capabilities)
  - [1. Cloud IDE & Code Workspace](#1-cloud-ide--code-workspace)
  - [2. Docker Micro-VM Sandboxes & Interactive Terminal](#2-docker-micro-vm-sandboxes--interactive-terminal)
  - [3. Voca AI Voice & Coding Companion](#3-voca-ai-voice--coding-companion)
  - [4. Professional Settings & Customization Engine](#4-professional-settings--customization-engine)
  - [5. Visual Identity & Reactive User Profiles](#5-visual-identity--reactive-user-profiles)
  - [6. Project Templates & Recycle Bin Lifecycle](#6-project-templates--recycle-bin-lifecycle)
- [🏗️ System Architecture](#️-system-architecture)
- [📁 Codebase Structure](#-codebase-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🔒 Security & Reliability](#-security--reliability)
- [👨‍💻 Author & Contributions](#-author--contributions)
- [📝 License](#-license)

---

## 🌟 What is VocodeAI?

**VocodeAI** is a cloud developer ecosystem combining:
1. A **full-featured cloud IDE** powered by Monaco Editor with live web preview.
2. An **isolated container sandbox** powered by Docker and WebSocket-driven `node-pty` / `xterm.js` terminals.
3. An **interactive AI voice & coding companion (Voca)** that writes, debugs, explains, and runs your code hands-free.
4. A **VS Code-grade customizable preferences engine** supporting both global user settings and per-workspace configurations.

---

## ✨ Core Capabilities

### 1. Cloud IDE & Code Workspace
- **Monaco Editor Core**: Intelligent autocompletion, multi-cursor editing, bracket matching, code folding, and syntax highlighting across 40+ programming languages.
- **Multi-File Tab System**: Open multiple files with dirty tracking, close actions, and smooth tab switching.
- **Tree Explorer**: Dynamic file and folder creation, deletion, renaming, and nested hierarchy management.
- **In-IDE Live Web Preview**: Real-time iframe preview pane for web applications with auto-refresh and popout capabilities.
- **Universal Document Viewers**: Embedded viewers for `.docx` (via Mammoth), `.xlsx` (via SheetJS), and `.md` (via Marked).
- **Import & Export**: 1-click ZIP export of entire workspaces and ZIP project file import.

### 2. Docker Micro-VM Sandboxes & Interactive Terminal
- **Dedicated Container Runners**: Workspaces run inside isolated Linux containers (`vocodeai/universal-dev:latest` on Ubuntu 22.04 LTS).
- **Preloaded Dev Environments**: Node.js 20 LTS, Python 3.10+, Java, Git, Build essentials, and developer utilities.
- **Real-Time PTY Stream**: Full POSIX terminal emulation via `node-pty` over low-latency WebSockets directly to `xterm.js`.
- **Custom Bash Environment**: Preconfigured shell aliases (`ll`, `cls`), interactive prompt (`saksham@vocodeai:/workspace$`), and color theme support.
- **Multi-Terminal & Split-Screen**: Split terminal panels side-by-side inside the workspace and manage parallel execution tabs.
- **Graceful Local Fallback**: Automatically connects to native local terminal fallback if Docker Desktop daemon is offline.

### 3. Voca AI Voice & Coding Companion
- **Voice-First Coding**: Speak coding commands, prompts, or questions into your microphone.
- **Speech-to-Text & Natural TTS**: Instant voice transcription and natural conversational audio output.
- **AI Coding Agent**: Generates boilerplate, fixes runtime errors, explains complex algorithms, and generates terminal commands.
- **Interactive Voca Mascot**: Animated assistant avatar on your screen with quick-action chips and responsive states.

### 4. Professional Settings & Customization Engine
Configurable across **Global User Preferences** and **Workspace Overrides**:

| Category | Available Customizations |
|----------|--------------------------|
| **📝 Text Editor** | Font family (`Fira Code`, `JetBrains Mono`, `Consolas`), font size slider (10–32px), line height, font ligatures, tab size (2/4/8), word wrap, minimap toggle, line numbers, cursor style (block, line, underline), cursor blink. |
| **👁️ Preview & Multi-File** | Auto-save delay slider (off, 500ms, 1s, 2s), format on save, live preview auto-refresh, port forwarding defaults. |
| **🎨 Workbench & Appearance** | Neon glow effects, dark & light themes, accent colors (emerald green, cyber orange, electric blue, purple), UI density. |
| **🤖 AI & Voice Assistant** | Model selector (`openrouter/free`, `gpt-4o`, `gpt-4o-mini`), voice speed slider, creativity temperature, auto-suggest inline completions. |
| **⚡ Runner & Sandbox** | Memory limit per container (512MB to 4GB), container idle timeouts, auto-reaping preferences. |
| **🗄️ Files & Storage** | File exclusion filters (`node_modules`, `.git`, `__pycache__`), cloud backup retention, storage quota tracking. |
| **🔐 Account & Security** | Two-factor authentication toggles, session token management, connected OAuth identities. |
| **📊 Diagnostics & Telemetry**| Raw JSON preference viewer, reset-to-defaults, performance and error telemetry. |

### 5. Visual Identity & Reactive User Profiles
- **Reactive Avatar System**: Switch between custom preset developer badges (**🦉 Voca Robot Owl**, **⚡ Cyber Coder**, **💻 Matrix Terminal**, **🚀 Rocket Pioneer**, **🛡️ Code Guardian**, or Initial Letter badge).
- **Custom Photo Upload**: In-browser client-side image compression using HTML5 Canvas with instant avatar persistence to MongoDB (`PUT /api/auth/profile`).
- **Real-Time UI Synchronization**: Profile changes instantly reflect across the dashboard sidebar, workspace header, and user popovers.
- **Storage & Sandbox Quota Widget**: Visualizes allocated Docker disk usage (e.g. 1.4 GB / 10.0 GB) and micro-VM resource allocation.

### 6. Project Templates & Recycle Bin Lifecycle
- **Starter Templates**: 1-click workspace generation for Vanilla Web Apps, React Vite, Node.js REST APIs, Python Data Science, and Express.
- **Safe Recycle Bin**: Soft deletion moves projects to the Recycle Bin with workspace badges and metadata intact.
- **Restore & Permanent Purge**: Restore projects back to active workspaces or permanently purge with confirmation modals.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT 19 FRONTEND                               │
│  Monaco Editor  │  xterm.js Terminal  │  Voca AI Voice  │  Settings Engine  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST & WebSocket (ws://)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS & NODE BACKEND                            │
│  Auth (JWT/OAuth) │  Workspace File Sync  │  AI Router  │  Terminal Server  │
└───────┬──────────────────────────────┬───────────────────────────────┬──────┘
        │                              │                               │
        ▼                              ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌────────────────┐
│    MONGODB    │              │  REDIS QUEUE  │              │  DOCKER ENGINE │
│  Users, Files │              │    BullMQ     │              │  Containerized │
│  & Workspaces │              │ Async Workers │              │ node-pty Linux │
└───────────────┘              └───────────────┘              └────────────────┘
```

---

## 📁 Codebase Structure

```bash
VocodeAI/
├── backend/
│   ├── config/             # Database, paths, and environment configuration
│   ├── controllers/        # Auth, File, AI, and Workspace controllers
│   ├── docker/             # Docker sandbox configuration & dev image definitions
│   ├── middleware/         # JWT verification, CORS, security, rate limiters
│   ├── models/             # Mongoose schemas (User, Workspace, File, RecycleBin)
│   ├── routes/             # REST endpoints (authRoutes, fileRoutes, aiRoutes)
│   ├── sandbox/            # Container lifecycle manager, reaper & registry
│   ├── services/           # Sync engine, disk hydration & workspace services
│   ├── templates/          # Project starter templates (React, Node, Python)
│   ├── terminal/           # node-pty docker and native shell spawn engine
│   ├── workers/            # BullMQ background code execution workers
│   ├── server.js           # Express application & HTTP server entrypoint
│   └── terminalServer.js   # WebSocket PTY streaming server
│
├── frontend/
│   ├── public/             # Static logos, themes, and branding assets
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── account/    # Account settings & visual identity components
│   │   │   ├── dashboard/  # Sidebar, templates, recycle bin, workspace grid
│   │   │   ├── editor/     # Monaco editor and file tab controls
│   │   │   ├── layout/     # Navbars, headers, and footer components
│   │   │   ├── settings/   # VS Code-grade preferences view & raw JSON modal
│   │   │   ├── terminal/   # TerminalPanel (xterm.js), split tabs & runner UI
│   │   │   └── voice/      # Voca voice assistant widget & animation
│   │   ├── context/        # AuthContext, WorkspaceContext & ThemeContext
│   │   ├── pages/          # Dashboard, Workspace IDE, Login, Signup, Landing
│   │   ├── services/       # Axios API clients & WebSocket managers
│   │   ├── styles/         # Scoped stylesheets & Tailwind CSS styles
│   │   └── utils/          # Settings storage, buildTree & helper utilities
│   ├── index.html          # HTML entrypoint
│   └── vite.config.js      # Vite build configuration & proxy setup
│
├── .gitignore              # Ignored dependencies and environments
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI
- **Docker Desktop**: Running Docker daemon (for containerized terminal sandboxes)
- **Redis**: Optional (required for async BullMQ code runner workers)

---

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/VocodeAI.git
cd VocodeAI
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env  # Or create .env based on section below

# Start backend with nodemon
npm start
```
*Backend server will start listening on `http://localhost:8000`.*

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
# Verify frontend/.env points to: VITE_BACKEND_URL=http://localhost:8000

# Start Vite dev server
npm run dev
```
*Frontend application will start on `http://localhost:5173`.*

---

## 🔑 Environment Variables

### Backend Configuration (`backend/.env`)

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# MongoDB Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/Vocodeai

# Authentication & JWT Secrets
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Google OAuth 2.0 (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Email Configuration for OTP / Reset Passwords
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# AI Model & OpenRouter / OpenAI
OPENAI_API_KEY=sk-or-v1-your_openrouter_or_openai_key
AI_MODEL=openrouter/free

# Redis & Container Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
CONTAINER_IDLE_TIMEOUT=900000
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## 🔒 Security & Reliability

- **Sandboxed Execution**: Code runs in ephemeral, unprivileged Linux containers with memory caps and CPU throttling to isolate workloads.
- **Token Security**: Short-lived JWT access tokens paired with secure HTTP-only refresh tokens.
- **Input Sanitization**: Terminal inputs and file paths are strictly validated to prevent directory traversal and command injection.
- **Graceful Fault Tolerance**: Live terminal falls back automatically to local native PTY if the Docker daemon restarts or disconnects.

---

## 👨‍💻 Author & Contributions

<div align="center">

### **Saksham Agarwal**
**Full Stack Developer & AI Platform Architect**  
*React • Node.js • Express • Monaco Editor • Docker • MongoDB • OpenAI*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com)

</div>

Contributions, bug reports, and feature suggestions are welcome! Please open an issue or submit a pull request.

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for modern developers who code with speed and voice.</sub>
</div>

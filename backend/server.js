import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import executeRoutes from "./routes/executeRoutes.js";
import runRoutes from "./routes/runRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import { setupTerminalServer } from "./terminalServer.js";
import { startContainerReaper } from "./sandbox/containerReaper.js";
import { startCodeWorker } from "./workers/codeWorker.js";

const app = express();
app.set("trust proxy", 1);

/* ================= CORS & SECURITY ================= */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", ...allowedOrigins],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Generous rate limit for active IDE editing actions (saving, reading, navigating)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());

/* ================= INIT SERVICES ================= */

connectDB();
startContainerReaper();
startCodeWorker();

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: "Vocodeai Backend",
    message: "VocodeAI Backend is running with Docker Container Engine and AI Voice integration",
  });
});

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/run", runRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ai", aiRoutes);

/* ================= STATIC WORKSPACE PREVIEW ================= */
const workspacesDir = path.join(
  process.cwd(),
  process.env.WORKSPACES_ROOT || "workspaces"
);

app.use(
  "/preview",
  express.static(workspacesDir, {
    extensions: ["html", "htm"],
  })
);

/* ================= ERROR HANDLING ================= */
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

/* ================= SERVER & WEBSOCKET ================= */

const server = http.createServer(app);
setupTerminalServer(server);

const PORT = Number(process.env.PORT);
server.listen(PORT, () => {
  console.log(`🚀 VocodeAI Backend running on http://localhost:${PORT}`);
});

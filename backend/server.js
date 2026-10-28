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

const app = express();
app.set("trust proxy", 1);

/* ================= SECURITY ================= */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors: ["'self'", "http://localhost:5173"], 
      },
    },
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

/* ================= CORS ================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

/* ================= INIT ================= */

connectDB();
startContainerReaper();

app.get("/",(req,res) =>{
  res.send("Vocodeai Backend is running");
})
/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/run", runRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ai", aiRoutes);

app.use(
  "/preview",
  express.static(path.join(process.cwd(), "workspaces"), {
    extensions: ["html"],
  })
);

/* ================= SERVER ================= */

const server = http.createServer(app);
setupTerminalServer(server);

 const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
import express from "express";
import path from "path";
import { auth } from "../middleware/auth.js";
import { detectProject } from "../projects/projectDetector.js";
import { codeQueue } from "../queue/codeQueue.js";
import rateLimit from "express-rate-limit";

const runLimiter = rateLimit({
  windowMs: 5 * 1000,
  max: 10,
  message: {
    error: "Too many run requests, please wait a moment",
  },
});

const router = express.Router();
const activeRuns = new Map();

router.post("/", runLimiter, auth, async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const runKey = `${req.user.id}-${workspaceId}`;

    if (activeRuns.has(runKey)) {
      return res.status(429).json({
        error: "Project already running",
      });
    }

    activeRuns.set(runKey, true);

    const workspacePath = path.join(
      process.cwd(),
      process.env.WORKSPACES_ROOT || "workspaces",
      req.user.id,
      workspaceId
    );

    const detected = detectProject(workspacePath);

    if (!detected) {
      activeRuns.delete(runKey);
      return res.status(400).json({
        error: "No supported project detected in workspace",
      });
    }

    const job = await codeQueue.add(
      "run-project",
      {
        userId: req.user.id,
        workspaceId,
        workspacePath,
        command: detected.command,
        mode: detected.mode,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    setTimeout(() => {
      activeRuns.delete(runKey);
    }, 5000);

    res.json({
      success: true,
      jobId: job.id,
      type: detected.type,
      command: detected.command,
      mode: detected.mode,
      port: detected.port || null,
    });
  } catch (err) {
    console.error("RUN ROUTE ERROR:", err);
    res.status(500).json({
      error: "Run failed: " + err.message,
    });
  }
});

export default router;

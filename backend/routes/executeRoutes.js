import express from "express";
import path from "path";
import { auth } from "../middleware/auth.js";
import { codeQueue } from "../queue/codeQueue.js";
import { execInWorkspace } from "../sandbox/execService.js";
import { getWorkspacesRoot } from "../config/paths.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { workspaceId, command, sync } = req.body;

    if (!workspaceId || !command) {
      return res
        .status(400)
        .json({ error: "workspaceId and command are required" });
    }

    const workspacePath = path.join(
      getWorkspacesRoot(),
      req.user.id,
      workspaceId
    );

    if (sync) {
      const result = await execInWorkspace({
        userId: req.user.id,
        workspaceId,
        workspacePath,
        command,
      });
      return res.json(result);
    }

    try {
      const job = await codeQueue.add("run-code", {
        userId: req.user.id,
        workspaceId,
        workspacePath,
        command,
        mode: "single",
      });

      return res.json({
        jobId: job.id,
        status: "queued",
      });
    } catch (queueErr) {
      console.warn("BullMQ queue add failed, falling back to direct execution:", queueErr.message);
      const result = await execInWorkspace({
        userId: req.user.id,
        workspaceId,
        workspacePath,
        command,
      });
      return res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

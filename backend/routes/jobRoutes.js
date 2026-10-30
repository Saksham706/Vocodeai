import express from "express";
import { auth } from "../middleware/auth.js";
import { codeQueue } from "../queue/codeQueue.js";

const router = express.Router();

router.get("/:id", auth, async (req, res) => {
  try {
    const job = await codeQueue.getJob(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();

    res.json({
      state,
      result: job.returnvalue || null,
    });
  } catch (err) {
    res.status(503).json({ error: "Queue service unavailable: " + err.message });
  }
});

export default router;

import express from "express";
import { auth } from "../middleware/auth.js";
import Workspace from "../models/Workspace.js"; // ✅ REQUIRED
import {
  createWorkspace,
  listWorkspaces,
  deleteWorkspace,
  renameWorkspace,
  duplicateWorkspace,
  togglePin,
} from "../controllers/workspaceController.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";

const router = express.Router();

router.get("/", auth, listWorkspaces);
router.post("/", auth, createWorkspace);
router.delete("/:id", auth, deleteWorkspace);
router.patch("/:id/rename", auth, renameWorkspace);
router.post("/:id/duplicate", auth, duplicateWorkspace);
router.patch("/:id/pin", auth, togglePin);

/* GET SINGLE WORKSPACE (FOR EDITOR PAGE) */
router.get("/:id", auth, async (req, res) => {
  const ws = await Workspace.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!ws) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  res.json(ws);
});

router.post("/:id/hydrate", auth, async (req, res) => {
  try {
    await hydrateWorkspace(req.user.id, req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Hydrate failed",
    });
  }
});

export default router;

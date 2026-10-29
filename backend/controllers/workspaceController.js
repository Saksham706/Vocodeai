import Workspace from "../models/Workspace.js";
import FileNode from "../models/FileNode.js";
import {
  ensureWorkspace,
  deleteWorkspace as deleteWorkspaceFS,
} from "../services/fileService.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";

/* CREATE */
export async function createWorkspace(req, res) {
  try {
    const ws = await Workspace.create({
      userId: req.user.id,
      name: req.body.name || "Untitled Workspace",
    });

    ensureWorkspace(req.user.id, ws._id.toString());
    res.json(ws);
  } catch (err) {
    console.error("CREATE WORKSPACE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* LIST */
export async function listWorkspaces(req, res) {
  try {
    const workspaces = await Workspace.find({ userId: req.user.id }).sort({
      isPinned: -1,
      createdAt: -1,
    });
    res.json(workspaces);
  } catch (err) {
    console.error("LIST WORKSPACES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* DELETE */
export async function deleteWorkspace(req, res) {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    await FileNode.deleteMany({
      workspaceId: workspace._id,
    });

    deleteWorkspaceFS(req.user.id, workspace._id.toString());

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE WORKSPACE ERROR:", err);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
}

/* RENAME */
export async function renameWorkspace(req, res) {
  try {
    const ws = await Workspace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name: req.body.name },
      { new: true }
    );

    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* DUPLICATE */
export async function duplicateWorkspace(req, res) {
  try {
    const old = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!old) return res.status(404).json({ error: "Workspace not found" });

    const copy = await Workspace.create({
      userId: req.user.id,
      name: `${old.name} (copy)`,
      type: old.type,
    });

    ensureWorkspace(req.user.id, copy._id.toString());

    const oldNodes = await FileNode.find({ workspaceId: old._id });
    if (oldNodes.length > 0) {
      const copyOperations = oldNodes.map((n) => ({
        workspaceId: copy._id,
        path: n.path,
        type: n.type,
        content: n.content || "",
      }));
      await FileNode.insertMany(copyOperations);
      await hydrateWorkspace(req.user.id, copy._id.toString());
    }

    res.json(copy);
  } catch (err) {
    console.error("DUPLICATE WORKSPACE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* PIN / UNPIN */
export async function togglePin(req, res) {
  try {
    const ws = await Workspace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isPinned: req.body.isPinned },
      { new: true }
    );

    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

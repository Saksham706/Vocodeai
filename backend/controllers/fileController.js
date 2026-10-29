import FileNode from "../models/FileNode.js";
import * as fsService from "../services/fileService.js";

/* ========== CREATE FILE / FOLDER ========== */
export async function createNode(req, res) {
  try {
    const { workspaceId, path, type } = req.body;

    if (!workspaceId || !path || !type) {
      return res.status(400).json({ error: "workspaceId, path and type are required" });
    }

    const cleanPath = path.replace(/^[\\\/]+/, "");

    await FileNode.findOneAndUpdate(
      { workspaceId, path: cleanPath },
      {
        workspaceId,
        path: cleanPath,
        type,
        content: type === "file" ? "" : undefined,
      },
      { upsert: true, new: true }
    );

    if (type === "file") {
      fsService.createFile(req.user.id, workspaceId, cleanPath);
    } else {
      fsService.createFolder(req.user.id, workspaceId, cleanPath);
    }

    res.json({ success: true, path: cleanPath });
  } catch (err) {
    console.error("CREATE NODE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ========== READ FILE ========== */
export async function readFile(req, res) {
  try {
    const { workspaceId, path } = req.query;

    if (!workspaceId || !path) {
      return res.status(400).json({ error: "workspaceId and path are required" });
    }

    const cleanPath = path.replace(/^[\\\/]+/, "");

    const node = await FileNode.findOne({ workspaceId, path: cleanPath });
    if (!node || node.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    let content = fsService.readFile(req.user.id, workspaceId, cleanPath);
    if (!content && node.content) {
      content = node.content;
    }

    res.json({ content });
  } catch (err) {
    console.error("READ FILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ========== SAVE FILE ========== */
export async function saveFile(req, res) {
  try {
    const { workspaceId, path, content } = req.body;

    if (!workspaceId || !path) {
      return res.status(400).json({ error: "workspaceId and path are required" });
    }

    const cleanPath = path.replace(/^[\\\/]+/, "");

    await FileNode.findOneAndUpdate(
      { workspaceId, path: cleanPath, type: "file" },
      { content: content || "" },
      { upsert: true, new: true }
    );

    fsService.saveFile(req.user.id, workspaceId, cleanPath, content || "");

    res.json({ success: true });
  } catch (err) {
    console.error("SAVE FILE ERROR:", err);
    res.status(500).json({ error: "Failed to save file: " + err.message });
  }
}

/* ========== RENAME FILE / FOLDER ========== */
export async function renameNode(req, res) {
  try {
    const { workspaceId, oldPath, newPath } = req.body;

    const cleanOld = oldPath.replace(/^[\\\/]+/, "");
    const cleanNew = newPath.replace(/^[\\\/]+/, "");

    const escapedOld = cleanOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const nodes = await FileNode.find({
      workspaceId,
      path: { $regex: `^${escapedOld}` },
    });

    for (const node of nodes) {
      const updatedPath = node.path.replace(cleanOld, cleanNew);
      await FileNode.updateOne({ _id: node._id }, { path: updatedPath });
    }

    fsService.renameNode(req.user.id, workspaceId, cleanOld, cleanNew);

    res.json({ success: true });
  } catch (err) {
    console.error("RENAME ERROR:", err);
    res.status(500).json({ error: "Rename failed: " + err.message });
  }
}

/* ========== DELETE FILE / FOLDER ========== */
export async function deleteNode(req, res) {
  try {
    const { workspaceId, path } = req.body;

    const clean = path.replace(/^[\\\/]+/, "");
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    await FileNode.deleteMany({
      workspaceId,
      path: { $regex: `^${escaped}` },
    });

    fsService.deleteNode(req.user.id, workspaceId, clean);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE NODE ERROR:", err);
    res.status(500).json({ error: "Delete failed: " + err.message });
  }
}

/* ========== LOAD TREE ========== */
export async function loadTree(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const nodes = await FileNode.find({
      workspaceId,
      path: {
        $not: {
          $regex: "\\.(class|out|o|obj|exe|pyc|so|dll)$|(^|/)a\\.out$",
          $options: "i",
        },
      },
    })
      .sort({ path: 1 })
      .lean();

    res.json(nodes);
  } catch (err) {
    console.error("LOAD TREE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

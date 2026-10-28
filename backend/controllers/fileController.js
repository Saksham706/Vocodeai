import FileNode from "../models/FileNode.js";
import * as fsService from "../services/fileService.js";

/* ========== CREATE FILE / FOLDER ========== */
export async function createNode(req, res) {
  const { workspaceId, path, type } = req.body;

  await FileNode.create({
    workspaceId,
    path,
    type,
    content: type === "file" ? "" : undefined,
  });

  type === "file"
    ? fsService.createFile(req.user.id, workspaceId, path)
    : fsService.createFolder(req.user.id, workspaceId, path);

  res.json({ success: true });
}

/* ========== READ FILE ========== */
export async function readFile(req, res) {
  const { workspaceId, path } = req.query;

  const node = await FileNode.findOne({ workspaceId, path });
  if (!node || node.type !== "file") {
    return res.status(404).json({ error: "File not found" });
  }

  const content = fsService.readFile(
    req.user.id,
    workspaceId,
    path
  );

  res.json({ content });
}

/* ========== SAVE FILE ========== */
export async function saveFile(req, res) {
  try {
    const { workspaceId, path, content } = req.body;

    const node = await FileNode.findOneAndUpdate(
      { workspaceId, path, type: "file" },
      { content },
      { new: true }
    );

    if (!node) {
      return res.status(404).json({ error: "File node not found" });
    }

    fsService.saveFile(req.user.id, workspaceId, path, content);

    res.json({ success: true });
  } catch (err) {
    console.error("SAVE FILE ERROR:", err);
    res.status(500).json({ error: "Failed to save file" });
  }
}



/* ========== RENAME FILE / FOLDER ========== */
export async function renameNode(req, res) {
  try {
    const { workspaceId, oldPath, newPath } = req.body;

    // Escape regex properly
    const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const nodes = await FileNode.find({
      workspaceId,
      path: { $regex: `^${escapedOldPath}` },
    });

    for (const node of nodes) {
      const updatedPath = node.path.replace(oldPath, newPath);

      await FileNode.updateOne(
        { _id: node._id },
        { path: updatedPath }
      );
    }

    fsService.renameNode(
      req.user.id,
      workspaceId,
      oldPath,
      newPath
    );

    res.json({ success: true });
  } catch (err) {
    console.error("RENAME ERROR:", err);
    res.status(500).json({ error: "Rename failed" });
  }
}

/* ========== DELETE FILE / FOLDER ========== */
export async function deleteNode(req, res) {
  const { workspaceId, path } = req.body;

  await FileNode.deleteMany({
    workspaceId,
    path: { $regex: `^${path}` }
  });

  fsService.deleteNode(
    req.user.id,
    workspaceId,
    path
  );

  res.json({ success: true });
}

/* ========== LOAD TREE ========== */
export async function loadTree(req, res) {
  const nodes = await FileNode.find({
    workspaceId: req.query.workspaceId
  }).sort({ path: 1 });

  res.json(nodes);
}

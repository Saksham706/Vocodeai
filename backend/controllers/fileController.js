import FileNode from "../models/FileNode.js";
import RecycleBin from "../models/RecycleBin.js";
import Workspace from "../models/Workspace.js";
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

/* ========== DELETE FILE / FOLDER (MOVES TO RECYCLE BIN) ========== */
export async function deleteNode(req, res) {
  try {
    const { workspaceId, path } = req.body;
    const userId = String(req.user.id || req.user._id);
    const wsId = String(workspaceId);

    const clean = path.replace(/^[\\\/]+/, "");
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Fetch existing nodes matching exact path or directory contents
    const targetNodes = await FileNode.find({
      workspaceId: wsId,
      path: { $regex: `^${escaped}(/|$)` },
    }).lean();

    const ws = await Workspace.findById(wsId).lean();
    const wsName = ws?.name || "Workspace";

    const name = clean.split("/").pop() || clean;
    const primary = targetNodes.find((n) => n.path === clean) || targetNodes[0];
    const isFolder = targetNodes.length > 1 || (targetNodes.length === 1 && targetNodes[0].type === "folder");

    await RecycleBin.create({
      userId,
      workspaceId: wsId,
      workspaceName: wsName,
      name,
      originalPath: clean,
      type: primary?.type || (isFolder ? "folder" : "file"),
      content: primary?.content || "",
      items: targetNodes.map((n) => ({
        path: n.path,
        type: n.type,
        content: n.content || "",
      })),
      deletedAt: new Date(),
    });

    await FileNode.deleteMany({
      workspaceId: wsId,
      path: { $regex: `^${escaped}(/|$)` },
    });

    fsService.deleteNode(userId, wsId, clean);

    res.json({ success: true, movedToRecycleBin: true });
  } catch (err) {
    console.error("DELETE NODE ERROR:", err);
    res.status(500).json({ error: "Delete failed: " + err.message });
  }
}

/* ========== GET RECYCLE BIN ITEMS ========== */
export async function getRecycleBin(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const items = await RecycleBin.find({ userId }).sort({ deletedAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error("GET RECYCLE BIN ERROR:", err);
    res.status(500).json({ error: "Failed to fetch recycle bin" });
  }
}

/* ========== RESTORE RECYCLE BIN ITEM ========== */
export async function restoreRecycleBinItem(req, res) {
  try {
    const { id } = req.params;
    const userId = String(req.user.id || req.user._id);

    const item = await RecycleBin.findOne({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ error: "Item not found in recycle bin" });
    }

    const wsId = String(item.workspaceId);

    // Helper: recreate parent directories in FileNode so the tree hierarchy stays intact
    const ensureParents = async (targetPath) => {
      const parts = targetPath.split("/").filter(Boolean);
      let curr = "";
      for (let i = 0; i < parts.length - 1; i++) {
        curr = curr ? `${curr}/${parts[i]}` : parts[i];
        await FileNode.findOneAndUpdate(
          { workspaceId: wsId, path: curr },
          { workspaceId: wsId, path: curr, type: "folder" },
          { upsert: true }
        );
      }
    };

    // 1. Ensure parent folders exist
    await ensureParents(item.originalPath);

    // 2. Restore nodes to FileNode collection
    if (item.type === "file") {
      await FileNode.findOneAndUpdate(
        { workspaceId: wsId, path: item.originalPath },
        {
          workspaceId: wsId,
          path: item.originalPath,
          type: "file",
          content: item.content || "",
        },
        { upsert: true }
      );
    } else {
      // Folder
      await FileNode.findOneAndUpdate(
        { workspaceId: wsId, path: item.originalPath },
        {
          workspaceId: wsId,
          path: item.originalPath,
          type: "folder",
        },
        { upsert: true }
      );

      if (Array.isArray(item.items)) {
        for (const sub of item.items) {
          await ensureParents(sub.path);
          await FileNode.findOneAndUpdate(
            { workspaceId: wsId, path: sub.path },
            {
              workspaceId: wsId,
              path: sub.path,
              type: sub.type,
              content: sub.content || "",
            },
            { upsert: true }
          );
        }
      }
    }

    // 3. Restore on disk at the exact original path
    fsService.restoreNode(userId, wsId, item);

    // 4. Remove from RecycleBin
    await RecycleBin.deleteOne({ _id: id });

    res.json({ success: true, restored: item.originalPath });
  } catch (err) {
    console.error("RESTORE ERROR:", err);
    res.status(500).json({ error: "Failed to restore item: " + err.message });
  }
}

/* ========== PERMANENTLY DELETE RECYCLE BIN ITEM ========== */
export async function permanentlyDeleteRecycleBinItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await RecycleBin.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ error: "Item not found in recycle bin" });
    }

    res.json({ success: true, message: "Permanently deleted" });
  } catch (err) {
    console.error("PERMANENT DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to permanently delete item" });
  }
}

/* ========== EMPTY RECYCLE BIN ========== */
export async function emptyRecycleBin(req, res) {
  try {
    const userId = req.user.id;
    await RecycleBin.deleteMany({ userId });
    res.json({ success: true, message: "Recycle bin emptied" });
  } catch (err) {
    console.error("EMPTY RECYCLE BIN ERROR:", err);
    res.status(500).json({ error: "Failed to empty recycle bin" });
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

import mongoose from "mongoose";
import FileNode from "../models/FileNode.js";
import RecycleBin from "../models/RecycleBin.js";
import Workspace from "../models/Workspace.js";
import * as fsService from "../services/fileService.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";
import * as r2Service from "../services/r2Service.js";

/* Helper: Normalize file paths to avoid slash and traversal issues */
export function normalizePath(p) {
  return (p || "").replace(/^[\\\/]+/, "").replace(/\\/g, "/");
}

/* Helper: Query workspaceId supporting both string and ObjectId */
export function buildWsQuery(workspaceId) {
  const wsStr = String(workspaceId || "");
  const queries = [{ workspaceId }, { workspaceId: wsStr }];
  if (mongoose.Types.ObjectId.isValid(wsStr)) {
    queries.push({ workspaceId: new mongoose.Types.ObjectId(wsStr) });
  }
  return { $or: queries };
}

/* ========== CREATE FILE / FOLDER ========== */
export async function createNode(req, res) {
  try {
    const { workspaceId, path, type } = req.body;

    if (!workspaceId || !path || !type) {
      return res.status(400).json({ error: "workspaceId, path and type are required" });
    }

    const cleanPath = normalizePath(path);
    const wsQuery = buildWsQuery(workspaceId);

    let r2Key = undefined;
    let size = 0;
    if (type === "file") {
      try {
        const r2Res = await r2Service.saveFileToR2(req.user.id, workspaceId, cleanPath, "");
        if (r2Res) {
          r2Key = r2Res.key;
          size = r2Res.size;
        }
      } catch (r2Err) {
        console.warn("R2 create file warning:", r2Err.message);
      }
    } else if (type === "folder") {
      try {
        const r2Res = await r2Service.createFolderInR2(req.user.id, workspaceId, cleanPath);
        if (r2Res) {
          r2Key = r2Res.key;
        }
      } catch (r2Err) {
        console.warn("R2 create folder warning:", r2Err.message);
      }
    }

    await FileNode.findOneAndUpdate(
      { ...wsQuery, path: cleanPath },
      {
        workspaceId: String(workspaceId),
        path: cleanPath,
        type,
        content: type === "file" ? "" : undefined,
        r2Key,
        size,
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

    const cleanPath = normalizePath(path);
    const wsQuery = buildWsQuery(workspaceId);

    const node = await FileNode.findOne({ ...wsQuery, path: cleanPath });
    if (!node || node.type !== "file") {
      return res.status(404).json({ error: "File not found" });
    }

    // 1. Try local filesystem
    let content = fsService.readFile(req.user.id, workspaceId, cleanPath);

    // 2. Fallback to Cloudflare R2 if local disk doesn't have it
    if (!content) {
      try {
        const r2Content = await r2Service.readFileFromR2(req.user.id, workspaceId, cleanPath);
        if (r2Content !== null && r2Content !== undefined) {
          content = r2Content;
          try {
            fsService.saveFile(req.user.id, workspaceId, cleanPath, content);
          } catch {}
        }
      } catch (r2Err) {
        console.warn("R2 read fallback warning:", r2Err.message);
      }
    }

    // 3. Fallback to MongoDB content if needed
    if ((content === "" || content === null || content === undefined) && node.content) {
      content = node.content;
      try {
        fsService.saveFile(req.user.id, workspaceId, cleanPath, content);
      } catch {}
    }

    res.json({ content: content || "" });
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

    const cleanPath = normalizePath(path);
    const wsQuery = buildWsQuery(workspaceId);

    // 1. Save to Cloudflare R2
    let r2Key = undefined;
    let size = Buffer.byteLength(content || "", "utf8");
    try {
      const r2Res = await r2Service.saveFileToR2(req.user.id, workspaceId, cleanPath, content || "");
      if (r2Res) {
        r2Key = r2Res.key;
        size = r2Res.size;
      }
    } catch (r2Err) {
      console.warn("R2 saveFile warning:", r2Err.message);
    }

    // 2. Save in MongoDB FileNode
    await FileNode.findOneAndUpdate(
      { ...wsQuery, path: cleanPath, type: "file" },
      {
        workspaceId: String(workspaceId),
        path: cleanPath,
        type: "file",
        content: content || "",
        r2Key,
        size,
      },
      { upsert: true, new: true }
    );

    // 3. Save to local disk
    fsService.saveFile(req.user.id, workspaceId, cleanPath, content || "");

    res.json({ success: true, r2Key, size });
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

    try {
      await r2Service.renameFileOrFolderInR2(req.user.id, workspaceId, cleanOld, cleanNew);
    } catch (r2Err) {
      console.warn("R2 rename warning:", r2Err.message);
    }

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

    const clean = normalizePath(path);
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wsQuery = buildWsQuery(wsId);

    // Fetch existing nodes matching exact path or directory contents (lightweight projection)
    const targetNodes = await FileNode.find(
      {
        ...wsQuery,
        path: { $regex: `^${escaped}(/|$)` },
      },
      "path type name"
    ).lean();

    let ws = null;
    try {
      ws = await Workspace.findById(wsId).lean();
    } catch {}
    const wsName = ws?.name || "Workspace";

    const name = clean.split("/").pop() || clean;
    const primary = targetNodes.find((n) => n.path === clean) || targetNodes[0];
    const isFolder = targetNodes.length > 1 || (targetNodes.length === 1 && targetNodes[0].type === "folder");

    // Capture single file content before deleting from disk and DB
    let singleContent = "";
    if (!isFolder) {
      try {
        singleContent = fsService.readFile(userId, wsId, clean) || "";
      } catch {}
      if (!singleContent) {
        const found = await FileNode.findOne({ ...wsQuery, path: clean }).select("content").lean();
        singleContent = found?.content || "";
      }
    }

    // Lightweight items metadata (content is preserved on disk in .trash & R2)
    const safeItems = targetNodes.map((n) => ({
      path: n.path,
      type: n.type || "file",
    }));

    const rawId = req.user.id || req.user._id;
    const binItem = await RecycleBin.create({
      userId: rawId,
      workspaceId: wsId,
      workspaceName: wsName,
      name,
      originalPath: clean,
      type: primary?.type || (isFolder ? "folder" : "file"),
      content: singleContent,
      items: safeItems,
      deletedAt: new Date(),
    });

    // 1. Instantly delete from DB & local filesystem
    await FileNode.deleteMany({
      ...wsQuery,
      path: { $regex: `^${escaped}(/|$)` },
    });

    fsService.deleteNode(userId, wsId, clean);

    // 2. Move file/folder in Cloudflare R2 to trash prefix before returning so immediate syncs don't resurrect it
    try {
      const r2Trash = await r2Service.moveNodeToTrashR2(userId, wsId, clean, binItem._id.toString());
      if (r2Trash?.r2Key) {
        binItem.r2Key = r2Trash.r2Key;
        binItem.size = r2Trash.size;
        await binItem.save();
      }
    } catch (r2Err) {
      console.warn("R2 move to trash warning:", r2Err.message);
    }

    res.json({ success: true, movedToRecycleBin: true });
  } catch (err) {
    console.error("DELETE NODE ERROR:", err);
    res.status(500).json({ error: "Delete failed: " + err.message });
  }
}

/* ========== GET RECYCLE BIN ITEMS ========== */
export async function getRecycleBin(req, res) {
  try {
    const rawId = req.user.id || req.user._id;
    const userQuery = mongoose.Types.ObjectId.isValid(rawId)
      ? { $in: [rawId, String(rawId), new mongoose.Types.ObjectId(rawId)] }
      : rawId;

    // Use lean projection without heavy content strings for instant response
    const items = await RecycleBin.find({ userId: userQuery })
      .select("name type originalPath workspaceName workspaceId deletedAt size items.path items.type")
      .sort({ deletedAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("GET RECYCLE BIN ERROR:", err);
    res.status(500).json({ error: "Failed to fetch recycle bin: " + err.message });
  }
}

/* ========== RESTORE RECYCLE BIN ITEM ========== */
export async function restoreRecycleBinItem(req, res) {
  try {
    const { id } = req.params;
    const rawId = req.user.id || req.user._id;
    const userQuery = mongoose.Types.ObjectId.isValid(rawId)
      ? { $in: [rawId, String(rawId), new mongoose.Types.ObjectId(rawId)] }
      : rawId;
    const userId = String(rawId);

    const item = await RecycleBin.findOne({ _id: id, userId: userQuery });
    if (!item) {
      return res.status(404).json({ error: "Item not found in recycle bin" });
    }

    // ========== RESTORE FULL WORKSPACE / FOLDER ==========
    if (item.type === "workspace") {
      // 1. Re-create the Workspace in MongoDB
      let ws = await Workspace.findById(item.workspaceId);
      if (!ws) {
        ws = await Workspace.create({
          _id: item.workspaceId,
          userId,
          name: item.name || "Restored Workspace",
          isPinned: false,
          r2Prefix: r2Service.getWorkspaceR2Prefix(userId, item.workspaceId.toString()),
        });
      }

      fsService.restoreFromTrash(userId, ws._id.toString());
      fsService.ensureWorkspace(userId, ws._id.toString());

      // Restore from Cloudflare R2
      try {
        await r2Service.restoreFromTrashR2(userId, ws._id.toString(), id);
        await r2Service.syncWorkspaceDirFromR2(userId, ws._id.toString());
      } catch (r2Err) {
        console.warn("R2 workspace restore warning:", r2Err.message);
      }

      // 2. Re-create all FileNode documents in MongoDB
      if (Array.isArray(item.items) && item.items.length > 0) {
        const nodesToInsert = item.items.map((it) => {
          let content = it.content || "";
          if (!content && it.type === "file") {
            try {
              content = fsService.readFile(userId, ws._id.toString(), it.path) || "";
            } catch {}
          }
          return {
            workspaceId: ws._id.toString(),
            path: it.path,
            type: it.type || "file",
            content,
          };
        });
        await FileNode.insertMany(nodesToInsert);
        // Hydrate files on disk
        await hydrateWorkspace(userId, ws._id.toString());
      }

      // 3. Remove entry from RecycleBin
      await RecycleBin.deleteOne({ _id: id });

      return res.json({
        success: true,
        restored: item.name,
        isWorkspace: true,
        workspaceId: ws._id,
      });
    }

    const wsId = String(item.workspaceId);

    // Restore from Cloudflare R2
    try {
      await r2Service.restoreFromTrashR2(userId, wsId, id);
      await r2Service.syncWorkspaceDirFromR2(userId, wsId);
    } catch (r2Err) {
      console.warn("R2 node restore warning:", r2Err.message);
    }

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
      let content = item.content || "";
      if (!content) {
        try {
          content = fsService.readFile(userId, wsId, item.originalPath) || "";
        } catch {}
      }
      await FileNode.findOneAndUpdate(
        { workspaceId: wsId, path: item.originalPath },
        {
          workspaceId: wsId,
          path: item.originalPath,
          type: "file",
          content,
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
          let subContent = sub.content || "";
          if (!subContent && sub.type === "file") {
            try {
              subContent = fsService.readFile(userId, wsId, sub.path) || "";
            } catch {}
          }
          await FileNode.findOneAndUpdate(
            { workspaceId: wsId, path: sub.path },
            {
              workspaceId: wsId,
              path: sub.path,
              type: sub.type,
              content: subContent,
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
    const rawId = req.user.id || req.user._id;
    const userQuery = mongoose.Types.ObjectId.isValid(rawId)
      ? { $in: [rawId, String(rawId), new mongoose.Types.ObjectId(rawId)] }
      : rawId;

    const deleted = await RecycleBin.findOneAndDelete({ _id: id, userId: userQuery });
    if (!deleted) {
      return res.status(404).json({ error: "Item not found in recycle bin" });
    }

    const userId = String(rawId);

    // Purge from Cloudflare R2 asynchronously
    r2Service.purgeTrashR2(userId, id)
      .then(async () => {
        if (deleted.type === "workspace") {
          await r2Service.deleteWorkspaceFromR2(userId, String(deleted.workspaceId));
        }
      })
      .catch((r2Err) => {
        console.warn("R2 purge trash warning:", r2Err.message);
      });

    if (deleted.type === "workspace") {
      await Workspace.deleteOne({ _id: deleted.workspaceId, userId: userQuery });
      await FileNode.deleteMany({
        $or: [
          { workspaceId: deleted.workspaceId },
          { workspaceId: String(deleted.workspaceId) },
        ],
      });
      fsService.deleteWorkspace(userId, String(deleted.workspaceId));
    }

    res.json({ success: true, message: "Permanently deleted" });
  } catch (err) {
    console.error("PERMANENT DELETE ERROR:", err);
    res.status(500).json({ error: "Failed to permanently delete item: " + err.message });
  }
}

/* ========== EMPTY RECYCLE BIN ========== */
export async function emptyRecycleBin(req, res) {
  try {
    const rawId = req.user.id || req.user._id;
    const userQuery = mongoose.Types.ObjectId.isValid(rawId)
      ? { $in: [rawId, String(rawId), new mongoose.Types.ObjectId(rawId)] }
      : rawId;
    const userId = String(rawId);

    const items = await RecycleBin.find({ userId: userQuery }).lean();

    // Immediately remove from RecycleBin collection in MongoDB
    await RecycleBin.deleteMany({ userId: userQuery });

    // Respond immediately so client closes modal in ~20ms!
    res.json({ success: true, message: "Recycle bin emptied" });

    // Clean up filesystem trash and R2 asynchronously in background
    setImmediate(async () => {
      for (const it of items) {
        try {
          await r2Service.purgeTrashR2(userId, it._id.toString());
          if (it.type === "workspace") {
            await r2Service.deleteWorkspaceFromR2(userId, String(it.workspaceId));
          }
        } catch (r2Err) {
          console.warn("R2 empty trash item error:", r2Err.message);
        }

        if (it.type === "workspace") {
          try {
            await Workspace.deleteOne({ _id: it.workspaceId, userId: userQuery });
            await FileNode.deleteMany({
              $or: [
                { workspaceId: it.workspaceId },
                { workspaceId: String(it.workspaceId) },
              ],
            });
            fsService.deleteWorkspace(userId, String(it.workspaceId));
          } catch (e) {
            console.warn("Workspace purge error:", e.message);
          }
        }
      }
    });
  } catch (err) {
    console.error("EMPTY RECYCLE BIN ERROR:", err);
    res.status(500).json({ error: "Failed to empty recycle bin: " + err.message });
  }
}

/* ========== LOAD TREE ========== */
export async function loadTree(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const wsQuery = buildWsQuery(workspaceId);

    const nodes = await FileNode.find({
      ...wsQuery,
      path: {
        $not: {
          $regex: "\\.(class|out|o|obj|exe|pyc|so|dll)$|(^|/)a\\.out$",
          $options: "i",
        },
      },
    })
      .select("path type workspaceId")
      .sort({ path: 1 })
      .lean();

    res.json(nodes);
  } catch (err) {
    console.error("LOAD TREE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ========== SEARCH IN WORKSPACE FILES ========== */
export async function searchFiles(req, res) {
  try {
    const {
      workspaceId,
      query,
      isCaseSensitive = "false",
      isRegex = "false",
      isWholeWord = "false",
      includePattern = "",
      excludePattern = "",
    } = req.query;

    if (!workspaceId || !query) {
      return res.json({ results: [], totalMatches: 0 });
    }

    const wsQuery = buildWsQuery(workspaceId);
    const caseSensitive = isCaseSensitive === "true";
    const useRegex = isRegex === "true";
    const wholeWord = isWholeWord === "true";

    const queryFilter = {
      ...wsQuery,
      type: "file",
      path: {
        $not: {
          $regex: "\\.(class|out|o|obj|exe|pyc|so|dll|png|jpg|jpeg|gif|ico|svg|wasm|zip|tar|gz)$|(^|/)a\\.out$",
          $options: "i",
        },
      },
    };

    const files = await FileNode.find(queryFilter).select("path content").lean();

    let pattern = query;
    if (!useRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    let flags = "g";
    if (!caseSensitive) flags += "i";

    let searchRegex;
    try {
      searchRegex = new RegExp(pattern, flags);
    } catch {
      return res.status(400).json({ error: "Invalid regular expression" });
    }

    const results = [];
    let totalMatches = 0;

    for (const file of files) {
      if (includePattern && !file.path.toLowerCase().includes(includePattern.toLowerCase())) {
        continue;
      }
      if (excludePattern && file.path.toLowerCase().includes(excludePattern.toLowerCase())) {
        continue;
      }

      let content = file.content;
      if (!content || content.length === 0) {
        try {
          content = fsService.readFile(req.user.id, workspaceId, file.path) || "";
        } catch {
          content = "";
        }
      }

      const lines = content.split("\n");
      const fileMatches = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        searchRegex.lastIndex = 0;
        let match;

        while ((match = searchRegex.exec(line)) !== null) {
          fileMatches.push({
            lineNumber: i + 1,
            lineText: line,
            matchIndex: match.index,
            matchLength: match[0].length,
          });
          totalMatches++;
          if (!searchRegex.global) break;
        }
      }

      if (fileMatches.length > 0) {
        results.push({
          path: file.path,
          fileName: file.path.split("/").pop(),
          matches: fileMatches,
        });
      }
    }

    res.json({ results, totalMatches });
  } catch (err) {
    console.error("SEARCH FILES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ========== REPLACE IN WORKSPACE FILES ========== */
export async function replaceInFiles(req, res) {
  try {
    const {
      workspaceId,
      query,
      replaceText = "",
      filePath,
      isCaseSensitive = false,
      isRegex = false,
      isWholeWord = false,
    } = req.body;

    if (!workspaceId || !query) {
      return res.status(400).json({ error: "workspaceId and query are required" });
    }

    const wsQuery = buildWsQuery(workspaceId);
    let pattern = query;
    if (!isRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    if (isWholeWord) {
      pattern = `\\b${pattern}\\b`;
    }
    const flags = isCaseSensitive ? "g" : "gi";
    const regex = new RegExp(pattern, flags);

    const filter = { ...wsQuery, type: "file" };
    if (filePath) filter.path = filePath;

    const files = await FileNode.find(filter);
    let modifiedFilesCount = 0;

    for (const file of files) {
      if (regex.test(file.content || "")) {
        const updated = (file.content || "").replace(regex, replaceText);
        file.content = updated;
        await file.save();
        fsService.saveFile(req.user.id, workspaceId, file.path, updated);
        try {
          await r2Service.saveFileToR2(req.user.id, workspaceId, file.path, updated);
        } catch {}
        modifiedFilesCount++;
      }
    }

    res.json({ success: true, modifiedFilesCount });
  } catch (err) {
    console.error("REPLACE IN FILES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

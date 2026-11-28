import fs from "fs";
import path from "path";
import os from "os";
import { ZipArchive } from "archiver";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import FileNode from "../models/FileNode.js";
import { getPlanConfig } from "../config/plans.js";
import RecycleBin from "../models/RecycleBin.js";
import {
  ensureWorkspace,
  deleteWorkspace as deleteWorkspaceFS,
  moveToTrash,
  restoreFromTrash,
  DEFAULT_GITIGNORE,
} from "../services/fileService.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";
import { getWorkspacesRoot } from "../config/paths.js";
import { scanLocalDirectory } from "../utils/scanLocalFolder.js";
import { STARTER_TEMPLATES, getTemplateById } from "../templates/starterTemplates.js";
import * as r2Service from "../services/r2Service.js";
import { stopAndRemoveContainer, getContainerKey } from "../sandbox/containerManager.js";

/* GET STARTER TEMPLATES */
export async function getTemplates(req, res) {
  try {
    const list = STARTER_TEMPLATES.map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      description: t.description,
      category: t.category,
      badge: t.badge,
      icon: t.icon,
      color: t.color,
      tags: t.tags,
      recommendedFile: t.recommendedFile,
      fileCount: t.files?.length || 0,
      files: t.files?.map((f) => ({ path: f.path, type: f.type, content: f.content })) || [],
    }));
    res.json(list);
  } catch (err) {
    console.error("GET TEMPLATES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* CREATE */
export async function createWorkspace(req, res) {
  try {
    const user = await User.findById(req.user.id).select("plan planExpiresAt").lean();
    const planConfig = getPlanConfig(user);
    const maxWorkspaces = planConfig.limits.maxWorkspaces;
    if (maxWorkspaces !== -1) {
      const currentCount = await Workspace.countDocuments({ userId: req.user.id });
      if (currentCount >= maxWorkspaces) {
        return res.status(403).json({
          error: `Workspace limit reached (${currentCount}/${maxWorkspaces} on the ${planConfig.name} plan). Upgrade your plan to create more workspaces.`,
          workspaceLimitReached: true,
          planId: planConfig.id,
          maxWorkspaces,
        });
      }
    }

    const templateId = req.body.templateId;
    const template = templateId ? getTemplateById(templateId) : null;

    const defaultName = template ? `${template.title}` : "Untitled Workspace";
    const wsName =
      req.body.name && req.body.name.trim() ? req.body.name.trim() : defaultName;

    const ws = await Workspace.create({
      userId: req.user.id,
      name: wsName,
      r2Prefix: r2Service.getWorkspaceR2Prefix(req.user.id, "temp"),
    });

    // Update actual r2Prefix with real ID
    ws.r2Prefix = r2Service.getWorkspaceR2Prefix(req.user.id, ws._id.toString());
    await ws.save();

    // Create workspace directory marker in Cloudflare R2 immediately
    try {
      await r2Service.createWorkspaceMarkerInR2(req.user.id, ws._id.toString());
    } catch (r2Err) {
      console.warn("R2 create workspace marker warning:", r2Err.message);
    }

    ensureWorkspace(req.user.id, ws._id.toString());

    try {
      await FileNode.create({
        workspaceId: ws._id.toString(),
        path: ".gitignore",
        type: "file",
        content: DEFAULT_GITIGNORE,
      });
    } catch {}

    // Seed starter template files if requested
    if (template && Array.isArray(template.files)) {
      for (const f of template.files) {
        try {
          await FileNode.create({
            workspaceId: ws._id.toString(),
            path: f.path,
            type: f.type || "file",
            content: f.content || "",
          });
        } catch (fileErr) {
          console.warn(`Template seed file error [${f.path}]:`, fileErr.message);
        }
      }

      // Immediately hydrate to disk
      try {
        await hydrateWorkspace(req.user.id, ws._id.toString());
      } catch (hydrateErr) {
        console.warn("Template hydrate warning:", hydrateErr.message);
      }
    }

    // Sync initial workspace files to Cloudflare R2 in background
    r2Service.syncWorkspaceDirToR2(req.user.id, ws._id.toString()).catch((r2Err) => {
      console.warn("R2 initial workspace sync warning:", r2Err.message);
    });

    res.json(ws);
  } catch (err) {
    console.error("CREATE WORKSPACE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* LIST */
export async function listWorkspaces(req, res) {
  try {
    const workspaces = await Workspace.find({ userId: req.user.id })
      .sort({
        isPinned: -1,
        createdAt: -1,
      })
      .lean();
    res.json(workspaces);
  } catch (err) {
    console.error("LIST WORKSPACES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* DELETE (MOVES TO RECYCLE BIN) */
export async function deleteWorkspace(req, res) {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // 1. Fetch FileNode paths belonging to this workspace (lightweight projection)
    const nodes = await FileNode.find(
      {
        $or: [
          { workspaceId: workspace._id },
          { workspaceId: workspace._id.toString() },
        ],
      },
      "path type"
    ).lean();

    // 2. Prepare lightweight items metadata (files preserved in .trash & R2)
    const safeItems = nodes.map((n) => ({
      path: n.path,
      type: n.type || "file",
    }));

    // 3. Stop/remove container & move filesystem files to .trash directory in background so ports are freed and API response is instant
    const targetUserId = req.user.id || req.user._id;
    const targetWsId = workspace._id.toString();
    stopAndRemoveContainer(getContainerKey(targetUserId, targetWsId)).catch((err) => {
      console.warn("Background stopAndRemoveContainer notice:", err.message);
    });
    setTimeout(() => {
      try {
        moveToTrash(targetUserId, targetWsId);
      } catch (err) {
        console.warn("Background moveToTrash error:", err.message);
      }
    }, 0);

    // 4. Archive to RecycleBin so user can restore it from dashboard
    const rawId = req.user.id || req.user._id;
    const binItem = await RecycleBin.create({
      userId: rawId,
      workspaceId: workspace._id,
      workspaceName: workspace.name,
      name: workspace.name,
      originalPath: workspace.name,
      type: "workspace",
      items: safeItems,
      deletedAt: new Date(),
    });

    // 5. Remove active workspace record
    await Workspace.deleteOne({
      _id: workspace._id,
      userId: req.user.id,
    });

    // 6. Remove active FileNode collection entries
    await FileNode.deleteMany({
      $or: [
        { workspaceId: workspace._id },
        { workspaceId: workspace._id.toString() },
      ],
    });

    // Move in Cloudflare R2 to trash prefix asynchronously in background
    r2Service.moveWorkspaceToTrashR2(
      req.user.id,
      workspace._id.toString(),
      binItem._id.toString()
    ).then(async (r2Res) => {
      if (r2Res?.r2Key) {
        binItem.r2Key = r2Res.r2Key;
        binItem.size = r2Res.size;
        await binItem.save();
      }
    }).catch((r2Err) => {
      console.warn("R2 workspace move to trash warning:", r2Err.message);
    });

    res.json({
      success: true,
      message: "Moved to Recycle Bin",
      movedToRecycleBin: true,
    });
  } catch (err) {
    console.error("DELETE WORKSPACE ERROR:", err);
    res.status(500).json({ error: "Failed to delete workspace: " + err.message });
  }
}

/* RENAME */
export async function renameWorkspace(req, res) {
  try {
    const newName = (req.body.name || "").trim();
    if (!newName) {
      return res.status(400).json({ error: "Workspace name cannot be empty" });
    }

    const ws = await Workspace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name: newName },
      { new: true }
    );

    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    console.error("RENAME WORKSPACE ERROR:", err);
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
      isPinned: false,
      r2Prefix: r2Service.getWorkspaceR2Prefix(req.user.id, "temp"),
    });

    copy.r2Prefix = r2Service.getWorkspaceR2Prefix(req.user.id, copy._id.toString());
    await copy.save();

    ensureWorkspace(req.user.id, copy._id.toString());

    // Copy on disk if source directory exists
    try {
      const srcDisk = path.join(getWorkspacesRoot(), String(req.user.id), old._id.toString());
      const dstDisk = path.join(getWorkspacesRoot(), String(req.user.id), copy._id.toString());
      if (fs.existsSync(srcDisk)) {
        fs.cpSync(srcDisk, dstDisk, { recursive: true });
      }
    } catch (diskErr) {
      console.warn("Disk copy error during duplicate workspace:", diskErr.message);
    }

    // Copy FileNode records in MongoDB
    const oldNodes = await FileNode.find({
      $or: [
        { workspaceId: old._id },
        { workspaceId: old._id.toString() },
      ],
    }).lean();

    if (oldNodes.length > 0) {
      const copyOperations = oldNodes.map((n) => ({
        workspaceId: copy._id.toString(),
        path: n.path,
        type: n.type,
        content: n.content || "",
      }));
      await FileNode.insertMany(copyOperations);
      await hydrateWorkspace(req.user.id, copy._id.toString());
    }

    // Background Cloudflare R2 sync
    r2Service.syncWorkspaceDirToR2(req.user.id, copy._id.toString()).catch((r2Err) => {
      console.warn("R2 duplicate sync warning:", r2Err.message);
    });

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
      { isPinned: Boolean(req.body.isPinned) },
      { new: true }
    );

    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    console.error("PIN WORKSPACE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* IMPORT WORKSPACE (FROM LOCAL DESKTOP FOLDER) */
export async function importWorkspace(req, res) {
  try {
    const { name, files } = req.body;
    const wsName = (name || "Imported Workspace").trim();

    const ws = await Workspace.create({
      userId: req.user.id,
      name: wsName,
      isPinned: false,
    });

    const wsIdStr = ws._id.toString();
    const workspacePath = ensureWorkspace(req.user.id, wsIdStr);

    if (Array.isArray(files) && files.length > 0) {
      const folderPaths = new Set();
      const nodeDocs = [];

      for (const file of files) {
        const cleanPath = (file.path || "").replace(/^[\\\/]+/, "").replace(/\\/g, "/");
        if (!cleanPath) continue;

        // Auto-register ancestor folders
        const parts = cleanPath.split("/").filter(Boolean);
        let curr = "";
        for (let i = 0; i < parts.length - (file.type === "folder" ? 0 : 1); i++) {
          curr = curr ? `${curr}/${parts[i]}` : parts[i];
          folderPaths.add(curr);
        }

        if (file.type === "folder") {
          folderPaths.add(cleanPath);
        } else {
          nodeDocs.push({
            workspaceId: wsIdStr,
            path: cleanPath,
            type: "file",
            content: typeof file.content === "string" ? file.content : "",
          });
        }
      }

      // Deduplicate file nodes by path
      const fileMap = new Map();
      for (const doc of nodeDocs) {
        fileMap.set(doc.path, doc);
      }
      const uniqueFiles = Array.from(fileMap.values());
      const filePathsSet = new Set(uniqueFiles.map((n) => n.path));
      const finalFolders = Array.from(folderPaths).filter((fp) => !filePathsSet.has(fp));

      // 1. Single batch operation to upsert all FileNodes in MongoDB (1 round-trip)
      const bulkOps = [];
      for (const fPath of finalFolders) {
        bulkOps.push({
          updateOne: {
            filter: { workspaceId: wsIdStr, path: fPath },
            update: { $set: { workspaceId: wsIdStr, path: fPath, type: "folder" } },
            upsert: true,
          },
        });
      }
      for (const file of uniqueFiles) {
        bulkOps.push({
          updateOne: {
            filter: { workspaceId: wsIdStr, path: file.path },
            update: {
              $set: {
                workspaceId: wsIdStr,
                path: file.path,
                type: "file",
                content: file.content,
              },
            },
            upsert: true,
          },
        });
      }

      if (bulkOps.length > 0) {
        await FileNode.bulkWrite(bulkOps, { ordered: false });
      }

      // 2. High-speed concurrent local disk hydration directly from payload
      await Promise.all(
        finalFolders.map((fPath) =>
          fs.promises.mkdir(path.join(workspacePath, fPath), { recursive: true })
        )
      );

      const WRITE_BATCH = 25;
      for (let i = 0; i < uniqueFiles.length; i += WRITE_BATCH) {
        const batch = uniqueFiles.slice(i, i + WRITE_BATCH);
        await Promise.all(
          batch.map(async (file) => {
            const fullPath = path.join(workspacePath, file.path);
            await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
            const content = file.content;
            if (typeof content === "string" && content.startsWith("data:") && content.includes(";base64,")) {
              const base64Data = content.replace(/^data:.*?;base64,/, "");
              await fs.promises.writeFile(fullPath, Buffer.from(base64Data, "base64"));
            } else {
              await fs.promises.writeFile(fullPath, content || "", "utf-8");
            }
          })
        );
      }

      // 3. Asynchronously sync to Cloudflare R2 in background without blocking the response
      r2Service.syncWorkspaceDirToR2(req.user.id, wsIdStr).catch((r2Err) => {
        console.warn("Background R2 import sync warning:", r2Err.message);
      });
    }

    res.json(ws);
  } catch (err) {
    console.error("IMPORT WORKSPACE ERROR:", err);
    res.status(500).json({ error: "Failed to import workspace: " + err.message });
  }
}

/* EXPORT WORKSPACES AS ZIP */
export async function exportWorkspaces(req, res) {
  try {
    const { workspaceIds } = req.body;
    if (!Array.isArray(workspaceIds) || workspaceIds.length === 0) {
      return res.status(400).json({ error: "workspaceIds array is required" });
    }

    const workspaces = await Workspace.find({
      _id: { $in: workspaceIds },
      userId: req.user.id,
    }).lean();

    if (workspaces.length === 0) {
      return res.status(404).json({ error: "No matching workspaces found to export" });
    }

    // Hydrate all selected workspaces to ensure disk files exist
    for (const ws of workspaces) {
      await hydrateWorkspace(req.user.id, ws._id.toString());
    }

    // Format archive name
    let filename = "vocodeai-workspaces.zip";
    if (workspaces.length === 1) {
      const wsName = workspaces[0].name.trim();
      const safeName = wsName.replace(/[<>:"/\\|?*]/g, "_") || "workspace";
      filename = `${safeName}.zip`;
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const archive = new ZipArchive({
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("ARCHIVE STREAM ERROR:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Zip compression error" });
      }
    });

    archive.pipe(res);

    for (const ws of workspaces) {
      const wsDir = path.join(getWorkspacesRoot(), String(req.user.id), String(ws._id));
      if (fs.existsSync(wsDir)) {
        // Always place files under the workspace's folder name so exported zip extracts cleanly
        archive.directory(wsDir, ws.name);
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error("EXPORT WORKSPACES ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export workspaces: " + err.message });
    }
  }
}

/* SCAN LOCAL FOLDER BY PATH */
export async function scanLocalFolder(req, res) {
  try {
    const targetPath = (req.body.folderPath || "").trim();
    if (!targetPath) {
      return res.status(400).json({ error: "folderPath is required" });
    }
    const result = scanLocalDirectory(targetPath);
    res.json({
      success: true,
      folderName: result.folderName,
      fullPath: result.fullPath,
      totalFiles: result.totalFiles,
      totalFolders: result.totalFolders,
      items: result.items,
    });
  } catch (err) {
    console.error("SCAN LOCAL FOLDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* GET COMMON FOLDERS SUGGESTIONS */
export async function getCommonFolders(req, res) {
  try {
    const suggestions = [];
    const home = os.homedir();
    const commonPaths = [
      { name: "C++_DSA", path: "D:\\C++_DSA" },
      { name: "TownYaar", path: "D:\\TownYaar" },
      { name: "Desktop", path: path.join(home, "Desktop") },
      { name: "Documents", path: path.join(home, "Documents") },
      { name: "Downloads", path: path.join(home, "Downloads") },
      { name: "D: Drive", path: "D:\\" },
    ];

    for (const item of commonPaths) {
      if (fs.existsSync(item.path)) {
        suggestions.push(item);
      }
    }

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

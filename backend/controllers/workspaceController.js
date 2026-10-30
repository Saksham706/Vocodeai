import fs from "fs";
import path from "path";
import { ZipArchive } from "archiver";
import Workspace from "../models/Workspace.js";
import FileNode from "../models/FileNode.js";
import RecycleBin from "../models/RecycleBin.js";
import {
  ensureWorkspace,
  deleteWorkspace as deleteWorkspaceFS,
} from "../services/fileService.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";
import { getWorkspacesRoot } from "../config/paths.js";

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

    // 1. Fetch all FileNode documents belonging to this workspace
    const nodes = await FileNode.find({
      $or: [
        { workspaceId: workspace._id },
        { workspaceId: workspace._id.toString() },
      ],
    }).lean();

    // 2. Archive to RecycleBin so user can restore it from dashboard
    await RecycleBin.create({
      userId: req.user.id,
      workspaceId: workspace._id,
      workspaceName: workspace.name,
      name: workspace.name,
      originalPath: workspace.name,
      type: "workspace",
      items: nodes.map((n) => ({
        path: n.path,
        type: n.type || "file",
        content: n.content || "",
      })),
      deletedAt: new Date(),
    });

    // 3. Remove active workspace record
    await Workspace.deleteOne({
      _id: workspace._id,
      userId: req.user.id,
    });

    // 4. Remove active FileNode collection entries
    await FileNode.deleteMany({
      $or: [
        { workspaceId: workspace._id },
        { workspaceId: workspace._id.toString() },
      ],
    });

    // 5. Clean up active workspace filesystem directory
    deleteWorkspaceFS(req.user.id, workspace._id.toString());

    res.json({
      success: true,
      message: "Moved to Recycle Bin",
      movedToRecycleBin: true,
    });
  } catch (err) {
    console.error("DELETE WORKSPACE ERROR:", err);
    res.status(500).json({ error: "Failed to delete workspace" });
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
    });

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
    ensureWorkspace(req.user.id, wsIdStr);

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

      // Ensure folders do not collide with files
      const filePathsSet = new Set(nodeDocs.map((n) => n.path));
      const finalFolders = Array.from(folderPaths).filter((fp) => !filePathsSet.has(fp));

      // Upsert folders
      for (const fPath of finalFolders) {
        await FileNode.findOneAndUpdate(
          { workspaceId: wsIdStr, path: fPath },
          { workspaceId: wsIdStr, path: fPath, type: "folder" },
          { upsert: true }
        );
      }

      // Upsert files
      for (const node of nodeDocs) {
        await FileNode.findOneAndUpdate(
          { workspaceId: wsIdStr, path: node.path },
          {
            workspaceId: wsIdStr,
            path: node.path,
            type: "file",
            content: node.content,
          },
          { upsert: true }
        );
      }

      // Hydrate all files onto the disk directory
      await hydrateWorkspace(req.user.id, wsIdStr);
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
      const safeName = workspaces[0].name.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "workspace";
      filename = `${safeName}.zip`;
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

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
        if (workspaces.length === 1) {
          archive.directory(wsDir, false);
        } else {
          archive.directory(wsDir, ws.name);
        }
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

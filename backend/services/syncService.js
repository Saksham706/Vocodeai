import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";

const IGNORED_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "__pycache__",
  ".venv",
  ".pytest_cache",
  ".DS_Store",
  ".workspace.json",
];

const IGNORED_EXTENSIONS = [
  ".class",
  ".out",
  ".o",
  ".obj",
  ".exe",
  ".pyc",
  ".pyo",
  ".pyd",
  ".so",
  ".dll",
  ".dylib",
  ".pdb",
  ".idb",
  ".ilk",
  ".map",
];

const IGNORED_FILENAMES = [
  "a.out",
  "a.exe",
  ".ds_store",
  "thumbs.db",
];

export function isIgnoredFile(relativePath) {
  if (!relativePath) return true;
  const lower = relativePath.toLowerCase();
  const filename = lower.split("/").pop();

  if (IGNORED_PATTERNS.some((pattern) => lower.includes(pattern))) return true;
  if (IGNORED_FILENAMES.includes(filename)) return true;
  if (IGNORED_EXTENSIONS.some((ext) => filename.endsWith(ext))) return true;

  return false;
}

import { getWorkspacesRoot } from "../config/paths.js";

export async function syncWorkspaceToDB(userId, workspaceId) {
  try {
    const workspacePath = path.join(
      getWorkspacesRoot(),
      userId,
      workspaceId
    );

    try {
      await fs.access(workspacePath);
    } catch {
      return;
    }

    const nodes = [];

    async function walk(dir, base = "") {
      const entries = await fs.readdir(dir, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        const relativePath = base
          ? `${base}/${entry.name}`
          : entry.name;

        // Skip ignored system, dependency, and compiled binary files (.class, a.out, etc.)
        if (isIgnoredFile(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          nodes.push({
            workspaceId,
            path: relativePath,
            type: "folder",
          });

          await walk(fullPath, relativePath);
        } else {
          let content = "";

          try {
            content = await fs.readFile(fullPath, "utf-8");
          } catch {
            content = "";
          }

          nodes.push({
            workspaceId,
            path: relativePath,
            type: "file",
            content,
          });
        }
      }
    }

    await walk(workspacePath);

    // Existing DB nodes
    const existingNodes = await FileNode.find({
      workspaceId,
    }).lean();

    const existingPaths = new Set(existingNodes.map((n) => n.path));
    const currentPaths = new Set(nodes.map((n) => n.path));

    // Remove deleted files/folders
    const pathsToDelete = [...existingPaths].filter(
      (p) => !currentPaths.has(p)
    );

    if (pathsToDelete.length > 0) {
      await FileNode.deleteMany({
        workspaceId,
        path: { $in: pathsToDelete },
      });
    }

    // Explicitly delete any compiled binary files (.class, a.out, etc.) from MongoDB
    await FileNode.deleteMany({
      workspaceId,
      $or: [
        { path: { $regex: "\\.(class|out|o|obj|exe|pyc|so|dll)$", $options: "i" } },
        { path: { $regex: "(^|/)a\\.out$", $options: "i" } },
      ],
    });

    // Bulk upsert current nodes
    if (nodes.length > 0) {
      const operations = nodes.map((node) => ({
        updateOne: {
          filter: {
            workspaceId: node.workspaceId,
            path: node.path,
          },
          update: {
            $set: node,
          },
          upsert: true,
        },
      }));

      await FileNode.bulkWrite(operations);
    }
  } catch (err) {
    console.error("❌ syncWorkspaceToDB ERROR:", err.message);
  }
}

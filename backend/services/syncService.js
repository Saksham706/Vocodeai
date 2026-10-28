import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";

export async function syncWorkspaceToDB(userId, workspaceId) {
  try {
    const workspacePath = path.join(
      process.cwd(),
      "workspaces",
      userId,
      workspaceId
    );

    // Workspace does not exist
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

        // Ignore system files
        if (
          relativePath.includes("node_modules") ||
          relativePath.includes(".git") ||
          relativePath.includes("dist") ||
          relativePath.includes("build")
        ) {
          continue;
        }

        // Folder
        if (entry.isDirectory()) {
          nodes.push({
            workspaceId,
            path: relativePath,
            type: "folder",
          });

          await walk(fullPath, relativePath);
        }

        // File
        else {
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

    const existingPaths = new Set(
      existingNodes.map((n) => n.path)
    );

    const currentPaths = new Set(
      nodes.map((n) => n.path)
    );

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

    // Bulk upsert
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

    console.log(
      `✅ Workspace synced: ${workspaceId}`
    );

  } catch (err) {
    console.error(
      "❌ syncWorkspaceToDB ERROR:",
      err
    );
  }
}
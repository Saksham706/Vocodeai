import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";
import { getWorkspacesRoot } from "../config/paths.js";

export async function hydrateWorkspace(userId, workspaceId) {
  const workspacePath = path.join(
    getWorkspacesRoot(),
    userId,
    workspaceId
  );

  await fs.mkdir(workspacePath, {
    recursive: true,
  });

  const nodes = await FileNode.find({
    $or: [
      { workspaceId },
      { workspaceId: String(workspaceId) },
    ],
  }).lean();

  for (const node of nodes) {
    const cleanPath = (node.path || "").replace(/^[\\\/]+/, "");
    const fullPath = path.join(workspacePath, cleanPath);

    if (node.type === "folder") {
      await fs.mkdir(fullPath, {
        recursive: true,
      });
    }

    if (node.type === "file") {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      await fs.writeFile(fullPath, node.content || "", "utf-8");
    }
  }
}

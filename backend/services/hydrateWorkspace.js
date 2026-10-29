import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";

export async function hydrateWorkspace(userId, workspaceId) {
  const workspacePath = path.join(
    process.cwd(),
    process.env.WORKSPACES_ROOT || "workspaces",
    userId,
    workspaceId
  );

  await fs.mkdir(workspacePath, {
    recursive: true,
  });

  const nodes = await FileNode.find({
    workspaceId,
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

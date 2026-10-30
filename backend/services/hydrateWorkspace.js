import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";
import { getWorkspacesRoot } from "../config/paths.js";

export async function hydrateWorkspace(userId, workspaceId) {
  const workspacePath = path.join(
    getWorkspacesRoot(),
    String(userId),
    String(workspaceId)
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
    const cleanPath = (node.path || "").replace(/^[\\\/]+/, "").replace(/\\/g, "/");
    if (!cleanPath) continue;

    const fullPath = path.join(workspacePath, cleanPath);

    if (node.type === "folder") {
      await fs.mkdir(fullPath, {
        recursive: true,
      });
    }

    if (node.type === "file") {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      const content = node.content || "";
      if (typeof content === "string" && content.startsWith("data:") && content.includes(";base64,")) {
        const base64Data = content.replace(/^data:.*?;base64,/, "");
        await fs.writeFile(fullPath, Buffer.from(base64Data, "base64"));
      } else {
        await fs.writeFile(fullPath, content, "utf-8");
      }
    }
  }
}

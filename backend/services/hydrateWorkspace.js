import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";

export async function hydrateWorkspace(
  userId,
  workspaceId
) {
  const workspacePath = path.join(
    process.cwd(),
    "workspaces",
    userId,
    workspaceId
  );

  await fs.mkdir(workspacePath, {
    recursive: true,
  });

  const nodes = await FileNode.find({
    workspaceId,
  });

  for (const node of nodes) {
    const fullPath = path.join(
      workspacePath,
      node.path
    );

    if (node.type === "folder") {
      await fs.mkdir(fullPath, {
        recursive: true,
      });
    }

    if (node.type === "file") {
      await fs.mkdir(
        path.dirname(fullPath),
        { recursive: true }
      );

      await fs.writeFile(
        fullPath,
        node.content || "",
        "utf-8"
      );
    }
  }
}
import fs from "fs/promises";
import path from "path";
import FileNode from "../models/FileNode.js";
import { getWorkspacesRoot } from "../config/paths.js";
import { DEFAULT_GITIGNORE } from "./fileService.js";
import { readFileFromR2 } from "./r2Service.js";

export async function hydrateWorkspace(userId, workspaceId) {
  const workspacePath = path.join(
    getWorkspacesRoot(),
    String(userId),
    String(workspaceId)
  );

  await fs.mkdir(workspacePath, {
    recursive: true,
  });

  const gitignorePath = path.join(workspacePath, ".gitignore");
  try {
    await fs.access(gitignorePath);
  } catch {
    await fs.writeFile(gitignorePath, DEFAULT_GITIGNORE, "utf-8");
  }

  const nodes = await FileNode.find({
    $or: [
      { workspaceId },
      { workspaceId: String(workspaceId) },
    ],
  }).lean();

  const folders = [];
  const files = [];

  for (const node of nodes) {
    const cleanPath = (node.path || "").replace(/^[\\\/]+/, "").replace(/\\/g, "/");
    if (!cleanPath) continue;
    if (node.type === "folder") {
      folders.push(cleanPath);
    } else if (node.type === "file") {
      files.push({ ...node, cleanPath });
    }
  }

  // Create all folder directories in parallel
  await Promise.all(
    folders.map((fPath) =>
      fs.mkdir(path.join(workspacePath, fPath), { recursive: true })
    )
  );

  // Write files in parallel batches of 20
  const BATCH_SIZE = 20;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (node) => {
        const fullPath = path.join(workspacePath, node.cleanPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        let content = node.content || "";
        // If content was truncated or stored in R2, fetch original from R2
        if (!content) {
          try {
            const r2Content = await readFileFromR2(userId, workspaceId, node.cleanPath);
            if (r2Content !== null && r2Content !== undefined) {
              content = r2Content;
            }
          } catch (r2Err) {
            console.warn(`[Hydrate R2 Warning] ${node.cleanPath}:`, r2Err.message);
          }
        }

        if (typeof content === "string" && content.startsWith("data:") && content.includes(";base64,")) {
          const base64Data = content.replace(/^data:.*?;base64,/, "");
          await fs.writeFile(fullPath, Buffer.from(base64Data, "base64"));
        } else {
          await fs.writeFile(fullPath, content, "utf-8");
        }
      })
    );
  }
}

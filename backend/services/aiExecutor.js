import * as fileService from "../services/fileService.js";
import { execInWorkspace } from "../sandbox/execService.js";
import FileNode from "../models/FileNode.js";

function cleanRelativePath(p) {
  let clean = (p || "").replace(/^[\\\/]+/, "");
  if (clean.startsWith("workspace/") || clean.startsWith("workspace\\")) {
    clean = clean.replace(/^workspace[\\\/]+/, "");
  }
  return clean;
}

export async function executeAI({
  userId,
  workspaceId,
  workspacePath,
  command,
}) {
  const results = [];

  if (!command?.actions || !Array.isArray(command.actions)) {
    return { results: ["No actions to execute"] };
  }

  for (const cmd of command.actions) {
    switch (cmd.action) {
      case "create_file": {
        const cleanPath = cleanRelativePath(cmd.path);
        const content = cmd.content || "";

        fileService.createFile(userId, workspaceId, cleanPath);
        if (content) {
          fileService.saveFile(userId, workspaceId, cleanPath, content);
        }

        try {
          await FileNode.findOneAndUpdate(
            { workspaceId, path: cleanPath },
            {
              workspaceId,
              path: cleanPath,
              type: "file",
              content,
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.warn("Could not upsert FileNode in DB:", dbErr.message);
        }

        results.push(`Created ${cleanPath}`);
        break;
      }

      case "write_file": {
        const cleanPath = cleanRelativePath(cmd.path);
        const content = cmd.content || "";

        fileService.saveFile(userId, workspaceId, cleanPath, content);

        try {
          await FileNode.findOneAndUpdate(
            { workspaceId, path: cleanPath },
            {
              workspaceId,
              path: cleanPath,
              type: "file",
              content,
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.warn("Could not upsert FileNode in DB:", dbErr.message);
        }

        results.push(`Updated ${cleanPath}`);
        break;
      }

      case "delete_file":
      case "remove_file": {
        const cleanPath = cleanRelativePath(cmd.path);
        fileService.deleteNode(userId, workspaceId, cleanPath);
        try {
          await FileNode.deleteMany({
            workspaceId,
            path: { $regex: `^${cleanPath}` },
          });
        } catch (dbErr) {
          console.warn("Could not delete FileNode in DB:", dbErr.message);
        }
        results.push(`Deleted ${cleanPath}`);
        break;
      }

      case "run_code":
      case "terminal": {
        const output = await execInWorkspace({
          userId,
          workspaceId,
          workspacePath,
          command: cmd.command,
        });
        results.push(output?.output || output || "Executed command");
        break;
      }

      case "chat": {
        results.push(cmd.message);
        break;
      }

      default:
        results.push(`Unknown command: ${cmd.action}`);
    }
  }

  return { results };
}

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

  // Flatten / unpack any nested JSON actions if AI mistakenly wrapped them
  const flattenedActions = [];
  for (const cmd of command.actions) {
    if (
      (cmd.action === "create_file" || cmd.action === "write_file") &&
      typeof cmd.content === "string" &&
      (cmd.content.includes('"actions": [') || cmd.content.includes('"actions":['))
    ) {
      try {
        const nestedMatch = cmd.content.match(/\{[\s\S]*"actions"[\s\S]*\}/);
        if (nestedMatch) {
          const nested = JSON.parse(nestedMatch[0]);
          if (nested?.actions && Array.isArray(nested.actions)) {
            flattenedActions.push(...nested.actions);
            continue;
          }
        }
      } catch {}
    }
    flattenedActions.push(cmd);
  }

  for (const cmd of flattenedActions) {
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

import path from "path";
import Chat from "../models/Chat.js";
import FileNode from "../models/FileNode.js";
import { askAI } from "../services/aiService.js";
import { parseAI } from "../utils/aiParser.js";
import { executeAI } from "../services/aiExecutor.js";
import { getWorkspacesRoot } from "../config/paths.js";

export async function handleAI(req, res) {
  try {
    const { message, workspaceId, activeFile, attachments = [] } = req.body;
    const userId = String(req.user.id || req.user._id);

    if (!message || !workspaceId) {
      return res
        .status(400)
        .json({ error: "message and workspaceId are required" });
    }

    const workspacePath = path.join(
      getWorkspacesRoot(),
      userId,
      String(workspaceId)
    );

    /* ================= EXTRACT ATTACHMENTS ================= */
    const images = [];
    let attachedContentContext = "";

    if (Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments) {
        // 1. Attached Images
        if (att.type === "image" && att.previewUrl) {
          images.push({
            name: att.name || "screenshot.png",
            url: att.previewUrl,
          });
        }
        // 2. Attached Files
        else if (att.type === "file") {
          let fileBody = att.content;
          if (!fileBody && att.path) {
            const node = await FileNode.findOne({
              workspaceId,
              path: att.path,
            }).lean();
            fileBody = node?.content || "";
          }
          if (fileBody !== undefined && fileBody !== null) {
            attachedContentContext += `\n\n=== ATTACHED FILE: ${att.path || att.name} ===\n${fileBody.slice(0, 8000)}`;
          }
        }
        // 3. Attached Folders
        else if (att.type === "folder") {
          if (att.path) {
            const clean = att.path.replace(/^[\\\/]+/, "");
            const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const folderNodes = await FileNode.find({
              workspaceId,
              path: { $regex: `^${escaped}(/|$)` },
              type: "file",
            }).limit(20).lean();

            attachedContentContext += `\n\n=== ATTACHED FOLDER: ${att.path || att.name} ===\n`;
            if (folderNodes.length > 0) {
              for (const fn of folderNodes) {
                attachedContentContext += `--- ${fn.path} ---\n${(fn.content || "").slice(0, 1500)}\n\n`;
              }
            } else {
              attachedContentContext += `(empty folder)\n`;
            }
          }
        }
      }
    }

    /* ================= WORKSPACE CONTEXT ================= */
    let workspaceContext = "";
    try {
      const files = await FileNode.find({ workspaceId, type: "file" })
        .limit(10)
        .lean();

      if (files.length > 0) {
        workspaceContext = files
          .map((f) => {
            const preview = f.content ? f.content.slice(0, 2000) : "(empty)";
            const isTarget = activeFile && f.path === activeFile ? " [CURRENTLY ACTIVE IN EDITOR]" : "";
            return `--- ${f.path}${isTarget} ---\n${preview}`;
          })
          .join("\n\n");
      }
    } catch (ctxErr) {
      console.warn("Could not load workspace context:", ctxErr.message);
    }

    if (attachedContentContext) {
      workspaceContext = `${workspaceContext}\n\n${attachedContentContext}`;
    }

    /* ================= CHAT HISTORY ================= */
    const chats = await Chat.find({
      userId,
      workspaceId,
    })
      .sort({ createdAt: 1 })
      .limit(10);

    const history = chats.map((c) => ({
      role: c.role,
      content: c.content,
    }));

    /* ================= AI INFERENCE ================= */
    const aiRaw = await askAI({
      message,
      history,
      workspaceContext,
      images,
    });

    const parsed = parseAI(aiRaw);

    /* ================= EXECUTE ACTIONS ================= */
    const result = await executeAI({
      userId,
      workspaceId,
      workspacePath,
      command: parsed,
    });

    /* ================= SAVE CHAT ================= */
    const chatAction = parsed.actions.find((a) => a.action === "chat");
    let summary = chatAction?.message;

    // Prevent raw JSON from being saved or displayed as chat text
    if (!summary || summary.trim().startsWith("{") || summary.trim().startsWith("[")) {
      const createdFiles = parsed.actions
        .filter((a) => a.action === "create_file" || a.action === "write_file")
        .map((a) => a.path);

      if (createdFiles.length > 0) {
        summary = `Created ${createdFiles.join(", ")} with the requested code.`;
      } else {
        summary = "Code task completed successfully.";
      }
    }

    await Chat.create({
      userId,
      workspaceId,
      role: "user",
      content: message,
    });

    await Chat.create({
      userId,
      workspaceId,
      role: "assistant",
      content: summary,
    });

    res.json({
      success: true,
      ai: parsed,
      result,
      reply: summary,
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= DELETE CHAT HISTORY ================= */
export async function deleteChatHistory(req, res) {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    const filter = { userId };
    if (workspaceId && workspaceId !== "all") {
      filter.workspaceId = workspaceId;
    }

    const result = await Chat.deleteMany(filter);

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("DELETE CHAT ERROR:", err);
    res.status(500).json({ error: "Failed to delete chat history: " + err.message });
  }
}

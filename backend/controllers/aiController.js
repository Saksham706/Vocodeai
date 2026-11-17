import path from "path";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import FileNode from "../models/FileNode.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { askAI, verifyAIKey } from "../services/aiService.js";
import { parseAI } from "../utils/aiParser.js";
import { executeAI } from "../services/aiExecutor.js";
import { getWorkspacesRoot } from "../config/paths.js";
import {
  getGoogleAIAccountStatus,
  getValidGoogleAccessToken,
} from "../utils/googleAuthHelper.js";

async function clearLegacyAICredentials(userId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) return;
  await User.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(String(userId)) },
    {
      $unset: {
        aiCredentials: "",
        activeAiConfig: "",
        aiGoogleId: "",
        aiGoogleEmail: "",
        aiGoogleAccessToken: "",
        aiGoogleRefreshToken: "",
        googleAiAuthorized: "",
      },
    }
  );
}

export async function handleAI(req, res) {
  try {
    const {
      message,
      workspaceId,
      activeFile,
      attachments = [],
      provider = "gemini",
      model = "gemini-3.8-flash",
      apiKey,
      apiKeys,
      backupKeys,
    } = req.body;
    const userId = String(req.user.id || req.user._id);

    if (!message || !workspaceId) {
      return res
        .status(400)
        .json({ error: "message and workspaceId are required" });
    }

    let workspace;
    try {
      workspace = await Workspace.findOne({ _id: workspaceId, userId }).select("_id").lean();
    } catch {
      return res.status(400).json({ error: "Invalid workspaceId." });
    }
    if (!workspace) {
      return res.status(404).json({ error: "Workspace not found for this account." });
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
      provider,
      model,
      apiKey,
      apiKeys,
      backupKeys,
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

      const runAction = parsed.actions.find(
        (a) => a.action === "run_code" || a.action === "terminal"
      );

      if (createdFiles.length > 0) {
        summary = `Created ${createdFiles.join(", ")} with the requested code.`;
      } else if (runAction) {
        summary = `Running ${runAction.path || runAction.command || "command"} in terminal...`;
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
    // Avoid logging Axios request config, which contains the user's Authorization header.
    console.error("AI ERROR:", err.response?.data?.error?.message || err.message || "AI request failed");
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

/* ================= VOCA MASCOT ASSISTANT ================= */
export async function handleVocaAI(req, res) {
  // Public mascot help uses built-in content; workspace AI requires a Google Gemini account.
  return res.status(503).json({
    error: "Voca's public guide uses built-in help content. Connect Google Gemini in a workspace to use AI chat.",
  });
}
/* ================= REUSE GOOGLE SIGN-IN FOR GEMINI ================= */
export async function getGoogleAccountStatus(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    return res.json(await getGoogleAIAccountStatus(userId));
  } catch (err) {
    return res.status(500).json({ error: "Could not check Google sign-in status." });
  }
}

export async function handleVerifyKey(req, res) {
  try {
    const { provider = "gemini", apiKey } = req.body;
    const verification = await verifyAIKey({ provider, apiKey });
    return res.json(verification);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function handleVerifyGoogleAI(req, res) {
  try {
    const { apiKey, projectId } = req.body;
    const verification = await verifyAIKey({ provider: "gemini", apiKey: apiKey || projectId });
    return res.json(verification);
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/* ================= GET SAVED USER AI CREDENTIALS ================= */
export async function getAICredentials(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (userId) {
      // Remove provider credentials and Google model OAuth tokens written by older versions.
      await clearLegacyAICredentials(userId);
    }
    return res.json({ activeConfig: null, savedProviders: {} });
  } catch (err) {
    return res.json({ activeConfig: null, savedProviders: {} });
  }
}

/* ================= DISCONNECT AI CREDENTIAL ================= */
export async function disconnectAICredential(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (userId) {
      await clearLegacyAICredentials(userId);
    }
    return res.json({ success: true, message: "AI provider disconnected." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to disconnect AI provider." });
  }
}

/* ================= GET AI USAGE & QUOTA STATS ================= */
export async function getAIUsageStats(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayCount, totalCount] = await Promise.all([
      Chat.countDocuments({ userId, role: "user", createdAt: { $gte: startOfDay } }),
      Chat.countDocuments({ userId, role: "user" }),
    ]);

    const dailyLimit = 150;
    const remaining = Math.max(0, dailyLimit - todayCount);

    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    const diffMs = nextMidnight - now;
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return res.json({
      success: true,
      todayRequests: todayCount,
      totalRequests: totalCount,
      dailyLimit,
      remainingRequests: remaining,
      resetIn: `${hoursLeft}h ${minsLeft}m`,
      status: remaining > 0 ? "Optimal" : "Limit Reached",
      quotaPercentage: Math.min(100, Math.round((todayCount / dailyLimit) * 100)),
      rpmLimit: 15,
      maxTokens: 4096,
      avgLatency: "0.8s",
      managedBackendKeys: true,
      sequentialFailover: true,
    });
  } catch (err) {
    console.error("GET AI USAGE ERROR:", err);
    return res.status(500).json({ error: "Failed to get AI usage statistics." });
  }
}

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

    /* ================= CHECK 150 DAILY QUOTA LIMIT ================= */
    const todayKey = new Date().toISOString().slice(0, 10);
    let userDoc = null;
    try {
      userDoc = await User.findById(userId);
      if (userDoc) {
        if (!userDoc.aiDailyUsage || userDoc.aiDailyUsage.date !== todayKey) {
          userDoc.aiDailyUsage = {
            date: todayKey,
            count: 0,
            lifetimeCount: userDoc.aiDailyUsage?.lifetimeCount || 0,
          };
        }

        if (userDoc.aiDailyUsage.count >= 150) {
          return res.status(429).json({
            error: "Daily AI request limit reached (150/150 requests used today). Quota resets at 12:00 AM midnight.",
            limitReached: true,
            dailyLimit: 150,
            remainingRequests: 0,
          });
        }
      }
    } catch (quotaErr) {
      console.warn("Could not check user quota:", quotaErr.message);
    }

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

    // Increment user's persistent daily quota counter
    if (userDoc) {
      try {
        userDoc.aiDailyUsage.count = (userDoc.aiDailyUsage.count || 0) + 1;
        userDoc.aiDailyUsage.lifetimeCount = (userDoc.aiDailyUsage.lifetimeCount || 0) + 1;
        await userDoc.save();
      } catch (saveErr) {
        console.warn("Could not increment user AI daily usage:", saveErr.message);
      }
    }

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

/* ================= VOCO VOICE AI ASSISTANT ================= */
export async function handleVoiceAI(req, res) {
  try {
    const { message, workspaceId, activeFile, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Optional workspace context if workspaceId is supplied
    let workspaceContext = "";
    if (workspaceId && mongoose.Types.ObjectId.isValid(String(workspaceId))) {
      try {
        const files = await FileNode.find({ workspaceId, type: "file" })
          .select("path name content")
          .limit(8)
          .lean();
        if (files && files.length > 0) {
          workspaceContext = files
            .map((f) => `File: ${f.path}\n${(f.content || "").slice(0, 1000)}`)
            .join("\n\n");
        }
      } catch (err) {
        console.warn("Could not load workspace context for voice:", err.message);
      }
    }

    const voiceSystemPrompt = `You are Voco, the ultra-fast, intelligent Voice AI Assistant for the VocodeAI Cloud IDE.
You are interacting with the user through live voice and speech.
Current active file in editor: ${activeFile || "None"}
Current workspace files:
${workspaceContext || "Standard development workspace"}

VOICE RESPONSE GUIDELINES:
1. Always identify yourself as Voco. Never say you are an owl, Voca, or a mascot. You are Voco, the AI voice assistant for VocodeAI.
2. Be concise, direct, helpful, and natural: 1 to 3 spoken sentences is ideal.
3. If the user asks general questions ("what are you doing", "who are you", "what can you do"), give a friendly, sharp, conversational answer as Voco.
4. If the user asks for code, provide only the core code snippet or concise explanation.
5. NEVER format your response as massive markdown bullet lists or tables. It will be read aloud.
6. If the user's intent is to perform an IDE action, indicate the action at the very end of your response in the format:
ACTION: {"type": "ACTION_TYPE", "payload": {...}}
Supported ACTION_TYPEs:
- "open-terminal" (when user wants to open/run terminal)
- "close-terminal" (when user wants to hide/close terminal)
- "run-code" (when user wants to run/execute the active file or code)
- "open-folder" with payload {"name": "folder_name"}
- "open-file" with payload {"name": "file_name"}
- "create-file" with payload {"name": "file_name"}
- "create-folder" with payload {"name": "folder_name"}
- "toggle-explorer"
- "open-git"
- "save-file"
- "open-dashboard"
- "open-docs"
- "toggle-theme"`;

    const aiRaw = await askAI({
      message,
      history,
      systemPromptOverride: voiceSystemPrompt,
    });

    let rawReply = typeof aiRaw === "string" ? aiRaw : JSON.stringify(aiRaw);
    let detectedAction = null;

    // Check if the AI returned an ACTION: tag
    const actionMatch = rawReply.match(/ACTION:\s*(\{.*\})/s);
    if (actionMatch) {
      try {
        detectedAction = JSON.parse(actionMatch[1].trim());
        rawReply = rawReply.replace(/ACTION:\s*\{.*\}/s, "").trim();
      } catch {}
    }

    // Clean up any remaining JSON wrappers or artifacts
    let cleanReply = rawReply.trim();
    if (cleanReply.startsWith("{") && cleanReply.endsWith("}")) {
      try {
        const parsedJson = JSON.parse(cleanReply);
        if (parsedJson.actions) {
          const chatAct = parsedJson.actions.find((a) => a.action === "chat");
          cleanReply = chatAct?.message || "I processed that command for your workspace.";
        }
      } catch {}
    }

    return res.json({
      success: true,
      reply: cleanReply,
      action: detectedAction,
    });
  } catch (err) {
    console.error("VOICE AI ERROR:", err.message);
    return res.status(500).json({
      error: err.message || "Failed to process voice AI request.",
      fallback: "I'm Voco, your voice AI assistant. I'm ready to help you code, run terminal commands, and navigate your workspace.",
    });
  }
}

export const handleVocaAI = handleVoiceAI;
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
    const todayKey = new Date().toISOString().slice(0, 10);

    const userDoc = await User.findById(userId).lean();
    let todayCount = 0;
    let totalCount = 0;

    if (userDoc?.aiDailyUsage) {
      if (userDoc.aiDailyUsage.date === todayKey) {
        todayCount = userDoc.aiDailyUsage.count || 0;
      }
      totalCount = userDoc.aiDailyUsage.lifetimeCount || todayCount;
    } else {
      // Fallback for initial sync
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      todayCount = await Chat.countDocuments({ userId, role: "user", createdAt: { $gte: startOfDay } });
      totalCount = await Chat.countDocuments({ userId, role: "user" });
    }

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

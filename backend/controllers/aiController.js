import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import FileNode from "../models/FileNode.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { askAI, verifyAIKey } from "../services/aiService.js";
import { parseAI } from "../utils/aiParser.js";
import { executeAI } from "../services/aiExecutor.js";
import * as fileService from "../services/fileService.js";
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
    let targetFileNode = null;

    if (workspaceId && mongoose.Types.ObjectId.isValid(String(workspaceId))) {
      try {
        const files = await FileNode.find({ workspaceId, type: "file" })
          .select("path name content")
          .limit(20)
          .lean();

        if (files && files.length > 0) {
          workspaceContext = files
            .map((f) => `--- File: ${f.path} ---\n${(f.content || "").slice(0, 3000)}`)
            .join("\n\n");

          // Identify target file mentioned in message or active in editor
          const msgLower = (message || "").toLowerCase();
          for (const f of files) {
            const fName = (f.name || "").toLowerCase();
            const fPath = (f.path || "").toLowerCase();
            const fBase = fName.replace(/\.[^.]+$/, "");
            if (
              (activeFile && (f.path === activeFile || f.name === activeFile)) ||
              msgLower.includes(fName) ||
              msgLower.includes(fPath) ||
              (fBase.length > 2 && msgLower.includes(fBase))
            ) {
              targetFileNode = f;
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Could not load workspace context for voice:", err.message);
      }
    }

    const targetFileSnippet = targetFileNode
      ? `\n\n=== TARGET ACTIVE FILE CONTENT: ${targetFileNode.path} ===\n${targetFileNode.content || "(empty file)"}\n===============================\n`
      : "";

    const voiceSystemPrompt = `You are Voco, the ultra-fast, witty, charismatic, and brilliant Voice AI Assistant for the VocodeAI Cloud IDE.
You are interacting with the user through live voice and speech. You are as powerful as the VocodeAI IDE Copilot and can directly edit files, add comments, delete files, and execute commands.
Current active file in editor: ${activeFile || targetFileNode?.path || "None"}
Current workspace files:
${workspaceContext || "Standard development workspace"}${targetFileSnippet}

VOICE RESPONSE GUIDELINES:
1. PERSONALITY & CHARISMA (FUNNY, WITTY, LIVELY & CHARMING):
   - You are Voco: delightfully witty, charming, upbeat, and smart with a great sense of humor.
   - Think of yourself as an elite AI sidekick (like JARVIS meets a witty senior dev friend).
   - Sprinkle in light programmer humor, playful banter, or clever witty remarks (e.g. "Cracking open ThreeSum.java! May your arrays be sorted and your edge cases covered.", "Firing up your code in the terminal! Zero exit codes incoming.", "Closing that tab! Out of sight, out of RAM.").
   - If the user asks something fun or makes a joke, banter back playfully and cleverly!
   - Be enthusiastic and charming—never sound dry, robotic, or corporate.
2. DO NOT INTRODUCE YOURSELF (NEVER say "I'm Voco...", "I am Voco...", "As Voco...", or "I am your voice assistant..."):
   - Never start your answers with an introduction, greeting, or identity statement unless the user explicitly asks "Who are you?", "What is your name?", or "Introduce yourself".
   - Start immediately with the direct, witty answer (just like Siri or Google Search).
   - If (and only if) the user explicitly asks who you are or what your name is, state that you are Voco, the AI assistant for VocodeAI. Never claim to be an owl or a mascot.
3. ENCYCLOPEDIC KNOWLEDGE & SEARCH (LIKE GOOGLE SEARCH):
   - You have vast, comprehensive world knowledge across all domains: science, tech, pop culture, trivia, math, history, coding, and real-world facts.
   - When the user asks ANY question, deliver an accurate, smart, punchy answer with personality.
   - Keep spoken answers to 1 to 3 crisp, natural sentences ideal for voice playback.
4. CODE EDITING & WORKSPACE MODIFICATIONS (LIKE THE VOCODEAI IDE ASSISTANT):
   - When the user asks to modify, comment, refactor, or write code in a file (e.g. "write comments in threesum.java", "write the comment in the threesum.java", "add comments", "add a function", "fix this error"):
     1. Generate the COMPLETE updated file content including all requested comments or code changes.
     2. Give a brief, witty 1-2 sentence spoken summary of what you did.
     3. Append the action tag at the very end in JSON format:
     ACTION: {"type": "write-file", "payload": {"path": "FILE_PATH", "content": "FULL_UPDATED_FILE_CONTENT"}}
   - When the user asks to delete a file (e.g. "delete the twosum.java file", "remove TwoSum.java", "delete TwoSum"):
     1. Confirm deletion in a short, witty spoken sentence.
     2. Append the action tag:
     ACTION: {"type": "delete-file", "payload": {"path": "FILE_PATH", "name": "FILE_NAME"}}
   - When the user asks to create a file:
     ACTION: {"type": "create-file", "payload": {"path": "FILE_PATH", "content": "INITIAL_CONTENT"}}
   - When the user asks to run code:
     ACTION: {"type": "run-code", "payload": {"target": "FILE_PATH"}}
   - When the user asks to open a file:
     ACTION: {"type": "open-file", "payload": {"name": "FILE_NAME"}}
   - When the user asks to close a file:
     ACTION: {"type": "close-file", "payload": {"name": "FILE_NAME"}}
   - When the user asks to open or close terminal:
     ACTION: {"type": "open-terminal"} or ACTION: {"type": "close-terminal"}
5. FACTUAL ACCURACY (NO FAKE URLS):
   - NEVER invent or hallucinate fake domains or URLs (such as "vocode.dev").`;

    const aiRaw = await askAI({
      message,
      history,
      systemPromptOverride: voiceSystemPrompt,
    });

    let rawReply = typeof aiRaw === "string" ? aiRaw : JSON.stringify(aiRaw);
    let detectedAction = null;

    // Check if the AI returned an ACTION tag (robust against backticks, colons, newlines)
    const actionRegex = /(?:^|\n)\s*ACTION(?:\s*:)?\s*(?:```(?:json)?\s*)?(\{[\s\S]*?\})(?:\s*```)?/i;
    const actionMatch = rawReply.match(actionRegex);
    if (actionMatch) {
      try {
        detectedAction = JSON.parse(actionMatch[1].trim());
      } catch (e) {
        try {
          const jsonMatch = actionMatch[1].match(/\{[\s\S]*"type"[\s\S]*\}/);
          if (jsonMatch) detectedAction = JSON.parse(jsonMatch[0]);
        } catch {}
      }
    }

    // Normalize action type (hyphens vs underscores)
    if (detectedAction?.type) {
      detectedAction.type = detectedAction.type.replace(/_/g, "-");
    }

    // Secondary fallback: if action was not extracted via tag, deduce directly from user message intent
    if (!detectedAction) {
      const lowerMsg = (message || "").toLowerCase().trim();
      if (/^(?:(?:hey|hi|ok)?\s*voco[,.]?\s*)?(?:delete|remove|destroy|trash)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+(?:\.[a-zA-Z0-9]+)?)/i.test(lowerMsg)) {
        const delM = lowerMsg.match(/(?:delete|remove|destroy|trash)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+(?:\.[a-zA-Z0-9]+)?)/i);
        const fileName = delM?.[1]?.replace(/\s+file$/i, "")?.trim();
        if (fileName) {
          detectedAction = { type: "delete-file", payload: { path: fileName, name: fileName } };
        }
      } else if (/^(?:(?:hey|hi|ok)?\s*voco[,.]?\s*)?(?:open|show|edit|view|display)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+(?:\.[a-zA-Z0-9]+)?)/i.test(lowerMsg)) {
        const fileM = lowerMsg.match(/(?:open|show|edit|view|display)\s+(?:the\s+)?(?:file\s+)?([a-zA-Z0-9_\-./]+(?:\.[a-zA-Z0-9]+)?)/i);
        const fileName = fileM?.[1]?.replace(/\s+file$/i, "")?.trim();
        if (fileName && !["terminal", "folder", "dashboard", "explorer", "git"].includes(fileName)) {
          detectedAction = { type: "open-file", payload: { name: fileName } };
        }
      } else if (/(?:close|exit|hide)\s+(?:the\s+)?(?:current\s+|active\s+)?(?:file|tab)/i.test(lowerMsg)) {
        detectedAction = { type: "close-file", payload: { name: activeFile || "" } };
      } else if (/(?:run|execute|start|compile)\s+(?:the\s+)?(?:current\s+|opened\s+|this\s+)?(?:file|code)/i.test(lowerMsg)) {
        detectedAction = { type: "run-code", payload: { target: activeFile || "" } };
      } else if (/(?:open|show|start|launch)\s+(?:the\s+)?terminal/i.test(lowerMsg)) {
        detectedAction = { type: "open-terminal", payload: {} };
      } else if (/(?:close|hide|exit|minimize)\s+(?:the\s+)?terminal/i.test(lowerMsg)) {
        detectedAction = { type: "close-terminal", payload: {} };
      }
    }

    // Execute file modifications / deletions on backend storage and MongoDB
    if (detectedAction && workspaceId) {
      const actType = (detectedAction.type || "").replace(/_/g, "-");
      let targetPath = detectedAction.payload?.path || detectedAction.payload?.name || "";
      const content = detectedAction.payload?.content;

      // Resolve relative path if needed
      if (targetFileNode && !targetPath.includes("/") && targetFileNode.path.includes("/")) {
        if (targetFileNode.name.toLowerCase() === targetPath.toLowerCase()) {
          targetPath = targetFileNode.path;
          if (detectedAction.payload) detectedAction.payload.path = targetPath;
        }
      }

      let uid = req.user?.id || req.user?._id;
      if (!uid && req.headers?.authorization?.startsWith("Bearer ")) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          uid = decoded?.id || decoded?._id;
        } catch {}
      }
      if (!uid) {
        try {
          const wsDoc = await Workspace.findById(workspaceId).select("userId").lean();
          if (wsDoc?.userId) uid = String(wsDoc.userId);
        } catch {}
      }

      if (uid && targetPath) {
        const cleanPath = targetPath.replace(/^[\\\/]+/, "");
        if (actType === "write-file" || actType === "create-file") {
          try {
            fileService.createFile(uid, workspaceId, cleanPath);
            if (content !== undefined) {
              fileService.saveFile(uid, workspaceId, cleanPath, content);
            }
            await FileNode.findOneAndUpdate(
              { workspaceId, path: cleanPath },
              { workspaceId, path: cleanPath, type: "file", content: content || "" },
              { upsert: true, new: true }
            );
          } catch (fileErr) {
            console.warn("Voice AI could not write file:", fileErr.message);
          }
        } else if (actType === "delete-file") {
          try {
            fileService.deleteNode(uid, workspaceId, cleanPath);
            await FileNode.deleteMany({
              workspaceId,
              path: { $regex: `^${cleanPath}` },
            });
          } catch (delErr) {
            console.warn("Voice AI could not delete file:", delErr.message);
          }
        }
      }
    }

    // Clean up reply: strip ACTION tags, JSON blocks, and code fences so they NEVER leak to voice or UI
    let cleanReply = rawReply
      .replace(/(?:^|\n)\s*ACTION(?:\s*:\s*|\s+)?[\s\S]*$/i, "")
      .replace(/\bACTION\b\s*:?/gi, "")
      .replace(/```(?:json)?[\s\S]*?```/gi, "")
      .trim();

    // Clean up any remaining JSON wrappers or artifacts
    if (cleanReply.startsWith("{") && cleanReply.endsWith("}")) {
      try {
        const parsedJson = JSON.parse(cleanReply);
        if (parsedJson.actions) {
          const chatAct = parsedJson.actions.find((a) => a.action === "chat");
          cleanReply = chatAct?.message || "I processed that command for your workspace.";
        }
      } catch {}
    }

    // Strip self-introductions if the user did not explicitly ask who Voco is
    const isAskingIdentity = /(?:who\s+(?:are\s+you|is\s+voco)|what\s+is\s+your\s+name|what\s+are\s+you|introduce\s+yourself)/i.test(message);
    if (!isAskingIdentity) {
      cleanReply = cleanReply
        .replace(/^(?:(?:hello|hey|hi)[,\s]*)?(?:I'm|I am)\s+Voco[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
        .replace(/^(?:(?:hello|hey|hi)[,\s]*)?as\s+Voco[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
        .replace(/^(?:I'm|I am)\s+your\s+(?:voice\s+)?(?:AI\s+)?assistant[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
        .trim();
    }

    if (!cleanReply && detectedAction) {
      cleanReply = `On it! Executing ${detectedAction.type.replace(/-/g, " ")}.`;
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
      fallback: "I'm ready to help you code, run terminal commands, and navigate your workspace.",
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

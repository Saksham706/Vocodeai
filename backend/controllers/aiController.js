import path from "path";
import Chat from "../models/Chat.js";
import { askAI } from "../services/aiService.js";
import { parseAI } from "../utils/aiParser.js";
import { executeAI } from "../services/aiExecutor.js";

export async function handleAI(req, res) {
  try {
    const { message, workspaceId } = req.body;
    const userId = req.user.id;

    const workspacePath = path.join(
      process.cwd(),
      "workspaces",
      userId,
      workspaceId
    );

    /* ================= CHAT HISTORY ================= */
    const chats = await Chat.find({
      userId,
      workspaceId,
    }).sort({ createdAt: 1 });

    const history = chats.map((c) => ({
      role: c.role,
      content: c.content,
    }));

    /* ================= AI ================= */
    const aiRaw = await askAI({
      message,
      history,
    });

    const parsed = parseAI(aiRaw);

    /* ================= EXECUTE ================= */
    const result = await executeAI({
      userId,
      workspaceId,
      workspacePath,
      command: parsed,
    });

    /* ================= SAVE ================= */
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
      content: aiRaw,
    });

    res.json({
      success: true,
      ai: parsed,
      result,
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
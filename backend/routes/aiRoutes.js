import express from "express";
import { auth } from "../middleware/auth.js";
import { handleAI, deleteChatHistory, handleVocaAI } from "../controllers/aiController.js";

const router = express.Router();

// Public assistant for the floating robot mascot "Voca"
router.post("/voca", handleVocaAI);

router.post("/", auth, handleAI);
router.delete("/history/:workspaceId", auth, deleteChatHistory);
router.delete("/history", auth, deleteChatHistory);

export default router;

import express from "express";
import { auth } from "../middleware/auth.js";
import { handleAI, deleteChatHistory } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", auth, handleAI);
router.delete("/history/:workspaceId", auth, deleteChatHistory);
router.delete("/history", auth, deleteChatHistory);

export default router;

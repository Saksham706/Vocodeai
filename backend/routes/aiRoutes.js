import express from "express";
import { auth } from "../middleware/auth.js";
import {
  handleAI,
  deleteChatHistory,
  handleVoiceAI,
  handleVocaAI,
  getGoogleAccountStatus,
  handleVerifyGoogleAI,
  handleVerifyKey,
  getAICredentials,
  disconnectAICredential,
  getAIUsageStats,
} from "../controllers/aiController.js";

const router = express.Router();

// Voice AI assistant for Voco
router.post("/voice", handleVoiceAI);
router.post("/voca", handleVoiceAI);

router.get("/usage", auth, getAIUsageStats);
router.get("/credentials", auth, getAICredentials);
router.get("/google-account", auth, getGoogleAccountStatus);
router.post("/verify-google", auth, handleVerifyGoogleAI);
router.post("/verify-key", auth, handleVerifyKey);
router.post("/disconnect", auth, disconnectAICredential);
router.post("/", auth, handleAI);
router.delete("/history/:workspaceId", auth, deleteChatHistory);
router.delete("/history", auth, deleteChatHistory);

export default router;

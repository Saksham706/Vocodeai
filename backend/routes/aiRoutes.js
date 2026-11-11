import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import {
  handleAI,
  deleteChatHistory,
  handleVocaAI,
  handleVerifyKey,
  getGoogleAIStatus,
  getAICredentials,
  disconnectAICredential,
} from "../controllers/aiController.js";

const router = express.Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
}

// Public assistant for the floating robot mascot "Voca"
router.post("/voca", handleVocaAI);

router.get("/google-status", optionalAuth, getGoogleAIStatus);
router.get("/credentials", auth, getAICredentials);
router.post("/disconnect", auth, disconnectAICredential);
router.post("/verify-key", optionalAuth, handleVerifyKey);
router.post("/", auth, handleAI);
router.delete("/history/:workspaceId", auth, deleteChatHistory);
router.delete("/history", auth, deleteChatHistory);

export default router;

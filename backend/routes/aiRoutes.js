import express from "express";
import { auth } from "../middleware/auth.js";
import { handleAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", auth, handleAI);

export default router;
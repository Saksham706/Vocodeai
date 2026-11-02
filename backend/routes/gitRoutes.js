import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getStatus,
  initRepo,
  stageFiles,
  unstageFiles,
  commit,
  discardChanges,
  getBranches,
  createOrCheckoutBranch,
  getDiff,
  getLog,
  addOrSetRemote,
  push,
  pull,
  cloneRepo,
  generateCommitMessage,
} from "../controllers/gitController.js";

const router = express.Router();

router.get("/status", auth, getStatus);
router.post("/init", auth, initRepo);
router.post("/stage", auth, stageFiles);
router.post("/unstage", auth, unstageFiles);
router.post("/commit", auth, commit);
router.post("/generate-commit-message", auth, generateCommitMessage);
router.post("/discard", auth, discardChanges);
router.get("/branches", auth, getBranches);
router.post("/branch", auth, createOrCheckoutBranch);
router.get("/diff", auth, getDiff);
router.get("/log", auth, getLog);
router.post("/remote", auth, addOrSetRemote);
router.post("/push", auth, push);
router.post("/pull", auth, pull);
router.post("/clone", auth, cloneRepo);

export default router;


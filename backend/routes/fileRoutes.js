import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createNode,
  readFile,
  saveFile,
  renameNode,
  deleteNode,
  loadTree,
  getRecycleBin,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem,
  emptyRecycleBin,
} from "../controllers/fileController.js";

const router = express.Router();

router.get("/tree", auth, loadTree);
router.get("/read", auth, readFile);
router.post("/create", auth, createNode);
router.put("/save", auth, saveFile);
router.put("/rename", auth, renameNode);
router.post("/delete", auth, deleteNode);

/* Recycle Bin Routes */
router.get("/recycle-bin", auth, getRecycleBin);
router.post("/recycle-bin/:id/restore", auth, restoreRecycleBinItem);
router.delete("/recycle-bin/:id", auth, permanentlyDeleteRecycleBinItem);
router.delete("/recycle-bin", auth, emptyRecycleBin);

export default router;

import fs from "fs";
import path from "path";
import { getWorkspacesRoot } from "../config/paths.js";

/* ================= HELPERS ================= */

export function safeJoin(base, target) {
  const baseStr = String(base || "");
  let cleanTarget = String(target || "").replace(/^[\\\/]+/, "");
  if (
    cleanTarget.startsWith("workspace/") ||
    cleanTarget.startsWith("workspace\\")
  ) {
    cleanTarget = cleanTarget.replace(/^workspace[\\\/]+/, "");
  }
  const resolvedBase = path.resolve(baseStr);
  const targetPath = path.resolve(resolvedBase, cleanTarget);
  if (!targetPath.startsWith(resolvedBase)) {
    throw new Error("Invalid path traversal attempt");
  }
  return targetPath;
}

export function ensureWorkspace(userId, workspaceId) {
  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  const wsPath = path.join(getWorkspacesRoot(), uId, wId);
  if (!fs.existsSync(wsPath)) {
    fs.mkdirSync(wsPath, { recursive: true });
  }
  return wsPath;
}

/* ================= CREATE ================= */

export function createFile(userId, workspaceId, relativePath) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const fullPath = safeJoin(wsPath, relativePath);

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, "");
  }
  return fullPath;
}

export function createFolder(userId, workspaceId, relativePath) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const fullPath = safeJoin(wsPath, relativePath);

  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

/* ================= READ ================= */

const BINARY_EXTENSIONS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "svg",
  "docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf",
  "zip", "tar", "gz", "7z", "rar",
  "mp3", "wav", "mp4", "webm"
]);

const MIME_MAP = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  pdf: "application/pdf",
  zip: "application/zip",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
  webm: "video/webm",
};

export function readFile(userId, workspaceId, relativePath) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const fullPath = safeJoin(wsPath, relativePath);

  if (!fs.existsSync(fullPath)) return "";

  const ext = (relativePath || "").split(".").pop()?.toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    const mime = MIME_MAP[ext] || "application/octet-stream";
    const buf = fs.readFileSync(fullPath);
    return `data:${mime};base64,${buf.toString("base64")}`;
  }

  return fs.readFileSync(fullPath, "utf-8");
}

/* ================= SAVE ================= */

export function saveFile(userId, workspaceId, relativePath, content) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const fullPath = safeJoin(wsPath, relativePath);

  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  if (typeof content === "string" && content.startsWith("data:") && content.includes(";base64,")) {
    const base64Data = content.replace(/^data:.*?;base64,/, "");
    fs.writeFileSync(fullPath, Buffer.from(base64Data, "base64"));
  } else {
    fs.writeFileSync(fullPath, content);
  }
  return fullPath;
}

/* ================= RENAME ================= */

export function renameNode(userId, workspaceId, oldPath, newPath) {
  const wsPath = ensureWorkspace(userId, workspaceId);

  const from = safeJoin(wsPath, oldPath);
  const to = safeJoin(wsPath, newPath);

  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
  }
}

/* ================= DELETE ================= */

export function deleteNode(userId, workspaceId, relativePath) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const fullPath = safeJoin(wsPath, relativePath);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

/* ================= RESTORE ================= */

export function restoreNode(userId, workspaceId, item) {
  const wsPath = ensureWorkspace(userId, workspaceId);
  const origPath = String(item.originalPath || "").replace(/^[\\\/]+/, "");

  if (item.type === "file") {
    const fullPath = safeJoin(wsPath, origPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, item.content || "");
  } else if (item.type === "folder") {
    const folderPath = safeJoin(wsPath, origPath);
    fs.mkdirSync(folderPath, { recursive: true });
    if (Array.isArray(item.items)) {
      for (const sub of item.items) {
        const subPathStr = String(sub.path || "").replace(/^[\\\/]+/, "");
        const subPath = safeJoin(wsPath, subPathStr);
        if (sub.type === "folder") {
          fs.mkdirSync(subPath, { recursive: true });
        } else {
          fs.mkdirSync(path.dirname(subPath), { recursive: true });
          fs.writeFileSync(subPath, sub.content || "");
        }
      }
    }
  }
}

/* ================= DELETE WORKSPACE ================= */

export function deleteWorkspace(userId, workspaceId) {
  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  const wsPath = path.join(getWorkspacesRoot(), uId, wId);

  if (fs.existsSync(wsPath)) {
    fs.rmSync(wsPath, { recursive: true, force: true });
  }
}

import fs from "fs";
import path from "path";

const IGNORED_NAMES = new Set([
  "node_modules",
  ".git",
  ".vscode",
  ".idea",
  "dist",
  "build",
  ".DS_Store",
  "Thumbs.db",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg",
  ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt",
  ".zip", ".tar", ".gz", ".7z", ".rar",
  ".mp3", ".wav", ".ogg", ".mp4", ".mov", ".webm",
  ".exe", ".dll", ".so", ".dylib", ".class",
]);

function isBinaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".zip": "application/zip",
  };
  return mimeMap[ext] || "application/octet-stream";
}

export function scanLocalDirectory(dirPath) {
  if (!dirPath || typeof dirPath !== "string") {
    throw new Error("Folder path is required");
  }

  const cleanPath = dirPath.trim();
  if (!fs.existsSync(cleanPath)) {
    throw new Error(`Directory does not exist: ${cleanPath}`);
  }

  const stat = fs.statSync(cleanPath);
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${cleanPath}`);
  }

  const rootName = path.basename(cleanPath) || "Imported Project";
  const items = [];
  const knownFolders = new Set();

  function walk(currentDir, relativePrefix = "") {
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      console.warn(`Unable to read directory: ${currentDir}`, e.message);
      return;
    }

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) continue;

      const fullPath = path.join(currentDir, entry.name);
      const relPath = relativePrefix
        ? `${relativePrefix}/${entry.name}`.replace(/\\/g, "/")
        : entry.name.replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (!knownFolders.has(relPath)) {
          knownFolders.add(relPath);
          items.push({
            path: relPath,
            type: "folder",
          });
        }
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        try {
          const stats = fs.statSync(fullPath);
          if (stats.size > 25 * 1024 * 1024) {
            console.warn(`Skipping file larger than 25MB: ${fullPath}`);
            continue;
          }

          let content = "";
          if (isBinaryFile(fullPath)) {
            const buffer = fs.readFileSync(fullPath);
            const mime = getMimeType(fullPath);
            content = `data:${mime};base64,${buffer.toString("base64")}`;
          } else {
            content = fs.readFileSync(fullPath, "utf8");
          }

          items.push({
            path: relPath,
            type: "file",
            content,
            size: stats.size,
          });
        } catch (readErr) {
          console.warn(`Error reading file ${fullPath}:`, readErr.message);
        }
      }
    }
  }

  walk(cleanPath, "");

  const fileCount = items.filter((i) => i.type === "file").length;
  const folderCount = items.filter((i) => i.type === "folder").length;

  return {
    folderName: rootName,
    fullPath: cleanPath,
    totalFiles: fileCount,
    totalFolders: folderCount,
    items,
  };
}


import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import r2Client, { BUCKET_NAME, isR2Configured } from "../config/r2.js";
import { getWorkspacesRoot } from "../config/paths.js";
import { isIgnoredFile } from "./syncService.js";

/* ================= PATH & KEY HELPERS ================= */

export function normalizeKey(p) {
  return (p || "").replace(/^[\\\/]+/, "").replace(/\\/g, "/");
}

export function getFileR2Key(userId, workspaceId, relativePath) {
  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  const clean = normalizeKey(relativePath);
  return `workspaces/${uId}/${wId}/files/${clean}`;
}

export function getWorkspaceR2Prefix(userId, workspaceId) {
  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  return `workspaces/${uId}/${wId}/`;
}

export function getTrashR2Prefix(userId, recycleBinId) {
  const uId = String(userId || "");
  const bId = String(recycleBinId || "");
  return `trash/${uId}/${bId}/`;
}

/* ================= CORE S3/R2 PRIMITIVES ================= */

/**
 * Upload object to Cloudflare R2
 */
export async function uploadObject(key, body, contentType = "text/plain") {
  if (!isR2Configured || !r2Client) return null;

  try {
    let buffer;
    if (Buffer.isBuffer(body)) {
      buffer = body;
    } else if (typeof body === "string") {
      if (body.startsWith("data:") && body.includes(";base64,")) {
        const matches = body.match(/^data:(.*?);base64,(.*)$/);
        if (matches) {
          contentType = matches[1] || contentType;
          buffer = Buffer.from(matches[2], "base64");
        } else {
          buffer = Buffer.from(body, "utf-8");
        }
      } else {
        buffer = Buffer.from(body, "utf-8");
      }
    } else {
      buffer = Buffer.from(String(body || ""), "utf-8");
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);
    return { key, size: buffer.length };
  } catch (err) {
    console.error(`[R2 Upload Error] Key: ${key}:`, err.message);
    return null;
  }
}

/**
 * Download raw Buffer from Cloudflare R2
 */
export async function getObjectBuffer(key) {
  if (!isR2Configured || !r2Client) return null;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await r2Client.send(command);
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  } catch (err) {
    if (err.name !== "NoSuchKey" && err.$metadata?.httpStatusCode !== 404) {
      console.error(`[R2 GetBuffer Error] Key: ${key}:`, err.message);
    }
    return null;
  }
}

/**
 * Download string content from Cloudflare R2
 */
export async function getObjectString(key) {
  const buf = await getObjectBuffer(key);
  if (!buf) return null;
  return buf.toString("utf-8");
}

/**
 * Delete a single object from Cloudflare R2
 */
export async function deleteObject(key) {
  if (!isR2Configured || !r2Client) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error(`[R2 Delete Error] Key: ${key}:`, err.message);
    return false;
  }
}

/**
 * List all objects matching prefix
 */
export async function listObjects(prefix) {
  if (!isR2Configured || !r2Client) return [];

  const results = [];
  let continuationToken = undefined;

  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const res = await r2Client.send(command);
      if (res.Contents && res.Contents.length > 0) {
        for (const item of res.Contents) {
          results.push({
            key: item.Key,
            size: item.Size || 0,
            lastModified: item.LastModified,
          });
        }
      }
      continuationToken = res.NextContinuationToken;
    } while (continuationToken);

    return results;
  } catch (err) {
    console.error(`[R2 List Error] Prefix: ${prefix}:`, err.message);
    return [];
  }
}

/**
 * Delete all objects with a given prefix in batches of 1000
 */
export async function deletePrefix(prefix) {
  if (!isR2Configured || !r2Client) return 0;

  try {
    const items = await listObjects(prefix);
    if (!items.length) return 0;

    const CHUNK_SIZE = 1000;
    let deletedCount = 0;

    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: chunk.map((c) => ({ Key: c.key })),
          Quiet: true,
        },
      });
      await r2Client.send(command);
      deletedCount += chunk.length;
    }

    return deletedCount;
  } catch (err) {
    console.error(`[R2 DeletePrefix Error] Prefix: ${prefix}:`, err.message);
    return 0;
  }
}

/**
 * Copy an object in Cloudflare R2
 */
export async function copyObject(sourceKey, destinationKey) {
  if (!isR2Configured || !r2Client) return false;

  try {
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${encodeURIComponent(sourceKey)}`,
      Key: destinationKey,
    });
    await r2Client.send(command);
    return true;
  } catch (err) {
    console.error(
      `[R2 Copy Error] From: ${sourceKey} -> To: ${destinationKey}:`,
      err.message
    );
    return false;
  }
}

/* ================= FILE NODE R2 OPERATIONS ================= */

export async function createWorkspaceMarkerInR2(userId, workspaceId) {
  if (!isR2Configured) return null;
  const key = getWorkspaceR2Prefix(userId, workspaceId);
  return await uploadObject(key, Buffer.alloc(0), "application/x-directory");
}

export async function createFolderInR2(userId, workspaceId, folderPath) {
  if (!isR2Configured) return null;
  const clean = normalizeKey(folderPath);
  const key = `${getFileR2Key(userId, workspaceId, clean)}/`;
  return await uploadObject(key, Buffer.alloc(0), "application/x-directory");
}

export async function saveFileToR2(userId, workspaceId, relativePath, content) {
  if (!isR2Configured) return null;
  const key = getFileR2Key(userId, workspaceId, relativePath);
  return await uploadObject(key, content);
}

export async function readFileFromR2(userId, workspaceId, relativePath) {
  if (!isR2Configured) return null;
  const key = getFileR2Key(userId, workspaceId, relativePath);
  return await getObjectString(key);
}

export async function deleteFileFromR2(userId, workspaceId, relativePath) {
  if (!isR2Configured) return false;
  const key = getFileR2Key(userId, workspaceId, relativePath);
  return await deleteObject(key);
}

export async function renameFileOrFolderInR2(userId, workspaceId, oldPath, newPath) {
  if (!isR2Configured) return false;

  const oldKey = getFileR2Key(userId, workspaceId, oldPath);
  const newKey = getFileR2Key(userId, workspaceId, newPath);

  // Check if single file
  const single = await getObjectBuffer(oldKey);
  if (single) {
    await copyObject(oldKey, newKey);
    await deleteObject(oldKey);
    return true;
  }

  // Handle folder rename (prefix match)
  const oldFolderPrefix = `${oldKey}/`;
  const items = await listObjects(oldFolderPrefix);
  for (const item of items) {
    const suffix = item.key.slice(oldKey.length);
    const targetKey = `${newKey}${suffix}`;
    await copyObject(item.key, targetKey);
    await deleteObject(item.key);
  }

  return true;
}

/* ================= RECYCLE BIN & WORKSPACE R2 OPERATIONS ================= */

/**
 * Moves deleted file or folder from workspace prefix to trash prefix in R2
 */
export async function moveNodeToTrashR2(userId, workspaceId, relativePath, recycleBinId) {
  if (!isR2Configured) return { count: 0, size: 0 };

  const nodeKey = getFileR2Key(userId, workspaceId, relativePath);
  const trashPrefix = getTrashR2Prefix(userId, recycleBinId);

  let movedCount = 0;
  let totalSize = 0;

  // Single file check
  const singleBuf = await getObjectBuffer(nodeKey);
  if (singleBuf) {
    const destKey = `${trashPrefix}files/${normalizeKey(relativePath)}`;
    await uploadObject(destKey, singleBuf);
    await deleteObject(nodeKey);
    return { count: 1, size: singleBuf.length, r2Key: destKey };
  }

  // Directory prefix match
  const folderPrefix = `${nodeKey}/`;
  const items = await listObjects(folderPrefix);
  for (const item of items) {
    const suffix = item.key.replace(getWorkspaceR2Prefix(userId, workspaceId), "");
    const destKey = `${trashPrefix}${suffix}`;
    await copyObject(item.key, destKey);
    await deleteObject(item.key);
    movedCount++;
    totalSize += item.size || 0;
  }

  return { count: movedCount, size: totalSize, r2Key: trashPrefix };
}

/**
 * Moves entire active workspace to trash prefix in Cloudflare R2
 */
export async function moveWorkspaceToTrashR2(userId, workspaceId, recycleBinId) {
  if (!isR2Configured) return { count: 0, size: 0 };

  const wsPrefix = getWorkspaceR2Prefix(userId, workspaceId);
  const trashPrefix = getTrashR2Prefix(userId, recycleBinId);

  const items = await listObjects(wsPrefix);
  let totalSize = 0;

  for (const item of items) {
    const suffix = item.key.slice(wsPrefix.length);
    const destKey = `${trashPrefix}${suffix}`;
    await copyObject(item.key, destKey);
    await deleteObject(item.key);
    totalSize += item.size || 0;
  }

  return { count: items.length, size: totalSize, r2Key: trashPrefix };
}

/**
 * Restores all files from trash prefix back to active workspace in Cloudflare R2
 */
export async function restoreFromTrashR2(userId, workspaceId, recycleBinId) {
  if (!isR2Configured) return { count: 0 };

  const trashPrefix = getTrashR2Prefix(userId, recycleBinId);
  const wsPrefix = getWorkspaceR2Prefix(userId, workspaceId);

  const items = await listObjects(trashPrefix);
  for (const item of items) {
    const suffix = item.key.slice(trashPrefix.length);
    const destKey = `${wsPrefix}${suffix}`;
    await copyObject(item.key, destKey);
    await deleteObject(item.key);
  }

  return { count: items.length };
}

/**
 * Permanently purge trash item from R2
 */
export async function purgeTrashR2(userId, recycleBinId) {
  if (!isR2Configured) return 0;
  const trashPrefix = getTrashR2Prefix(userId, recycleBinId);
  return await deletePrefix(trashPrefix);
}

/**
 * Permanently delete entire workspace from R2
 */
export async function deleteWorkspaceFromR2(userId, workspaceId) {
  if (!isR2Configured) return 0;
  const wsPrefix = getWorkspaceR2Prefix(userId, workspaceId);
  return await deletePrefix(wsPrefix);
}

/* ================= FULL WORKSPACE DISK <-> R2 SYNC ================= */

/**
 * Backup / sync all local workspace files to Cloudflare R2
 */
export async function syncWorkspaceDirToR2(userId, workspaceId) {
  if (!isR2Configured) return { uploaded: 0 };

  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  const localDir = path.join(getWorkspacesRoot(), uId, wId);

  if (!fs.existsSync(localDir)) {
    return { uploaded: 0 };
  }

  let uploadCount = 0;

  async function walkAndUpload(currentDir, relativeBase = "") {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const relPath = relativeBase
        ? `${relativeBase}/${entry.name}`
        : entry.name;

      if (isIgnoredFile(relPath)) continue;

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walkAndUpload(fullPath, relPath);
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath);
          const r2Key = getFileR2Key(uId, wId, relPath);
          await uploadObject(r2Key, content);
          uploadCount++;
        } catch (readErr) {
          console.warn(`[SyncToR2 Warning] ${relPath}:`, readErr.message);
        }
      }
    }
  }

  await walkAndUpload(localDir);
  return { uploaded: uploadCount };
}

/**
 * Hydrate / restore local disk files from Cloudflare R2 if missing
 */
export async function syncWorkspaceDirFromR2(userId, workspaceId) {
  if (!isR2Configured) return { downloaded: 0 };

  const uId = String(userId || "");
  const wId = String(workspaceId || "");
  const wsPrefix = getWorkspaceR2Prefix(uId, wId);
  const filesPrefix = `${wsPrefix}files/`;
  const localDir = path.join(getWorkspacesRoot(), uId, wId);

  const items = await listObjects(filesPrefix);
  let downloadedCount = 0;

  for (const item of items) {
    const relPath = item.key.slice(filesPrefix.length);
    if (!relPath) continue;

    const localPath = path.join(localDir, relPath);
    if (!fs.existsSync(localPath)) {
      const buf = await getObjectBuffer(item.key);
      if (buf) {
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, buf);
        downloadedCount++;
      }
    }
  }

  return { downloaded: downloadedCount };
}


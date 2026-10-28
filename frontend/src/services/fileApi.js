const backendUrl = import.meta.env.VITE_BACKEND_URL;
const BASE = `${backendUrl}/api/files`;

/* ================= AUTH HELPER ================= */

const authHeaders = (token, isJson = true) => {
  if (!token) {
    throw new Error("User not authenticated");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

/* ================= LOAD TREE ================= */

export async function loadTree(token, workspaceId) {
  const res = await fetch(`${BASE}/tree?workspaceId=${workspaceId}`, {
    headers: authHeaders(token, false),
  });

  if (!res.ok) {
    const err = await res.json();

    console.error(err);

    return err;
  }

  return res.json();
}

/* ================= CREATE FILE ================= */

export async function createFile(token, workspaceId, path) {
  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      workspaceId,
      path,
      type: "file",
    }),
  });

  if (!res.ok) throw new Error("Failed to create file");
  return res.json();
}

export async function createFolder(token, workspaceId, path) {
  const res = await fetch(`${BASE}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      workspaceId,
      path,
      type: "folder",
    }),
  });

  if (!res.ok) throw new Error("Failed to create folder");
  return res.json();
}

/* ================= READ FILE ================= */

export async function readFile(token, workspaceId, path) {
  const res = await fetch(
    `${BASE}/read?workspaceId=${workspaceId}&path=${encodeURIComponent(path)}`,
    {
      headers: authHeaders(token, false),
    },
  );

  if (!res.ok) throw new Error("Failed to read file");

  const data = await res.json();
  return data.content ?? "";
}

/* ================= SAVE FILE ================= */

export async function saveFile(token, workspaceId, path, content) {
  const res = await fetch(`${BASE}/save`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      workspaceId,
      path,
      content,
    }),
  });

  if (!res.ok) throw new Error("Failed to save file");
  return res.json();
}

/* ================= RENAME ================= */

export async function renameNode(token, workspaceId, oldPath, newPath) {
  const res = await fetch(`${BASE}/rename`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      workspaceId,
      oldPath,
      newPath,
    }),
  });

  if (!res.ok) throw new Error("Failed to rename node");
  return res.json();
}

/* ================= DELETE ================= */

export async function deleteNode(token, workspaceId, path) {
  const res = await fetch(`${BASE}/delete`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      workspaceId,
      path,
    }),
  });

  if (!res.ok) throw new Error("Failed to delete node");
  return res.json();
}

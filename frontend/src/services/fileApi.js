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
  try {
    const res = await fetch(`${BASE}/tree?workspaceId=${workspaceId}`, {
      headers: authHeaders(token, false),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("loadTree error:", err);
    return [];
  }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create file");
  }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create folder");
  }
  return res.json();
}

/* ================= READ FILE ================= */

export async function readFile(token, workspaceId, path) {
  const res = await fetch(
    `${BASE}/read?workspaceId=${workspaceId}&path=${encodeURIComponent(path)}`,
    {
      headers: authHeaders(token, false),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to read file");
  }

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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save file");
  }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to rename node");
  }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete node");
  }
  return res.json();
}

/* ================= RECYCLE BIN ================= */

export async function getRecycleBin(token) {
  const res = await fetch(`${BASE}/recycle-bin`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error("Failed to load recycle bin");
  }
  return res.json();
}

export async function restoreRecycleBinItem(token, id) {
  const res = await fetch(`${BASE}/recycle-bin/${id}/restore`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to restore item");
  }
  return res.json();
}

export async function permanentlyDeleteRecycleBinItem(token, id) {
  const res = await fetch(`${BASE}/recycle-bin/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete item permanently");
  }
  return res.json();
}

export async function emptyRecycleBin(token) {
  const res = await fetch(`${BASE}/recycle-bin`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error("Failed to empty recycle bin");
  }
  return res.json();
}

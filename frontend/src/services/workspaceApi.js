const backendUrl = import.meta.env.VITE_BACKEND_URL;
const BASE = `${backendUrl}/api/workspaces`;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

/* LIST */
export async function listWorkspaces(token) {
  try {
    const res = await fetch(BASE, {
      headers: authHeaders(token),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("listWorkspaces error:", err);
    return [];
  }
}

/* CREATE */
export async function createWorkspace(token, name) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Create error:", text);
    throw new Error("Failed to create workspace");
  }

  return res.json();
}

/* DELETE */
export async function deleteWorkspace(token, id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Failed to delete workspace");
  return res.json();
}

/* RENAME */
export async function renameWorkspace(token, id, name) {
  const res = await fetch(`${BASE}/${id}/rename`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to rename workspace");
  return res.json();
}

/* DUPLICATE */
export async function duplicateWorkspace(token, id) {
  const res = await fetch(`${BASE}/${id}/duplicate`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Failed to duplicate workspace");
  return res.json();
}

/* PIN */
export async function pinWorkspace(token, id, isPinned) {
  const res = await fetch(`${BASE}/${id}/pin`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ isPinned }),
  });

  if (!res.ok) throw new Error("Failed to pin workspace");
  return res.json();
}

/* GET SINGLE (EDITOR PAGE) */
export async function getWorkspace(token, id) {
  const res = await fetch(`${BASE}/${id}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Workspace not found");
  return res.json();
}

/* IMPORT WORKSPACE (FOLDER FROM DESKTOP) */
export async function importWorkspace(token, { name, files }) {
  const res = await fetch(`${BASE}/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ name, files }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to import workspace");
  }

  return res.json();
}

/* EXPORT WORKSPACES (AS ZIP) */
export async function exportWorkspaces(token, workspaceIds) {
  const res = await fetch(`${BASE}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ workspaceIds }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to export workspaces");
  }

  const blob = await res.blob();
  let filename = "vocodeai-workspaces.zip";
  const disposition = res.headers.get("Content-Disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) filename = match[1];
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return { success: true, filename };
}

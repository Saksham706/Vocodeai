const BASE = "http://localhost:8000/api/git";
const AUTH_BASE = "http://localhost:8000/api/auth";

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Git request failed");
  }
  return data;
}

export async function getGitStatus(token, workspaceId) {
  const res = await fetch(`${BASE}/status?workspaceId=${encodeURIComponent(workspaceId)}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function initGitRepo(token, workspaceId, defaultBranch = "main") {
  const res = await fetch(`${BASE}/init`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, defaultBranch }),
  });
  return handleResponse(res);
}

export async function stageGitFiles(token, workspaceId, files = null, all = false) {
  const res = await fetch(`${BASE}/stage`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, files, all }),
  });
  return handleResponse(res);
}

export async function unstageGitFiles(token, workspaceId, files = null, all = false) {
  const res = await fetch(`${BASE}/unstage`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, files, all }),
  });
  return handleResponse(res);
}

export async function commitGit(token, workspaceId, message, stageAll = false, amend = false) {
  const res = await fetch(`${BASE}/commit`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, message, stageAll, amend }),
  });
  return handleResponse(res);
}

export async function generateAiCommitMessage(token, workspaceId) {
  const res = await fetch(`${BASE}/generate-commit-message`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId }),
  });
  return handleResponse(res);
}

export async function discardGitChanges(token, workspaceId, files = null, all = false) {
  const res = await fetch(`${BASE}/discard`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, files, all }),
  });
  return handleResponse(res);
}

export async function getGitBranches(token, workspaceId) {
  const res = await fetch(`${BASE}/branches?workspaceId=${encodeURIComponent(workspaceId)}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function checkoutGitBranch(token, workspaceId, branchName, createNew = false) {
  const res = await fetch(`${BASE}/branch`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, branchName, createNew }),
  });
  return handleResponse(res);
}

export async function getGitDiff(token, workspaceId, filePath, staged = false) {
  const res = await fetch(
    `${BASE}/diff?workspaceId=${encodeURIComponent(workspaceId)}&path=${encodeURIComponent(filePath)}&staged=${staged}`,
    {
      headers: authHeaders(token),
    }
  );
  return handleResponse(res);
}

export async function getGitLog(token, workspaceId, limit = 25) {
  const res = await fetch(`${BASE}/log?workspaceId=${encodeURIComponent(workspaceId)}&limit=${limit}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function addGitRemote(token, workspaceId, remoteName = "origin", url = "") {
  const res = await fetch(`${BASE}/remote`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, remoteName, url }),
  });
  return handleResponse(res);
}

export async function pushGit(token, workspaceId, remote = "origin", branch = null, tokenAuth = null, setUpstream = true) {
  const res = await fetch(`${BASE}/push`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, remote, branch, token: tokenAuth, setUpstream }),
  });
  return handleResponse(res);
}

export async function pullGit(token, workspaceId, remote = "origin", branch = null, tokenAuth = null) {
  const res = await fetch(`${BASE}/pull`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, remote, branch, token: tokenAuth }),
  });
  return handleResponse(res);
}

export async function cloneGitRepo(token, workspaceId, repoUrl, tokenAuth = null, branch = null) {
  const res = await fetch(`${BASE}/clone`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ workspaceId, repoUrl, token: tokenAuth, branch }),
  });
  return handleResponse(res);
}

/* ================= GITHUB ACCOUNT & OAUTH ================= */

export async function getGithubAccountStatus(token) {
  const res = await fetch(`${AUTH_BASE}/github/status`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function disconnectGithubAccount(token) {
  const res = await fetch(`${AUTH_BASE}/github/disconnect`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function connectGithubWithToken(token, ghToken) {
  const res = await fetch(`${AUTH_BASE}/github/connect-token`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ token: ghToken }),
  });
  return handleResponse(res);
}

export function getGithubOAuthUrl(workspaceId, token) {
  const origin = window.location.origin;
  return `http://localhost:8000/api/auth/github?workspaceId=${encodeURIComponent(
    workspaceId || ""
  )}&token=${encodeURIComponent(token || "")}&origin=${encodeURIComponent(origin)}`;
}

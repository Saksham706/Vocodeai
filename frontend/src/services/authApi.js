import { BACKEND_URL } from "../config/apiConfig";

export async function fetchProfile(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch profile");
  }
  return data.user;
}

export async function updateProfile(token, profileData) {
  const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update profile");
  }
  return data.user;
}

export async function changePassword(token, { currentPassword, newPassword }) {
  const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change password");
  }
  return data;
}

export async function fetchGithubStatus(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/github/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch GitHub status");
  }
  return data;
}

export async function connectGithubToken(token, ghToken) {
  const res = await fetch(`${BACKEND_URL}/api/auth/github/connect-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: ghToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to connect GitHub token");
  }
  return data;
}

export async function disconnectGithub(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/github/disconnect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to disconnect GitHub");
  }
  return data;
}

export async function fetchStorageUsage(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/storage-usage`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch storage usage");
  }
  return data;
}


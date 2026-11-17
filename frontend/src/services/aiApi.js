import { BACKEND_URL } from "../config/apiConfig";

export async function askAI(
  token,
  message,
  workspaceId,
  activeFile,
  attachments = [],
  aiConfig = {}
) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({
      message,
      workspaceId,
      activeFile,
      attachments,
      provider: aiConfig?.provider || "gemini",
      model: aiConfig?.model || "gemini-3.8-flash",
      apiKey: aiConfig?.apiKey,
      backupKeys: Array.isArray(aiConfig?.backupKeys) ? aiConfig.backupKeys : [],
      apiKeys: Array.isArray(aiConfig?.apiKeys) && aiConfig.apiKeys.length > 0
        ? aiConfig.apiKeys
        : (aiConfig?.apiKey
          ? [aiConfig.apiKey, ...(Array.isArray(aiConfig?.backupKeys) ? aiConfig.backupKeys : [])]
          : []),
      authMethod: aiConfig?.authMethod,
      projectId: aiConfig?.projectId,
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(text || `AI request failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data;
}

export async function getAIUsageApi(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai/usage`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load AI usage statistics");
  return await res.json();
}

export async function verifyAIKeyApi(token, { provider, apiKey }) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai/verify-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({ provider, apiKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "API key verification failed");
  return data;
}

export async function getGoogleAIAccountStatus(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai/google-account`, {
    headers: { Authorization: `Bearer ${activeToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not check Google sign-in status");
  return data;
}

export async function verifyGoogleAI(token, { projectId }) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai/verify-google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({ projectId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not connect this Google project");
  return data;
}

export async function clearLegacyAICredentials(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/credentials`, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });
    if (!res.ok) return { activeConfig: null, savedProviders: {} };
    return await res.json();
  } catch {
    return { activeConfig: null, savedProviders: {} };
  }
}

export async function disconnectAIProviderApi(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/disconnect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function deleteChatHistory(token, workspaceId) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const url = workspaceId
    ? `${BACKEND_URL}/api/ai/history/${workspaceId}`
    : `${BACKEND_URL}/api/ai/history`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to delete chat history with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to delete chat history");
  }
  return data;
}

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
      provider: aiConfig?.provider,
      model: aiConfig?.model,
      apiKey: aiConfig?.apiKey,
      authMethod: aiConfig?.authMethod,
      accountEmail: aiConfig?.accountEmail,
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

export async function verifyAIKey(
  token,
  { provider, model, apiKey, authMethod, accountEmail }
) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  const res = await fetch(`${BACKEND_URL}/api/ai/verify-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify({
      provider,
      model,
      apiKey,
      authMethod,
      accountEmail,
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Verification failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to verify credentials");
  }

  return data;
}

export async function getGoogleAIStatus(token) {
  const activeToken = token || localStorage.getItem("accessToken") || "";
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai/google-status`, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });
    if (!res.ok) return { hasGoogleToken: false, email: null };
    return await res.json();
  } catch {
    return { hasGoogleToken: false, email: null };
  }
}

export async function fetchAICredentials(token) {
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

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function askAI(token, message, workspaceId, activeFile, attachments = []) {
  const res = await fetch(`${backendUrl}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      workspaceId,
      activeFile,
      attachments,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data;
}

export async function deleteChatHistory(token, workspaceId) {
  const url = workspaceId
    ? `${backendUrl}/api/ai/history/${workspaceId}`
    : `${backendUrl}/api/ai/history`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete chat history");
  }
  return res.json();
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function askAI(token, message, workspaceId, activeFile) {
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
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function askAI(token, message, workspaceId) {
  const res = await fetch(`${backendUrl}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      workspaceId,
    }),
  });

  if (!res.ok) throw new Error("AI request failed");

  return res.json();
}
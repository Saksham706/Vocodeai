import { BACKEND_URL } from "../config/apiConfig";

export async function execute({ userId, workspaceId, command }) {
  await fetch(`${BACKEND_URL}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, workspaceId, command }),
  });
}

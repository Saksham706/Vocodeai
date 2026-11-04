import { BACKEND_URL } from "../config/apiConfig";

export function connectTerminal(userId, workspaceId) {
  const host = BACKEND_URL.replace(/^https?:\/\//, "");
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${host}`);

  socket.onopen = () => {
    console.log("Terminal connected");

    socket.send(
      JSON.stringify({
        type: "create",
        userId,
        workspaceId,
      })
    );
  };

  socket.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Terminal disconnected");
  };

  return socket;
}
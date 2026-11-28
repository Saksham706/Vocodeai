import { WebSocketServer, WebSocket } from "ws";
import Announcement from "../models/Announcement.js";

export const announcementWss = new WebSocketServer({ noServer: true });

async function getActiveList() {
  const now = new Date();
  return Announcement.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .select("title message type targetPlan")
    .sort({ createdAt: -1 })
    .lean();
}

announcementWss.on("connection", async (ws) => {
  try {
    const announcements = await getActiveList();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "announcements", announcements }));
    }
  } catch (err) {
    console.error("ANNOUNCEMENT WS INIT ERROR:", err.message);
  }
});

/**
 * Broadcasts the latest active announcements to all connected Dashboard clients.
 */
export async function broadcastAnnouncements() {
  try {
    const announcements = await getActiveList();
    const payload = JSON.stringify({ type: "announcements", announcements });
    for (const client of announcementWss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  } catch (err) {
    console.error("ANNOUNCEMENT WS BROADCAST ERROR:", err.message);
  }
}

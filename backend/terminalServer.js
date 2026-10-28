import { WebSocketServer } from "ws";
import path from "path";
import jwt from "jsonwebtoken";
import chokidar from "chokidar";

import { getOrCreateContainer } from "./sandbox/containerManager.js";
import { touchContainer } from "./sandbox/containerRegistry.js";
import { createDockerPty } from "./terminal/dockerPty.js";
import { syncWorkspaceToDB } from "./services/syncService.js";

import {
  registerTerminal,
  getTerminal,
  removeTerminal,
  getAllTerminals,
} from "./sandbox/terminalRegistry.js";

function getContainerKey(userId, workspaceId) {
  return `${userId}-${workspaceId}`;
}

export function setupTerminalServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    /* ================= AUTH ================= */

    const params = new URLSearchParams(req.url.replace("/?", ""));
    const token = params.get("token");

    let userId;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      ws.close();
      return;
    }

    /* ================= STATE ================= */

    const watchers = new Map(); // workspaceId -> watcher

    /* ================= MESSAGE HANDLER ================= */

    ws.on("message", async (raw) => {
      let msg;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      /* ================================================= */
      /* ================= CREATE TERMINAL ================ */
      /* ================================================= */

      if (msg.type === "create") {
        const { terminalId, workspaceId } = msg;
        if (!terminalId || !workspaceId) return;

        try {
          const workspacePath = path.join(
            process.cwd(),
            process.env.WORKSPACES_ROOT || "workspaces",
            userId,
            workspaceId
          );

          const key = getContainerKey(userId, workspaceId);

          const container = await getOrCreateContainer({
            workspaceKey: key,
            workspacePath,
          });

          touchContainer(key);

          const ptyProcess = createDockerPty(container.id);

          registerTerminal(terminalId, {
            pty: ptyProcess,
            workspaceId,
            userId,
            buffer: "", // 🔥 store terminal output
          });

          /* ---------- FILE WATCHER ---------- */
          if (!watchers.has(workspaceId)) {
            const watcher = chokidar.watch(workspacePath, {
              ignoreInitial: true,
              persistent: true,
              depth: 10,
            });

            watcher.on("all", async () => {
              try {
                await syncWorkspaceToDB(userId, workspaceId);
              } catch (err) {
                console.error("Watcher sync error:", err.message);
              }
            });

            watchers.set(workspaceId, watcher);
          }

          /* ---------- TERMINAL OUTPUT ---------- */
          ptyProcess.onData((data) => {
            const entry = getTerminal(terminalId);
            if (entry) {
              entry.buffer += data; // ✅ persist output
            }

            ws.send(
              JSON.stringify({
                type: "output",
                terminalId,
                data,
              })
            );
          });

          /* ---------- EXIT HANDLER ---------- */
          ptyProcess.onExit(async () => {
            removeTerminal(terminalId);

            try {
              await syncWorkspaceToDB(userId, workspaceId);
            } catch (err) {
              console.error("Exit sync error:", err.message);
            }

            ws.send(
              JSON.stringify({
                type: "closed",
                terminalId,
              })
            );
          });

          ws.send(
            JSON.stringify({
              type: "created",
              terminalId,
              title: `terminal-${terminalId.slice(0, 4)}`,
            })
          );
        } catch (err) {
          console.error("Terminal creation failed:", err);
        }
      }

      /* ================================================= */
      /* ================= ATTACH (RECONNECT) ============= */
      /* ================================================= */

      if (msg.type === "attach") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) return;

        ws.send(
          JSON.stringify({
            type: "output",
            terminalId: msg.terminalId,
            data: entry.buffer, // 🔥 replay old output
          })
        );
      }

      /* ================================================= */
      /* ================= INPUT ========================= */
      /* ================================================= */

      if (msg.type === "input") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) return;

        const command = msg.data.trim();

        /* 🔥 CUSTOM COMMANDS */
        if (command === "cls") {
          entry.buffer = "";
          ws.send(
            JSON.stringify({
              type: "output",
              terminalId: msg.terminalId,
              data: "\x1Bc",
            })
          );
          return;
        }

        entry.pty.write(msg.data);
      }

      /* ================================================= */
      /* ================= RESIZE ======================== */
      /* ================================================= */

      if (msg.type === "resize") {
        const entry = getTerminal(msg.terminalId);
        if (entry) {
          entry.pty.resize(msg.cols, msg.rows);
        }
      }

      /* ================================================= */
      /* ================= CLEAR ========================= */
      /* ================================================= */

      if (msg.type === "clear") {
        const entry = getTerminal(msg.terminalId);
        if (entry) {
          entry.buffer = "";
          entry.pty.write("clear\n");
        }
      }

      /* ================================================= */
      /* ================= RESTART ======================= */
      /* ================================================= */

      if (msg.type === "restart") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) return;

        const { workspaceId } = entry;

        entry.pty.kill();
        removeTerminal(msg.terminalId);

        const workspacePath = path.join(
          process.cwd(),
          process.env.WORKSPACES_ROOT || "workspaces",
          userId,
          workspaceId
        );

        const key = getContainerKey(userId, workspaceId);

        const container = await getOrCreateContainer({
          workspaceKey: key,
          workspacePath,
        });

        const newPty = createDockerPty(container.id);

        registerTerminal(msg.terminalId, {
          pty: newPty,
          workspaceId,
          userId,
          buffer: "",
        });

        newPty.onData((data) => {
          const entry = getTerminal(msg.terminalId);
          if (entry) entry.buffer += data;

          ws.send(
            JSON.stringify({
              type: "output",
              terminalId: msg.terminalId,
              data,
            })
          );
        });
      }

      /* ================================================= */
      /* ================= KILL ========================== */
      /* ================================================= */

      if (msg.type === "kill") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) return;

        entry.pty.kill();
        removeTerminal(msg.terminalId);

        try {
          await syncWorkspaceToDB(userId, entry.workspaceId);
        } catch (err) {
          console.error("Kill sync failed:", err.message);
        }

        ws.send(
          JSON.stringify({
            type: "closed",
            terminalId: msg.terminalId,
          })
        );
      }
    });

    /* ================================================= */
    /* ================= SOCKET CLOSE ================== */
    /* ================================================= */

    ws.on("close", async () => {
      try {
        // ❌ DO NOT kill terminals (VS Code behavior)

        // Only close watchers
        for (const watcher of watchers.values()) {
          await watcher.close();
        }

        watchers.clear();
      } catch (err) {
        console.error("Terminal cleanup failed:", err.message);
      }
    });
  });
}
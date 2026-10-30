import { WebSocketServer } from "ws";
import path from "path";
import jwt from "jsonwebtoken";
import chokidar from "chokidar";

import { getOrCreateContainer } from "./sandbox/containerManager.js";
import { touchContainer } from "./sandbox/containerRegistry.js";
import { createDockerPty } from "./terminal/dockerPty.js";
import { syncWorkspaceToDB } from "./services/syncService.js";
import { hydrateWorkspace } from "./services/hydrateWorkspace.js";
import { getWorkspacesRoot } from "./config/paths.js";
import User from "./models/User.js";

import {
  registerTerminal,
  getTerminal,
  removeTerminal,
} from "./sandbox/terminalRegistry.js";

function getContainerKey(userId, workspaceId) {
  return `${userId}-${workspaceId}`;
}

export function setupTerminalServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    /* ================= AUTH ================= */
    let userId;
    let username = "user";

    try {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(4001, "Missing authentication token");
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;

      try {
        const dbUser = await User.findById(userId).lean();
        if (dbUser) {
          username = (dbUser.firstName || dbUser.email?.split("@")[0] || "user")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
        }
      } catch {}
    } catch (err) {
      console.warn("WebSocket authentication failed:", err.message);
      ws.close(4003, "Invalid authentication token");
      return;
    }

    /* ================= STATE ================= */
    const watchers = new Map(); // workspaceId -> watcher
    const syncTimeouts = new Map(); // workspaceId -> debounce timer

    const debounceSync = (workspaceId) => {
      if (syncTimeouts.has(workspaceId)) {
        clearTimeout(syncTimeouts.get(workspaceId));
      }

      const timer = setTimeout(async () => {
        try {
          await syncWorkspaceToDB(userId, workspaceId);
        } catch (err) {
          console.error("Debounced sync error:", err.message);
        } finally {
          syncTimeouts.delete(workspaceId);
        }
      }, 500);

      syncTimeouts.set(workspaceId, timer);
    };

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
        const { terminalId, workspaceId, shell } = msg;
        if (!terminalId || !workspaceId) return;

        try {
          const workspacePath = path.join(
            getWorkspacesRoot(),
            userId,
            workspaceId
          );

          // 1. Ensure files from MongoDB exist on disk before mounting container
          await hydrateWorkspace(userId, workspaceId);

          const key = getContainerKey(userId, workspaceId);

          // 2. Start or attach Docker container
          const container = await getOrCreateContainer({
            workspaceKey: key,
            workspacePath,
          });

          touchContainer(key);

          // 3. Spawn real PTY session connected to container
          const ptyProcess = createDockerPty(container.id, shell, username);

          registerTerminal(terminalId, {
            pty: ptyProcess,
            workspaceId,
            userId,
            shell: shell || "bash",
            title: msg.title || shell || "bash",
            file: msg.file || null,
            buffer: "",
          });

          /* ---------- FILE WATCHER ---------- */
          if (!watchers.has(workspaceId)) {
            const watcher = chokidar.watch(workspacePath, {
              ignoreInitial: true,
              persistent: true,
              depth: 10,
              ignored: [
                /(^|[\/\\])\../, // dotfiles
                /node_modules/,
                /__pycache__/,
                /dist/,
                /build/,
                /\.git/,
              ],
            });

            watcher.on("all", () => {
              debounceSync(workspaceId);
            });

            watchers.set(workspaceId, watcher);
          }

          /* ---------- TERMINAL OUTPUT ---------- */
          ptyProcess.onData((data) => {
            const entry = getTerminal(terminalId);
            if (entry) {
              entry.buffer = (entry.buffer + data).slice(-20000); // keep last 20k chars
            }

            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "output",
                  terminalId,
                  data,
                })
              );
            }
          });

          /* ---------- EXIT HANDLER ---------- */
          ptyProcess.onExit(async () => {
            removeTerminal(terminalId);
            debounceSync(workspaceId);

            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "closed",
                  terminalId,
                })
              );
            }
          });

          ws.send(
            JSON.stringify({
              type: "created",
              terminalId,
              title: msg.title || shell || "bash",
              shell: shell || "bash",
              file: msg.file || null,
              setAsActive: msg.setAsActive !== false,
            })
          );
        } catch (err) {
          console.error("Terminal creation failed:", err);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "output",
                terminalId,
                data: `\r\n\x1b[31m[Error] Failed to initialize terminal container: ${err.message}\x1b[0m\r\n`,
              })
            );
          }
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
            type: "buffer",
            terminalId: msg.terminalId,
            data: entry.buffer,
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
        if (entry && msg.cols && msg.rows) {
          try {
            entry.pty.resize(msg.cols, msg.rows);
          } catch {}
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

        try {
          entry.pty.kill();
        } catch {}
        removeTerminal(msg.terminalId);

        const workspacePath = path.join(
          getWorkspacesRoot(),
          userId,
          workspaceId
        );

        const key = getContainerKey(userId, workspaceId);

        const container = await getOrCreateContainer({
          workspaceKey: key,
          workspacePath,
        });

        const newPty = createDockerPty(container.id, entry.shell || "bash", username);

        registerTerminal(msg.terminalId, {
          pty: newPty,
          workspaceId,
          userId,
          buffer: "",
        });

        newPty.onData((data) => {
          const tEntry = getTerminal(msg.terminalId);
          if (tEntry) tEntry.buffer = (tEntry.buffer + data).slice(-20000);

          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "output",
                terminalId: msg.terminalId,
                data,
              })
            );
          }
        });

        newPty.onExit(() => {
          removeTerminal(msg.terminalId);
          debounceSync(workspaceId);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "closed",
                terminalId: msg.terminalId,
              })
            );
          }
        });
      }

      /* ================================================= */
      /* ================= KILL ========================== */
      /* ================================================= */
      if (msg.type === "kill") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "closed", terminalId: msg.terminalId }));
          }
          return;
        }

        try {
          entry.pty.kill();
        } catch {}
        removeTerminal(msg.terminalId);

        debounceSync(entry.workspaceId);

        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "closed",
              terminalId: msg.terminalId,
            })
          );
        }
      }
    });

    /* ================================================= */
    /* ================= SOCKET CLOSE ================== */
    /* ================================================= */
    ws.on("close", async () => {
      try {
        for (const [wsId, timer] of syncTimeouts.entries()) {
          clearTimeout(timer);
          await syncWorkspaceToDB(userId, wsId);
        }
        syncTimeouts.clear();

        for (const watcher of watchers.values()) {
          await watcher.close();
        }
        watchers.clear();
      } catch (err) {
        console.error("Terminal watcher cleanup failed:", err.message);
      }
    });
  });
}

import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import path from "path";
import jwt from "jsonwebtoken";
import chokidar from "chokidar";

import { getOrCreateContainer } from "./sandbox/containerManager.js";
import { touchContainer } from "./sandbox/containerRegistry.js";
import { createDockerPty, createLocalPty } from "./terminal/dockerPty.js";
import { syncWorkspaceToDB } from "./services/syncService.js";
import { hydrateWorkspace } from "./services/hydrateWorkspace.js";
import { getWorkspacesRoot } from "./config/paths.js";
import User from "./models/User.js";

import {
  registerTerminal,
  getTerminal,
  removeTerminal,
  addTerminalSubscriber,
  removeTerminalSubscriber,
  removeSubscriberFromAll,
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

      if (token === "demo-token" || token.startsWith("demo-")) {
        userId = "demo-user";
        username = "guest";
      } else {
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
          // If token signature is expired during session, allow decoded payload so terminal stays active
          decoded = jwt.decode(token);
          if (!decoded || !decoded.id) {
            ws.close(4003, "Invalid authentication token");
            return;
          }
        }
        userId = decoded.id;

        try {
          if (mongoose.Types.ObjectId.isValid(userId)) {
            const dbUser = await User.findById(userId).lean();
            if (dbUser) {
              username = (dbUser.firstName || dbUser.email?.split("@")[0] || "user")
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, "");
            }
          }
        } catch {}
      }
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

    /* ================= HELPER: SPAWN PTY ================= */
    const spawnSession = async (terminalId, workspaceId, shell, cols, rows, title, file) => {
      const workspacePath = path.join(
        getWorkspacesRoot(),
        String(userId),
        String(workspaceId)
      );

      // 1. Ensure files from MongoDB exist on disk before mounting container
      await hydrateWorkspace(userId, workspaceId);

      let ptyProcess = null;
      let fallbackNotice = null;

      // 2. Start or attach Docker container with graceful local PTY fallback
      try {
        const key = getContainerKey(userId, workspaceId);
        const container = await getOrCreateContainer({
          workspaceKey: key,
          workspacePath,
        });

        touchContainer(key);

        // 3. Spawn real PTY session connected to container with client's exact dimensions
        ptyProcess = createDockerPty(container.id, shell, username, cols, rows);
      } catch (dockerErr) {
        console.warn("Docker container spawn unavailable, using local PTY fallback:", dockerErr.message);
        ptyProcess = createLocalPty(workspacePath, shell, cols, rows);
        fallbackNotice = `\r\n\x1b[33m⚡ [VocodeAI] Docker offline (${dockerErr.message.slice(0, 40)}...). Connected to native terminal in /workspace.\x1b[0m\r\n`;
      }

      const subscribers = new Set([ws]);
      registerTerminal(terminalId, {
        pty: ptyProcess,
        workspaceId,
        userId,
        shell: shell || "bash",
        title: title || shell || "bash",
        file: file || null,
        buffer: "",
        cols: cols || 120,
        rows: rows || 30,
        sockets: subscribers,
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

      /* ---------- TERMINAL OUTPUT MULTICAST ---------- */
      ptyProcess.onData((data) => {
        const entry = getTerminal(terminalId);
        if (entry) {
          entry.buffer = (entry.buffer + data).slice(-40000); // keep last 40k chars
          const payload = JSON.stringify({
            type: "output",
            terminalId,
            data,
          });

          if (entry.sockets) {
            for (const sock of entry.sockets) {
              if (sock.readyState === 1 /* OPEN */) {
                sock.send(payload);
              }
            }
          }
        }
      });

      /* ---------- EXIT HANDLER ---------- */
      ptyProcess.onExit(async () => {
        const entry = getTerminal(terminalId);
        const closePayload = JSON.stringify({
          type: "closed",
          terminalId,
        });

        if (entry?.sockets) {
          for (const sock of entry.sockets) {
            if (sock.readyState === 1 /* OPEN */) {
              sock.send(closePayload);
            }
          }
        }

        removeTerminal(terminalId);
        debounceSync(workspaceId);
      });

      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "created",
            terminalId,
            title: title || shell || "bash",
            shell: shell || "bash",
            file: file || null,
            setAsActive: true,
          })
        );

        if (fallbackNotice) {
          ws.send(
            JSON.stringify({
              type: "output",
              terminalId,
              data: fallbackNotice,
            })
          );
        }
      }
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
        const { terminalId, workspaceId, shell, cols, rows } = msg;
        if (!terminalId || !workspaceId) return;

        try {
          const existing = getTerminal(terminalId);
          // If session already exists with the same target workspace, reuse & attach
          if (existing && existing.pty && String(existing.workspaceId) === String(workspaceId)) {
            addTerminalSubscriber(terminalId, ws);

            if (cols && rows) {
              try {
                existing.pty.resize(Math.max(20, cols), Math.max(5, rows));
              } catch {}
            }

            if (ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "created",
                  terminalId,
                  title: existing.title || shell || "bash",
                  shell: existing.shell || "bash",
                  file: existing.file || null,
                  setAsActive: msg.setAsActive !== false,
                })
              );

              // Replay buffer so all previous output and history is completely preserved!
              if (existing.buffer) {
                ws.send(
                  JSON.stringify({
                    type: "buffer",
                    terminalId,
                    data: existing.buffer,
                  })
                );
              }
            }
            return;
          }

          // If switching to a new workspace environment, clean up the previous session
          if (existing) {
            removeTerminal(terminalId);
          }

          await spawnSession(
            terminalId,
            workspaceId,
            shell || "bash",
            cols || 120,
            rows || 32,
            msg.title,
            msg.file
          );
        } catch (err) {
          console.error("Terminal creation failed:", err);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "output",
                terminalId,
                data: `\r\n\x1b[31m[Error] Failed to initialize terminal: ${err.message}\x1b[0m\r\n`,
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
        if (!entry) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "dead", terminalId: msg.terminalId }));
          }
          return;
        }

        addTerminalSubscriber(msg.terminalId, ws);

        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: "created",
              terminalId: msg.terminalId,
              title: entry.title || entry.shell || "bash",
              shell: entry.shell || "bash",
              file: entry.file || null,
              setAsActive: true,
            })
          );

          if (entry.buffer) {
            ws.send(
              JSON.stringify({
                type: "buffer",
                terminalId: msg.terminalId,
                data: entry.buffer,
              })
            );
          }
        }
      }

      /* ================================================= */
      /* ================= INPUT ========================= */
      /* ================================================= */
      if (msg.type === "input") {
        const entry = getTerminal(msg.terminalId);
        if (!entry) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: "dead", terminalId: msg.terminalId }));
          }
          return;
        }

        try {
          if (msg.data) {
            entry.pty.write(msg.data);
          }
        } catch (ptyErr) {
          console.warn("PTY write error:", ptyErr.message);
        }
      }

      /* ================================================= */
      /* ================= RESIZE ======================== */
      /* ================================================= */
      if (msg.type === "resize") {
        const entry = getTerminal(msg.terminalId);
        if (entry && msg.cols && msg.rows) {
          try {
            entry.pty.resize(
              Math.max(20, Math.min(Number(msg.cols) || 120, 500)),
              Math.max(5, Math.min(Number(msg.rows) || 30, 200))
            );
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
          try {
            entry.pty.write("clear\r");
          } catch {}
        }
      }

      /* ================================================= */
      /* ================= RESTART ======================= */
      /* ================================================= */
      if (msg.type === "restart") {
        const entry = getTerminal(msg.terminalId);
        const wsId = entry?.workspaceId || msg.workspaceId || "cloud-sandbox";
        const shell = entry?.shell || msg.shell || "bash";
        const cols = entry?.cols || msg.cols || 120;
        const rows = entry?.rows || msg.rows || 32;

        removeTerminal(msg.terminalId);

        try {
          await spawnSession(
            msg.terminalId,
            wsId,
            shell,
            cols,
            rows,
            entry?.title,
            entry?.file
          );
        } catch (err) {
          console.error("Terminal restart failed:", err);
        }
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
      // Remove this socket as a listener from all sessions, but DO NOT kill PTY
      removeSubscriberFromAll(ws);

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

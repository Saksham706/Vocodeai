import net from "net";
import Docker from "dockerode";
import { getAllContainers } from "../sandbox/containerRegistry.js";

const docker = new Docker();

// Active dynamic forwarders on the host: port -> { server, containerId, workspaceKey }
const activeForwarders = new Map();

// Known ports restricted by Chromium (Chrome, Edge, Brave, Opera)
export const CHROME_RESTRICTED_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 77, 79, 87, 95,
  101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 139, 143, 179,
  389, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 556, 563, 587, 601, 636,
  993, 995, 2049, 3659, 4045, 6000
]);

const RESERVED_HOST_PORTS = new Set([
  Number(process.env.PORT) || 8000,
  5173, // Frontend
  6379, // Redis
  27017, // MongoDB
]);

/**
 * Inspect active listening ports inside a container by reading /proc/net/tcp and tcp6
 */
export async function getListeningPortsInContainer(container) {
  try {
    const exec = await container.exec({
      Cmd: [
        "node",
        "-e",
        `
        const fs = require('fs');
        function parsePorts(path) {
          try {
            const lines = fs.readFileSync(path, 'utf-8').trim().split('\\n').slice(1);
            const res = [];
            for (const l of lines) {
              const p = l.trim().split(/\\s+/);
              if (p[3] === '0A') { // TCP_LISTEN
                const port = parseInt(p[1].split(':')[1], 16);
                if (port >= 1024 && port <= 65535) res.push(port);
              }
            }
            return res;
          } catch { return []; }
        }
        const found = [...new Set([...parsePorts('/proc/net/tcp'), ...parsePorts('/proc/net/tcp6')])];
        console.log(JSON.stringify(found));
        `
      ],
      AttachStdout: true,
      AttachStderr: false,
    });

    const stream = await exec.start({ hijack: true, stdin: false });
    return new Promise((resolve) => {
      let output = "";
      stream.on("data", (chunk) => {
        // Demux if header is present
        let str = chunk.toString();
        // Remove docker stream header characters if any
        str = str.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "");
        output += str;
      });
      stream.on("end", () => {
        try {
          const match = output.match(/\[.*?\]/);
          if (match) {
            resolve(JSON.parse(match[0]));
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
      setTimeout(() => resolve([]), 1500);
    });
  } catch {
    return [];
  }
}

/**
 * Check if a host port is currently available to bind
 */
function isHostPortAvailable(port) {
  if (RESERVED_HOST_PORTS.has(port)) return false;
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => {
      s.close();
      resolve(true);
    });
    s.listen({ port, host: "0.0.0.0", exclusive: true });
  });
}

/**
 * Start dynamic TCP forwarder on host port for a container
 */
function startForwarderForPort(port, container, workspaceKey) {
  if (activeForwarders.has(port)) return;

  const server = net.createServer(async (clientSocket) => {
    try {
      const exec = await container.exec({
        Cmd: [
          "node",
          "-e",
          `const net = require('net'); const s = net.connect(${port}, '127.0.0.1'); process.stdin.pipe(s); s.pipe(process.stdout); s.on('error', () => process.exit(1));`
        ],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({ hijack: true, stdin: true });

      clientSocket.pipe(stream);
      docker.modem.demuxStream(stream, clientSocket, process.stderr);

      clientSocket.on("close", () => stream.end());
      clientSocket.on("error", () => stream.end());
      stream.on("end", () => clientSocket.end());
    } catch {
      clientSocket.destroy();
    }
  });

  server.once("error", (err) => {
    console.warn(`[DYNAMIC FORWARDER] Error on host port ${port}:`, err.message);
    activeForwarders.delete(port);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(
      `[DYNAMIC FORWARDER] Host port ${port} is now dynamically forwarded to container ${container.id.slice(0, 12)} (${workspaceKey})`
    );
    activeForwarders.set(port, {
      server,
      containerId: container.id,
      workspaceKey,
    });
  });
}

/**
 * Stop dynamic forwarder on host port
 */
function stopForwarderForPort(port) {
  const entry = activeForwarders.get(port);
  if (entry) {
    try {
      entry.server.close();
    } catch { }
    activeForwarders.delete(port);
    console.log(`[DYNAMIC FORWARDER] Stopped forwarder on port ${port}`);
  }
}

/**
 * Scan all active containers and synchronize dynamic forwarders
 */
export async function syncDynamicForwarders() {
  const currentListeningByContainer = new Map();
  let containers = [];

  try {
    containers = await docker.listContainers();
  } catch {
    return;
  }

  for (const cInfo of containers) {
    const name = (cInfo.Names || [])[0]?.replace(/^\//, "") || "";
    if (!name.startsWith("Sirideai-") && !name.startsWith("Siridea-")) continue;

    const container = docker.getContainer(cInfo.Id);
    try {
      const inspectData = await container.inspect();
      if (!inspectData.State?.Running) continue;

      // Check ports already bound by Docker HostConfig
      const dockerPorts = inspectData.HostConfig?.PortBindings || {};
      const boundContainerPorts = new Set(
        Object.keys(dockerPorts).map((k) => parseInt(k.split("/")[0], 10))
      );

      // Query live listening ports from /proc/net/tcp(6)
      const livePorts = await getListeningPortsInContainer(container);
      currentListeningByContainer.set(container.id, {
        workspaceKey: name.replace(/^Sirideai-/, ""),
        container,
        livePorts,
        boundContainerPorts,
      });

      for (const p of livePorts) {
        // If Docker did not bind this port on the host, start a dynamic forwarder!
        if (!boundContainerPorts.has(p) && !activeForwarders.has(p)) {
          const isFree = await isHostPortAvailable(p);
          if (isFree) {
            startForwarderForPort(p, container, name.replace(/^Sirideai-/, ""));
          }
        }
      }
    } catch { }
  }

  // Cleanup forwarders for ports that are no longer listening
  for (const [port, entry] of activeForwarders.entries()) {
    const containerData = currentListeningByContainer.get(entry.containerId);
    if (!containerData || !containerData.livePorts.includes(port)) {
      stopForwarderForPort(port);
    }
  }
}

/**
 * Forward an HTTP request directly into a container's port via Dockerode stream
 */
export async function proxyHttpRequestToContainer(container, targetPort, req, res) {
  try {
    const exec = await container.exec({
      Cmd: [
        "node",
        "-e",
        `const net = require('net'); const s = net.connect(${targetPort}, '127.0.0.1'); process.stdin.pipe(s); s.pipe(process.stdout); s.on('error', () => process.exit(1));`
      ],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({ hijack: true, stdin: true });

    // Construct raw HTTP request to pipe into container
    let reqHeader = `${req.method} ${req.url} HTTP/1.1\r\n`;
    for (const [k, v] of Object.entries(req.headers)) {
      if (k.toLowerCase() === "host") {
        reqHeader += `host: localhost:${targetPort}\r\n`;
      } else {
        reqHeader += `${k}: ${v}\r\n`;
      }
    }
    reqHeader += "\r\n";

    stream.write(reqHeader);
    req.pipe(stream);

    // Pipe raw HTTP response back to client socket
    docker.modem.demuxStream(stream, res.socket, process.stderr);

    stream.on("end", () => {
      try { res.end(); } catch { }
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Start periodic dynamic port forwarding monitor
 */
let forwarderInterval = null;

export function startDynamicPortForwarder() {
  if (forwarderInterval) return;
  // Run every 2 seconds
  forwarderInterval = setInterval(syncDynamicForwarders, 2000);
  syncDynamicForwarders();
  console.log("✔ Dynamic Port Forwarder initialized (real-time /proc/net/tcp monitor active)");
}

export function getActiveForwardedPorts() {
  const result = [];
  for (const [port, entry] of activeForwarders.entries()) {
    result.push({
      port,
      isRestrictedByBrowser: CHROME_RESTRICTED_PORTS.has(port),
      workspaceKey: entry.workspaceKey,
      directUrl: `http://localhost:${port}`,
      safeProxyUrl: `http://localhost:8000/proxy/${port}`,
    });
  }
  return result;
}

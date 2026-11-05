import Docker from "dockerode";
import path from "path";
import fs from "fs";
import net from "net";
import { getImageForWorkspace } from "./imageResolver.js";
import {
  registerContainer,
  getContainerEntry,
  touchContainer,
  removeContainer,
} from "./containerRegistry.js";
import User from "../models/User.js";

const docker = new Docker();

export function getContainerKey(userId, workspaceId) {
  return `${userId}-${workspaceId}`;
}

export function getSanitizedContainerName(workspaceKey) {
  return `vocodeai-${workspaceKey.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
}

export async function configureContainerEnvironment(container, workspaceKey) {
  try {
    let gitUser = "";
    let gitEmail = "";
    let gitCreds = "";

    if (workspaceKey) {
      try {
        const userId = workspaceKey.split("-")[0];
        const user = await User.findById(userId).lean();
        if (user) {
          gitUser = user.githubUsername || user.firstName || "VocodeAI Developer";
          gitEmail = user.email || "developer@vocodeai.com";

          if (user.githubAccessToken) {
            const cleanToken = user.githubAccessToken.trim();
            const ghUser = user.githubUsername || "oauth2";
            gitCreds = `
git config --global credential.helper store 2>/dev/null || true
cat << 'EOFCRED' > /root/.git-credentials
https://${ghUser}:${cleanToken}@github.com
EOFCRED
chmod 600 /root/.git-credentials 2>/dev/null || true
`;
          }
        }
      } catch (err) {
        console.warn("Could not load user for container git configuration:", err.message);
      }
    }

    const setupScript = `
printf '#!/bin/sh\\nclear\\n' > /usr/local/bin/cls
chmod +x /usr/local/bin/cls
cat << 'EOF' > /etc/vocode_bashrc
export HOME=/workspace
export TERM=xterm-256color
cd /workspace 2>/dev/null || true
alias cls='clear'
alias ll='ls -la --color=auto'
alias ls='ls --color=auto'
prompt_func() {
  local p="\${PWD}"
  PS1="\\[\\e[32m\\]\${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]\${p}\\[\\e[0m\\]\\$ "
}
PROMPT_COMMAND=prompt_func
EOF
sed -i '/vocode/d' /etc/bash.bashrc 2>/dev/null || true
sed -i '/vocode/d' /root/.bashrc 2>/dev/null || true
echo ". /etc/vocode_bashrc" >> /etc/bash.bashrc
echo ". /etc/vocode_bashrc" >> /root/.bashrc

git config --system --add safe.directory '*' 2>/dev/null || true
git config --global --add safe.directory '*' 2>/dev/null || true
git config --system core.filemode false 2>/dev/null || true
git config --global core.filemode false 2>/dev/null || true
git config --system init.defaultBranch main 2>/dev/null || true
git config --global init.defaultBranch main 2>/dev/null || true

cat << 'GITIGNORE_EOF' > /etc/gitignore_global
# Compiled class and binary files
*.class
*.out
*.o
*.obj
*.exe
*.pyc
*.pyo
*.pyd
*.so
*.dll
*.dylib
*.pdb
*.idb
*.ilk
*.map
a.out
a.exe

# OS and temporary files
.DS_Store
thumbs.db
.workspace.json

# Dependencies and build outputs
node_modules/
dist/
build/
__pycache__/
.venv/
.pytest_cache/
GITIGNORE_EOF

git config --system core.excludesfile /etc/gitignore_global 2>/dev/null || true
git config --global core.excludesfile /etc/gitignore_global 2>/dev/null || true

mkdir -p /etc/git-templates/info 2>/dev/null || true
cp /etc/gitignore_global /etc/git-templates/info/exclude 2>/dev/null || true
git config --system init.templateDir /etc/git-templates 2>/dev/null || true
git config --global init.templateDir /etc/git-templates 2>/dev/null || true
if [ -n "${gitUser}" ]; then
  git config --global user.name "${gitUser}" 2>/dev/null || true
fi
if [ -n "${gitEmail}" ]; then
  git config --global user.email "${gitEmail}" 2>/dev/null || true
fi
${gitCreds}
`;
    const exec = await container.exec({
      Cmd: ["bash", "-c", setupScript],
      AttachStdout: true,
      AttachStderr: true,
    });
    const stream = await exec.start({});
    await new Promise((resolve) => {
      stream.on("end", resolve);
      stream.resume();
    });
  } catch (err) {
    // Non-fatal if setup is slightly delayed
  }
}

const STANDARD_DEV_PORTS = [
  3000, 3001, 3002,
  4000, 4001, 4200,
  5000, 5001, 5002,
  5174, 5175,
  8000, 8001, 8008, 8080, 8081,
  8888,
  9000, 9001
];

const RESERVED_HOST_PORTS = new Set([
  Number(process.env.PORT) || 8000,
  5173, // Vite Frontend
  6379, // Redis
  27017, // MongoDB
]);

export function detectWorkspacePorts(workspacePath) {
  const detected = new Set();
  if (!workspacePath) return Array.from(detected);

  try {
    const absPath = path.resolve(workspacePath);
    if (!fs.existsSync(absPath)) return Array.from(detected);

    // 1. Scan .env
    const envFile = path.join(absPath, ".env");
    if (fs.existsSync(envFile)) {
      const txt = fs.readFileSync(envFile, "utf-8");
      const matches = txt.matchAll(/(?:PORT|APP_PORT|SERVER_PORT)\s*=\s*(\d{2,5})/gi);
      for (const m of matches) {
        const p = parseInt(m[1], 10);
        if (p >= 1024 && p <= 65535) detected.add(p);
      }
    }

    // 2. Scan package.json
    const pkgFile = path.join(absPath, "package.json");
    if (fs.existsSync(pkgFile)) {
      const txt = fs.readFileSync(pkgFile, "utf-8");
      const matches = txt.matchAll(/(?:--port|-p|PORT=)\s*(\d{2,5})/gi);
      for (const m of matches) {
        const p = parseInt(m[1], 10);
        if (p >= 1024 && p <= 65535) detected.add(p);
      }
    }

    // 3. Scan common source files
    const candidateFiles = [
      "server.js",
      "app.js",
      "index.js",
      "main.py",
      "app.py",
      "server.py",
      "application.properties",
      "application.yml",
    ];

    for (const f of candidateFiles) {
      const fp = path.join(absPath, f);
      if (fs.existsSync(fp)) {
        const txt = fs.readFileSync(fp, "utf-8");
        const matches = txt.matchAll(
          /(?:listen\s*\(\s*|PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?|server\.port\s*=\s*|port\s*=\s*)(\d{2,5})/gi
        );
        for (const m of matches) {
          const p = parseInt(m[1], 10);
          if (p >= 1024 && p <= 65535) detected.add(p);
        }
      }
    }
  } catch (err) {
    console.warn("Could not detect workspace ports:", err.message);
  }

  return Array.from(detected);
}

async function getDockerBoundPorts(excludeContainerName) {
  try {
    const containers = await docker.listContainers();
    const bound = new Set();
    for (const c of containers) {
      const names = c.Names || [];
      if (excludeContainerName && names.some((n) => n.replace(/^\//, "") === excludeContainerName)) {
        continue;
      }
      for (const p of c.Ports || []) {
        if (p.PublicPort) {
          bound.add(p.PublicPort);
        }
      }
    }
    return bound;
  } catch {
    return new Set();
  }
}

function isPortAvailable(port) {
  if (RESERVED_HOST_PORTS.has(port)) return false;
  return new Promise((resolve) => {
    const s4 = net.createServer();
    s4.once("error", () => resolve(false));
    s4.once("listening", () => {
      const s6 = net.createServer();
      s6.once("error", () => {
        s4.close();
        resolve(false);
      });
      s6.once("listening", () => {
        s6.close();
        s4.close();
        resolve(true);
      });
      s6.listen({ port, host: "::", exclusive: true });
    });
    s4.listen({ port, host: "0.0.0.0", exclusive: true });
  });
}

function isContainerUsable(inspectData, workspacePath = null) {
  if (!inspectData || !inspectData.HostConfig) return false;
  const pb = inspectData.HostConfig.PortBindings || {};

  // Check if any explicitly detected workspace port is missing from PortBindings
  if (workspacePath) {
    const neededPorts = detectWorkspacePorts(workspacePath);
    for (const p of neededPorts) {
      const key = `${p}/tcp`;
      if (!pb[key] || pb[key].length === 0) {
        return false;
      }
    }
  }

  // Ensure dev ports are bound
  const hasDevPort = Object.keys(pb).some((k) => pb[k] && pb[k].length > 0);
  if (!hasDevPort) return false;

  if (inspectData.State?.Running) {
    const networks = inspectData.NetworkSettings?.Networks;
    const ports = inspectData.NetworkSettings?.Ports;
    if (!networks || Object.keys(networks).length === 0) {
      return false;
    }
    if (!ports || Object.keys(ports).length === 0) {
      return false;
    }
  }
  return true;
}

export async function getAvailableDevPortBindings(workspacePath = null, containerName = null) {
  const exposedPorts = {};
  const portBindings = {};
  const assignedHostPorts = new Set();

  const detectedPorts = workspacePath ? detectWorkspacePorts(workspacePath) : [];
  const candidatePorts = Array.from(new Set([...detectedPorts, ...STANDARD_DEV_PORTS]));

  const dockerBound = await getDockerBoundPorts(containerName);

  for (const port of candidatePorts) {
    // If user's project wants port 8000 while host 8000 is occupied by VocodeAI backend:
    if (port === 8000 && RESERVED_HOST_PORTS.has(8000)) {
      for (const alt of [8005, 8008, 8085]) {
        if (!assignedHostPorts.has(alt) && !dockerBound.has(alt) && (await isPortAvailable(alt))) {
          exposedPorts["8000/tcp"] = {};
          portBindings["8000/tcp"] = [{ HostPort: String(alt) }];
          assignedHostPorts.add(alt);
          break;
        }
      }
      continue;
    }

    if (!assignedHostPorts.has(port) && !dockerBound.has(port) && (await isPortAvailable(port))) {
      exposedPorts[`${port}/tcp`] = {};
      portBindings[`${port}/tcp`] = [{ HostPort: String(port) }];
      assignedHostPorts.add(port);
    }
  }

  // Ensure port 5000 is always at least exposed as fallback if not bound
  if (!exposedPorts["5000/tcp"]) {
    exposedPorts["5000/tcp"] = {};
    if (!assignedHostPorts.has(5000) && !dockerBound.has(5000) && (await isPortAvailable(5000))) {
      portBindings["5000/tcp"] = [{ HostPort: "5000" }];
      assignedHostPorts.add(5000);
    }
  }

  return { exposedPorts, portBindings, detectedPorts };
}

export async function getOrCreateContainer({
  workspaceKey,
  workspacePath,
}) {
  const containerName = getSanitizedContainerName(workspaceKey);

  // 1. Check in-memory registry first
  const existing = getContainerEntry(workspaceKey);
  if (existing) {
    try {
      const inspectData = await existing.container.inspect();
      if (!isContainerUsable(inspectData, workspacePath)) {
        await existing.container.stop({ t: 1 }).catch(() => {});
        await existing.container.remove({ force: true }).catch(() => {});
        removeContainer(workspaceKey);
      } else if (inspectData.State.Running) {
        touchContainer(workspaceKey);
        configureContainerEnvironment(existing.container, workspaceKey);
        return existing.container;
      } else {
        await existing.container.start();
        touchContainer(workspaceKey);
        configureContainerEnvironment(existing.container, workspaceKey);
        return existing.container;
      }
    } catch {
      removeContainer(workspaceKey);
    }
  }

  // 2. Check if a container with this predictable name already exists in Docker daemon
  try {
    const existingDocker = docker.getContainer(containerName);
    const data = await existingDocker.inspect();
    if (!isContainerUsable(data, workspacePath)) {
      await existingDocker.stop({ t: 1 }).catch(() => {});
      await existingDocker.remove({ force: true }).catch(() => {});
      removeContainer(workspaceKey);
    } else {
      if (!data.State.Running) {
        await existingDocker.start();
      }
      registerContainer(workspaceKey, existingDocker);
      touchContainer(workspaceKey);
      configureContainerEnvironment(existingDocker, workspaceKey);
      return existingDocker;
    }
  } catch {
    // Container does not exist yet in Docker daemon
  }

  // 3. Ensure any conflicting container is cleaned up before creating fresh
  try {
    const leftover = docker.getContainer(containerName);
    await leftover.stop({ t: 1 }).catch(() => {});
    await leftover.remove({ force: true }).catch(() => {});
  } catch {}

  // 4. Create a fresh container with volume mount and dynamic port forwarding
  const image = getImageForWorkspace();
  const absolutePath = path.resolve(workspacePath);
  const { exposedPorts, portBindings } = await getAvailableDevPortBindings(
    absolutePath,
    containerName
  );

  const container = await docker.createContainer({
    name: containerName,
    Image: image,
    Tty: true,
    OpenStdin: true,
    WorkingDir: "/workspace",
    ExposedPorts: exposedPorts,
    HostConfig: {
      Binds: [`${absolutePath}:/workspace`],
      PortBindings: portBindings,
      Memory: 1024 * 1024 * 1024,
      CpuShares: 512,
      PidsLimit: 256,
    },
  });

  await container.start();
  registerContainer(workspaceKey, container);
  touchContainer(workspaceKey);
  configureContainerEnvironment(container, workspaceKey);

  return container;
}

export async function stopAndRemoveContainer(workspaceKey) {
  const entry = getContainerEntry(workspaceKey);
  const container = entry?.container || docker.getContainer(getSanitizedContainerName(workspaceKey));

  if (container) {
    try {
      await container.stop({ t: 3 });
    } catch {}

    try {
      await container.remove({ force: true });
    } catch {}
  }

  removeContainer(workspaceKey);
}

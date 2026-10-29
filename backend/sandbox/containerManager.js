import Docker from "dockerode";
import path from "path";
import { getImageForWorkspace } from "./imageResolver.js";
import {
  registerContainer,
  getContainerEntry,
  touchContainer,
  removeContainer,
} from "./containerRegistry.js";

const docker = new Docker();

export function getContainerKey(userId, workspaceId) {
  return `${userId}-${workspaceId}`;
}

export function getSanitizedContainerName(workspaceKey) {
  return `vocodeai-${workspaceKey.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
}

export async function configureContainerEnvironment(container) {
  try {
    const setupScript = `
printf '#!/bin/sh\\nclear\\n' > /usr/local/bin/cls
chmod +x /usr/local/bin/cls
cat << 'EOF' > /etc/vocode_bashrc
alias cls='clear'
alias ll='ls -la'
PROMPT_COMMAND='PS1="\\[\\e[32m\\]\${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]\${PWD/#\\/workspace/~\\/workspace}\\[\\e[0m\\]\\$ "'
EOF
sed -i '/vocode/d' /etc/bash.bashrc 2>/dev/null || true
sed -i '/vocode/d' /root/.bashrc 2>/dev/null || true
echo ". /etc/vocode_bashrc" >> /etc/bash.bashrc
echo ". /etc/vocode_bashrc" >> /root/.bashrc
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

export async function getOrCreateContainer({
  workspaceKey,
  workspacePath,
}) {
  // 1. Check in-memory registry first
  const existing = getContainerEntry(workspaceKey);
  if (existing) {
    try {
      const inspectData = await existing.container.inspect();
      if (inspectData.State.Running) {
        touchContainer(workspaceKey);
        configureContainerEnvironment(existing.container);
        return existing.container;
      } else {
        await existing.container.start();
        touchContainer(workspaceKey);
        configureContainerEnvironment(existing.container);
        return existing.container;
      }
    } catch {
      removeContainer(workspaceKey);
    }
  }

  // 2. Check if a container with this predictable name already exists in Docker daemon
  const containerName = getSanitizedContainerName(workspaceKey);
  try {
    const existingDocker = docker.getContainer(containerName);
    const data = await existingDocker.inspect();
    if (!data.State.Running) {
      await existingDocker.start();
    }
    registerContainer(workspaceKey, existingDocker);
    touchContainer(workspaceKey);
    configureContainerEnvironment(existingDocker);
    return existingDocker;
  } catch {
    // Container does not exist yet in Docker daemon
  }

  // 3. Create a fresh container with volume mount
  const image = getImageForWorkspace();
  const absolutePath = path.resolve(workspacePath);

  const container = await docker.createContainer({
    name: containerName,
    Image: image,
    Tty: true,
    OpenStdin: true,
    WorkingDir: "/workspace",
    HostConfig: {
      Binds: [`${absolutePath}:/workspace`],
      Memory: 1024 * 1024 * 1024,
      CpuShares: 512,
      PidsLimit: 256,
    },
  });

  await container.start();
  registerContainer(workspaceKey, container);
  touchContainer(workspaceKey);
  configureContainerEnvironment(container);

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

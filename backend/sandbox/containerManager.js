import Docker from "dockerode";
import path from "path";
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
alias cls='clear'
alias ll='ls -la'
PROMPT_COMMAND='PS1="\\[\\e[32m\\]\${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]\${PWD/#\\/workspace/~}\\[\\e[0m\\]\\$ "'
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
  const containerName = getSanitizedContainerName(workspaceKey);
  try {
    const existingDocker = docker.getContainer(containerName);
    const data = await existingDocker.inspect();
    if (!data.State.Running) {
      await existingDocker.start();
    }
    registerContainer(workspaceKey, existingDocker);
    touchContainer(workspaceKey);
    configureContainerEnvironment(existingDocker, workspaceKey);
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

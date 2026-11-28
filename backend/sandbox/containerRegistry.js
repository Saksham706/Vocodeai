const containers = new Map();

export function registerContainer(workspaceId, container, idleTimeoutMs = null) {
  containers.set(workspaceId, {
    container,
    lastUsed: Date.now(),
    idleTimeoutMs,
  });
}

export function touchContainer(workspaceId) {
  const entry = containers.get(workspaceId);
  if (entry) entry.lastUsed = Date.now();
}

export function getContainerEntry(workspaceId) {
  return containers.get(workspaceId);
}

export function removeContainer(workspaceId) {
  containers.delete(workspaceId);
}

export function getAllContainers() {
  return containers;
}

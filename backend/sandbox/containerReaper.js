import { getAllContainers } from "./containerRegistry.js";
import { stopAndRemoveContainer, cleanupOrphanedContainers } from "./containerManager.js";

const IDLE_TIMEOUT =
  Number(process.env.CONTAINER_IDLE_TIMEOUT) ||
  15 * 60 * 1000;

export function startContainerReaper() {
  setInterval(async () => {
    const now = Date.now();

    for (const [workspaceId, entry] of getAllContainers()) {
      const timeout = entry.idleTimeoutMs || IDLE_TIMEOUT;
      if (now - entry.lastUsed > timeout) {
        console.log(`[REAPER] Stopping idle container: ${workspaceId}`);
        await stopAndRemoveContainer(workspaceId);
      }
    }

    // Periodically remove exited containers so host ports are freed
    try {
      await cleanupOrphanedContainers();
    } catch {}
  }, 60 * 1000);
}

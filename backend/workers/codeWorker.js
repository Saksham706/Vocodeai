import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { execInWorkspace } from "../sandbox/execService.js";
import { syncWorkspaceToDB } from "../services/syncService.js";

export function startCodeWorker() {
  try {
    const worker = new Worker(
      "code-execution",
      async (job) => {
        const { userId, workspaceId, workspacePath, command, mode } = job.data;
        const executionMode = mode || "single";

        if (executionMode === "single") {
          const result = await execInWorkspace({
            userId,
            workspaceId,
            workspacePath,
            command,
          });

          await syncWorkspaceToDB(userId, workspaceId);
          return result;
        }

        if (executionMode === "server") {
          await execInWorkspace({
            userId,
            workspaceId,
            workspacePath,
            command,
            detach: true,
          });

          return { started: true };
        }
      },
      {
        connection: redisConnection,
        concurrency: 2,
      }
    );

    worker.on("completed", (job) => {
      console.log(`[WORKER] Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.error(`[WORKER] Job ${job?.id} failed:`, err.message);
    });

    console.log("🔥 Multi-project worker started");
    return worker;
  } catch (err) {
    console.error("Worker start error:", err.message);
  }
}

// Allow standalone execution
if (process.argv[1]?.endsWith("codeWorker.js")) {
  startCodeWorker();
}

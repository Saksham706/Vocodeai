import { getOrCreateContainer } from "./containerManager.js";
import { touchContainer } from "./containerRegistry.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";

function getContainerKey(userId, workspaceId) {
  return `${userId}-${workspaceId}`;
}

export async function execInWorkspace({
  userId,
  workspaceId,
  workspacePath,
  command,
  detach = false,
}) {
  try {
    /* ========================================= */
    /* HYDRATE WORKSPACE FROM MONGODB            */
    /* ========================================= */

    await hydrateWorkspace(userId, workspaceId);

    /* ========================================= */
    /* CONTAINER                                */
    /* ========================================= */

    const key = getContainerKey(userId, workspaceId);

    const container = await getOrCreateContainer({
      workspaceKey: key,
      workspacePath,
    });

    touchContainer(key);

    /* ========================================= */
    /* EXEC                                      */
    /* ========================================= */

    const execInstance = await container.exec({
      Cmd: ["bash", "-lc", command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      WorkingDir: "/workspace",
    });

    /* ========================================= */
    /* DETACHED MODE                             */
    /* ========================================= */

    if (detach) {
      await execInstance.start({
        hijack: true,
        stdin: false,
      });

      return {
        started: true,
      };
    }

    /* ========================================= */
    /* NORMAL EXECUTION                          */
    /* ========================================= */

    const stream = await execInstance.start({
      hijack: true,
      stdin: false,
    });

    return new Promise((resolve, reject) => {
      let output = "";

      stream.on("data", (chunk) => {
        output += chunk.toString();
      });

      stream.on("end", async () => {
        resolve({
          success: true,
          output,
        });
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });

  } catch (err) {
    console.error("EXEC WORKSPACE ERROR:", err);

    return {
      success: false,
      output: "",
      error: err.message,
    };
  }
}
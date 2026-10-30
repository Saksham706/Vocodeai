import os from "os";
import path from "path";

/**
 * Returns the root directory where active workspace files are mounted for Docker.
 * Defaults to OS temp folder so it never pollutes the repository or backend directory.
 */
export function getWorkspacesRoot() {
  if (
    process.env.WORKSPACES_ROOT &&
    process.env.WORKSPACES_ROOT !== "workspaces" &&
    path.isAbsolute(process.env.WORKSPACES_ROOT)
  ) {
    return process.env.WORKSPACES_ROOT;
  }
  return path.join(os.tmpdir(), "vocodeai-workspaces");
}


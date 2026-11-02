import pty from "node-pty";

export function createDockerPty(
  containerId,
  shell = "bash",
  username = "user",
  cols = 120,
  rows = 30
) {
  const isNode = shell === "node";
  const isSh = shell === "sh";

  const cleanUser =
    (username || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "user";

  const termCols = Math.max(20, Math.min(Number(cols) || 120, 500));
  const termRows = Math.max(5, Math.min(Number(rows) || 30, 200));

  const execArgs = [
    "exec",
    "-it",
    "-w",
    "/workspace",
    "-e",
    "TERM=xterm-256color",
    "-e",
    `COLUMNS=${termCols}`,
    "-e",
    `LINES=${termRows}`,
    "-e",
    `TERM_USER=${cleanUser}`,
    containerId,
  ];

  if (isNode) {
    execArgs.push("node");
  } else if (isSh) {
    execArgs.push("sh");
  } else {
    execArgs.push("bash");
    execArgs.push("-l");
  }

  return pty.spawn("docker", execArgs, {
    name: "xterm-256color",
    cols: termCols,
    rows: termRows,
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      TERM_USER: cleanUser,
    },
  });
}

export function createLocalPty(
  workspacePath,
  shell = "bash",
  cols = 120,
  rows = 30
) {
  const isWindows = process.platform === "win32";
  let shellCmd = isWindows ? "powershell.exe" : "/bin/bash";

  if (shell === "node") {
    shellCmd = "node";
  } else if (shell === "sh" && !isWindows) {
    shellCmd = "/bin/sh";
  } else if (shell === "cmd" && isWindows) {
    shellCmd = "cmd.exe";
  }

  const termCols = Math.max(20, Math.min(Number(cols) || 120, 500));
  const termRows = Math.max(5, Math.min(Number(rows) || 30, 200));

  return pty.spawn(shellCmd, [], {
    name: "xterm-256color",
    cols: termCols,
    rows: termRows,
    cwd: workspacePath || process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
    },
  });
}

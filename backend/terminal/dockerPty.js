import fs from "fs";
import os from "os";
import path from "path";
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
    "-e",
    "HOME=/workspace",
    "-e",
    "PWD=/workspace",
    containerId,
  ];

  if (isNode) {
    execArgs.push("node");
  } else if (isSh) {
    execArgs.push("sh");
  } else {
    // Force bash to load the custom vocode bashrc and run interactively with clean prompt
    execArgs.push("bash", "--rcfile", "/etc/vocode_bashrc", "-i");
  }

  const isWindows = process.platform === "win32";
  const dockerCmd = isWindows ? "docker.exe" : "docker";

  return pty.spawn(dockerCmd, execArgs, {
    name: "xterm-256color",
    cols: termCols,
    rows: termRows,
    cwd: process.cwd(),
    useConpty: false,
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
  rows = 30,
  username = "user"
) {
  const isWindows = process.platform === "win32";
  const cleanUser =
    (username || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "user";
  let shellCmd = isWindows ? "powershell.exe" : "/bin/bash";
  let shellArgs = [];

  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  if (isWindows && shell === "bash" && fs.existsSync(gitBash)) {
    shellCmd = gitBash;
    shellArgs = ["--login", "-i"];
  } else if (shell === "node") {
    shellCmd = "node";
  } else if (shell === "sh" && !isWindows) {
    shellCmd = "/bin/sh";
  } else if (shell === "cmd" && isWindows) {
    shellCmd = "cmd.exe";
  } else if (isWindows) {
    shellArgs = ["-NoLogo"];
  } else if (!isWindows) {
    const rcPath = path.join(os.tmpdir(), "vocode_local_bashrc");
    try {
      const rcContent = [
        "export TERM=xterm-256color",
        "alias cls='clear'",
        "alias ll='ls -la --color=auto'",
        "alias ls='ls --color=auto'",
        "prompt_func() {",
        '  local p="${PWD}"',
        '  if [ -n "$VOCODE_WS_ROOT" ] && [[ "$p" == "$VOCODE_WS_ROOT"* ]]; then',
        '    p="/workspace${p#$VOCODE_WS_ROOT}"',
        "  fi",
        '  PS1="\\[\\e[32m\\]${TERM_USER:-user}@vocodeai\\[\\e[0m\\]:\\[\\e[34;1m\\]${p}\\[\\e[0m\\]\\$ "',
        "}",
        "PROMPT_COMMAND=prompt_func",
        "",
      ].join("\n");
      fs.writeFileSync(rcPath, rcContent, "utf8");
      shellArgs = ["--rcfile", rcPath, "-i"];
    } catch {
      shellArgs = ["-i"];
    }
  }

  const termCols = Math.max(20, Math.min(Number(cols) || 120, 500));
  const termRows = Math.max(5, Math.min(Number(rows) || 30, 200));

  return pty.spawn(shellCmd, shellArgs, {
    name: "xterm-256color",
    cols: termCols,
    rows: termRows,
    cwd: workspacePath || process.cwd(),
    useConpty: false,
    env: {
      ...process.env,
      TERM: "xterm-256color",
      TERM_USER: cleanUser,
      VOCODE_WS_ROOT: workspacePath || "",
    },
  });
}

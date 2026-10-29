import pty from "node-pty";

export function createDockerPty(containerId, shell = "bash", username = "user") {
  const isNode = shell === "node";
  const isSh = shell === "sh";

  const cleanUser =
    (username || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "user";

  const execArgs = [
    "exec",
    "-it",
    "-w",
    "/workspace",
    "-e",
    "TERM=xterm-256color",
    "-e",
    "COLUMNS=120",
    "-e",
    "LINES=30",
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
    cols: 120,
    rows: 30,
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      TERM_USER: cleanUser,
    },
  });
}

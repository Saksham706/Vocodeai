import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import util from "util";
import { getWorkspacesRoot } from "../config/paths.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";
import { syncWorkspaceToDB, isIgnoredFile } from "../services/syncService.js";
import { askAI } from "../services/aiService.js";
import User from "../models/User.js";
import { getValidGoogleAccessToken } from "../utils/googleAuthHelper.js";

const DEFAULT_GITIGNORE = `# Compiled class and binary files
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

# OS, credentials and temporary files
.DS_Store
thumbs.db
.workspace.json
.git-credentials

# Dependencies, caches and build outputs
node_modules/
.npm/
.cache/
dist/
build/
__pycache__/
.venv/
.pytest_cache/
`;

async function cleanTrackedIgnoredFiles(wsPath) {
  try {
    const lsRes = await runGit(wsPath, ["ls-files"]);
    if (lsRes.stdout) {
      const tracked = lsRes.stdout.split("\n").map((s) => s.trim()).filter(Boolean);
      const toUntrack = tracked.filter((f) => isIgnoredFile(f) && f !== ".gitignore");
      if (toUntrack.length > 0) {
        await runGit(wsPath, ["rm", "--cached", "--ignore-unmatch", "--", ...toUntrack]);
      }
    }
  } catch (err) {
    console.warn("cleanTrackedIgnoredFiles notice:", err.message);
  }
}

async function ensureGitignore(wsPath) {
  try {
    const gitDir = path.join(wsPath, ".git");
    if (!fs.existsSync(gitDir)) return;

    const gitignorePath = path.join(wsPath, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, DEFAULT_GITIGNORE, "utf-8");
      await runGit(wsPath, ["add", ".gitignore"]);
    } else {
      let content = fs.readFileSync(gitignorePath, "utf-8");
      let changed = false;
      const criticalEntries = ["*.class", "*.out", "*.exe", "*.pyc", "node_modules/", ".npm/", ".cache/", ".git-credentials", "dist/", "build/"];
      for (const entry of criticalEntries) {
        if (!content.includes(entry)) {
          content += `\n${entry}`;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(gitignorePath, content.trim() + "\n", "utf-8");
      }
    }

    // Untrack any previously committed files that should be ignored
    await cleanTrackedIgnoredFiles(wsPath);
  } catch (err) {
    console.warn("ensureGitignore notice:", err.message);
  }
}

let globalExcludesPath = null;
function getGlobalExcludesPath() {
  if (globalExcludesPath) return globalExcludesPath;
  try {
    const p = path.join(getWorkspacesRoot(), ".gitignore_global");
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, DEFAULT_GITIGNORE, "utf-8");
    } else {
      let content = fs.readFileSync(p, "utf-8");
      let changed = false;
      for (const entry of [".npm/", ".cache/", ".git-credentials"]) {
        if (!content.includes(entry)) {
          content += `\n${entry}`;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(p, content.trim() + "\n", "utf-8");
      }
    }
    globalExcludesPath = p.replace(/\\/g, "/");
    return globalExcludesPath;
  } catch {
    return null;
  }
}

const execFileAsync = util.promisify(execFile);

/**
 * Execute a git command inside a workspace's directory safely.
 */
async function runGit(workspaceDir, args, envOptions = {}) {
  const defaultEnv = {
    ...process.env,
    GIT_TERMINAL_PROMPT: "0", // Prevent hanging on interactive credential prompts
    LANG: "en_US.UTF-8",
  };

  const excludesFile = getGlobalExcludesPath();
  const finalArgs = [
    "-c", "safe.directory=*",
    "-c", "core.filemode=false",
    "-c", "core.longpaths=true",
    ...(excludesFile ? ["-c", `core.excludesFile=${excludesFile}`] : []),
    ...args
  ];

  try {
    const { stdout, stderr } = await execFileAsync("git", finalArgs, {
      cwd: workspaceDir,
      env: { ...defaultEnv, ...envOptions },
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { stdout: stdout.trimEnd(), stderr: stderr.trim(), exitCode: 0 };
  } catch (err) {
    const stdout = (err.stdout || "").toString().trimEnd();
    let stderr = (err.stderr || "").toString().trim();
    if (!stderr) {
      stderr = stdout || err.message || "Git command failed";
    }
    return {
      stdout,
      stderr,
      exitCode: err.code || 1,
      error: err,
    };
  }
}

/**
 * Helper to get workspace filesystem path and ensure directory exists.
 */
async function getWorkspacePath(userId, workspaceId) {
  const wsPath = path.join(getWorkspacesRoot(), String(userId), String(workspaceId));
  if (!fs.existsSync(wsPath)) {
    fs.mkdirSync(wsPath, { recursive: true });
    await hydrateWorkspace(userId, workspaceId);
  }
  return wsPath;
}

/**
 * Helper to get user's git author signature
 */
async function getUserGitSignature(userId) {
  try {
    const user = await User.findById(userId).lean();
    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.name || "VocodeAI Developer";
    const email = user?.email || "developer@vocodeai.com";
    return { name, email };
  } catch {
    return { name: "VocodeAI Developer", email: "developer@vocodeai.com" };
  }
}

/**
 * Helper to ensure user's Git credentials, author signature, and authentication
 * URL rewrites are configured on the local repository.
 */
export async function ensureGitCredentials(wsPath, userId, explicitToken = null) {
  try {
    const gitDir = path.join(wsPath, ".git");
    if (!fs.existsSync(gitDir)) return;

    let token = explicitToken?.trim() || null;
    let username = null;
    let name = "VocodeAI Developer";
    let email = "developer@vocodeai.com";

    if (userId) {
      try {
        const user = await User.findById(userId).lean();
        if (user) {
          if (!token && user.githubAccessToken) {
            token = user.githubAccessToken.trim();
          }
          username = user.githubUsername ? user.githubUsername.trim() : null;
          name = user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.name || "VocodeAI Developer";
          email = user.email || "developer@vocodeai.com";
        }
      } catch { }
    }

    // Configure author signature
    await runGit(wsPath, ["config", "user.name", name]);
    await runGit(wsPath, ["config", "user.email", email]);

    // If GitHub token is present, configure URL rewrite so all Git operations
    // targeting github.com automatically authenticate without password prompts
    if (token) {
      const authUser = username ? encodeURIComponent(username) : "x-access-token";
      const authPrefix = `https://${authUser}:${token}@github.com/`;
      await runGit(wsPath, [
        "config",
        `url.${authPrefix}.insteadOf`,
        "https://github.com/",
      ]);
      await runGit(wsPath, ["config", "credential.helper", "store"]);
    }
  } catch (err) {
    console.warn("ensureGitCredentials notice:", err.message);
  }
}

/**
 * Computes complete Git repository status data including ahead/behind counts.
 */
export async function getGitStatusData(wsPath, userId) {
  const gitDir = path.join(wsPath, ".git");
  if (!fs.existsSync(gitDir)) {
    return {
      isRepo: false,
      branch: null,
      clean: true,
      staged: [],
      unstaged: [],
      untracked: [],
      ahead: 0,
      behind: 0,
      remotes: [],
    };
  }

  await ensureGitignore(wsPath);
  if (userId) {
    await ensureGitCredentials(wsPath, userId);
  }

  // 1. Get current branch
  const branchRes = await runGit(wsPath, ["branch", "--show-current"]);
  let currentBranch = branchRes.stdout;
  if (!currentBranch) {
    const headRes = await runGit(wsPath, ["rev-parse", "--abbrev-ref", "HEAD"]);
    currentBranch = headRes.stdout || "main";
  }

  // 2. Get porcelain status
  const statusRes = await runGit(wsPath, [
    "status",
    "--porcelain=v1",
    "-uall",
  ]);

  const staged = [];
  const unstaged = [];
  const untracked = [];

  if (statusRes.stdout) {
    const lines = statusRes.stdout.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");
      if (!line || line.length < 3) continue;
      const x = line[0];
      const y = line[1];
      let rawPath = line.substring(2).trim().replace(/^"(.*)"$/, "$1");
      if (rawPath.includes(" -> ")) {
        rawPath = rawPath.split(" -> ").pop().trim().replace(/^"(.*)"$/, "$1");
      }

      const isIgnored = isIgnoredFile(rawPath) && rawPath !== ".gitignore";
      if (isIgnored) {
        if (x === "?" || (x === " " && y !== " ")) {
          continue;
        }
      }

      if (x !== " " && x !== "?" && x !== "!") {
        staged.push({ path: rawPath, status: x });
      }
      if (y !== " " && y !== "?" && y !== "!") {
        unstaged.push({ path: rawPath, status: y });
      }
      if (x === "?" && y === "?") {
        untracked.push({ path: rawPath, status: "U" });
      }
    }
  }

  // 3. Get remotes
  const remoteRes = await runGit(wsPath, ["remote", "-v"]);
  const remotesMap = new Map();
  if (remoteRes.stdout) {
    for (const rLine of remoteRes.stdout.split("\n")) {
      const parts = rLine.trim().split(/\s+/);
      if (parts.length >= 2) {
        remotesMap.set(parts[0], parts[1]);
      }
    }
  }
  const remotes = Array.from(remotesMap.entries()).map(([name, url]) => ({
    name,
    url,
  }));

  // 4. Ahead / Behind calculation
  let ahead = 0;
  let behind = 0;
  const revCountRes = await runGit(wsPath, [
    "rev-list",
    "--left-right",
    "--count",
    "HEAD...@{u}",
  ]);

  if (revCountRes.exitCode === 0 && revCountRes.stdout) {
    const counts = revCountRes.stdout.split(/\s+/);
    if (counts.length >= 2) {
      ahead = parseInt(counts[0], 10) || 0;
      behind = parseInt(counts[1], 10) || 0;
    }
  } else {
    // Fallback 1: Compare against origin/<currentBranch>
    const originBranchRes = await runGit(wsPath, [
      "rev-list",
      "--left-right",
      "--count",
      `HEAD...origin/${currentBranch}`,
    ]);
    if (originBranchRes.exitCode === 0 && originBranchRes.stdout) {
      const counts = originBranchRes.stdout.split(/\s+/);
      if (counts.length >= 2) {
        ahead = parseInt(counts[0], 10) || 0;
        behind = parseInt(counts[1], 10) || 0;
      }
      await runGit(wsPath, ["branch", `--set-upstream-to=origin/${currentBranch}`, currentBranch]);
    } else if (remotes.length > 0) {
      // Fallback 2: Check commits ahead of origin/main
      const mainCountRes = await runGit(wsPath, [
        "rev-list",
        "--count",
        "origin/main..HEAD",
      ]);
      if (mainCountRes.exitCode === 0 && mainCountRes.stdout) {
        ahead = parseInt(mainCountRes.stdout.trim(), 10) || 0;
      } else {
        // Fallback 3: Count total commits in HEAD if not pushed at all
        const totalCommitsRes = await runGit(wsPath, ["rev-list", "--count", "HEAD"]);
        if (totalCommitsRes.exitCode === 0 && totalCommitsRes.stdout) {
          ahead = parseInt(totalCommitsRes.stdout.trim(), 10) || 0;
        }
      }
    }
  }

  return {
    isRepo: true,
    branch: currentBranch,
    clean: staged.length === 0 && unstaged.length === 0 && untracked.length === 0,
    staged,
    unstaged,
    untracked,
    ahead,
    behind,
    remotes,
  };
}

/* ================= 1. GET STATUS ================= */
export async function getStatus(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const data = await getGitStatusData(wsPath, req.user.id);
    res.json(data);
  } catch (err) {
    console.error("GIT STATUS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}


/* ================= 2. INITIALIZE REPO ================= */
export async function initRepo(req, res) {
  try {
    const { workspaceId, defaultBranch = "main" } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const { name, email } = await getUserGitSignature(req.user.id);

    // Ensure standard .gitignore exists and untracks any ignored files
    await ensureGitignore(wsPath);

    const initRes = await runGit(wsPath, ["init", "-b", defaultBranch]);
    if (initRes.exitCode !== 0) {
      return res.status(500).json({ error: initRes.stderr || "Git init failed" });
    }

    // Set local author config
    await runGit(wsPath, ["config", "user.name", name]);
    await runGit(wsPath, ["config", "user.email", email]);

    // Ensure .gitignore is automatically added
    await runGit(wsPath, ["add", ".gitignore"]);

    res.json({ success: true, message: `Initialized empty Git repository on branch ${defaultBranch}` });
  } catch (err) {
    console.error("GIT INIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 3. STAGE FILES ================= */
export async function stageFiles(req, res) {
  try {
    const { workspaceId, files, all } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    await ensureGitignore(wsPath);

    if (all) {
      const addRes = await runGit(wsPath, ["add", "-A"]);
      await cleanTrackedIgnoredFiles(wsPath);
      if (addRes.exitCode !== 0) {
        return res.status(500).json({ error: addRes.stderr || "Failed to stage all files" });
      }
    } else if (Array.isArray(files) && files.length > 0) {
      const validFiles = files.filter((f) => !isIgnoredFile(f) || f === ".gitignore");
      if (validFiles.length > 0) {
        const addRes = await runGit(wsPath, ["add", "--", ...validFiles]);
        if (addRes.exitCode !== 0) {
          return res.status(500).json({ error: addRes.stderr || "Failed to stage selected files" });
        }
      }
    } else {
      return res.status(400).json({ error: "Specify files or all: true" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("GIT STAGE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 4. UNSTAGE FILES ================= */
export async function unstageFiles(req, res) {
  try {
    const { workspaceId, files, all } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    if (all) {
      let resetRes = await runGit(wsPath, ["restore", "--staged", "."]);
      if (resetRes.exitCode !== 0) {
        resetRes = await runGit(wsPath, ["reset", "HEAD", "--", "."]);
      }
      if (resetRes.exitCode !== 0) {
        resetRes = await runGit(wsPath, ["rm", "--cached", "-r", "--", "."]);
      }
      if (resetRes.exitCode !== 0) {
        return res.status(500).json({ error: resetRes.stderr || "Failed to unstage all files" });
      }
    } else if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        let resetRes = await runGit(wsPath, ["restore", "--staged", "--", f]);
        if (resetRes.exitCode !== 0) {
          resetRes = await runGit(wsPath, ["reset", "HEAD", "--", f]);
        }
        if (resetRes.exitCode !== 0) {
          resetRes = await runGit(wsPath, ["rm", "--cached", "-r", "--", f]);
        }
        if (resetRes.exitCode !== 0) {
          return res.status(500).json({ error: resetRes.stderr || `Failed to unstage ${f}` });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("GIT UNSTAGE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 5. COMMIT ================= */
export async function commit(req, res) {
  try {
    const { workspaceId, message, stageAll, amend } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Commit message cannot be empty" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    await ensureGitignore(wsPath);
    await cleanTrackedIgnoredFiles(wsPath);

    const { name, email } = await getUserGitSignature(req.user.id);

    // 1. Check if there are staged changes in git index
    const diffCachedRes = await runGit(wsPath, ["diff", "--cached", "--quiet"]);
    const hasStaged = diffCachedRes.exitCode !== 0;

    // 2. If nothing is staged or stageAll requested, auto-stage tracked and untracked changes
    if (!hasStaged || stageAll) {
      await runGit(wsPath, ["add", "-A"]);
      await cleanTrackedIgnoredFiles(wsPath);
    }

    // 3. Verify there is something to commit
    const finalDiffRes = await runGit(wsPath, ["diff", "--cached", "--quiet"]);
    if (finalDiffRes.exitCode === 0 && !amend) {
      return res.status(400).json({ error: "There are no changes to commit in this workspace." });
    }

    const commitArgs = [
      "-c",
      `user.name=${name}`,
      "-c",
      `user.email=${email}`,
      "commit",
    ];

    if (amend) commitArgs.push("--amend");
    commitArgs.push("-m", message.trim());

    const commitRes = await runGit(wsPath, commitArgs);
    if (commitRes.exitCode !== 0) {
      const errorMsg = commitRes.stderr || commitRes.stdout || "Commit failed";
      return res.status(500).json({ error: errorMsg });
    }

    res.json({
      success: true,
      output: commitRes.stdout,
      message: "Committed changes successfully",
    });
  } catch (err) {
    console.error("GIT COMMIT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 6. DISCARD CHANGES ================= */
export async function discardChanges(req, res) {
  try {
    const { workspaceId, files, all } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    if (all) {
      await runGit(wsPath, ["restore", "."]);
      await runGit(wsPath, ["clean", "-fd"]);
    } else if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        // Try restoring tracked
        const restoreRes = await runGit(wsPath, ["restore", "--", f]);
        if (restoreRes.exitCode !== 0) {
          // If untracked file, clean it
          await runGit(wsPath, ["clean", "-fd", "--", f]);
        }
      }
    }

    // Sync state back to MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    res.json({ success: true, message: "Discarded changes" });
  } catch (err) {
    console.error("GIT DISCARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 7. GET BRANCHES & SWITCH ================= */
export async function getBranches(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const branchRes = await runGit(wsPath, ["branch", "-a"]);

    const branches = [];
    let current = "main";

    if (branchRes.stdout) {
      for (const line of branchRes.stdout.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const isCurrent = trimmed.startsWith("* ");
        const name = isCurrent ? trimmed.substring(2) : trimmed;
        if (isCurrent) current = name;
        branches.push({ name, isCurrent });
      }
    }

    res.json({ current, branches });
  } catch (err) {
    console.error("GIT BRANCHES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function createOrCheckoutBranch(req, res) {
  try {
    const { workspaceId, branchName, createNew } = req.body;
    if (!workspaceId || !branchName) {
      return res.status(400).json({ error: "workspaceId and branchName required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const args = createNew
      ? ["checkout", "-b", branchName.trim()]
      : ["checkout", branchName.trim()];

    const coRes = await runGit(wsPath, args);
    if (coRes.exitCode !== 0) {
      return res.status(500).json({ error: coRes.stderr || coRes.stdout || "Branch checkout failed" });
    }

    await syncWorkspaceToDB(req.user.id, workspaceId);
    res.json({ success: true, branch: branchName.trim() });
  } catch (err) {
    console.error("GIT CHECKOUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 8. GET FILE DIFF ================= */
export async function getDiff(req, res) {
  try {
    const { workspaceId, path: filePath, staged } = req.query;
    if (!workspaceId || !filePath) {
      return res.status(400).json({ error: "workspaceId and path required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const fullDiskPath = path.join(wsPath, filePath);

    // 1. Current working tree or staged content
    let modified = "";
    if (fs.existsSync(fullDiskPath)) {
      try {
        modified = fs.readFileSync(fullDiskPath, "utf-8");
      } catch {
        modified = "";
      }
    }

    // 2. Base content (from HEAD or index)
    let original = "";
    const showArgs = staged === "true" ? ["show", `HEAD:${filePath}`] : ["show", `:${filePath}`];
    const showRes = await runGit(wsPath, showArgs);
    if (showRes.exitCode === 0) {
      original = showRes.stdout;
    } else {
      // If file is newly added/untracked, HEAD show fails, so original is empty string
      original = "";
    }

    // 3. Raw unified diff text
    const diffArgs = staged === "true" ? ["diff", "--cached", "--", filePath] : ["diff", "--", filePath];
    const diffRes = await runGit(wsPath, diffArgs);

    res.json({
      path: filePath,
      original,
      modified,
      diff: diffRes.stdout,
    });
  } catch (err) {
    console.error("GIT DIFF ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 9. COMMIT HISTORY (LOG) ================= */
export async function getLog(req, res) {
  try {
    const { workspaceId, limit = 20 } = req.query;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const logFormat = "%H%x1f%h%x1f%an%x1f%ae%x1f%ar%x1f%s";
    const logRes = await runGit(wsPath, [
      "log",
      `-n${limit}`,
      `--pretty=format:${logFormat}`,
    ]);

    const commits = [];
    if (logRes.exitCode === 0 && logRes.stdout) {
      for (const line of logRes.stdout.split("\n")) {
        const parts = line.split("\x1f");
        if (parts.length >= 6) {
          commits.push({
            hash: parts[0],
            shortHash: parts[1],
            author: parts[2],
            email: parts[3],
            timeAgo: parts[4],
            message: parts[5],
          });
        }
      }
    }

    res.json({ commits });
  } catch (err) {
    console.error("GIT LOG ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 10. REMOTE / GITHUB PUSH, PULL & SYNC ================= */
export async function addOrSetRemote(req, res) {
  try {
    const { workspaceId, remoteName = "origin", url } = req.body;
    if (!workspaceId || !url) {
      return res.status(400).json({ error: "workspaceId and url required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    // Clean any accidental tokens or auth from URL stored in Git
    let cleanUrl = url.trim();
    try {
      const parsed = new URL(cleanUrl);
      cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch { }

    // Check if remote already exists
    const checkRes = await runGit(wsPath, ["remote", "get-url", remoteName]);
    if (checkRes.exitCode === 0) {
      // Remote exists, update it
      await runGit(wsPath, ["remote", "set-url", remoteName, cleanUrl]);
    } else {
      // Add new remote
      const addRes = await runGit(wsPath, ["remote", "add", remoteName, cleanUrl]);
      if (addRes.exitCode !== 0) {
        return res.status(500).json({ error: addRes.stderr || "Failed to add remote" });
      }
    }

    // Immediately configure user credentials for this repository
    await ensureGitCredentials(wsPath, req.user.id);

    res.json({ success: true, message: `Remote '${remoteName}' configured to ${cleanUrl}` });
  } catch (err) {
    console.error("GIT REMOTE SET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function push(req, res) {
  try {
    const { workspaceId, remote = "origin", branch, setUpstream = true, token } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    // Get current branch if not provided
    let targetBranch = branch;
    if (!targetBranch) {
      const bRes = await runGit(wsPath, ["branch", "--show-current"]);
      targetBranch = bRes.stdout || "main";
    }

    // Check remote url
    const remUrlRes = await runGit(wsPath, ["remote", "get-url", remote]);
    if (remUrlRes.exitCode !== 0) {
      return res.status(400).json({ error: `Remote '${remote}' does not exist. Please configure remote URL first.` });
    }

    // Ensure credentials and URL rewriting are in place
    await ensureGitCredentials(wsPath, req.user.id, token);

    const pushArgs = ["push"];
    if (setUpstream) pushArgs.push("-u");
    pushArgs.push(remote, targetBranch);

    const pushRes = await runGit(wsPath, pushArgs);
    if (pushRes.exitCode !== 0) {
      const errOut = pushRes.stderr || pushRes.stdout || "";
      if (
        errOut.includes("Authentication failed") ||
        errOut.includes("Invalid username or token") ||
        errOut.includes("Password authentication is not supported")
      ) {
        return res.status(401).json({
          error: "GitHub authentication failed. Please verify your GitHub Personal Access Token (PAT) has 'repo' scope.",
        });
      }
      if (errOut.includes("[rejected]") || errOut.includes("non-fast-forward")) {
        return res.status(409).json({
          error: "Push rejected: Remote branch has newer commits. Please pull before pushing.",
        });
      }
      return res.status(500).json({
        error: errOut || "Push failed. Check GitHub permissions and branch state.",
      });
    }

    const status = await getGitStatusData(wsPath, req.user.id);
    res.json({ success: true, output: pushRes.stdout || pushRes.stderr || "Pushed successfully", status });
  } catch (err) {
    console.error("GIT PUSH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function pull(req, res) {
  try {
    const { workspaceId, remote = "origin", branch, token } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    let targetBranch = branch;
    if (!targetBranch) {
      const bRes = await runGit(wsPath, ["branch", "--show-current"]);
      targetBranch = bRes.stdout || "main";
    }

    const remUrlRes = await runGit(wsPath, ["remote", "get-url", remote]);
    if (remUrlRes.exitCode !== 0) {
      return res.status(400).json({ error: `Remote '${remote}' not configured` });
    }

    await ensureGitCredentials(wsPath, req.user.id, token);

    const pullRes = await runGit(wsPath, ["pull", "--rebase=false", remote, targetBranch]);
    if (pullRes.exitCode !== 0) {
      const errOut = pullRes.stderr || pullRes.stdout || "";
      if (errOut.includes("couldn't find remote ref") || errOut.includes("Couldn't find remote ref")) {
        return res.json({ success: true, emptyRemote: true, output: "Remote branch is empty or not yet published." });
      }
      if (
        errOut.includes("Authentication failed") ||
        errOut.includes("Invalid username or token") ||
        errOut.includes("Password authentication is not supported")
      ) {
        return res.status(401).json({
          error: "GitHub authentication failed. Please connect your GitHub Personal Access Token (PAT) with 'repo' scope.",
        });
      }
      return res.status(500).json({
        error: errOut || "Pull failed. Conflicts or credentials required.",
      });
    }

    // Sync newly pulled files from disk into MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    const status = await getGitStatusData(wsPath, req.user.id);
    res.json({ success: true, output: pullRes.stdout || "Pulled latest changes", status });
  } catch (err) {
    console.error("GIT PULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * 1-Click Smooth Git Sync: pulls latest commits from GitHub and pushes local commits with upstream tracking.
 */
export async function sync(req, res) {
  try {
    const { workspaceId, remote = "origin", branch, token } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    let targetBranch = branch;
    if (!targetBranch) {
      const bRes = await runGit(wsPath, ["branch", "--show-current"]);
      targetBranch = bRes.stdout || "main";
    }

    const remUrlRes = await runGit(wsPath, ["remote", "get-url", remote]);
    if (remUrlRes.exitCode !== 0) {
      return res.status(400).json({ error: `Remote '${remote}' does not exist. Please configure remote URL first.` });
    }

    // 1. Ensure user's GitHub credentials are fully configured on repo
    await ensureGitCredentials(wsPath, req.user.id, token);

    // 2. Try pull first (non-destructive, gracefully handles brand-new empty remote repos)
    let pulled = false;
    const pullRes = await runGit(wsPath, ["pull", "--rebase=false", remote, targetBranch]);
    if (pullRes.exitCode === 0) {
      pulled = true;
    } else {
      const pullErr = pullRes.stderr || pullRes.stdout || "";
      const isNewBranch = pullErr.includes("couldn't find remote ref") || pullErr.includes("Couldn't find remote ref");
      if (!isNewBranch && pullErr.includes("CONFLICT")) {
        return res.status(409).json({ error: "Merge conflict detected during sync. Please resolve conflicts before syncing." });
      }
    }

    // 3. Push with upstream tracking (-u)
    const pushRes = await runGit(wsPath, ["push", "-u", remote, targetBranch]);
    if (pushRes.exitCode !== 0) {
      const pushErr = pushRes.stderr || pushRes.stdout || "";
      if (
        pushErr.includes("Authentication failed") ||
        pushErr.includes("Invalid username or token") ||
        pushErr.includes("Password authentication is not supported")
      ) {
        return res.status(401).json({
          error: "GitHub authentication failed. Please connect your GitHub Personal Access Token (PAT) with 'repo' scope.",
        });
      }
      if (pushErr.includes("[rejected]") || pushErr.includes("non-fast-forward")) {
        return res.status(409).json({
          error: "Push rejected: Remote repository has new commits. Please pull before syncing.",
        });
      }
      return res.status(500).json({
        error: pushErr || "Push failed during sync.",
      });
    }

    // 4. Sync newly pulled/pushed state into MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    // 5. Get fresh status data
    const status = await getGitStatusData(wsPath, req.user.id);

    res.json({
      success: true,
      message: `Synced branch '${targetBranch}' with GitHub successfully!`,
      pulled,
      status,
    });
  } catch (err) {
    console.error("GIT SYNC ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 11. CLONE REPOSITORY ================= */
async function resolveAuthToken(userId, explicitToken) {
  if (explicitToken && explicitToken.trim()) return explicitToken.trim();
  try {
    const user = await User.findById(userId).lean();
    if (user?.githubAccessToken) {
      return user.githubAccessToken.trim();
    }
  } catch { }
  return null;
}

function buildAuthUrl(remoteUrl, token, username = null) {
  if (!token || !token.trim()) return remoteUrl;
  const cleanToken = token.trim();
  const authUser = username ? encodeURIComponent(username) : "x-access-token";
  try {
    const parsed = new URL(remoteUrl);
    parsed.username = authUser;
    parsed.password = cleanToken;
    return parsed.toString();
  } catch {
    return remoteUrl.replace(
      /^https:\/\/(.*@)?github\.com\//,
      `https://${authUser}:${cleanToken}@github.com/`
    );
  }
}

export async function cloneRepo(req, res) {
  try {
    const { workspaceId, repoUrl, token, branch } = req.body;
    if (!workspaceId || !repoUrl) {
      return res.status(400).json({ error: "workspaceId and repoUrl required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    let userRecord = null;
    try {
      userRecord = await User.findById(req.user.id).lean();
    } catch { }

    const authToken = token?.trim() || userRecord?.githubAccessToken?.trim() || null;
    const authUsername = userRecord?.githubUsername?.trim() || null;
    const targetUrl = authToken ? buildAuthUrl(repoUrl.trim(), authToken, authUsername) : repoUrl.trim();

    // Clone into a dedicated temp folder in OS temp dir to prevent in-tree file locks
    const tempCloneDir = path.join(os.tmpdir(), "vocode_clone_" + Date.now());
    const cloneArgs = ["clone"];
    if (branch) cloneArgs.push("-b", branch.trim());
    cloneArgs.push(targetUrl, tempCloneDir);

    const cloneRes = await runGit(wsPath, cloneArgs);
    if (cloneRes.exitCode !== 0) {
      if (fs.existsSync(tempCloneDir)) {
        try { fs.rmSync(tempCloneDir, { recursive: true, force: true }); } catch { }
      }
      return res.status(500).json({ error: cloneRes.stderr || "Clone failed. Verify URL and authentication." });
    }

    // Safely copy all cloned files including .git to wsPath on Windows
    try {
      fs.cpSync(tempCloneDir, wsPath, { recursive: true, force: true });
    } catch (cpErr) {
      console.warn("cpSync failed, falling back to per-item copy:", cpErr.message);
      const clonedItems = fs.readdirSync(tempCloneDir);
      for (const item of clonedItems) {
        const src = path.join(tempCloneDir, item);
        const dst = path.join(wsPath, item);
        try {
          fs.cpSync(src, dst, { recursive: true, force: true });
        } catch (itemErr) {
          console.warn(`Copy error for ${item}:`, itemErr.message);
        }
      }
    }

    try {
      fs.rmSync(tempCloneDir, { recursive: true, force: true });
    } catch { }

    // Ensure credentials and standard gitignore are active
    await ensureGitCredentials(wsPath, req.user.id, authToken);
    await ensureGitignore(wsPath);

    // Sync cloned files to MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    res.json({ success: true, message: "Cloned repository successfully" });
  } catch (err) {
    console.error("GIT CLONE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Generate a smart Git commit message using AI and diff/file analysis.
 */
export async function generateCommitMessage(req, res) {
  try {
    const { workspaceId, aiConfig } = req.body;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    // 1. Gather status and diff
    let diffRes = await runGit(wsPath, ["diff", "--cached"]);
    if (!diffRes.stdout || diffRes.stdout.trim().length === 0) {
      diffRes = await runGit(wsPath, ["diff", "HEAD"]);
    }

    const statusRes = await runGit(wsPath, ["status", "--porcelain=v1", "-uall"]);
    const lines = statusRes.stdout ? statusRes.stdout.split("\n").filter(Boolean) : [];
    const files = lines.map((l) => {
      const status = l.substring(0, 2).trim();
      let p = l.substring(2).trim().replace(/^"(.*)"$/, "$1");
      if (p.includes(" -> ")) p = p.split(" -> ").pop().trim();
      return { status, path: p };
    });

    if (files.length === 0 && (!diffRes.stdout || diffRes.stdout.trim().length === 0)) {
      return res.json({ message: "chore: update workspace files" });
    }

    const diffText = (diffRes.stdout || "").slice(0, 3500);
    const filesSummary = files.map((f) => `${f.status || "M"} ${f.path}`).join(", ");

    // 2. Try generating via LLM if configured
    try {
      const usesGoogleAccount = Boolean(
        aiConfig?.authMethod === "google" &&
        aiConfig?.provider === "gemini" &&
        aiConfig?.projectId
      );

      const prompt = `Generate a single concise git commit message following Conventional Commits (feat:, fix:, refactor:, docs:, chore:, test:).
Changed files: ${filesSummary}
${diffText ? `Git diff:\n${diffText}` : ""}

Requirements:
- Exactly 1 line
- Maximum 72 characters
- Lowercase description after prefix
- No quotes, no markdown, no trailing period
- Return ONLY the commit message text.`;

      const aiResponse = await askAI({
        message: prompt,
        history: [],
        workspaceContext: "",
        provider: aiConfig?.provider || "gemini",
        model: aiConfig?.model || "gemini-3.5-flash-lite",
        apiKey: aiConfig?.apiKey,
        apiKeys: aiConfig?.apiKeys,
        backupKeys: aiConfig?.backupKeys,
        authMethod: usesGoogleAccount ? "google" : "api_key",
        projectId: aiConfig?.projectId,
        googleAccessToken: usesGoogleAccount
          ? await getValidGoogleAccessToken(req.user.id)
          : null,
        systemPromptOverride: "You are an expert git assistant. You generate clean, accurate conventional commit messages in one line without extra text, explanation, or markdown formatting.",
      });

      let commitMsg = "";
      if (aiResponse) {
        if (typeof aiResponse === "string") {
          commitMsg = aiResponse.trim();
        } else if (aiResponse.chat) {
          commitMsg = aiResponse.chat.trim();
        } else if (aiResponse.message) {
          commitMsg = aiResponse.message.trim();
        }
      }

      commitMsg = commitMsg
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/^```[a-z]*\n?|```$/g, "")
        .replace(/\r?\n/g, " ")
        .trim();

      if (commitMsg && commitMsg.length >= 5 && commitMsg.length <= 100) {
        return res.json({ message: commitMsg });
      }
    } catch (aiErr) {
      console.warn("AI commit generation fallback triggered:", aiErr.message);
    }

    // 3. Fallback heuristic
    let fallback = "";
    if (files.length === 1) {
      const f = files[0];
      const filename = f.path.split("/").pop();
      if (f.status.includes("A") || f.status.includes("?")) {
        fallback = `feat: add ${filename}`;
      } else if (f.status.includes("D")) {
        fallback = `chore: remove ${filename}`;
      } else {
        fallback = `refactor: update ${filename}`;
      }
    } else if (files.length > 1) {
      const names = files.slice(0, 2).map((f) => f.path.split("/").pop()).join(" and ");
      fallback = `feat: update ${names}${files.length > 2 ? ` and ${files.length - 2} other files` : ""}`;
    } else {
      fallback = "chore: update project changes";
    }

    return res.json({ message: fallback });
  } catch (err) {
    console.error("GENERATE COMMIT MESSAGE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}


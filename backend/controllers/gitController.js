import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { getWorkspacesRoot } from "../config/paths.js";
import { hydrateWorkspace } from "../services/hydrateWorkspace.js";
import { syncWorkspaceToDB } from "../services/syncService.js";
import User from "../models/User.js";

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

  const finalArgs = ["-c", "safe.directory=*", "-c", "core.filemode=false", ...args];

  try {
    const { stdout, stderr } = await execFileAsync("git", finalArgs, {
      cwd: workspaceDir,
      env: { ...defaultEnv, ...envOptions },
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
  } catch (err) {
    const stdout = (err.stdout || "").toString().trim();
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

/* ================= 1. GET STATUS ================= */
export async function getStatus(req, res) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const gitDir = path.join(wsPath, ".git");

    if (!fs.existsSync(gitDir)) {
      return res.json({
        isRepo: false,
        branch: null,
        staged: [],
        unstaged: [],
        untracked: [],
        ahead: 0,
        behind: 0,
        remotes: [],
      });
    }

    // 1. Get current branch
    const branchRes = await runGit(wsPath, ["branch", "--show-current"]);
    let currentBranch = branchRes.stdout;
    if (!currentBranch) {
      // Might be detached or fresh repo with no commits
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
      for (const line of lines) {
        if (!line || line.length < 3) continue;
        const x = line[0]; // Staged status
        const y = line[1]; // Unstaged status
        const rawPath = line.substring(3).trim().replace(/^"(.*)"$/, "$1");

        // Staged changes
        if (x !== " " && x !== "?" && x !== "!") {
          staged.push({
            path: rawPath,
            status: x, // 'M', 'A', 'D', 'R', etc.
          });
        }

        // Unstaged modified / deleted
        if (y !== " " && y !== "?" && y !== "!") {
          unstaged.push({
            path: rawPath,
            status: y, // 'M', 'D', etc.
          });
        }

        // Untracked new files
        if (x === "?" && y === "?") {
          untracked.push({
            path: rawPath,
            status: "U",
          });
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
    }

    res.json({
      isRepo: true,
      branch: currentBranch,
      clean: staged.length === 0 && unstaged.length === 0 && untracked.length === 0,
      staged,
      unstaged,
      untracked,
      ahead,
      behind,
      remotes,
    });
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

    const initRes = await runGit(wsPath, ["init", "-b", defaultBranch]);
    if (initRes.exitCode !== 0) {
      return res.status(500).json({ error: initRes.stderr || "Git init failed" });
    }

    // Set local author config
    await runGit(wsPath, ["config", "user.name", name]);
    await runGit(wsPath, ["config", "user.email", email]);

    // Create standard .gitignore if none exists
    const gitignorePath = path.join(wsPath, ".gitignore");
    if (!fs.existsSync(gitignorePath)) {
      const defaultGitignore = `node_modules/\ndist/\nbuild/\n__pycache__/\n*.class\n.DS_Store\n`;
      fs.writeFileSync(gitignorePath, defaultGitignore, "utf-8");
    }

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

    if (all) {
      const addRes = await runGit(wsPath, ["add", "-A"]);
      if (addRes.exitCode !== 0) {
        return res.status(500).json({ error: addRes.stderr || "Failed to stage all files" });
      }
    } else if (Array.isArray(files) && files.length > 0) {
      const addRes = await runGit(wsPath, ["add", "--", ...files]);
      if (addRes.exitCode !== 0) {
        return res.status(500).json({ error: addRes.stderr || "Failed to stage selected files" });
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
        return res.status(500).json({ error: resetRes.stderr || "Failed to unstage all files" });
      }
    } else if (Array.isArray(files) && files.length > 0) {
      let resetRes = await runGit(wsPath, ["restore", "--staged", "--", ...files]);
      if (resetRes.exitCode !== 0) {
        resetRes = await runGit(wsPath, ["reset", "HEAD", "--", ...files]);
      }
      if (resetRes.exitCode !== 0) {
        return res.status(500).json({ error: resetRes.stderr || "Failed to unstage selected files" });
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
    const { name, email } = await getUserGitSignature(req.user.id);

    // 1. Check if there are staged changes in git index
    const diffCachedRes = await runGit(wsPath, ["diff", "--cached", "--quiet"]);
    const hasStaged = diffCachedRes.exitCode !== 0;

    // 2. If nothing is staged or stageAll requested, auto-stage tracked and untracked changes
    if (!hasStaged || stageAll) {
      await runGit(wsPath, ["add", "-A"]);
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

/* ================= 10. REMOTE / GITHUB PUSH & PULL ================= */
export async function addOrSetRemote(req, res) {
  try {
    const { workspaceId, remoteName = "origin", url } = req.body;
    if (!workspaceId || !url) {
      return res.status(400).json({ error: "workspaceId and url required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);

    // Check if remote already exists
    const checkRes = await runGit(wsPath, ["remote", "get-url", remoteName]);
    if (checkRes.exitCode === 0) {
      // Remote exists, update it
      await runGit(wsPath, ["remote", "set-url", remoteName, url.trim()]);
    } else {
      // Add new remote
      const addRes = await runGit(wsPath, ["remote", "add", remoteName, url.trim()]);
      if (addRes.exitCode !== 0) {
        return res.status(500).json({ error: addRes.stderr || "Failed to add remote" });
      }
    }

    res.json({ success: true, message: `Remote '${remoteName}' configured to ${url.trim()}` });
  } catch (err) {
    console.error("GIT REMOTE SET ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

async function resolveAuthToken(userId, explicitToken) {
  if (explicitToken && explicitToken.trim()) return explicitToken.trim();
  try {
    const user = await User.findById(userId).lean();
    if (user?.githubAccessToken) {
      return user.githubAccessToken.trim();
    }
  } catch {}
  return null;
}

function buildAuthUrl(remoteUrl, token) {
  if (!token || !token.trim()) return remoteUrl;
  const cleanToken = token.trim();
  try {
    const parsed = new URL(remoteUrl);
    parsed.username = "oauth2";
    parsed.password = cleanToken;
    return parsed.toString();
  } catch {
    // If not a standard URL, try regex replace for https://github.com/...
    return remoteUrl.replace(
      /^https:\/\/(.*@)?github\.com\//,
      `https://oauth2:${cleanToken}@github.com/`
    );
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

    const originalUrl = remUrlRes.stdout.trim();
    const authToken = await resolveAuthToken(req.user.id, token);
    const pushTarget = authToken ? buildAuthUrl(originalUrl, authToken) : remote;

    const pushArgs = ["push"];
    if (setUpstream) pushArgs.push("-u");
    pushArgs.push(pushTarget, targetBranch);

    const pushRes = await runGit(wsPath, pushArgs);
    if (pushRes.exitCode !== 0) {
      return res.status(500).json({
        error: pushRes.stderr || pushRes.stdout || "Push failed. Check GitHub permissions and branch state.",
      });
    }

    res.json({ success: true, output: pushRes.stdout || pushRes.stderr || "Pushed successfully" });
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

    const authToken = await resolveAuthToken(req.user.id, token);
    const pullTarget = authToken ? buildAuthUrl(remUrlRes.stdout.trim(), authToken) : remote;
    const pullRes = await runGit(wsPath, ["pull", pullTarget, targetBranch]);

    if (pullRes.exitCode !== 0) {
      return res.status(500).json({
        error: pullRes.stderr || pullRes.stdout || "Pull failed. Conflicts or credentials required.",
      });
    }

    // Sync newly pulled files from disk into MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    res.json({ success: true, output: pullRes.stdout || "Pulled latest changes" });
  } catch (err) {
    console.error("GIT PULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

/* ================= 11. CLONE REPOSITORY ================= */
export async function cloneRepo(req, res) {
  try {
    const { workspaceId, repoUrl, token, branch } = req.body;
    if (!workspaceId || !repoUrl) {
      return res.status(400).json({ error: "workspaceId and repoUrl required" });
    }

    const wsPath = await getWorkspacePath(req.user.id, workspaceId);
    const authToken = await resolveAuthToken(req.user.id, token);
    const targetUrl = authToken ? buildAuthUrl(repoUrl.trim(), authToken) : repoUrl.trim();

    // Clone into a temp folder then move contents into workspace
    const tempCloneDir = path.join(wsPath, ".temp_clone_" + Date.now());
    const cloneArgs = ["clone"];
    if (branch) cloneArgs.push("-b", branch.trim());
    cloneArgs.push(targetUrl, tempCloneDir);

    const cloneRes = await runGit(wsPath, cloneArgs);
    if (cloneRes.exitCode !== 0) {
      if (fs.existsSync(tempCloneDir)) {
        fs.rmSync(tempCloneDir, { recursive: true, force: true });
      }
      return res.status(500).json({ error: cloneRes.stderr || "Clone failed. Verify URL and authentication." });
    }

    // Move all files including .git to wsPath
    const clonedItems = fs.readdirSync(tempCloneDir);
    for (const item of clonedItems) {
      const src = path.join(tempCloneDir, item);
      const dst = path.join(wsPath, item);
      if (fs.existsSync(dst)) {
        fs.rmSync(dst, { recursive: true, force: true });
      }
      fs.renameSync(src, dst);
    }
    fs.rmSync(tempCloneDir, { recursive: true, force: true });

    // Sync cloned files to MongoDB
    await syncWorkspaceToDB(req.user.id, workspaceId);

    res.json({ success: true, message: "Cloned repository successfully" });
  } catch (err) {
    console.error("GIT CLONE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}


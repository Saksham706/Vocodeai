import React, { useState, useEffect, useRef } from "react";
import {
  GitBranch,
  RefreshCw,
  Check,
  Plus,
  Minus,
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  History,
  FolderGit2,
  Lock,
  ArrowUp,
  ArrowDown,
  X,
  FileCode2,
  KeyRound,
  Unlink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  getGitStatus,
  initGitRepo,
  stageGitFiles,
  unstageGitFiles,
  commitGit,
  discardGitChanges,
  getGitBranches,
  checkoutGitBranch,
  getGitDiff,
  getGitLog,
  addGitRemote,
  pushGit,
  pullGit,
  cloneGitRepo,
  getGithubAccountStatus,
  disconnectGithubAccount,
  connectGithubWithToken,
  getGithubOAuthUrl,
} from "../../services/gitApi";
import { getFileIcon } from "../../utils/getFileIcon";
import "../../styles/sourcecontrol.css";

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function renderFileIcon(filePath) {
  try {
    const icon = getFileIcon(filePath);
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function") {
      const IconComp = icon;
      return <IconComp size={14} />;
    }
  } catch {}
  return <FileCode2 size={14} />;
}

export default function SourceControl({
  workspaceId,
  onOpenDiff,
  onCloseSidebar,
}) {
  const { accessToken } = useAuth();
  const { loadWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [gitStatus, setGitStatus] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [stagedExpanded, setStagedExpanded] = useState(true);
  const [changesExpanded, setChangesExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [commitHistory, setCommitHistory] = useState([]);

  // GitHub Account status
  const [ghAccount, setGhAccount] = useState({ connected: false, username: null, avatar: null });
  const [ghLoading, setGhLoading] = useState(false);

  // Modals & Popovers
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showTokenConnectModal, setShowTokenConnectModal] = useState(false);
  const [quickTokenInput, setQuickTokenInput] = useState("");

  // Branch state
  const [branchList, setBranchList] = useState([]);
  const [newBranchName, setNewBranchName] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);

  // Remote / GitHub state
  const [remoteUrl, setRemoteUrl] = useState("");
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem("vocode_gh_token") || "");
  const [remoteLoading, setRemoteLoading] = useState(false);

  // Clone state
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneLoading, setCloneLoading] = useState(false);

  // Status message / toast banner
  const [banner, setBanner] = useState(null);
  const menuRef = useRef(null);

  const showBanner = (msg, type = "success") => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 5000);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check URL query parameters for OAuth redirect results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ghState = params.get("github");
    const ghError = params.get("github_error");
    const ghUser = params.get("username");

    if (ghState === "connected") {
      showBanner(`Successfully connected to GitHub as @${ghUser || "user"}!`);
      // Clean query parameters from URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      fetchGithubStatus();
    } else if (ghError) {
      if (ghError === "missing_client_id") {
        showBanner("GitHub OAuth App not configured. You can connect instantly using your token below.", "info");
        setShowTokenConnectModal(true);
      } else {
        showBanner(`GitHub Auth Error: ${decodeURIComponent(ghError)}`, "error");
      }
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Fetch GitHub account status
  const fetchGithubStatus = async () => {
    if (!accessToken) return;
    try {
      setGhLoading(true);
      const data = await getGithubAccountStatus(accessToken);
      setGhAccount(data);
    } catch {
      // Silently ignore status errors
    } finally {
      setGhLoading(false);
    }
  };

  useEffect(() => {
    fetchGithubStatus();
  }, [accessToken]);

  // Fetch status
  const fetchStatus = async () => {
    if (!accessToken || !workspaceId) return;
    try {
      setLoading(true);
      const data = await getGitStatus(accessToken, workspaceId);
      setGitStatus(data);
      if (data?.remotes?.length > 0) {
        setRemoteUrl(data.remotes[0].url);
      }
    } catch (err) {
      console.warn("Failed to fetch git status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [accessToken, workspaceId]);

  // Load commit history
  const loadHistory = async () => {
    if (!accessToken || !workspaceId) return;
    try {
      const data = await getGitLog(accessToken, workspaceId);
      setCommitHistory(data.commits || []);
    } catch (err) {
      showBanner("Failed to load history: " + err.message, "error");
    }
  };

  // 1-Click Sign in with GitHub (VS Code Style OAuth)
  const handleSignInWithGithub = () => {
    const oauthUrl = getGithubOAuthUrl(workspaceId, accessToken);
    window.location.href = oauthUrl;
  };

  // Disconnect GitHub
  const handleDisconnectGithub = async () => {
    if (!window.confirm("Are you sure you want to disconnect your GitHub account?")) return;
    try {
      await disconnectGithubAccount(accessToken);
      setGhAccount({ connected: false, username: null, avatar: null });
      showBanner("Disconnected GitHub account");
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Quick connect with token
  const handleConnectWithToken = async (e) => {
    e.preventDefault();
    if (!quickTokenInput.trim()) return;
    try {
      setGhLoading(true);
      const data = await connectGithubWithToken(accessToken, quickTokenInput.trim());
      setGhAccount({ connected: true, username: data.username, avatar: data.avatar });
      setShowTokenConnectModal(false);
      setQuickTokenInput("");
      showBanner(`Connected to GitHub as @${data.username}!`);
      fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setGhLoading(false);
    }
  };

  // Initialize Repo
  const handleInitRepo = async () => {
    try {
      setLoading(true);
      await initGitRepo(accessToken, workspaceId, "main");
      showBanner("Initialized empty Git repository on 'main'");
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Stage single file
  const handleStageFile = async (e, filePath) => {
    e.stopPropagation();
    try {
      await stageGitFiles(accessToken, workspaceId, [filePath]);
      await fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Stage all
  const handleStageAll = async (e) => {
    e.stopPropagation();
    try {
      await stageGitFiles(accessToken, workspaceId, null, true);
      await fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Unstage single file
  const handleUnstageFile = async (e, filePath) => {
    e.stopPropagation();
    try {
      await unstageGitFiles(accessToken, workspaceId, [filePath]);
      await fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Unstage all
  const handleUnstageAll = async (e) => {
    e.stopPropagation();
    try {
      await unstageGitFiles(accessToken, workspaceId, null, true);
      await fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Discard file changes
  const handleDiscardFile = async (e, filePath) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to discard changes in "${filePath}"?`)) return;
    try {
      await discardGitChanges(accessToken, workspaceId, [filePath]);
      showBanner(`Discarded changes in "${filePath}"`);
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Discard all changes
  const handleDiscardAll = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to discard ALL uncommitted changes? This cannot be undone.")) return;
    try {
      await discardGitChanges(accessToken, workspaceId, null, true);
      showBanner("Discarded all changes");
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
    }
  };

  // Commit
  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      showBanner("Please enter a commit message", "error");
      return;
    }

    const hasStaged = gitStatus?.staged?.length > 0;
    const hasUnstaged = (gitStatus?.unstaged?.length || 0) + (gitStatus?.untracked?.length || 0) > 0;

    if (!hasStaged && !hasUnstaged) {
      showBanner("There are no changes to commit", "error");
      return;
    }

    try {
      setIsCommitting(true);
      const stageAll = !hasStaged;
      if (stageAll) {
        await stageGitFiles(accessToken, workspaceId, null, true);
      }
      await commitGit(accessToken, workspaceId, commitMessage.trim(), false);
      setCommitMessage("");
      showBanner("Committed changes successfully");
      await fetchStatus();
      if (historyExpanded) loadHistory();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setIsCommitting(false);
    }
  };

  // Open Diff Viewer
  const handleFileClick = async (fileObj, isStaged) => {
    try {
      const data = await getGitDiff(accessToken, workspaceId, fileObj.path, isStaged);
      if (onOpenDiff) {
        onOpenDiff({
          path: fileObj.path,
          original: data.original,
          modified: data.modified,
          isStaged,
        });
      }
    } catch (err) {
      showBanner("Failed to load diff: " + err.message, "error");
    }
  };

  // Open branch modal
  const openBranches = async () => {
    try {
      setBranchLoading(true);
      setShowBranchModal(true);
      const data = await getGitBranches(accessToken, workspaceId);
      setBranchList(data.branches || []);
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setBranchLoading(false);
    }
  };

  // Switch / Create branch
  const handleSwitchBranch = async (branchName, isNew = false) => {
    try {
      setBranchLoading(true);
      await checkoutGitBranch(accessToken, workspaceId, branchName, isNew);
      showBanner(`Switched to branch '${branchName}'`);
      setShowBranchModal(false);
      setNewBranchName("");
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setBranchLoading(false);
    }
  };

  // Sync (Pulls latest changes, then pushes commits to GitHub with upstream tracking)
  const handleSync = async () => {
    if (!gitStatus?.remotes || gitStatus.remotes.length === 0) {
      setShowRemoteModal(true);
      return;
    }
    try {
      setLoading(true);
      showBanner("Syncing changes with GitHub...", "info");
      // 1. Pull latest first
      try {
        await pullGit(accessToken, workspaceId, "origin", gitStatus?.branch, null);
      } catch (pullErr) {
        console.warn("Pull during sync notice:", pullErr.message);
      }
      // 2. Push local commits to remote origin (sets upstream automatically)
      await pushGit(accessToken, workspaceId, "origin", gitStatus?.branch, null, true);
      showBanner("Synced successfully with GitHub!");
      await fetchStatus();
      await loadWorkspace();
      if (historyExpanded) loadHistory();
    } catch (err) {
      showBanner(err.message, "error");
      if (err.message.includes("does not exist") || err.message.includes("not configured")) {
        setShowRemoteModal(true);
      } else if (err.message.includes("Authentication") || !ghAccount?.connected) {
        setShowTokenConnectModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Push (Seamless: uses connected GitHub account automatically)
  const handlePush = async () => {
    try {
      setLoading(true);
      await pushGit(accessToken, workspaceId, "origin", gitStatus?.branch, null);
      showBanner("Pushed branch to GitHub successfully!");
      fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
      if (err.message.includes("does not exist") || err.message.includes("not configured")) {
        setShowRemoteModal(true);
      } else if (err.message.includes("Authentication") || err.message.includes("permissions") || !ghAccount?.connected) {
        // Prompt to connect account
        setShowTokenConnectModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull (Seamless: uses connected GitHub account automatically)
  const handlePull = async () => {
    try {
      setLoading(true);
      await pullGit(accessToken, workspaceId, "origin", gitStatus?.branch, null);
      showBanner("Pulled latest changes from GitHub!");
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
      if (err.message.includes("not configured") || err.message.includes("does not exist")) {
        setShowRemoteModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Remote URL
  const handleSaveRemote = async (e) => {
    e.preventDefault();
    if (!remoteUrl.trim()) return;
    try {
      setRemoteLoading(true);
      // Clean accidental double paste or embedded credentials from the URL
      let cleanUrl = remoteUrl.trim();
      try {
        const parsed = new URL(cleanUrl);
        // Strip credentials from URL stored in git so it remains clean
        cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
      } catch {}

      await addGitRemote(accessToken, workspaceId, "origin", cleanUrl);
      showBanner("Remote 'origin' updated!");
      setShowRemoteModal(false);
      fetchStatus();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setRemoteLoading(false);
    }
  };

  // Clone
  const handleClone = async (e) => {
    e.preventDefault();
    if (!cloneUrl.trim()) return;
    try {
      setCloneLoading(true);
      await cloneGitRepo(accessToken, workspaceId, cloneUrl.trim(), null);
      showBanner("Cloned repository successfully!");
      setShowCloneModal(false);
      setCloneUrl("");
      await fetchStatus();
      await loadWorkspace();
    } catch (err) {
      showBanner(err.message, "error");
    } finally {
      setCloneLoading(false);
    }
  };

  const stagedCount = gitStatus?.staged?.length || 0;
  const changesCount = (gitStatus?.unstaged?.length || 0) + (gitStatus?.untracked?.length || 0);
  const totalChanges = stagedCount + changesCount;

  return (
    <aside className="source-control-panel">
      {/* 1. Header */}
      <div className="sc-header" ref={menuRef}>
        <span className="sc-header-title">Source Control</span>

        <div className="sc-header-actions">
          {/* Refresh */}
          <button
            className={`sc-icon-btn ${loading ? "spinning" : ""}`}
            onClick={fetchStatus}
            title="Refresh Git Status"
            aria-label="Refresh Git Status"
          >
            <RefreshCw size={14} />
          </button>

          {/* More actions dropdown */}
          <button
            className="sc-icon-btn"
            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            title="Views and More Actions"
            aria-label="Views and More Actions"
          >
            <MoreHorizontal size={14} />
          </button>

          {headerMenuOpen && (
            <div className="sc-menu-dropdown">
              <button
                className="sc-menu-item"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  setShowRemoteModal(true);
                }}
              >
                <ExternalLink size={14} />
                <span>Configure Remote (GitHub)...</span>
              </button>
              <button
                className="sc-menu-item"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  openBranches();
                }}
              >
                <GitBranch size={14} />
                <span>Manage Branches...</span>
              </button>
              <button
                className="sc-menu-item"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  handlePush();
                }}
              >
                <UploadCloud size={14} />
                <span>Push to Origin</span>
              </button>
              <button
                className="sc-menu-item"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  handlePull();
                }}
              >
                <DownloadCloud size={14} />
                <span>Pull from Origin</span>
              </button>
              <div className="sc-menu-divider" />
              <button
                className="sc-menu-item"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  setShowCloneModal(true);
                }}
              >
                <DownloadCloud size={14} />
                <span>Clone Repository...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification Banner */}
      {banner && (
        <div className={`sc-banner ${banner.type}`}>
          <span>{banner.msg}</span>
          <button onClick={() => setBanner(null)}><X size={12} /></button>
        </div>
      )}

      {/* GitHub Account Header Badge (VS Code Style) */}
      <div className="sc-github-auth-bar">
        {ghAccount.connected ? (
          <div className="sc-github-connected-row">
            <div className="sc-gh-user-info">
              {ghAccount.avatar ? (
                <img src={ghAccount.avatar} alt="avatar" className="sc-gh-avatar" />
              ) : (
                <GithubIcon size={14} />
              )}
              <span className="sc-gh-username">@{ghAccount.username}</span>
              <span className="sc-gh-badge">
                <span className="sc-gh-dot"></span> Active
              </span>
            </div>
            <button
              className="sc-gh-unlink-btn"
              onClick={handleDisconnectGithub}
              title="Disconnect GitHub Account"
            >
              <Unlink size={12} />
            </button>
          </div>
        ) : (
          <div className="sc-github-unconnected-row">
            <button
              className="sc-btn-github-oauth"
              onClick={handleSignInWithGithub}
              title="Sign in with GitHub in browser (VS Code Style)"
            >
              <GithubIcon size={14} />
              <span>Sign in with GitHub</span>
            </button>
            <button
              className="sc-btn-token-link"
              onClick={() => setShowTokenConnectModal(true)}
              title="Or link via Personal Access Token"
            >
              <KeyRound size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Repository Content */}
      <div className="sc-body">
        {!gitStatus?.isRepo ? (
          /* NOT A GIT REPO: Empty State */
          <div className="sc-empty-state">
            <div className="sc-empty-icon-wrap">
              <FolderGit2 size={36} />
            </div>
            <h4>No Source Control Providers</h4>
            <p>
              Initialize a Git repository in this workspace to track changes, create branches, and sync with GitHub.
            </p>
            <div className="sc-empty-btn-group">
              <button
                className="btn-create-workspace-primary"
                onClick={handleInitRepo}
                disabled={loading}
              >
                <GitBranch size={16} />
                <span>Initialize Repository</span>
              </button>
              <button
                className="btn-create-workspace-secondary"
                onClick={() => setShowCloneModal(true)}
              >
                <DownloadCloud size={15} />
                <span>Clone from GitHub</span>
              </button>
            </div>
          </div>
        ) : (
          /* IS A GIT REPO */
          <>
            {/* Sync Status Bar (Ahead/Behind & Remote) */}
            <div className="sc-sync-bar">
              <div className="sc-sync-branch" onClick={openBranches} title="Switch Branch">
                <GitBranch size={14} />
                <span className="branch-label">{gitStatus.branch}</span>
              </div>

              <div className="sc-sync-actions">
                {gitStatus.ahead > 0 && (
                  <span className="sync-count ahead" title={`${gitStatus.ahead} commits ahead of remote`}>
                    <ArrowUp size={12} /> {gitStatus.ahead}
                  </span>
                )}
                {gitStatus.behind > 0 && (
                  <span className="sync-count behind" title={`${gitStatus.behind} commits behind remote`}>
                    <ArrowDown size={12} /> {gitStatus.behind}
                  </span>
                )}

                <button
                  className="sc-sync-btn"
                  onClick={handleSync}
                  title="Sync with GitHub (Pull & Push)"
                  disabled={loading}
                >
                  <RefreshCw size={12} className={loading ? "spinning" : ""} />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {/* Commit Message Box */}
            <div className="sc-commit-box">
              <textarea
                className="sc-commit-input"
                placeholder="Message (Ctrl+Enter to commit)"
                rows={2}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleCommit();
                  }
                }}
              />
              <button
                className="sc-commit-btn"
                onClick={handleCommit}
                disabled={isCommitting || !commitMessage.trim() || totalChanges === 0}
              >
                <Check size={14} />
                <span>{isCommitting ? "Committing..." : "Commit"}</span>
              </button>
            </div>

            {/* Prominent Sync / Push Changes Button (VS Code style) */}
            {(gitStatus.ahead > 0 || (gitStatus.remotes?.length > 0 && totalChanges === 0)) && (
              <button
                className="sc-publish-btn"
                onClick={handleSync}
                disabled={loading}
                title="Sync and push commits to GitHub"
              >
                <UploadCloud size={14} className={loading ? "spinning" : ""} />
                <span>
                  {loading ? "Syncing..." : gitStatus.ahead > 0 ? `Sync Changes (${gitStatus.ahead} ↑)` : "Sync with GitHub"}
                </span>
              </button>
            )}

            {/* STAGED CHANGES ACCORDION */}
            {stagedCount > 0 && (
              <div className="sc-section">
                <div
                  className="sc-section-header"
                  onClick={() => setStagedExpanded(!stagedExpanded)}
                >
                  <div className="sc-section-title-left">
                    {stagedExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>STAGED CHANGES</span>
                    <span className="sc-badge count">{stagedCount}</span>
                  </div>

                  <div className="sc-section-actions">
                    <button
                      className="sc-item-action-btn"
                      onClick={handleUnstageAll}
                      title="Unstage All Changes"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                </div>

                {stagedExpanded && (
                  <div className="sc-file-list">
                    {gitStatus.staged.map((f) => {
                      return (
                        <div
                          key={`staged-${f.path}`}
                          className="sc-file-row"
                          onClick={() => handleFileClick(f, true)}
                        >
                          <div className="sc-file-info">
                            <span className="sc-file-icon">{renderFileIcon(f.path)}</span>
                            <span className="sc-file-name" title={f.path}>{f.path}</span>
                          </div>

                          <div className="sc-file-row-actions">
                            <span className={`sc-status-letter ${f.status.toLowerCase()}`}>
                              {f.status}
                            </span>
                            <button
                              className="sc-row-btn"
                              onClick={(e) => handleUnstageFile(e, f.path)}
                              title="Unstage"
                            >
                              <Minus size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CHANGES ACCORDION (UNSTAGED & UNTRACKED) */}
            <div className="sc-section">
              <div
                className="sc-section-header"
                onClick={() => setChangesExpanded(!changesExpanded)}
              >
                <div className="sc-section-title-left">
                  {changesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span>CHANGES</span>
                  {changesCount > 0 && (
                    <span className="sc-badge count">{changesCount}</span>
                  )}
                </div>

                {changesCount > 0 && (
                  <div className="sc-section-actions">
                    <button
                      className="sc-item-action-btn"
                      onClick={handleDiscardAll}
                      title="Discard All Changes"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      className="sc-item-action-btn"
                      onClick={handleStageAll}
                      title="Stage All Changes"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                )}
              </div>

              {changesExpanded && (
                <div className="sc-file-list">
                  {changesCount === 0 ? (
                    <div className="sc-empty-hint">No working tree changes</div>
                  ) : (
                    <>
                      {/* Unstaged files */}
                      {gitStatus.unstaged?.map((f) => {
                        return (
                          <div
                            key={`unstaged-${f.path}`}
                            className="sc-file-row"
                            onClick={() => handleFileClick(f, false)}
                          >
                            <div className="sc-file-info">
                              <span className="sc-file-icon">{renderFileIcon(f.path)}</span>
                              <span className="sc-file-name" title={f.path}>{f.path}</span>
                            </div>

                            <div className="sc-file-row-actions">
                              <span className={`sc-status-letter ${f.status.toLowerCase()}`}>
                                {f.status}
                              </span>
                              <button
                                className="sc-row-btn"
                                onClick={(e) => handleDiscardFile(e, f.path)}
                                title="Discard Changes"
                              >
                                <RotateCcw size={12} />
                              </button>
                              <button
                                className="sc-row-btn"
                                onClick={(e) => handleStageFile(e, f.path)}
                                title="Stage Changes"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Untracked files (U) */}
                      {gitStatus.untracked?.map((f) => {
                        return (
                          <div
                            key={`untracked-${f.path}`}
                            className="sc-file-row"
                            onClick={() => handleFileClick(f, false)}
                          >
                            <div className="sc-file-info">
                              <span className="sc-file-icon">{renderFileIcon(f.path)}</span>
                              <span className="sc-file-name" title={f.path}>{f.path}</span>
                            </div>

                            <div className="sc-file-row-actions">
                              <span className="sc-status-letter u" title="Untracked">U</span>
                              <button
                                className="sc-row-btn"
                                onClick={(e) => handleDiscardFile(e, f.path)}
                                title="Delete Untracked File"
                              >
                                <RotateCcw size={12} />
                              </button>
                              <button
                                className="sc-row-btn"
                                onClick={(e) => handleStageFile(e, f.path)}
                                title="Stage File"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* COMMIT HISTORY ACCORDION */}
            <div className="sc-section history-section">
              <div
                className="sc-section-header"
                onClick={() => {
                  const next = !historyExpanded;
                  setHistoryExpanded(next);
                  if (next && commitHistory.length === 0) {
                    loadHistory();
                  }
                }}
              >
                <div className="sc-section-title-left">
                  {historyExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <History size={13} />
                  <span>COMMITS</span>
                </div>
              </div>

              {historyExpanded && (
                <div className="sc-history-list">
                  {commitHistory.length === 0 ? (
                    <div className="sc-empty-hint">No commit history found</div>
                  ) : (
                    commitHistory.map((c) => (
                      <div key={c.hash} className="sc-history-item">
                        <div className="sc-history-top">
                          <span className="sc-history-msg">{c.message}</span>
                          <code className="sc-history-hash">{c.shortHash}</code>
                        </div>
                        <div className="sc-history-meta">
                          <span>{c.author}</span>
                          <span>•</span>
                          <span>{c.timeAgo}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL: Branch Switcher / Creator */}
      {showBranchModal && (
        <div className="dash-modal-overlay" onClick={() => setShowBranchModal(false)}>
          <div className="dash-modal-card sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title">
                <GitBranch size={18} />
                <span>Switch / Create Branch</span>
              </div>
              <button className="sc-modal-close" onClick={() => setShowBranchModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="sc-branch-create-row">
              <input
                type="text"
                className="sc-modal-input"
                placeholder="New branch name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBranchName.trim()) {
                    handleSwitchBranch(newBranchName.trim(), true);
                  }
                }}
              />
              <button
                className="btn-create-workspace-primary"
                onClick={() => handleSwitchBranch(newBranchName.trim(), true)}
                disabled={!newBranchName.trim() || branchLoading}
              >
                <Plus size={14} />
                <span>Create</span>
              </button>
            </div>

            <div className="sc-branch-list-header">Existing Branches</div>
            <div className="sc-branch-list">
              {branchList.map((b) => (
                <div
                  key={b.name}
                  className={`sc-branch-row ${b.isCurrent ? "current" : ""}`}
                  onClick={() => !b.isCurrent && handleSwitchBranch(b.name, false)}
                >
                  <div className="sc-branch-left">
                    <GitBranch size={14} />
                    <span>{b.name}</span>
                  </div>
                  {b.isCurrent && <span className="sc-current-tag">CURRENT</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Configure Remote (GitHub) */}
      {showRemoteModal && (
        <div className="dash-modal-overlay" onClick={() => setShowRemoteModal(false)}>
          <div className="dash-modal-card sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title">
                <ExternalLink size={18} />
                <span>Configure Remote (GitHub)</span>
              </div>
              <button className="sc-modal-close" onClick={() => setShowRemoteModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRemote}>
              <div className="sc-form-group">
                <label>Remote URL (origin)</label>
                <input
                  type="text"
                  className="sc-modal-input"
                  placeholder="https://github.com/username/repository.git"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  required
                />
                <span className="sc-input-hint">Clean HTTPS repository URL from GitHub (e.g. https://github.com/Saksham706/dp.git)</span>
              </div>

              {ghAccount.connected ? (
                <div className="sc-auth-info-box success">
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Authenticated as <strong>@{ghAccount.username}</strong>. Push & pull will run automatically!</span>
                </div>
              ) : (
                <div className="sc-auth-info-box warning">
                  <AlertCircle size={16} color="#F59E0B" />
                  <div>
                    <span>GitHub not connected yet.</span>
                    <button
                      type="button"
                      className="sc-link-btn"
                      onClick={() => {
                        setShowRemoteModal(false);
                        setShowTokenConnectModal(true);
                      }}
                    >
                      Connect your account or token
                    </button>
                  </div>
                </div>
              )}

              <div className="sc-modal-footer">
                <button
                  type="button"
                  className="btn-create-workspace-secondary"
                  onClick={() => setShowRemoteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create-workspace-primary"
                  disabled={remoteLoading}
                >
                  <span>{remoteLoading ? "Saving..." : "Save Remote"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Clone from GitHub */}
      {showCloneModal && (
        <div className="dash-modal-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="dash-modal-card sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title">
                <DownloadCloud size={18} />
                <span>Clone from GitHub</span>
              </div>
              <button className="sc-modal-close" onClick={() => setShowCloneModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClone}>
              <div className="sc-form-group">
                <label>GitHub Repository URL</label>
                <input
                  type="text"
                  className="sc-modal-input"
                  placeholder="https://github.com/username/repository.git"
                  value={cloneUrl}
                  onChange={(e) => setCloneUrl(e.target.value)}
                  required
                />
              </div>

              <div className="sc-modal-footer">
                <button
                  type="button"
                  className="btn-create-workspace-secondary"
                  onClick={() => setShowCloneModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create-workspace-primary"
                  disabled={cloneLoading}
                >
                  <span>{cloneLoading ? "Cloning..." : "Clone Repository"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link GitHub via Token (Fallback & Quick-Link) */}
      {showTokenConnectModal && (
        <div className="dash-modal-overlay" onClick={() => setShowTokenConnectModal(false)}>
          <div className="dash-modal-card sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-header">
              <div className="sc-modal-title">
                <GithubIcon size={18} />
                <span>Connect GitHub Account</span>
              </div>
              <button className="sc-modal-close" onClick={() => setShowTokenConnectModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConnectWithToken}>
              <p className="sc-modal-desc">
                Paste your GitHub Personal Access Token once. VocodeAI will securely save it to your account and automatically configure git credentials for both the UI and the terminal.
              </p>

              <div className="sc-form-group">
                <label>
                  <Lock size={13} style={{ display: "inline", marginRight: "4px" }} />
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  className="sc-modal-input"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={quickTokenInput}
                  onChange={(e) => setQuickTokenInput(e.target.value)}
                  required
                  autoFocus
                />
                <span className="sc-input-hint">
                  Generate at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic). Select 'repo' scope.
                </span>
              </div>

              <div className="sc-modal-footer">
                <button
                  type="button"
                  className="btn-create-workspace-secondary"
                  onClick={() => setShowTokenConnectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-create-workspace-primary"
                  disabled={ghLoading || !quickTokenInput.trim()}
                >
                  <span>{ghLoading ? "Verifying..." : "Connect GitHub"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Terminal,
  Files,
  Search,
  GitBranch,
  Play,
  Grid2X2,
  Settings,
  Plus,
  Save,
  Palette,
  Sparkles,
  Command,
  FileText,
  Code2,
  FolderPlus,
  FilePlus2,
  ArrowRight,
  GitPullRequest,
  DownloadCloud,
  UploadCloud,
  Maximize2,
  CheckCheck,
} from "lucide-react";
import AntigravityLogo from "./AntigravityLogo";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getFileIcon } from "../../utils/getFileIcon";
import "../../styles/commandpalette.css";

function flattenTreeFiles(node, parentPath = "") {
  if (!node) return [];
  const fullPath = node.path || (parentPath ? `${parentPath}/${node.name}` : node.name);
  if (node.type === "file") {
    return [{ name: node.name, path: fullPath }];
  }
  let list = [];
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      list = list.concat(flattenTreeFiles(child, fullPath));
    }
  }
  return list;
}

export default function CommandPalette({
  isOpen,
  onClose,
  isAntigravityInstalled = true,
  onFocusAntigravity,
  onNewAntigravityConversation,
  onSelectAIModel,
  onToggleExplorer,
  onToggleTerminal,
  onOpenExtensions,
  onOpenGit,
  onOpenSearch,
  onOpenDebug,
  onOpenSettings,
  onNewFile,
  onNewFolder,
  onSaveFile,
  onInstallAntigravity,
}) {
  const { tree, openFile, activeFile } = useWorkspace();

  const [query, setQuery] = useState("");
  const [activeMode, setActiveMode] = useState("all"); // 'all' | 'commands' | 'files' | 'line'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Extract all files from workspace tree
  const workspaceFiles = useMemo(() => {
    if (!tree) return [];
    if (Array.isArray(tree.children)) {
      let all = [];
      for (const child of tree.children) {
        all = all.concat(flattenTreeFiles(child, ""));
      }
      return all;
    }
    return flattenTreeFiles(tree, "");
  }, [tree]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveMode("all");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Base list of all commands
  const allCommands = useMemo(() => {
    const list = [];

    // Antigravity AI commands
    if (isAntigravityInstalled) {
      list.push(
        {
          id: "antigravity-focus",
          category: "Antigravity",
          title: "Focus on Antigravity View",
          desc: "Open Antigravity chat panel and focus prompt",
          icon: <AntigravityLogo size={16} />,
          shortcut: "Ctrl+Alt+A",
          action: () => {
            onClose();
            onFocusAntigravity?.();
          },
        },
        {
          id: "antigravity-new-chat",
          category: "Antigravity",
          title: "New Conversation",
          desc: "Start a fresh Antigravity session",
          icon: <AntigravityLogo size={16} />,
          shortcut: "Ctrl+Shift+L",
          action: () => {
            onClose();
            onNewAntigravityConversation?.();
          },
        },
        {
          id: "antigravity-model",
          category: "Antigravity",
          title: "Set up Google Gemini",
          desc: "Connect Google account and manage Gemini AI settings",
          icon: <Sparkles size={15} color="#38BDF8" />,
          action: () => {
            onClose();
            onSelectAIModel?.();
          },
        },
        {
          id: "antigravity-plan",
          category: "Antigravity",
          title: "Generate Implementation Plan",
          desc: "Ask Antigravity to create a multi-step execution plan",
          icon: <FileText size={15} color="#10B981" />,
          action: () => {
            onClose();
            onFocusAntigravity?.();
            window.dispatchEvent(
              new CustomEvent("vocode-antigravity-prompt", {
                detail: { prompt: "Generate an implementation plan for this project." },
              })
            );
          },
        }
      );
    } else {
      list.push({
        id: "antigravity-install",
        category: "Extensions",
        title: "Install 'Google Antigravity' Extension",
        desc: "Bring Google's agent-first development platform to VocodeAI",
        icon: <AntigravityLogo size={16} />,
        action: () => {
          onClose();
          onInstallAntigravity?.();
        },
      });
    }

    // Code Formatting & Prettier
    list.push({
      id: "code-format",
      category: "Code",
      title: "Format Document (Prettier)",
      desc: "Automatically format active code file with Prettier",
      icon: <CheckCheck size={15} color="#38BDF8" />,
      shortcut: "Shift+Alt+F",
      action: () => {
        onClose();
        window.dispatchEvent(
          new CustomEvent("vocode-editor-action", {
            detail: { action: "format" },
          })
        );
      },
    });

    // Git & Source Control Commands
    list.push(
      {
        id: "git-clone",
        category: "Git",
        title: "Git: Clone Repository",
        desc: "Clone a public or private GitHub repository into a new workspace",
        icon: <DownloadCloud size={15} color="#F97316" />,
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("vocode-open-git-clone"));
          onOpenGit?.();
        },
      },
      {
        id: "git-open",
        category: "Git",
        title: "Git: Open Source Control Panel",
        desc: "View staged/unstaged changes, branches, and commit history",
        icon: <GitBranch size={15} color="#F97316" />,
        shortcut: "Ctrl+Shift+G",
        action: () => {
          onClose();
          onOpenGit?.();
        },
      },
      {
        id: "git-stage-all",
        category: "Git",
        title: "Git: Stage All Changes",
        desc: "Stage all modified, deleted, and untracked files",
        icon: <Plus size={15} color="#10B981" />,
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("vocode-git-stage-all"));
          onOpenGit?.();
        },
      },
      {
        id: "git-push",
        category: "Git",
        title: "Git: Push / Publish Branch to Remote",
        desc: "Publish current branch commits to GitHub origin",
        icon: <UploadCloud size={15} color="#38BDF8" />,
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("vocode-git-push"));
          onOpenGit?.();
        },
      },
      {
        id: "git-pull",
        category: "Git",
        title: "Git: Pull from Remote",
        desc: "Fetch and merge commits from remote branch",
        icon: <DownloadCloud size={15} color="#A78BFA" />,
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("vocode-git-pull"));
          onOpenGit?.();
        },
      }
    );

    // Standard IDE Navigation & File Commands
    list.push(
      {
        id: "view-explorer",
        category: "View",
        title: "Toggle Primary Side Bar (Explorer)",
        desc: "Show or hide file tree explorer",
        icon: <Files size={15} color="#60A5FA" />,
        shortcut: "Ctrl+B",
        action: () => {
          onClose();
          onToggleExplorer?.();
        },
      },
      {
        id: "view-terminal",
        category: "View",
        title: "Toggle Integrated Terminal Panel",
        desc: "Open or hide interactive bash / node terminal",
        icon: <Terminal size={15} color="#34D399" />,
        shortcut: "Ctrl+`",
        action: () => {
          onClose();
          onToggleTerminal?.();
        },
      },
      {
        id: "view-extensions",
        category: "View",
        title: "Show Extensions Marketplace",
        desc: "Browse and install themes, AI agents, and formatters",
        icon: <Grid2X2 size={15} color="#FBBF24" />,
        shortcut: "Ctrl+Shift+X",
        action: () => {
          onClose();
          onOpenExtensions?.();
        },
      },
      {
        id: "view-search",
        category: "View",
        title: "Show Global Code Search",
        desc: "Search across all files in workspace",
        icon: <Search size={15} color="#A78BFA" />,
        shortcut: "Ctrl+Shift+F",
        action: () => {
          onClose();
          onOpenSearch?.();
        },
      },
      {
        id: "view-debug",
        category: "View",
        title: "Show Run and Debug",
        desc: "Inspect runtime logs and debug sessions",
        icon: <Play size={15} color="#F43F5E" />,
        shortcut: "Ctrl+Shift+D",
        action: () => {
          onClose();
          onOpenDebug?.();
        },
      },
      {
        id: "view-fullscreen",
        category: "View",
        title: "Toggle Fullscreen",
        desc: "Maximize IDE workspace viewport",
        icon: <Maximize2 size={15} color="#94A3B8" />,
        shortcut: "F11",
        action: () => {
          onClose();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        },
      },
      {
        id: "file-new-file",
        category: "File",
        title: "New File",
        desc: "Create a new file in active workspace",
        icon: <FilePlus2 size={15} color="#38BDF8" />,
        shortcut: "Ctrl+N",
        action: () => {
          onClose();
          onNewFile?.();
        },
      },
      {
        id: "file-new-folder",
        category: "File",
        title: "New Folder",
        desc: "Create a new folder in active directory",
        icon: <FolderPlus size={15} color="#38BDF8" />,
        shortcut: "Ctrl+Shift+N",
        action: () => {
          onClose();
          onNewFolder?.();
        },
      },
      {
        id: "file-save",
        category: "File",
        title: "Save File",
        desc: "Save changes in current editor file",
        icon: <Save size={15} color="#10B981" />,
        shortcut: "Ctrl+S",
        action: () => {
          onClose();
          onSaveFile?.();
        },
      },
      {
        id: "pref-settings",
        category: "Preferences",
        title: "Open User Settings",
        desc: "Configure editor font, formatting, and keybindings",
        icon: <Settings size={15} color="#94A3B8" />,
        shortcut: "Ctrl+,",
        action: () => {
          onClose();
          onOpenSettings?.();
        },
      }
    );

    return list;
  }, [
    isAntigravityInstalled,
    onClose,
    onFocusAntigravity,
    onNewAntigravityConversation,
    onSelectAIModel,
    onToggleExplorer,
    onToggleTerminal,
    onOpenExtensions,
    onOpenGit,
    onOpenSearch,
    onOpenDebug,
    onOpenSettings,
    onNewFile,
    onNewFolder,
    onSaveFile,
    onInstallAntigravity,
  ]);

  // Determine effective mode and clean search query
  const { effectiveMode, cleanQuery } = useMemo(() => {
    const raw = query.trim();
    if (raw.startsWith(">")) {
      return { effectiveMode: "commands", cleanQuery: raw.substring(1).trim().toLowerCase() };
    }
    if (raw.startsWith(":")) {
      return { effectiveMode: "line", cleanQuery: raw.substring(1).trim() };
    }
    if (raw.startsWith("@")) {
      return { effectiveMode: "files", cleanQuery: raw.substring(1).trim().toLowerCase() };
    }
    return { effectiveMode: activeMode, cleanQuery: raw.toLowerCase() };
  }, [query, activeMode]);

  // Unified items list based on mode & query
  const filteredItems = useMemo(() => {
    const items = [];

    // 1. Go to Line Mode
    if (effectiveMode === "line") {
      const lineNum = parseInt(cleanQuery.replace(/\D/g, ""), 10);
      if (!isNaN(lineNum) && lineNum > 0) {
        items.push({
          id: `goto-line-${lineNum}`,
          category: "Go to Line",
          title: `Line ${lineNum}`,
          desc: `Jump to line ${lineNum} in active file: ${activeFile || "Editor"}`,
          icon: <ArrowRight size={15} color="#38BDF8" />,
          action: () => {
            onClose();
            window.dispatchEvent(
              new CustomEvent("vocode-editor-action", {
                detail: { action: "jumpToLine", line: lineNum },
              })
            );
          },
        });
      } else {
        items.push({
          id: "goto-line-hint",
          category: "Go to Line",
          title: "Type a line number (e.g. :42)",
          desc: "Press Enter to jump directly to that line in active editor",
          icon: <ArrowRight size={15} color="#94A3B8" />,
          action: () => {},
        });
      }
      return items;
    }

    // 2. Commands Matching
    if (effectiveMode === "all" || effectiveMode === "commands") {
      const matchingCmds = allCommands.filter((cmd) => {
        if (!cleanQuery) return true;
        const full = `${cmd.category}: ${cmd.title} ${cmd.desc || ""}`.toLowerCase();
        return full.includes(cleanQuery);
      });
      items.push(...matchingCmds);
    }

    // 3. Files Matching (Fuzzy workspace files)
    if (effectiveMode === "all" || effectiveMode === "files") {
      const matchingFiles = workspaceFiles
        .filter((file) => {
          if (!cleanQuery) return effectiveMode === "files";
          return file.path.toLowerCase().includes(cleanQuery) || file.name.toLowerCase().includes(cleanQuery);
        })
        .slice(0, effectiveMode === "files" ? 40 : 10)
        .map((file) => ({
          id: `file-${file.path}`,
          category: "File",
          title: file.name,
          desc: file.path,
          icon: getFileIcon(file.name, "file"),
          tag: "File",
          action: () => {
            onClose();
            if (openFile) openFile(file.path);
          },
        }));
      items.push(...matchingFiles);
    }

    return items;
  }, [effectiveMode, cleanQuery, allCommands, workspaceFiles, activeFile, openFile, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="cmd-palette-backdrop" onClick={onClose}>
      <div
        className="cmd-palette-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Mode Selector Pills */}
        <div className="cmd-palette-modes-bar">
          <button
            className={`cmd-mode-pill ${effectiveMode === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveMode("all");
              if (query.startsWith(">") || query.startsWith(":") || query.startsWith("@")) {
                setQuery("");
              }
              inputRef.current?.focus();
            }}
          >
            <Sparkles size={12} />
            <span>All</span>
          </button>
          <button
            className={`cmd-mode-pill ${effectiveMode === "commands" ? "active" : ""}`}
            onClick={() => {
              setActiveMode("commands");
              setQuery(">");
              inputRef.current?.focus();
            }}
          >
            <Command size={12} />
            <span>&gt; Commands</span>
          </button>
          <button
            className={`cmd-mode-pill ${effectiveMode === "files" ? "active" : ""}`}
            onClick={() => {
              setActiveMode("files");
              setQuery("@");
              inputRef.current?.focus();
            }}
          >
            <Files size={12} />
            <span>@ Files</span>
          </button>
          <button
            className={`cmd-mode-pill ${effectiveMode === "line" ? "active" : ""}`}
            onClick={() => {
              setActiveMode("line");
              setQuery(":");
              inputRef.current?.focus();
            }}
          >
            <ArrowRight size={12} />
            <span>: Go to Line</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="cmd-palette-input-wrap">
          <span className="cmd-palette-prompt">
            {effectiveMode === "commands"
              ? ">"
              : effectiveMode === "line"
              ? ":"
              : effectiveMode === "files"
              ? "@"
              : ">"}
          </span>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder={
              effectiveMode === "commands"
                ? "Type a command (e.g. Format Document, Git Clone, Terminal)..."
                : effectiveMode === "files"
                ? "Type file name to open..."
                : effectiveMode === "line"
                ? "Type line number to jump to (e.g. :35)..."
                : "Search files (@), commands (>), or go to line (:)..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="cmd-palette-esc-hint" onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Commands / Files List */}
        <div className="cmd-palette-list" ref={listRef}>
          {filteredItems.length === 0 ? (
            <div className="cmd-palette-empty">
              <span>No matching items found for "{cleanQuery}"</span>
              <span style={{ fontSize: "11px", opacity: 0.7 }}>
                Tip: Type &gt; for commands, @ for files, or : for line jump
              </span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-palette-item ${isSelected ? "selected" : ""}`}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">{item.icon}</div>

                  <div className="cmd-item-content">
                    <div className="cmd-item-title-row">
                      {item.category && (
                        <span className="cmd-item-category">{item.category}:</span>
                      )}
                      <span className="cmd-item-title">{item.title}</span>
                    </div>
                    {item.desc && (
                      <span className="cmd-item-desc">{item.desc}</span>
                    )}
                  </div>

                  {item.tag && <span className="cmd-file-tag">{item.tag}</span>}
                  {item.shortcut && (
                    <kbd className="cmd-item-shortcut">{item.shortcut}</kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="cmd-palette-footer">
          <div className="cmd-footer-hints">
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
          <span>VocodeAI Quick Open</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

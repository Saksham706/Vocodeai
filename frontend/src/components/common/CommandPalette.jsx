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
  Bot,
  Sparkles,
  Command,
  FileText,
  Code2,
  FolderPlus,
  FilePlus2,
  ArrowRight,
} from "lucide-react";
import AntigravityLogo from "./AntigravityLogo";
import "../../styles/commandpalette.css";

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
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const allCommands = useMemo(() => {
    const list = [];

    // Antigravity commands if installed
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
          desc: "Start a fresh Antigravity session (Hey Saksham, what should we build today?)",
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
          desc: "Connect the Google account already signed in to VocodeAI and manage Gemini settings",
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
          desc: "Ask Antigravity to create a multi-step execution plan before coding",
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

    // Standard IDE Commands
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
        id: "view-git",
        category: "View",
        title: "Show Source Control (Git)",
        desc: "View staged, unstaged files and commit changes",
        icon: <GitBranch size={15} color="#F97316" />,
        shortcut: "Ctrl+Shift+G",
        action: () => {
          onClose();
          onOpenGit?.();
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

  // Clean filter query: remove leading '>' if user typed it
  const cleanQuery = query.replace(/^>\s*/, "").trim().toLowerCase();

  const filteredCommands = useMemo(() => {
    if (!cleanQuery) return allCommands;
    return allCommands.filter((cmd) => {
      const full = `${cmd.category}: ${cmd.title} ${cmd.desc || ""}`.toLowerCase();
      return full.includes(cleanQuery);
    });
  }, [allCommands, cleanQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
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
        {/* Search Input Box */}
        <div className="cmd-palette-input-wrap">
          <span className="cmd-palette-prompt">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command or search (e.g. Antigravity: Focus on Antigravity View)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="cmd-palette-esc-hint" onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="cmd-palette-list" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="cmd-palette-empty">
              No matching commands found for "{cleanQuery}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`cmd-palette-item ${isSelected ? "selected" : ""}`}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">{cmd.icon}</div>

                  <div className="cmd-item-content">
                    <div className="cmd-item-title-row">
                      <span className="cmd-item-category">{cmd.category}:</span>
                      <span className="cmd-item-title">{cmd.title}</span>
                    </div>
                    {cmd.desc && (
                      <span className="cmd-item-desc">{cmd.desc}</span>
                    )}
                  </div>

                  {cmd.shortcut && (
                    <kbd className="cmd-item-shortcut">{cmd.shortcut}</kbd>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}


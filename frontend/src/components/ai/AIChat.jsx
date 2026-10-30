import { useState, useRef, useEffect, useMemo } from "react";
import { useAI } from "../../context/AIContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import VoiceInput from "./VoiceInput";
import { RobotAvatar, RobotIllustration } from "./RobotIllustration";
import {
  Code2,
  ShieldAlert,
  Zap,
  FileText,
  SquareCheckBig,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  FilePlus2,
  FolderPlus,
  Folder,
  PanelTop,
  WandSparkles,
  HelpCircle,
  Bug,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  SendHorizontal,
  Sparkles,
  User,
  Copy,
  RotateCcw,
  FileCode2,
  Plus,
  Clock,
  Trash2,
  Maximize2,
  Minimize2,
  Upload,
  Download,
  Search,
  ExternalLink,
} from "lucide-react";
import "../../styles/aichat.css";

const AI_MODELS = ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"];

export default function AIChat({
  workspaceId,
  onClose,
  isMaximized = false,
  onToggleMaximize,
}) {
  const {
    sendMessage,
    messages,
    loading,
    sessions,
    currentSessionId,
    createNewSession,
    loadSession,
    deleteSession,
    saveChatToFile,
  } = useAI();

  const { activeFile, openFile, tree, applyFileChange } = useWorkspace();

  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Attached items (files, folders, images)
  const [attachments, setAttachments] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [chatFileModal, setChatFileModal] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [historySearch, setHistorySearch] = useState("");

  const modelMenuRef = useRef(null);
  const filePickerRef = useRef(null);
  const folderPickerRef = useRef(null);
  const attachMenuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hidden inputs for file/folder/image uploads
  const localFileInputRef = useRef(null);
  const localFolderInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const displayFile = activeFile ? activeFile.split("/").pop() : "No active file";

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Flatten workspace tree to get all available files and folders
  const { allWorkspaceFiles, allWorkspaceFolders } = useMemo(() => {
    const files = [];
    const folders = [];
    const traverse = (node, prefix = "") => {
      if (!node) return;
      const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
      if (node.type === "file") {
        files.push(currentPath);
      } else if (node.type === "folder") {
        folders.push(currentPath);
      }
      if (node.children?.length) {
        node.children.forEach((c) => traverse(c, currentPath));
      }
    };
    if (tree?.children?.length) {
      tree.children.forEach((c) => traverse(c, ""));
    }
    return { allWorkspaceFiles: files, allWorkspaceFolders: folders };
  }, [tree]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
      if (filePickerRef.current && !filePickerRef.current.contains(e.target)) {
        setFilePickerOpen(false);
      }
      if (folderPickerRef.current && !folderPickerRef.current.contains(e.target)) {
        setFolderPickerOpen(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= ATTACHMENT HANDLERS ================= */

  // Attach local files
  const handleLocalFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const isImg = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `file_${Date.now()}_${Math.random()}`,
            type: isImg ? "image" : "file",
            name: file.name,
            size: file.size,
            previewUrl: isImg ? evt.target.result : null,
            content: !isImg && typeof evt.target.result === "string" ? evt.target.result.slice(0, 10000) : null,
            source: "upload",
          },
        ]);
      };
      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    setAttachMenuOpen(false);
    e.target.value = "";
  };

  // Attach local folder
  const handleLocalFolderSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const folderPath = files[0].webkitRelativePath || files[0].name;
      const folderName = folderPath.split("/")[0] || "Uploaded Folder";
      setAttachments((prev) => [
        ...prev,
        {
          id: `folder_${Date.now()}_${Math.random()}`,
          type: "folder",
          name: folderName,
          fileCount: files.length,
          source: "upload",
        },
      ]);
      showToast(`Attached folder: ${folderName} (${files.length} files)`);
    }
    setAttachMenuOpen(false);
    e.target.value = "";
  };

  // Attach image directly
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}_${Math.random()}`,
            type: "image",
            name: file.name,
            previewUrl: evt.target.result,
            source: "upload",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    setAttachMenuOpen(false);
    e.target.value = "";
  };

  // Attach workspace item (file or folder)
  const attachWorkspaceItem = (path, type = "file") => {
    if (attachments.some((a) => a.path === path)) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: `ws_${path}`,
        type,
        name: path.split("/").pop() || path,
        path,
        source: "workspace",
      },
    ]);
    setFilePickerOpen(false);
    setFolderPickerOpen(false);
    setAttachMenuOpen(false);
  };

  // Copy and Paste Handler (supports text, images from clipboard, and files)
  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    let hasMedia = false;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // 1. Image paste (e.g. Snipping tool / screenshot / copied image)
        if (item.type.startsWith("image/")) {
          hasMedia = true;
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              setAttachments((prev) => [
                ...prev,
                {
                  id: `paste_img_${Date.now()}_${Math.random()}`,
                  type: "image",
                  name: `screenshot_${new Date().toLocaleTimeString().replace(/:/g, "-")}.png`,
                  previewUrl: evt.target.result,
                  source: "clipboard",
                },
              ]);
              showToast("Pasted image attached! 🖼️");
            };
            reader.readAsDataURL(blob);
          }
        }
        // 2. File paste
        else if (item.kind === "file") {
          hasMedia = true;
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              setAttachments((prev) => [
                ...prev,
                {
                  id: `paste_file_${Date.now()}_${Math.random()}`,
                  type: "file",
                  name: file.name,
                  content: evt.target.result,
                  source: "clipboard",
                },
              ]);
              showToast(`Pasted file attached: ${file.name} 📄`);
            };
            reader.readAsText(file);
          }
        }
      }
    }

    // If pasted pure media, prevent inserting binary/empty string
    if (hasMedia && !clipboardData.getData("text/plain")) {
      e.preventDefault();
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /* ================= SEND MESSAGE ================= */
  const handleSend = (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if ((!query.trim() && attachments.length === 0) || loading) return;

    let finalQuery = query.trim();

    // Append attachments summary to prompt context
    if (attachments.length > 0) {
      const summaryList = attachments
        .map((a) => {
          if (a.type === "image") return `[Attached Image: ${a.name}]`;
          if (a.type === "folder") return `[Attached Folder: ${a.name}${a.path ? ` (${a.path})` : ""}]`;
          return `[Attached File: ${a.name}${a.path ? ` (${a.path})` : ""}]`;
        })
        .join("\n");

      finalQuery = finalQuery
        ? `${finalQuery}\n\n---\nContext Attachments:\n${summaryList}`
        : `Please inspect the attached items:\n${summaryList}`;
    }

    sendMessage(finalQuery, workspaceId, attachments);
    setInput("");
    setAttachments([]);
    setActiveTab("chat");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Open Chat File in modal and provide Save-to-Workspace
  const handleViewChatFile = (session) => {
    setChatFileModal(session);
  };

  const handleSaveChatFileToWorkspace = async (session) => {
    const filePath = await saveChatToFile(session.id);
    if (filePath) {
      showToast(`Saved to workspace: ${filePath} 💾`);
      openFile?.(filePath);
      setChatFileModal(null);
    }
  };

  // Feature Cards matching design
  const featureCards = [
    {
      id: "generate",
      title: "Generate Code",
      desc: "Files, components & features",
      iconTileClass: "generate-code",
      icon: <Code2 size={13} />,
      prompt: `Create a clean, production-ready component or feature for this project.`,
    },
    {
      id: "debug",
      title: "Debug Code",
      desc: "Find and fix errors",
      iconTileClass: "debug-code",
      icon: <ShieldAlert size={13} />,
      prompt: activeFile
        ? `Debug ${activeFile}: inspect the code, identify errors or edge-case bugs, fix them and explain.`
        : `Find and fix any errors or edge-case bugs in the current project code.`,
    },
    {
      id: "optimize",
      title: "Optimize Code",
      desc: "Improve performance",
      iconTileClass: "optimize-code",
      icon: <Zap size={13} />,
      prompt: activeFile
        ? `Analyze ${activeFile} and optimize its time and space complexity for better performance.`
        : `Optimize the project code for speed, memory, and performance best practices.`,
    },
    {
      id: "explain",
      title: "Explain Code",
      desc: "Get clear explanations",
      iconTileClass: "explain-code",
      icon: <FileText size={13} />,
      prompt: activeFile
        ? `Explain how ${activeFile} works in detail, including key algorithms, data structures, and step-by-step flow.`
        : `Explain the architecture and how this codebase works.`,
    },
    {
      id: "tests",
      title: "Generate Tests",
      desc: "Unit & integration tests",
      iconTileClass: "generate-tests",
      icon: <SquareCheckBig size={13} />,
      prompt: activeFile
        ? `Generate comprehensive unit test cases and boundary conditions for ${activeFile}.`
        : `Generate unit tests and test suites for this workspace.`,
    },
    {
      id: "docs",
      title: "Create Documentation",
      desc: "Docs & code comments",
      iconTileClass: "create-docs",
      icon: <BookOpen size={13} />,
      prompt: activeFile
        ? `Write complete markdown documentation, API specifications, and docstrings for ${activeFile}.`
        : `Create clear README documentation for this project.`,
    },
  ];

  // Quick Action Buttons
  const quickActions = [
    {
      label: "Create File",
      icon: <FilePlus2 size={12} color="#14B8A6" />,
      onClick: () => {
        setInput("Create a new file called ");
        inputRef.current?.focus();
      },
    },
    {
      label: "Add to Editor",
      icon: <PanelTop size={12} color="#8B5CF6" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Write the code to add directly to ${activeFile}:`
            : `Generate code for the current editor:`
        );
      },
    },
    {
      label: "Refactor",
      icon: <WandSparkles size={12} color="#F97316" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Refactor ${activeFile} to follow modern clean-code patterns, improve readability, and reduce complexity.`
            : `Refactor the active code to improve cleanliness and maintainability.`
        );
      },
    },
    {
      label: "Explain",
      icon: <HelpCircle size={12} color="#10B981" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Explain the core logic, functions, and architecture of ${activeFile}.`
            : `Explain how the active code works step-by-step.`
        );
      },
    },
    {
      label: "Find Bugs",
      icon: <Bug size={12} color="#EF4444" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Perform static analysis on ${activeFile} and find potential runtime bugs, unhandled null values, or memory leaks.`
            : `Scan the workspace for potential bugs and security vulnerabilities.`
        );
      },
    },
    {
      label: "Generate Tests",
      icon: <SquareCheckBig size={12} color="#22C55E" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Write comprehensive test suites with edge cases for ${activeFile}.`
            : `Generate unit test cases for the current project.`
        );
      },
    },
    {
      label: "Add Comments",
      icon: <MessageSquare size={12} color="#6366F1" />,
      onClick: () => {
        handleSend(
          activeFile
            ? `Add clear JSDoc / docstring comments explaining every function, parameter, and return value in ${activeFile}.`
            : `Add comments and documentation throughout the active code.`
        );
      },
    },
  ];

  // Helper to format messages with code blocks
  const renderFormattedMessage = (content, msgIndex) => {
    if (typeof content !== "string") {
      return content?.message || JSON.stringify(content);
    }

    const trimmed = content.trim();

    if (trimmed.startsWith("{") && trimmed.includes('"actions"')) {
      try {
        const parsed = JSON.parse(trimmed);
        const chat = parsed.actions?.find((a) => a.action === "chat");
        if (chat?.message) return chat.message;
        const file = parsed.actions?.find(
          (a) => a.action === "create_file" || a.action === "write_file"
        );
        if (file) return `✅ Created and updated ${file.path} with the requested code.`;
      } catch {}
    }

    const codeFenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeFenceRegex.exec(trimmed)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: trimmed.substring(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        language: match[1] || "code",
        code: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < trimmed.length) {
      parts.push({
        type: "text",
        content: trimmed.substring(lastIndex),
      });
    }

    if (parts.length === 0) {
      return trimmed;
    }

    return parts.map((part, pIdx) => {
      if (part.type === "text") {
        return (
          <div key={pIdx} className="bubble-text">
            {part.content}
          </div>
        );
      }

      const isCopied = copiedIndex === `${msgIndex}-${pIdx}`;

      return (
        <div key={pIdx} className="ai-code-block-wrap">
          <div className="ai-code-block-bar">
            <span>{part.language || "code"}</span>
            <button
              type="button"
              className="ai-code-copy-btn"
              onClick={() => handleCopyCode(part.code, `${msgIndex}-${pIdx}`)}
            >
              {isCopied ? <Check size={11} color="#22C55E" /> : <Copy size={11} />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="ai-code-pre">
            <code>{part.code}</code>
          </pre>
        </div>
      );
    });
  };

  // Filter sessions for History tab
  const filteredSessions = useMemo(() => {
    if (!historySearch.trim()) return sessions;
    const q = historySearch.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, historySearch]);

  return (
    <div className="ide-ai-panel">
      {/* Hidden file input pickers */}
      <input
        ref={localFileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleLocalFileSelect}
      />
      <input
        ref={localFolderInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: "none" }}
        onChange={handleLocalFolderSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />

      {/* Toast Notification */}
      {toastMessage && <div className="ai-status-toast">{toastMessage}</div>}

      {/* ================= 1. ASSISTANT HEADER ================= */}
      <div className="ide-ai-header">
        <div className="ide-ai-brand">
          <RobotAvatar size={32} />
          <div className="ide-ai-title-wrap">
            <h4 className="ide-ai-title">VocodeAI Assistant</h4>
            <p className="ide-ai-sub">Your AI pair programmer</p>
          </div>
        </div>

        <div className="ide-ai-header-right">
          {/* Model Selector Dropdown */}
          <div className="ai-model-wrap" ref={modelMenuRef}>
            <button
              type="button"
              className="ai-model-pill"
              onClick={() => setModelDropdownOpen((prev) => !prev)}
              aria-label="Select AI Model"
            >
              <span>{selectedModel}</span>
              <ChevronDown size={13} />
            </button>

            {modelDropdownOpen && (
              <div className="ai-model-dropdown">
                {AI_MODELS.map((m) => (
                  <div
                    key={m}
                    className={`ai-model-item ${m === selectedModel ? "active" : ""}`}
                    onClick={() => {
                      setSelectedModel(m);
                      setModelDropdownOpen(false);
                    }}
                  >
                    <span>{m}</span>
                    {m === selectedModel && <Check size={12} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expand / Decrease Width Button */}
          {onToggleMaximize && (
            <button
              type="button"
              className="ai-header-icon-btn"
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore Width" : "Expand Assistant Width"}
              aria-label={isMaximized ? "Restore Width" : "Expand Assistant Width"}
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          )}

          {/* Close Panel Button */}
          {onClose && (
            <button
              type="button"
              className="ai-close-btn"
              onClick={onClose}
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. NAVIGATION TABS ================= */}
      <div className="ai-nav-tabs-bar">
        <div className="ai-nav-tabs-group">
          <button
            type="button"
            className={`ai-nav-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <span>Chat</span>
          </button>
          <button
            type="button"
            className={`ai-nav-tab ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            <span>Tools</span>
          </button>
          <button
            type="button"
            className={`ai-nav-tab ${activeTab === "context" ? "active" : ""}`}
            onClick={() => setActiveTab("context")}
          >
            <span>Context</span>
          </button>
          <button
            type="button"
            className={`ai-nav-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <span>History</span>
            {sessions.length > 0 && <span className="ai-tab-badge">{sessions.length}</span>}
          </button>
        </div>
      </div>

      {/* ================= 3. TAB VIEWS CONTENT ================= */}
      <div className="ai-assistant-content">
        {/* ============ TAB: CHAT ============ */}
        {activeTab === "chat" && (
          <>
            {messages.length === 0 ? (
              <>
                {/* 1. Welcome Section */}
                <div className="ai-welcome-section">
                  <RobotIllustration size={76} />
                  <div className="ai-welcome-text-col">
                    <h3 className="ai-welcome-title">
                      Hello! <span className="accent-name">I'm VocodeAI</span>
                    </h3>
                    <p className="ai-welcome-desc">
                      Your AI pair programmer. I can help you write, debug, optimize and
                      understand your code.
                    </p>
                  </div>
                </div>

                {/* 2. Feature Cards */}
                <div className="ai-features-grid">
                  {featureCards.map((card) => (
                    <div
                      key={card.id}
                      className="ai-feature-card"
                      onClick={() => handleSend(card.prompt)}
                      title={`Run ${card.title}`}
                    >
                      <div className={`ai-feat-icon-tile ${card.iconTileClass}`}>
                        {card.icon}
                      </div>
                      <div className="ai-feat-info">
                        <h5 className="ai-feat-title">{card.title}</h5>
                        <p className="ai-feat-desc">{card.desc}</p>
                      </div>
                      <ChevronRight size={13} className="ai-feat-chevron" />
                    </div>
                  ))}
                </div>

                {/* 3. Quick Actions Section */}
                <div className="ai-quick-actions-wrap">
                  <h5 className="ai-section-title">Quick Actions</h5>
                  <div className="ai-quick-row">
                    {quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="ai-quick-btn"
                        onClick={qa.onClick}
                      >
                        {qa.icon}
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Current File Card */}
                <div className="ai-current-file-card" ref={filePickerRef}>
                  <div className="ai-current-file-left">
                    <div className="ai-current-file-icon-box">
                      <FileCode2 size={16} />
                    </div>
                    <div className="ai-current-file-meta">
                      <span className="ai-current-file-label">Current File</span>
                      <span className="ai-current-file-name" title={displayFile}>
                        {displayFile}
                      </span>
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="ai-change-file-btn"
                      onClick={() => setFilePickerOpen((prev) => !prev)}
                    >
                      Change
                    </button>

                    {filePickerOpen && (
                      <div className="ai-model-dropdown" style={{ minWidth: 200, maxHeight: 220 }}>
                        {allWorkspaceFiles.map((file) => (
                          <div
                            key={file}
                            className={`ai-model-item ${file === activeFile ? "active" : ""}`}
                            onClick={() => {
                              openFile?.(file);
                              setFilePickerOpen(false);
                            }}
                          >
                            <span style={{ fontSize: 11.5 }}>{file}</span>
                            {file === activeFile && <Check size={12} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Import File, Import Folder, Add Selection */}
                <div className="ai-import-row">
                  <button
                    type="button"
                    className="ai-import-btn"
                    onClick={() => {
                      if (activeFile) {
                        attachWorkspaceItem(activeFile, "file");
                      } else {
                        setFilePickerOpen(true);
                      }
                    }}
                    title="Attach active file to context"
                  >
                    <Plus size={12} />
                    <span>Import File</span>
                  </button>

                  <button
                    type="button"
                    className="ai-import-btn"
                    onClick={() => {
                      setFolderPickerOpen(true);
                    }}
                    title="Attach workspace folder"
                  >
                    <Plus size={12} />
                    <span>Import Folder</span>
                  </button>

                  <button
                    type="button"
                    className="ai-import-btn"
                    onClick={() => {
                      setInput(
                        (prev) =>
                          `${prev} Review the active code in ${displayFile} and suggest improvements: `
                      );
                      inputRef.current?.focus();
                    }}
                  >
                    <Plus size={12} />
                    <span>Add Selection</span>
                  </button>
                </div>
              </>
            ) : (
              /* Active Chat Conversation List */
              <div className="ai-messages-list">
                <div className="ai-conversation-header">
                  <span className="ai-conversation-title">Pair Programming Session</span>
                  <button
                    type="button"
                    className="ai-new-chat-btn"
                    onClick={() => createNewSession()}
                    title="Start fresh chat session"
                  >
                    <RotateCcw size={11} />
                    <span>New Chat</span>
                  </button>
                </div>

                {messages.map((m, i) => (
                  <div key={i} className={`ai-chat-bubble ${m.role}`}>
                    <div className="bubble-header">
                      <div className="bubble-author-icon">
                        {m.role === "user" ? <User size={12} /> : <Sparkles size={12} />}
                      </div>
                      <span className="bubble-author">
                        {m.role === "user" ? "You" : "VocodeAI"}
                      </span>
                    </div>

                    {/* Render message attachments if present */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="bubble-attachments-grid">
                        {m.attachments.map((att, aIdx) => (
                          <div key={aIdx} className="bubble-att-chip">
                            {att.type === "image" && att.previewUrl ? (
                              <img
                                src={att.previewUrl}
                                alt={att.name}
                                className="bubble-att-thumb"
                                onClick={() => setLightboxImage(att.previewUrl)}
                                title="Click to view full image"
                              />
                            ) : att.type === "folder" ? (
                              <Folder size={12} color="#F59E0B" />
                            ) : (
                              <FileText size={12} color="#38BDF8" />
                            )}
                            <span className="bubble-att-name">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {renderFormattedMessage(m.content, i)}
                  </div>
                ))}

                {loading && (
                  <div className="ai-chat-bubble assistant">
                    <div className="bubble-header">
                      <div className="bubble-author-icon">
                        <Sparkles size={12} />
                      </div>
                      <span className="bubble-author">VocodeAI</span>
                    </div>
                    <div className="loading-pulse-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                      <span className="loading-label">Analyzing code & reasoning...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}

        {/* ============ TAB: TOOLS ============ */}
        {activeTab === "tools" && (
          <div className="ai-tools-list">
            <h5 className="ai-section-title">Available Developer Tools</h5>
            {featureCards.map((tool) => (
              <div key={tool.id} className="ai-tool-item-card">
                <div className="ai-tool-left">
                  <div className={`ai-feat-icon-tile ${tool.iconTileClass}`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h6 className="ai-tool-name">{tool.title}</h6>
                    <p className="ai-tool-desc">{tool.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ai-run-tool-btn"
                  onClick={() => handleSend(tool.prompt)}
                >
                  Run Tool
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============ TAB: CONTEXT ============ */}
        {activeTab === "context" && (
          <div className="ai-context-container">
            <h5 className="ai-section-title">Shared Assistant Context</h5>
            <div className="ai-context-group">
              <span className="ai-current-file-label">Active Editor File</span>
              <div className="ai-context-item">
                <div className="ai-context-item-left">
                  <FileCode2 size={14} color="#FF8B32" />
                  <span>{displayFile}</span>
                </div>
                <span style={{ fontSize: 10.5, color: "#10B981" }}>Active</span>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="ai-context-group">
                <span className="ai-current-file-label">Attached to Next Prompt</span>
                {attachments.map((a) => (
                  <div key={a.id} className="ai-context-item">
                    <div className="ai-context-item-left">
                      {a.type === "image" ? (
                        <ImageIcon size={14} color="#38BDF8" />
                      ) : a.type === "folder" ? (
                        <Folder size={14} color="#F59E0B" />
                      ) : (
                        <FileText size={14} color="#10B981" />
                      )}
                      <span>{a.name}</span>
                    </div>
                    <button
                      type="button"
                      className="ai-remove-context-btn"
                      onClick={() => removeAttachment(a.id)}
                      title="Remove attachment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="ai-context-group">
              <span className="ai-current-file-label">Workspace Tree</span>
              <div className="ai-context-item">
                <div className="ai-context-item-left">
                  <FolderPlus size={14} color="#3B82F6" />
                  <span>Whole Project Context Available</span>
                </div>
                <span style={{ fontSize: 10.5, color: "#94A3B8" }}>Loaded</span>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB: HISTORY (ChatGPT Style Session Threads) ============ */}
        {activeTab === "history" && (
          <div className="ai-history-container">
            <div className="ai-history-top-bar">
              <div className="ai-history-search-wrap">
                <Search size={13} className="ai-history-search-icon" />
                <input
                  type="text"
                  className="ai-history-search-input"
                  placeholder="Search chat history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="ai-history-new-btn"
                onClick={() => {
                  createNewSession();
                  setActiveTab("chat");
                }}
                title="Start a fresh conversation"
              >
                <Plus size={13} />
                <span>New Chat</span>
              </button>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="ai-sessions-list">
                {filteredSessions.map((sess) => {
                  const isActive = sess.id === currentSessionId;
                  const dateLabel = new Date(sess.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const count = sess.messages?.length || 0;

                  return (
                    <div
                      key={sess.id}
                      className={`ai-session-card ${isActive ? "active-session" : ""}`}
                    >
                      <div
                        className="ai-session-click-area"
                        onClick={() => {
                          loadSession(sess.id);
                          setActiveTab("chat");
                        }}
                        title="Click to open this conversation"
                      >
                        <div className="ai-session-left-meta">
                          <Clock size={14} className="ai-session-clock-icon" />
                          <div className="ai-session-text">
                            <h6 className="ai-session-title">{sess.title}</h6>
                            <div className="ai-session-sub">
                              <span>{dateLabel}</span>
                              <span className="dot-sep">•</span>
                              <span>{count} msgs</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right action buttons: Chat File + Delete */}
                      <div className="ai-session-actions">
                        <button
                          type="button"
                          className="ai-session-action-btn file-btn"
                          title="View / Save as Chat File"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewChatFile(sess);
                          }}
                        >
                          <FileCode2 size={13} />
                          <span>Chat File</span>
                        </button>

                        <button
                          type="button"
                          className="ai-session-action-btn delete-btn"
                          title="Delete conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(sess.id);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ai-history-empty">
                <Clock size={32} className="ai-history-icon" />
                <p className="ai-history-msg">No conversation history found</p>
                <p className="ai-history-sub">
                  Start interacting with VocodeAI in the Chat tab or click "New Chat" to
                  start a conversation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= 4. ATTACHMENT CHIPS PREVIEW (ABOVE INPUT) ================= */}
      {attachments.length > 0 && (
        <div className="ai-attachments-tray">
          <div className="ai-att-tray-header">
            <span className="ai-att-tray-title">Attached Context ({attachments.length})</span>
            <button
              type="button"
              className="ai-att-clear-btn"
              onClick={() => setAttachments([])}
              title="Clear all attachments"
            >
              Clear All
            </button>
          </div>
          <div className="ai-att-chips-row">
            {attachments.map((att) => (
              <div key={att.id} className="ai-att-preview-chip">
                {att.type === "image" && att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="ai-att-chip-img" />
                ) : att.type === "folder" ? (
                  <Folder size={13} color="#F59E0B" />
                ) : (
                  <FileText size={13} color="#38BDF8" />
                )}
                <span className="ai-att-chip-label" title={att.name}>
                  {att.name}
                </span>
                <button
                  type="button"
                  className="ai-att-chip-remove"
                  onClick={() => removeAttachment(att.id)}
                  title="Remove"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 5. FIXED BOTTOM CHAT INPUT ================= */}
      <div className="ai-bottom-fixed-area">
        {/* Dropdown for folder picking */}
        {folderPickerOpen && (
          <div className="ai-workspace-picker-popover" ref={folderPickerRef}>
            <div className="ai-picker-popover-header">
              <span>Select Workspace Folder</span>
              <button onClick={() => setFolderPickerOpen(false)}>
                <X size={12} />
              </button>
            </div>
            <div className="ai-picker-popover-list">
              {allWorkspaceFolders.map((fld) => (
                <div
                  key={fld}
                  className="ai-picker-item"
                  onClick={() => attachWorkspaceItem(fld, "folder")}
                >
                  <Folder size={13} color="#F59E0B" />
                  <span>{fld}</span>
                </div>
              ))}
              {allWorkspaceFolders.length === 0 && (
                <div className="ai-picker-empty">No subfolders in workspace</div>
              )}
            </div>
          </div>
        )}

        {/* Paperclip Attach Menu Popover */}
        {attachMenuOpen && (
          <div className="ai-attach-menu-popover" ref={attachMenuRef}>
            <div
              className="ai-attach-menu-item"
              onClick={() => {
                setAttachMenuOpen(false);
                setFilePickerOpen(true);
              }}
            >
              <FileCode2 size={14} color="#38BDF8" />
              <span>Workspace File</span>
            </div>
            <div
              className="ai-attach-menu-item"
              onClick={() => {
                setAttachMenuOpen(false);
                setFolderPickerOpen(true);
              }}
            >
              <Folder size={14} color="#F59E0B" />
              <span>Workspace Folder</span>
            </div>
            <div
              className="ai-attach-menu-item"
              onClick={() => {
                setAttachMenuOpen(false);
                localFileInputRef.current?.click();
              }}
            >
              <Upload size={14} color="#10B981" />
              <span>Upload Local File</span>
            </div>
            <div
              className="ai-attach-menu-item"
              onClick={() => {
                setAttachMenuOpen(false);
                imageInputRef.current?.click();
              }}
            >
              <ImageIcon size={14} color="#EC4899" />
              <span>Upload Image / Screenshot</span>
            </div>
            <div
              className="ai-attach-menu-item"
              onClick={() => {
                setAttachMenuOpen(false);
                localFolderInputRef.current?.click();
              }}
            >
              <FolderPlus size={14} color="#8B5CF6" />
              <span>Upload Local Folder</span>
            </div>
          </div>
        )}

        {/* Pill-shaped Input Container */}
        <div className="ai-input-pill-container">
          {/* Attachment Paperclip Button */}
          <button
            type="button"
            className={`ai-attach-btn ${attachMenuOpen ? "active" : ""}`}
            title="Attach file, folder or image"
            onClick={() => setAttachMenuOpen((prev) => !prev)}
          >
            <Paperclip size={16} />
          </button>

          {/* Text Input with Paste Support */}
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask VocodeAI anything... (paste text, images or files)"
            disabled={loading}
          />

          {/* Right Tools (Image, Voice, Send) */}
          <div className="ai-input-right-tools">
            <button
              type="button"
              className="ai-icon-tool-btn"
              title="Attach image or screenshot (or paste via Ctrl+V)"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon size={15} />
            </button>

            <VoiceInput
              onCommand={(cmd) => {
                if (cmd) sendMessage(cmd, workspaceId, attachments);
              }}
            />

            <button
              type="button"
              className="ai-send-action-btn"
              onClick={() => handleSend()}
              disabled={(!input.trim() && attachments.length === 0) || loading}
              title="Send to VocodeAI"
              aria-label="Send to VocodeAI"
            >
              <SendHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* Suggested Prompt Shortcuts Row */}
        <div className="ai-prompt-shortcuts-row">
          <span>Try:</span>
          <span
            className="ai-shortcut-link"
            onClick={() => handleSend("Debug this code")}
          >
            "Debug this code"
          </span>
          <span className="ai-shortcut-sep">|</span>
          <span
            className="ai-shortcut-link"
            onClick={() => handleSend("Optimize for performance")}
          >
            "Optimize for performance"
          </span>
          <span className="ai-shortcut-sep">|</span>
          <span
            className="ai-shortcut-link"
            onClick={() => handleSend("Generate test cases")}
          >
            "Generate test cases"
          </span>
        </div>
      </div>

      {/* ================= 6. CHAT FILE PREVIEW MODAL ================= */}
      {chatFileModal && (
        <div
          className="ai-modal-overlay"
          onClick={() => setChatFileModal(null)}
        >
          <div
            className="ai-chat-file-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-modal-header">
              <div className="ai-modal-title-row">
                <FileCode2 size={16} color="#FF8B32" />
                <h5>Chat File: {chatFileModal.title}</h5>
              </div>
              <button
                className="ai-modal-close-btn"
                onClick={() => setChatFileModal(null)}
              >
                <X size={15} />
              </button>
            </div>

            <div className="ai-modal-body">
              <pre className="ai-chat-file-pre">
                <code>
                  {`# VocodeAI Chat Session: ${chatFileModal.title}
*Date: ${new Date(chatFileModal.createdAt).toLocaleString()}*
*Total Messages: ${chatFileModal.messages?.length || 0}*

` +
                    (chatFileModal.messages || [])
                      .map((m) => {
                        const sender = m.role === "user" ? "### 👤 User" : "### 🤖 VocodeAI";
                        const atts =
                          m.attachments?.length > 0
                            ? `\n*Attachments:* ${m.attachments.map((a) => a.name).join(", ")}\n`
                            : "";
                        return `${sender}${atts}\n${m.content}\n\n---`;
                      })
                      .join("\n\n")}
                </code>
              </pre>
            </div>

            <div className="ai-modal-footer">
              <button
                type="button"
                className="ai-btn-secondary"
                onClick={() => {
                  const content = (chatFileModal.messages || [])
                    .map((m) => `${m.role === "user" ? "User" : "VocodeAI"}: ${m.content}`)
                    .join("\n\n");
                  navigator.clipboard.writeText(content);
                  showToast("Chat text copied! 📋");
                }}
              >
                <Copy size={13} />
                <span>Copy Text</span>
              </button>

              <button
                type="button"
                className="ai-btn-primary"
                onClick={() => handleSaveChatFileToWorkspace(chatFileModal)}
              >
                <Download size={13} />
                <span>Save to Workspace (.chat.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. IMAGE LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div className="ai-modal-overlay" onClick={() => setLightboxImage(null)}>
          <div className="ai-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="ai-lightbox-close"
              onClick={() => setLightboxImage(null)}
            >
              <X size={18} />
            </button>
            <img src={lightboxImage} alt="Enlarged" className="ai-lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}

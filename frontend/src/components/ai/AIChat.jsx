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
  PanelTop,
  WandSparkles,
  HelpCircle,
  Bug,
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  SendHorizontal,
  Bot,
  Sparkles,
  User,
  Copy,
  RotateCcw,
  FileCode2,
  Plus,
  Clock,
  Trash2,
} from "lucide-react";
import "../../styles/aichat.css";

const AI_MODELS = ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"];

export default function AIChat({ workspaceId, onClose }) {
  const { sendMessage, messages, loading } = useAI();
  const { activeFile, openFile, tree } = useWorkspace();

  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const modelMenuRef = useRef(null);
  const filePickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const displayFile = activeFile ? activeFile.split("/").pop() : "No active file";

  // Flatten workspace tree to get all available files for file picker
  const allFiles = useMemo(() => {
    const list = [];
    const traverse = (node, prefix = "") => {
      if (!node) return;
      const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
      if (node.type === "file") {
        list.push(currentPath);
      }
      if (node.children?.length) {
        node.children.forEach((c) => traverse(c, currentPath));
      }
    };
    if (tree?.children?.length) {
      tree.children.forEach((c) => traverse(c, ""));
    }
    return list;
  }, [tree]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
      if (filePickerRef.current && !filePickerRef.current.contains(e.target)) {
        setFilePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if (!query.trim() || loading) return;

    // Attach active file or extra context if present
    let finalQuery = query;
    if (attachedFiles.length > 0) {
      finalQuery += `\n[Context Files: ${attachedFiles.join(", ")}]`;
    }

    sendMessage(finalQuery, workspaceId);
    setInput("");
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

  // 6 AI Feature Cards matching Reference Image
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

  // Quick Action pill buttons matching Reference Image
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

    // Check for JSON action response
    if (trimmed.startsWith("{") && trimmed.includes('"actions"')) {
      try {
        const parsed = JSON.parse(trimmed);
        const chat = parsed.actions?.find((a) => a.action === "chat");
        if (chat?.message) return chat.message;
        const file = parsed.actions?.find(
          (a) => a.action === "create_file" || a.action === "write_file"
        );
        if (file) return `✅ Created and updated ${file.path} with the requested code.`;
      } catch { }
    }

    // Parse code fences ```lang ... ```
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

  return (
    <div className="ide-ai-panel">
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
                {/* 1. Welcome Section with Robot Illustration */}
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

                {/* 2. Six AI Feature Cards (2-Column Grid) */}
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
                      <div className="ai-model-dropdown" style={{ minWidth: 180 }}>
                        {allFiles.map((file) => (
                          <div
                            key={file}
                            className={`ai-model-item ${file === activeFile ? "active" : ""
                              }`}
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
                      if (displayFile && !attachedFiles.includes(displayFile)) {
                        setAttachedFiles((prev) => [...prev, displayFile]);
                      }
                      setInput((prev) => `${prev} @${displayFile} `);
                      inputRef.current?.focus();
                    }}
                  >
                    <Plus size={12} />
                    <span>Import File</span>
                  </button>

                  <button
                    type="button"
                    className="ai-import-btn"
                    onClick={() => {
                      setInput((prev) => `${prev} @workspace `);
                      inputRef.current?.focus();
                    }}
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
                    onClick={() => {
                      // Reset to welcome screen
                      window.location.reload();
                    }}
                    title="Return to feature cards"
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

            {attachedFiles.length > 0 && (
              <div className="ai-context-group">
                <span className="ai-current-file-label">Attached Files</span>
                {attachedFiles.map((f, i) => (
                  <div key={i} className="ai-context-item">
                    <div className="ai-context-item-left">
                      <FileText size={14} />
                      <span>{f}</span>
                    </div>
                    <button
                      type="button"
                      className="ai-remove-context-btn"
                      onClick={() =>
                        setAttachedFiles((prev) => prev.filter((item) => item !== f))
                      }
                      title="Remove from context"
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

        {/* ============ TAB: HISTORY ============ */}
        {activeTab === "history" && (
          <div className="ai-history-container">
            <h5 className="ai-section-title">Recent Sessions</h5>
            {messages.length > 0 ? (
              <div
                className="ai-tool-item-card"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("chat")}
              >
                <div className="ai-tool-left">
                  <Clock size={16} color="#FF8B32" />
                  <div>
                    <h6 className="ai-tool-name">Pair Programming Session</h6>
                    <p className="ai-tool-desc">{messages.length} messages exchanged</p>
                  </div>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>
            ) : (
              <div className="ai-history-empty">
                <Clock size={32} className="ai-history-icon" />
                <p className="ai-history-msg">No conversation history yet</p>
                <p className="ai-history-sub">
                  Start interacting with VocodeAI in the Chat tab to see your saved
                  sessions here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= 4. FIXED BOTTOM CHAT INPUT ================= */}
      <div className="ai-bottom-fixed-area">
        {/* Pill-shaped Input Container */}
        <div className="ai-input-pill-container">
          {/* Attachment Button */}
          <button
            type="button"
            className="ai-attach-btn"
            title="Attach file to context"
            onClick={() => {
              if (displayFile && !attachedFiles.includes(displayFile)) {
                setAttachedFiles((prev) => [...prev, displayFile]);
              }
              setInput((prev) => `${prev} @${displayFile} `);
              inputRef.current?.focus();
            }}
          >
            <Paperclip size={16} />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VocodeAI anything..."
            disabled={loading}
          />

          {/* Right Tools (Image, Voice, Send) */}
          <div className="ai-input-right-tools">
            <button
              type="button"
              className="ai-icon-tool-btn"
              title="Attach image or screenshot"
              onClick={() => {
                setInput((prev) => `${prev} [Image attached] `);
                inputRef.current?.focus();
              }}
            >
              <ImageIcon size={15} />
            </button>

            <VoiceInput
              onCommand={(cmd) => {
                if (cmd) sendMessage(cmd, workspaceId);
              }}
            />

            <button
              type="button"
              className="ai-send-action-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
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
    </div>
  );
}

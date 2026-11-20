import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAI } from "../../context/AIContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getEffectiveSettings } from "../../utils/settingsStorage";
import { verifyAIKeyApi, getAIUsageApi } from "../../services/aiApi";
import VoiceInput from "./VoiceInput";
import { RobotAvatar, RobotIllustration } from "./RobotIllustration";
import AntigravityLogo from "../common/AntigravityLogo";
import VocodeLogo from "../common/VocodeLogo";
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
  Bot,
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
  GitBranch,
  MoreHorizontal,
  Columns2,
  Terminal,
  Play,
  Settings,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Layers,
  Sliders,
  RefreshCw,
  AlertCircle,
  Activity,
  Server,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import "../../styles/aichat.css";
import AIModelSelector, {
  AI_PROVIDERS,
  COMPACT_MODELS,
  CompactModelIcon,
} from "./AIModelSelector";

function renderInlineMarkdown(text) {
  const tokens = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/)[^)]+\))/g;
  return text.split(tokens).filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    }
    return token;
  });
}

function renderMarkdownText(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const Heading = `h${Math.min(heading[1].length, 4)}`;
      blocks.push(<Heading key={`h-${index}`}>{renderInlineMarkdown(heading[2])}</Heading>);
      index++;
      continue;
    }

    const listItem = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (listItem) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
        if (!item) break;
        items.push(<li key={`li-${index}`}>{renderInlineMarkdown(item[1])}</li>);
        index++;
      }
      blocks.push(<ul key={`ul-${index}`}>{items}</ul>);
      continue;
    }

    const paragraph = [line.trim()];
    index++;
    while (index < lines.length && lines[index].trim() && !/^(#{1,6})\s+/.test(lines[index]) && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index++;
    }
    blocks.push(<p key={`p-${index}`}>{renderInlineMarkdown(paragraph.join(" "))}</p>);
  }
  return blocks;
}

export default function AIChat({
  workspaceId,
  onClose,
  isMaximized = false,
  onToggleMaximize,
}) {
  const { user, accessToken } = useAuth();
  const {
    aiConfig,
    connectProvider,
    disconnectProvider,
    updateAiModel,
    saveAiSettings,
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

  const {
    activeFile,
    openFile,
    tree,
    applyFileChange,
    currentWorkspace,
    runCode,
    setShowTerminal,
    openNewTerminal,
    terminals,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState("chat");
  const [terminalCmdInput, setTerminalCmdInput] = useState("");
  const [input, setInput] = useState("");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelToConfigure, setModelToConfigure] = useState(null);

  // Settings: AI Requests & Quota Limits State
  const [usageStats, setUsageStats] = useState({
    todayRequests: 0,
    totalRequests: 0,
    dailyLimit: 150,
    remainingRequests: 150,
    resetIn: "24h 00m",
    status: "Optimal",
    quotaPercentage: 0,
    managedBackendKeys: true,
    sequentialFailover: true,
  });
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [settingsModel, setSettingsModel] = useState(aiConfig?.model || "gemini-2.5-flash");
  const [settingsProvider, setSettingsProvider] = useState(aiConfig?.provider || "gemini");

  const fetchAIUsage = async () => {
    if (!accessToken) return;
    setLoadingUsage(true);
    try {
      const data = await getAIUsageApi(accessToken);
      if (data && data.success) {
        setUsageStats(data);
      }
    } catch (err) {
      console.warn("Could not fetch AI usage statistics:", err);
    } finally {
      setLoadingUsage(false);
    }
  };

  const sessionRequestCount = useMemo(() => {
    return (messages || []).filter((m) => m && m.role === "user").length;
  }, [messages]);

  useEffect(() => {
    if (activeTab === "settings") {
      fetchAIUsage();
    }
  }, [activeTab, accessToken]);

  const handleSelectModel = (modelId, providerName) => {
    setSettingsModel(modelId);
    setSettingsProvider(providerName);
    updateAiModel?.(modelId);
    showToast(`Switched active model to ${modelId} ⚡`);
  };

  // Antigravity installed detection
  const [isAntigravityInstalled, setIsAntigravityInstalled] = useState(() => {
    try {
      const saved = localStorage.getItem("vocode_installed_extensions");
      if (saved) {
        return JSON.parse(saved).includes("google.google-antigravity");
      }
    } catch {}
    return true; // Default Antigravity mode active in workspace
  });

  const [quickModelOpen, setQuickModelOpen] = useState(false);
  const quickModelRef = useRef(null);

  // Listen to extension and command palette events
  useEffect(() => {
    const handleInstalled = (e) => {
      if (
        e.detail?.extensionId === "google.google-antigravity" ||
        e.detail?.extension?.id === "google.google-antigravity"
      ) {
        setIsAntigravityInstalled(true);
      }
    };
    const handleUninstalled = (e) => {
      if (
        e.detail?.extensionId === "google.google-antigravity" ||
        e.detail?.extension?.id === "google.google-antigravity"
      ) {
        setIsAntigravityInstalled(false);
      }
    };
    const handleNewChat = () => {
      createNewSession();
      setActiveTab("chat");
      setTimeout(() => inputRef.current?.focus(), 80);
    };
    const handleFocus = () => {
      setActiveTab("chat");
      setTimeout(() => inputRef.current?.focus(), 80);
    };
    const handlePrompt = (e) => {
      if (e.detail?.prompt) {
        setInput(e.detail.prompt);
        setTimeout(() => inputRef.current?.focus(), 80);
      }
    };
    window.addEventListener("vocode-extension-installed", handleInstalled);
    window.addEventListener("vocode-extension-uninstalled", handleUninstalled);
    window.addEventListener("vocode-antigravity-new-chat", handleNewChat);
    window.addEventListener("vocode-antigravity-focus", handleFocus);
    window.addEventListener("vocode-antigravity-prompt", handlePrompt);
    return () => {
      window.removeEventListener("vocode-extension-installed", handleInstalled);
      window.removeEventListener("vocode-extension-uninstalled", handleUninstalled);
      window.removeEventListener("vocode-antigravity-new-chat", handleNewChat);
      window.removeEventListener("vocode-antigravity-focus", handleFocus);
      window.removeEventListener("vocode-antigravity-prompt", handlePrompt);
    };
  }, []);

  const activeProvider = useMemo(() => {
    return (
      AI_PROVIDERS.find(
        (p) => p.id === aiConfig?.model || p.provider === aiConfig?.provider
      ) || null
    );
  }, [aiConfig]);

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

  const handleRunTerminalCommand = (commandToRun) => {
    if (!commandToRun) return;
    const cleanCmd = commandToRun.trim();
    setShowTerminal?.(true);
    if (runCode) {
      runCode(null, cleanCmd);
    }
    showToast(`Executing in terminal: ${cleanCmd.slice(0, 32)}${cleanCmd.length > 32 ? "..." : ""}`);
  };

  const handleChooseModel = (model) => {
    connectProvider({
      ...(aiConfig || {}),
      provider: model.provider,
      model: model.id,
      label: model.name,
      apiKey: aiConfig?.provider === model.provider ? aiConfig?.apiKey : "",
    });
    showToast(`Switched to ${model.name}`);
  };

  // Clean model display name: always VocodeAI
  const shortModelDisplayName = "VocodeAI";

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
      if (quickModelRef.current && !quickModelRef.current.contains(e.target)) {
        setQuickModelOpen(false);
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

    if (usageStats?.remainingRequests <= 0 || (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)) {
      showToast("Daily AI limit reached (150/150 requests used today). Quota resets at 12:00 AM midnight.", "error");
      return;
    }

    let finalQuery = query.trim();

    // Check if input is a direct terminal command (e.g. > npm run dev, $ git status, /run python app.py)
    const isDirectCmd = /^(>|\$|\/run\s+|\/term\s+|\/terminal\s+)/.test(finalQuery);
    if (isDirectCmd) {
      const cmdToRun = finalQuery.replace(/^(>|\$|\/run\s+|\/term\s+|\/terminal\s+)/, "").trim();
      handleRunTerminalCommand(cmdToRun);
      setInput("");
      sendMessage(`$ ${cmdToRun}`, workspaceId, attachments);
      setActiveTab("chat");
      return;
    }

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

    sendMessage(finalQuery, workspaceId, attachments).finally(() => {
      setTimeout(fetchAIUsage, 1000);
    });
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
      } catch { }
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
      return <div className="bubble-text">{renderMarkdownText(trimmed)}</div>;
    }

    return parts.map((part, pIdx) => {
      if (part.type === "text") {
        return (
          <div key={pIdx} className="bubble-text">
            {renderMarkdownText(part.content)}
          </div>
        );
      }

      const isCopied = copiedIndex === `${msgIndex}-${pIdx}`;
      const isRunnable =
        /^(bash|sh|shell|zsh|terminal|powershell|cmd|node|python|py)/i.test(part.language) ||
        /^(npm|npx|node|python|python3|pip|yarn|pnpm|git|docker|curl|cat|gcc|g\+\+|ls|cd|echo)\s+/m.test(part.code);

      return (
        <div key={pIdx} className="ai-code-block-wrap">
          <div className="ai-code-block-bar">
            <span>{part.language || "code"}</span>
            <div className="ai-code-actions-group">
              {isRunnable && (
                <button
                  type="button"
                  className="ai-code-run-terminal-btn"
                  onClick={() => handleRunTerminalCommand(part.code)}
                  title="Run command directly in integrated terminal"
                >
                  <Play size={10} className="fill-current" />
                  <span>Run</span>
                </button>
              )}
              <button
                type="button"
                className="ai-code-copy-btn"
                onClick={() => handleCopyCode(part.code, `${msgIndex}-${pIdx}`)}
              >
                {isCopied ? <Check size={11} color="#22C55E" /> : <Copy size={11} />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </button>
            </div>
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

      {/* ================= 1. PREMIUM UNIFIED ASSISTANT HEADER ================= */}
      <div className="vocode-ai-header">
        <div className="vocode-header-brand-row">
          <div
            className="vocode-brand-left"
            onClick={() => setActiveTab("chat")}
            style={{ cursor: "pointer" }}
            title="VocodeAI Assistant"
          >
            <VocodeLogo size={22} glow={true} />
            <div className="vocode-brand-meta">
              <span className="vocode-brand-title">VocodeAI Assistant</span>
            </div>
          </div>

          <div className="vocode-header-right-tools">
            {/* + New Conversation Button */}
            <button
              type="button"
              className="vocode-head-icon-btn"
              onClick={() => {
                createNewSession();
                setActiveTab("chat");
                showToast("Started New Conversation");
              }}
              title="New Conversation (Ctrl+L)"
            >
              <Plus size={15} />
            </button>

            {/* History Section Toggle Button */}
            <button
              type="button"
              className={`vocode-head-icon-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab(activeTab === "history" ? "chat" : "history")}
              title={`Conversation History (${sessions.length})`}
            >
              <Clock size={15} />
              {sessions.length > 0 && (
                <span className="vocode-head-badge">{sessions.length}</span>
              )}
            </button>

            {/* Quick Terminal Toggle Button */}
            <button
              type="button"
              className={`vocode-head-icon-btn ${activeTab === "terminal" ? "active" : ""}`}
              onClick={() => {
                setShowTerminal?.(true);
                setActiveTab(activeTab === "terminal" ? "chat" : "terminal");
              }}
              title="Terminal Command Runner"
            >
              <Terminal size={15} />
            </button>

            {/* More Options Dropdown */}
            <div style={{ position: "relative" }} ref={modelMenuRef}>
              <button
                type="button"
                className="vocode-head-icon-btn"
                onClick={() => setModelDropdownOpen((prev) => !prev)}
                title="More Actions"
              >
                <MoreHorizontal size={15} />
              </button>

              {modelDropdownOpen && (
                <div className="ai-model-dropdown">
                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      createNewSession();
                      setActiveTab("chat");
                    }}
                  >
                    <Plus size={12} />
                    <span>New Conversation</span>
                  </button>

                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      setActiveTab("history");
                    }}
                  >
                    <Clock size={12} />
                    <span>View Chat History ({sessions.length})</span>
                  </button>

                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      if (currentSessionId) saveChatToFile(currentSessionId);
                    }}
                  >
                    <FileCode2 size={12} />
                    <span>Export Chat (.md)</span>
                  </button>

                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      setShowTerminal?.(true);
                    }}
                  >
                    <Terminal size={12} />
                    <span>Open Integrated Terminal</span>
                  </button>

                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      setActiveTab("settings");
                    }}
                  >
                    <Settings size={12} />
                    <span>AI Settings & API Failover</span>
                  </button>

                  <button
                    type="button"
                    className="ai-model-dropdown-action-btn disconnect"
                    onClick={() => {
                      setModelDropdownOpen(false);
                      if (currentSessionId) deleteSession(currentSessionId);
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Clear Current Chat</span>
                  </button>
                </div>
              )}
            </div>

            {/* Maximize / Restore Width Button */}
            {onToggleMaximize && (
              <button
                type="button"
                className="vocode-head-icon-btn"
                onClick={onToggleMaximize}
                title={isMaximized ? "Restore Width" : "Maximize Width"}
              >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}

            {/* Close Panel Button */}
            {onClose && (
              <button
                type="button"
                className="vocode-head-icon-btn close-btn"
                onClick={onClose}
                title="Close Assistant"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Clean, Modern Navigation Tab Bar */}
        <div className="vocode-nav-bar">
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <Sparkles size={12} />
            <span>Chat</span>
          </button>
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={12} />
            <span>History</span>
            {sessions.length > 0 && (
              <span className="vocode-tab-count-pill">{sessions.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => setActiveTab("terminal")}
          >
            <Terminal size={12} />
            <span>Terminal</span>
          </button>
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            <Bot size={12} />
            <span>Tools</span>
          </button>
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "context" ? "active" : ""}`}
            onClick={() => setActiveTab("context")}
          >
            <FileCode2 size={12} />
            <span>Context</span>
          </button>
          <button
            type="button"
            className={`vocode-nav-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={12} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* ================= 3. TAB VIEWS CONTENT ================= */}
      <div className="ai-assistant-content">
        {/* ============ TAB: CHAT ============ */}
        {activeTab === "chat" && (
          <>
            {messages.length === 0 ? (
              <div className="vocode-welcome-view">
                <div className="vocode-hero-watermark">
                  <VocodeLogo size={180} glow={false} />
                </div>
                <div className="vocode-welcome-hero">
                  <div className="vocode-hero-avatar-wrap">
                    <VocodeLogo size={62} glow={true} />
                    <div className="vocode-hero-pulse-ring" />
                  </div>
                  <h2 className="vocode-hero-greeting">
                    Hey <span className="vocode-hero-user">{user?.name || user?.username || "Saksham"}</span>, what should we build today?
                  </h2>
                  <p className="vocode-hero-sub">
                    Autonomous AI pair programmer with live code & terminal execution
                  </p>
                  <div className="vocode-starter-chips">
                    <button
                      type="button"
                      className="vocode-starter-chip"
                      onClick={() => handleSend("Debug my active file and identify any runtime issues")}
                    >
                      <ShieldAlert size={12} color="#f87171" />
                      <span>Debug code</span>
                    </button>
                    <button
                      type="button"
                      className="vocode-starter-chip"
                      onClick={() => handleSend("Optimize this code for performance and clean architecture")}
                    >
                      <Zap size={12} color="#fbbf24" />
                      <span>Optimize performance</span>
                    </button>
                    <button
                      type="button"
                      className="vocode-starter-chip"
                      onClick={() => handleSend("Generate unit test cases for the active code")}
                    >
                      <SquareCheckBig size={12} color="#34d399" />
                      <span>Generate tests</span>
                    </button>
                    <button
                      type="button"
                      className="vocode-starter-chip"
                      onClick={() => setActiveTab("terminal")}
                    >
                      <Terminal size={12} color="#38bdf8" />
                      <span>Run terminal</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Chat Conversation List */
              <div className="ai-messages-list">
                <div className="ai-conversation-header">
                  <span className="ai-conversation-title">
                    {isAntigravityInstalled
                      ? "VocodeAI Session"
                      : "Pair Programming Session"}
                  </span>
                  <button
                    type="button"
                    className="ai-new-chat-btn"
                    onClick={() => {
                      createNewSession();
                      showToast("Started New Conversation");
                    }}
                    title="New Conversation"
                  >
                    <Plus size={11} />
                    <span>New Conversation</span>
                  </button>
                </div>

                {messages.map((m, i) => (
                  <div key={i} className={`ai-chat-bubble ${m.role}`}>
                    <div className="bubble-header">
                      <div className="bubble-author-icon">
                        {m.role === "user" ? (
                          <User size={12} />
                        ) : (
                          <VocodeLogo size={16} glow={true} />
                        )}
                      </div>
                      <span className="bubble-author">
                        {m.role === "user"
                          ? "You"
                          : (m.modelName || `VocodeAI Assistant (${shortModelDisplayName})`)}
                      </span>
                    </div>

                    {/* Action chips for terminal command executions */}
                    {m.actions && m.actions.some((a) => a.action === "run_code" || a.action === "terminal") && (
                      <div className="ai-terminal-actions-container">
                        {m.actions
                          .filter((a) => a.action === "run_code" || a.action === "terminal")
                          .map((act, actIdx) => (
                            <div key={actIdx} className="ai-terminal-action-card">
                              <div className="terminal-card-header">
                                <div className="terminal-card-tag">
                                  <Terminal size={12} />
                                  <span>TERMINAL EXECUTION</span>
                                </div>
                                <button
                                  type="button"
                                  className="terminal-card-run-btn"
                                  onClick={() => handleRunTerminalCommand(act.command || act.path)}
                                  title="Re-run in terminal"
                                >
                                  <Play size={10} />
                                  <span>Run</span>
                                </button>
                              </div>
                              <pre className="terminal-card-cmd">
                                <code>{act.command || act.path}</code>
                              </pre>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Action chips for created/modified files */}
                    {m.actions && m.actions.some((a) => a.action === "create_file" || a.action === "write_file") && (
                      <div className="antigravity-action-chips-row">
                        {m.actions
                          .filter((a) => a.action === "create_file" || a.action === "write_file")
                          .map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="antigravity-file-action-badge"
                              onClick={() => openFile?.(act.path)}
                              title="Click to view file in editor"
                            >
                              <FileCode2 size={13} color="#38bdf8" />
                              <span className="file-badge-path">{act.path}</span>
                              <span className="file-badge-tag">
                                {act.action === "create_file" ? "CREATED" : "UPDATED"}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

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
                  <div className="ai-chat-bubble assistant vocode-thinking-bubble">
                    <div className="bubble-header">
                      <div className="bubble-author-icon">
                        <VocodeLogo size={16} glow={true} />
                      </div>
                      <span className="bubble-author">
                        VocodeAI
                      </span>
                    </div>
                    <div className="vocode-thinking-body">
                      <div className="vocode-pulse-wave">
                        <span className="pulse-bar bar-1" />
                        <span className="pulse-bar bar-2" />
                        <span className="pulse-bar bar-3" />
                      </div>
                      <span className="vocode-thinking-shimmer">
                        vocodeai....
                      </span>
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

        {/* ============ TAB: TERMINAL RUNNER ============ */}
        {activeTab === "terminal" && (
          <div className="ai-terminal-tab-container">
            <div className="ai-terminal-hero">
              <div className="ai-terminal-icon-box">
                <Terminal size={22} />
              </div>
              <h5 className="ai-terminal-title">VocodeAI Terminal Runner</h5>
              <p className="ai-terminal-desc">
                Execute build commands, tests, scripts, and package managers directly in your cloud workspace.
              </p>
            </div>

            {/* Direct Command Input */}
            <div className="ai-terminal-cmd-box">
              <span className="terminal-prompt-symbol">$</span>
              <input
                type="text"
                className="ai-terminal-cmd-input"
                placeholder="Type command (e.g. npm run dev, git status)..."
                value={terminalCmdInput}
                onChange={(e) => setTerminalCmdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && terminalCmdInput.trim()) {
                    handleRunTerminalCommand(terminalCmdInput.trim());
                    setTerminalCmdInput("");
                  }
                }}
              />
              <button
                type="button"
                className="ai-terminal-run-submit"
                onClick={() => {
                  if (terminalCmdInput.trim()) {
                    handleRunTerminalCommand(terminalCmdInput.trim());
                    setTerminalCmdInput("");
                  }
                }}
                disabled={!terminalCmdInput.trim()}
              >
                <Play size={11} />
                <span>Run</span>
              </button>
            </div>

            {/* Quick Commands Grid */}
            <div className="ai-terminal-quick-section">
              <h5 className="ai-section-title">Quick Commands</h5>
              <div className="ai-terminal-quick-grid">
                {[
                  { label: "npm run dev", cmd: "npm run dev", desc: "Start dev server" },
                  { label: "npm install", cmd: "npm install", desc: "Install packages" },
                  { label: "python3 main.py", cmd: "python3 main.py", desc: "Run python script" },
                  { label: "git status", cmd: "git status", desc: "Git status" },
                  { label: "git log", cmd: "git log --oneline -5", desc: "Recent commits" },
                  { label: "ls -la", cmd: "ls -la", desc: "List all files" },
                  { label: "clear", cmd: "clear", desc: "Clear terminal" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ai-terminal-chip-btn"
                    onClick={() => handleRunTerminalCommand(item.cmd)}
                    title={item.desc}
                  >
                    <Play size={10} color="#10b981" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Open / Focus Terminal Dock */}
            <div className="ai-terminal-dock-action">
              <button
                type="button"
                className="ai-terminal-dock-btn"
                onClick={() => {
                  setShowTerminal?.(true);
                  showToast("Integrated Terminal Opened");
                }}
              >
                <Terminal size={14} />
                <span>Open / Focus Integrated Terminal Dock</span>
              </button>
            </div>
          </div>
        )}

        {/* ============ TAB: SETTINGS & AI REQUEST LIMITS ============ */}
        {activeTab === "settings" && (
          <div className="vocode-settings-container vocode-ai-settings-scroll-view">
            {/* Header Hero */}
            <div className="vocode-settings-hero">
              <div className="vocode-settings-icon-box">
                <Gauge size={22} />
              </div>
              <div className="vocode-settings-hero-text">
                <div className="vocode-settings-hero-header-row">
                  <h5 className="vocode-settings-title">AI Usage & Quota Limits</h5>
                  <button
                    type="button"
                    className="vocode-refresh-usage-btn"
                    onClick={fetchAIUsage}
                    title="Refresh AI Usage Statistics"
                    disabled={loadingUsage}
                  >
                    <RefreshCw size={12} className={loadingUsage ? "ai-spin" : ""} />
                    <span>{loadingUsage ? "Refreshing..." : "Refresh"}</span>
                  </button>
                </div>
                <p className="vocode-settings-desc">
                  Live tracking for your active AI requests and limits. All requests are securely powered by the backend API key pool with automatic sequential failover.
                </p>
              </div>
            </div>

            {/* ================= LINE 1: TODAY'S REQUESTS & ACTIVE QUOTA LIMIT ================= */}
            <div className="vocode-quota-line-card line-today">
              <div className="vocode-line-header">
                <div className="vocode-line-title-row">
                  <div className="vocode-line-icon-box line-green">
                    <Activity size={15} />
                  </div>
                  <div>
                    <h6 className="vocode-line-title">Daily Request Quota</h6>
                    <span className="vocode-line-desc">Active 24-hour limit & live prompt consumption</span>
                  </div>
                </div>
                <span className="vocode-line-status-pill green">
                  <CheckCircle2 size={11} />
                  <span>{usageStats.status || "Optimal"}</span>
                </span>
              </div>

              <div className="vocode-line-stat-row">
                <div className="vocode-line-main-metric">
                  <span className="vocode-line-big-num">{usageStats.todayRequests}</span>
                  <span className="vocode-line-limit-sep">/ {usageStats.dailyLimit}</span>
                  <span className="vocode-line-unit">requests used today</span>
                </div>
                <div className="vocode-line-remaining-tag">
                  <span className="highlight-emerald">{usageStats.remainingRequests} requests remaining</span>
                </div>
              </div>

              <div className="vocode-line-progress-track">
                <div
                  className="vocode-line-progress-fill green-grad"
                  style={{ width: `${Math.max(3, usageStats.quotaPercentage)}%` }}
                />
              </div>

              <div className="vocode-line-chips-row">
                <div className="vocode-line-chip">
                  <span className="chip-label">Daily Capacity:</span>
                  <span className="chip-val">{usageStats.dailyLimit} req / day</span>
                </div>
                <div className="vocode-line-chip">
                  <span className="chip-label">Current Chat Session:</span>
                  <span className="chip-val">{sessionRequestCount} req executed</span>
                </div>
                <div className="vocode-line-chip">
                  <span className="chip-label">Quota Consumed:</span>
                  <span className="chip-val">{usageStats.quotaPercentage}% utilized</span>
                </div>
              </div>
            </div>

            {/* ================= LINE 2: AI RATE LIMITS & SPEED CAPACITIES ================= */}
            <div className="vocode-quota-line-card line-speed">
              <div className="vocode-line-header">
                <div className="vocode-line-title-row">
                  <div className="vocode-line-icon-box line-blue">
                    <Gauge size={15} />
                  </div>
                  <div>
                    <h6 className="vocode-line-title">AI Rate Limits & Speed</h6>
                    <span className="vocode-line-desc">Concurrency, throughput & token window limits</span>
                  </div>
                </div>
                <span className="vocode-line-status-pill blue">
                  <Zap size={11} />
                  <span>High-Speed Tier</span>
                </span>
              </div>

              <div className="vocode-line-specs-grid">
                <div className="vocode-spec-box">
                  <span className="spec-label">Rate Limit (RPM)</span>
                  <span className="spec-val">15 req / min</span>
                  <span className="spec-sub">Burst protected</span>
                </div>
                <div className="vocode-spec-box">
                  <span className="spec-label">Max Output Limit</span>
                  <span className="spec-val">4,096 tokens</span>
                  <span className="spec-sub">Per code response</span>
                </div>
                <div className="vocode-spec-box">
                  <span className="spec-label">Context Window</span>
                  <span className="spec-val">128k tokens</span>
                  <span className="spec-sub">Multi-file scope</span>
                </div>
                <div className="vocode-spec-box">
                  <span className="spec-label">Average Latency</span>
                  <span className="spec-val">&lt; 0.8s</span>
                  <span className="spec-sub">Ultra-fast engine</span>
                </div>
              </div>
            </div>

            {/* ================= LINE 3: RENEWAL SCHEDULE & LIFETIME REQUESTS ================= */}
            <div className="vocode-quota-line-card line-reset">
              <div className="vocode-line-header">
                <div className="vocode-line-title-row">
                  <div className="vocode-line-icon-box line-amber">
                    <Clock size={15} />
                  </div>
                  <div>
                    <h6 className="vocode-line-title">Reset Schedule & Lifetime Requests</h6>
                    <span className="vocode-line-desc">Quota renewal countdown & workspace interaction count</span>
                  </div>
                </div>
                <span className="vocode-line-status-pill amber">
                  <Clock size={11} />
                  <span>Auto-Renewing</span>
                </span>
              </div>

              <div className="vocode-line-stat-row">
                <div className="vocode-line-main-metric">
                  <span className="vocode-line-big-num">{usageStats.resetIn}</span>
                  <span className="vocode-line-unit">until next quota renewal</span>
                </div>
                <div className="vocode-line-remaining-tag">
                  <span>Renews daily at 00:00 UTC</span>
                </div>
              </div>

              <div className="vocode-line-chips-row">
                <div className="vocode-line-chip">
                  <span className="chip-label">Lifetime Prompts:</span>
                  <span className="chip-val">{usageStats.totalRequests} total requests</span>
                </div>
                <div className="vocode-line-chip">
                  <span className="chip-label">Server Infrastructure:</span>
                  <span className="chip-val">Multi-Key Backend Cluster</span>
                </div>
                <div className="vocode-line-chip">
                  <span className="chip-label">Failover Engine:</span>
                  <span className="chip-val">Zero-Downtime Protected</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 4. ATTACHMENT CHIPS PREVIEW (ABOVE INPUT) ================= */}
      {activeTab !== "settings" && attachments.length > 0 && (
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
      {activeTab !== "settings" && (
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

          <div className="antigravity-input-box">
            {/* Top Workspace Chip */}
            <div className="antigravity-chips-top">
              <div className="antigravity-chip" title="Current Workspace">
                <Folder size={11} style={{ marginRight: 4, color: "#38bdf8" }} />
                <span>{currentWorkspace?.name || "Workspace"}</span>
                <ChevronDown size={10} style={{ marginLeft: 3, opacity: 0.6 }} />
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              className="antigravity-main-input"
              placeholder={
                usageStats?.remainingRequests <= 0 || (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)
                  ? "Daily AI limit reached (150/150). Quota resets at 12:00 AM midnight."
                  : "Ask anything, @ to mention, / for actions, > to run command"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() || attachments.length > 0) handleSend();
                }
              }}
              disabled={loading || usageStats?.remainingRequests <= 0 || (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)}
            />

            {/* Bottom Actions Row */}
            <div className="antigravity-input-toolbar">
              <div className="antigravity-toolbar-left">
                {/* + Attach Context Button */}
                <button
                  type="button"
                  className="antigravity-tool-btn"
                  onClick={() => setAttachMenuOpen((prev) => !prev)}
                  title="Attach Context (Files, Folders, Images)"
                  disabled={usageStats?.remainingRequests <= 0 || (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)}
                >
                  <Plus size={16} />
                </button>

                {/* VocodeAI Model Tag */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#34d399",
                    padding: "3px 8px",
                    background: "rgba(16, 185, 129, 0.12)",
                    borderRadius: 4,
                    letterSpacing: "0.02em",
                    border: "1px solid rgba(16, 185, 129, 0.28)",
                    userSelect: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="VocodeAI Pair Programmer"
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  VocodeAI
                </span>

                <VoiceInput
                  onCommand={(cmd) => {
                    if (cmd) sendMessage(cmd, workspaceId, attachments);
                  }}
                />
              </div>

              {/* Send Button -> */}
              <button
                type="button"
                className={`antigravity-send-button ${
                  input.trim() || attachments.length > 0 ? "ready" : ""
                }`}
                disabled={
                  (!input.trim() && attachments.length === 0) ||
                  loading ||
                  usageStats?.remainingRequests <= 0 ||
                  (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)
                }
                onClick={() => handleSend()}
                title={
                  usageStats?.remainingRequests <= 0 || (usageStats?.todayRequests !== undefined && usageStats.todayRequests >= 150)
                    ? "Daily limit reached (150/150)"
                    : "Send (Enter)"
                }
              >
                {loading ? (
                  <RotateCcw size={15} className="spin-icon" />
                ) : (
                  <SendHorizontal size={15} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

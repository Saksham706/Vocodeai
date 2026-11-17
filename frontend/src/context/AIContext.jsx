import { createContext, useContext, useState, useEffect } from "react";
import {
  askAI,
  deleteChatHistory,
  clearLegacyAICredentials,
  disconnectAIProviderApi,
} from "../services/aiApi";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const AIContext = createContext();

export function AIProvider({ children }) {
  const { accessToken, user } = useAuth();
  const {
    openFile,
    updateContent,
    addFile,
    runCode,
    openNewTerminal,
    setShowTerminal,
    activeFile,
    applyFileChange,
    loadWorkspace,
    closeTab,
    currentProject,
  } = useWorkspace();

  const wsKey = currentProject || "default";
  const userEmailKey = user?.email?.trim().toLowerCase() || "";

  // VocodeAI Core Engine Configuration
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const primary = (parsed.apiKey || "").trim();
        const backups = Array.isArray(parsed.backupKeys) ? parsed.backupKeys : [];
        return {
          provider: parsed.provider || "gemini",
          model: parsed.model || "vocodeai",
          label: parsed.label || "VocodeAI",
          apiKey: primary,
          backupKeys: backups,
          apiKeys: [primary, ...backups].filter(Boolean),
        };
      }
    } catch {}
    return {
      provider: "gemini",
      model: "vocodeai",
      label: "VocodeAI",
      apiKey: "",
      backupKeys: [],
      apiKeys: [],
    };
  });

  // Read saved provider config
  useEffect(() => {
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const primary = (parsed.apiKey || "").trim();
        const backups = Array.isArray(parsed.backupKeys) ? parsed.backupKeys : [];
        setAiConfig({
          provider: parsed.provider || "gemini",
          model: parsed.model || "vocodeai",
          label: parsed.label || "VocodeAI",
          apiKey: primary,
          backupKeys: backups,
          apiKeys: [primary, ...backups].filter(Boolean),
        });
        return;
      }
    } catch {}
    const defaultConfig = {
      provider: "gemini",
      model: "vocodeai",
      label: "VocodeAI",
      apiKey: "",
      backupKeys: [],
      apiKeys: [],
    };
    setAiConfig(defaultConfig);
  }, [userEmailKey]);

  // Save full settings & sequential API failover key pool
  const saveAiSettings = (newSettings) => {
    const primary = (newSettings.apiKey !== undefined ? newSettings.apiKey : (aiConfig?.apiKey || "")).trim();
    const backups = Array.isArray(newSettings.backupKeys)
      ? newSettings.backupKeys.map((k) => String(k).trim()).filter(Boolean)
      : (aiConfig?.backupKeys || []);
    const combinedKeys = [primary, ...backups].filter(Boolean);

    const updated = {
      ...aiConfig,
      ...newSettings,
      apiKey: primary,
      backupKeys: backups,
      apiKeys: combinedKeys,
    };
    setAiConfig(updated);
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not persist AI config:", err);
    }
    return updated;
  };

  // Connect / Save Provider with direct API Key
  const connectProvider = (config) => {
    if (!config || !config.provider) return false;
    const normProvider = config.provider === "openai" ? "openai" : "gemini";
    const defaultModel = normProvider === "openai" ? "gpt-4o" : "gemini-3.8-flash";
    const normalizedConfig = {
      provider: normProvider,
      model: config.model || defaultModel,
      label:
        config.label ||
        (normProvider === "openai"
          ? (config.model === "gpt-4o-mini" ? "ChatGPT (GPT-4o Mini)" : "ChatGPT (GPT-4o)")
          : (config.model === "gemini-1.5-pro" ? "Gemini 1.5 Pro" : "Gemini 3.8 Flash Medium")),
      apiKey: (config.apiKey || "").trim(),
      authMethod: "api_key",
      connectedAt: new Date().toISOString(),
    };
    setAiConfig(normalizedConfig);
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      localStorage.setItem(storageKey, JSON.stringify(normalizedConfig));
    } catch (err) {
      console.warn("Could not persist AI config to localStorage:", err);
    }
    return true;
  };

  // Disconnect active model & key (reverts to default)
  const disconnectProvider = () => {
    const defaultConfig = {
      provider: "gemini",
      model: "gemini-3.8-flash",
      label: "Gemini 3.8 Flash Medium",
      apiKey: "",
    };
    setAiConfig(defaultConfig);
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn("Could not remove AI config:", err);
    }
    if (accessToken) {
      disconnectAIProviderApi(accessToken).catch(() => {});
    }
  };

  // Switch model dynamically
  const updateAiModel = (newModelId) => {
    const isOAI = newModelId && newModelId.startsWith("gpt");
    const normProvider = isOAI ? "openai" : "gemini";
    const defaultLabel = isOAI
      ? (newModelId === "gpt-4o-mini" ? "ChatGPT (GPT-4o Mini)" : "ChatGPT (GPT-4o)")
      : (newModelId === "gemini-1.5-pro" ? "Gemini 1.5 Pro" : "Gemini 3.8 Flash Medium");

    const updated = {
      ...(aiConfig || {}),
      provider: normProvider,
      model: newModelId || (isOAI ? "gpt-4o" : "gemini-3.8-flash"),
      label: defaultLabel,
    };
    setAiConfig(updated);
    try {
      const storageKey = userEmailKey
        ? `vocode_ai_provider_config_${userEmailKey}`
        : "vocode_ai_provider_config_default";
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  // Load saved sessions from localStorage
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(`vocode_ai_sessions_${wsKey}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const stored = localStorage.getItem(`vocode_ai_active_session_${wsKey}`);
      return stored || null;
    } catch {
      return null;
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const storedSessions = localStorage.getItem(`vocode_ai_sessions_${wsKey}`);
      const list = storedSessions ? JSON.parse(storedSessions) : [];
      const storedActive = localStorage.getItem(`vocode_ai_active_session_${wsKey}`);
      const found = list.find((s) => s.id === storedActive);
      return found ? found.messages : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync sessions when workspace changes
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(`vocode_ai_sessions_${wsKey}`);
      const list = storedSessions ? JSON.parse(storedSessions) : [];
      setSessions(list);
      const storedActive = localStorage.getItem(`vocode_ai_active_session_${wsKey}`);
      const found = list.find((s) => s.id === storedActive);
      if (found) {
        setCurrentSessionId(found.id);
        setMessages(found.messages || []);
      } else if (list.length > 0) {
        setCurrentSessionId(list[0].id);
        setMessages(list[0].messages || []);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch {}
  }, [wsKey]);

  // Persist sessions to localStorage
  const saveSessions = (updatedSessions, newActiveId = currentSessionId) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(`vocode_ai_sessions_${wsKey}`, JSON.stringify(updatedSessions));
      if (newActiveId) {
        localStorage.setItem(`vocode_ai_active_session_${wsKey}`, newActiveId);
      }
    } catch {}
  };

  // Start a new fresh chat session
  const createNewSession = (initialTitle = "New Chat") => {
    const newId = `sess_${Date.now()}`;
    const newSession = {
      id: newId,
      title: initialTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    const updated = [newSession, ...sessions];
    setCurrentSessionId(newId);
    setMessages([]);
    saveSessions(updated, newId);
    return newId;
  };

  // Load a specific historical session
  const loadSession = (sessionId) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setCurrentSessionId(found.id);
      setMessages(found.messages || []);
      try {
        localStorage.setItem(`vocode_ai_active_session_${wsKey}`, found.id);
      } catch {}
    }
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    const filtered = sessions.filter((s) => s.id !== sessionId);
    if (currentSessionId === sessionId) {
      if (filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
        setMessages(filtered[0].messages || []);
        saveSessions(filtered, filtered[0].id);
      } else {
        setCurrentSessionId(null);
        setMessages([]);
        saveSessions(filtered, null);
      }
    } else {
      saveSessions(filtered);
    }

    // Delete chat records from MongoDB
    try {
      if (accessToken) {
        await deleteChatHistory(accessToken, wsKey);
      }
    } catch (err) {
      console.warn("Could not delete chat from MongoDB:", err.message);
    }
  };

  // Export session as a real markdown chat file in workspace
  const saveChatToFile = async (sessionId) => {
    const targetSession = sessions.find((s) => s.id === (sessionId || currentSessionId));
    if (!targetSession || !targetSession.messages?.length) return null;

    const dateStr = new Date(targetSession.createdAt).toISOString().slice(0, 10);
    const safeTitle = targetSession.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const fileName = `chats/${safeTitle}_${dateStr}.chat.md`;

    let md = `# VocodeAI Chat Session: ${targetSession.title}\n`;
    md += `*Recorded on: ${new Date(targetSession.createdAt).toLocaleString()}*\n\n---\n\n`;

    for (const msg of targetSession.messages) {
      const author = msg.role === "user" ? "### 👤 User" : "### 🤖 VocodeAI";
      md += `${author}\n`;
      if (msg.attachments && msg.attachments.length > 0) {
        md += `*Attached Items:* ${msg.attachments.map((a) => a.name).join(", ")}\n\n`;
      }
      md += `${msg.content}\n\n---\n\n`;
    }

    try {
      await applyFileChange(fileName, md);
      return fileName;
    } catch (err) {
      console.error("Failed to save chat file:", err);
      return null;
    }
  };

  const sendMessage = async (text, workspaceId, attachments = []) => {
    setLoading(true);

    let activeId = currentSessionId;
    let currentSess = sessions.find((s) => s.id === activeId);

    // If no active session, create one
    if (!currentSess) {
      const firstTitle = text.slice(0, 36) + (text.length > 36 ? "..." : "");
      activeId = createNewSession(firstTitle || "New Conversation");
      currentSess = {
        id: activeId,
        title: firstTitle || "New Conversation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
    }

    const userMessage = {
      role: "user",
      content: text,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      timestamp: new Date().toISOString(),
    };

    // Update session title on first user message if it's default
    let updatedTitle = currentSess.title;
    if (
      currentSess.messages.length === 0 ||
      currentSess.title === "New Chat" ||
      currentSess.title === "New Conversation"
    ) {
      updatedTitle = text.slice(0, 38) + (text.length > 38 ? "..." : "");
    }

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    try {
      const res = await askAI(accessToken, text, workspaceId, activeFile, attachments, aiConfig);
      const ai = res.ai;

      /* ================= MULTI ACTION SUPPORT ================= */
      if (ai?.actions) {
        // Flatten any nested JSON action responses
        const safeActions = [];
        for (const act of ai.actions) {
          if (
            (act.action === "create_file" || act.action === "write_file") &&
            typeof act.content === "string" &&
            (act.content.includes('"actions": [') || act.content.includes('"actions":['))
          ) {
            try {
              const nestedMatch = act.content.match(/\{[\s\S]*"actions"[\s\S]*\}/);
              if (nestedMatch) {
                const nested = JSON.parse(nestedMatch[0]);
                if (nested?.actions && Array.isArray(nested.actions)) {
                  safeActions.push(...nested.actions);
                  continue;
                }
              }
            } catch {}
          }
          safeActions.push(act);
        }

        for (const action of safeActions) {
          if (action.action === "create_file" || action.action === "write_file") {
            await applyFileChange(action.path, action.content || "");
          }

          if (action.action === "delete_file" || action.action === "remove_file") {
            const clean = (action.path || "").replace(/^[\\\/]+/, "");
            closeTab(clean);
            await loadWorkspace();
          }

          if (action.action === "run_code" || action.action === "terminal") {
            setShowTerminal?.(true);
            const cmd = action.command || "";
            let targetFile = action.path;
            if (!targetFile && cmd) {
              const fileMatch = cmd.match(
                /([a-zA-Z0-9_\-./\\]+\.(cpp|cc|c|java|py|js|ts|jsx|tsx|html|sh))/i
              );
              if (fileMatch) targetFile = fileMatch[1];
            }
            if (!targetFile) targetFile = activeFile;
            await runCode(targetFile, cmd || null);
          }
        }

        // Safety fallback: If user explicitly asked to run a file or code in chat, but no run_code action was emitted
        const isRunPrompt =
          /^(run|execute|compile|start)\s+/i.test((text || "").trim()) ||
          /\b(run|execute)\b.*\b(terminal|file|code)\b/i.test(text || "");

        const hasRunAction = safeActions.some(
          (a) => a.action === "run_code" || a.action === "terminal"
        );

        if (isRunPrompt && !hasRunAction) {
          const fileMatch = (text || "").match(
            /([a-zA-Z0-9_\-./\\]+\.(cpp|cc|c|java|py|js|ts|jsx|tsx|html|sh))/i
          );
          const fileToRun = fileMatch ? fileMatch[1] : activeFile;
          if (fileToRun) {
            setShowTerminal?.(true);
            await runCode(fileToRun);
          }
        }
      }

      /* ================= CHAT ================= */
      const chatAction = ai?.actions?.find((a) => a.action === "chat");
      const runAction = ai?.actions?.find(
        (a) => a.action === "run_code" || a.action === "terminal"
      );
      let replyMessage =
        chatAction?.message ||
        res.reply ||
        (runAction
          ? `Running ${runAction.path || runAction.command || "command"} in terminal...`
          : ai?.actions?.length
          ? `Executed: ${ai.actions.map((a) => a.path || a.action).join(", ")} ✅`
          : "Done ✅");

      if (
        typeof replyMessage === "string" &&
        (replyMessage.trim().startsWith("{") || replyMessage.trim().startsWith("["))
      ) {
        const file = ai?.actions?.find(
          (a) => a.action === "create_file" || a.action === "write_file"
        );
        replyMessage = file
          ? `Created and loaded ${file.path} with the requested code.`
          : "Task executed successfully.";
      }

      const assistantMessage = {
        role: "assistant",
        content: replyMessage,
        modelName: "VocodeAI",
        actions: ai?.actions || [],
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist to session
      const updatedSessions = sessions.map((s) => {
        if (s.id === activeId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: finalMessages,
          };
        }
        return s;
      });

      // If activeId wasn't in sessions array yet
      if (!updatedSessions.some((s) => s.id === activeId)) {
        updatedSessions.unshift({
          id: activeId,
          title: updatedTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: finalMessages,
        });
      }

      saveSessions(updatedSessions, activeId);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        role: "assistant",
        content: `❌ ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...nextMessages, errorMessage];
      setMessages(finalMessages);

      const updatedSessions = sessions.map((s) => {
        if (s.id === activeId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: finalMessages,
          };
        }
        return s;
      });
      saveSessions(updatedSessions, activeId);
    }

    setLoading(false);
  };

  return (
    <AIContext.Provider
      value={{
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
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => useContext(AIContext);

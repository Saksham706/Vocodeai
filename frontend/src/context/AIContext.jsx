import { createContext, useContext, useState, useEffect, useRef } from "react";
import { askAI, deleteChatHistory } from "../services/aiApi";
import { useAuth } from "./AuthContext";
import { useWorkspace } from "./WorkspaceContext";

const AIContext = createContext();

export function AIProvider({ children }) {
  const { accessToken } = useAuth();
  const {
    openFile,
    updateContent,
    addFile,
    runCode,
    openNewTerminal,
    activeFile,
    applyFileChange,
    loadWorkspace,
    closeTab,
    currentProject,
  } = useWorkspace();

  const wsKey = currentProject || "default";

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
      const res = await askAI(accessToken, text, workspaceId, activeFile, attachments);
      const ai = res.ai;

      /* ================= MULTI ACTION SUPPORT ================= */
      if (ai?.actions) {
        for (const action of ai.actions) {
          if (action.action === "create_file" || action.action === "write_file") {
            await applyFileChange(action.path, action.content || "");
          }

          if (action.action === "delete_file" || action.action === "remove_file") {
            const clean = (action.path || "").replace(/^[\\\/]+/, "");
            closeTab(clean);
            await loadWorkspace();
          }

          if (action.action === "run_code" || action.action === "terminal") {
            openNewTerminal();
            setTimeout(() => runCode(), 300);
          }
        }
      }

      /* ================= CHAT ================= */
      const chatAction = ai?.actions?.find((a) => a.action === "chat");
      let replyMessage =
        chatAction?.message ||
        res.reply ||
        (ai?.actions?.length
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

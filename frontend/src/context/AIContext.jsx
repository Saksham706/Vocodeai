import { createContext, useContext, useState } from "react";
import { askAI } from "../services/aiApi";
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
  } = useWorkspace();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text, workspaceId) => {
    setLoading(true);

    try {
      const res = await askAI(accessToken, text, workspaceId, activeFile);

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

      // Guard against displaying raw JSON in the chat UI
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

      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: replyMessage },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: `❌ ${err.message}` },
      ]);
    }

    setLoading(false);
  };

  return (
    <AIContext.Provider value={{ sendMessage, messages, loading }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => useContext(AIContext);

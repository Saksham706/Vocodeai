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
  } = useWorkspace();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text, workspaceId) => {
    setLoading(true);

    try {
      const res = await askAI(accessToken, text, workspaceId);

      const ai = res.ai;

      /* ================= MULTI ACTION SUPPORT ================= */

      if (ai.actions) {
        for (const action of ai.actions) {

          if (action.action === "create_file") {
            await addFile("", action.path);
            await openFile(action.path);
            updateContent(action.path, action.content || "");
          }

          if (action.action === "write_file") {
            await openFile(action.path);
            updateContent(action.path, action.content || "");
          }

          if (action.action === "run_code" || action.action === "terminal") {
            openNewTerminal();
            setTimeout(() => runCode(), 300);
          }
        }
      }

      /* ================= CHAT ================= */

      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "Done ✅" },
      ]);

    } catch (err) {
      console.error(err);
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
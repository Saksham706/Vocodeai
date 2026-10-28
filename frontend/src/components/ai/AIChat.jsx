import { useState } from "react";
import { useAI } from "../../context/AIContext";
import VoiceInput from "./VoiceInput";
import "../../styles/ai.css";

export default function AIChat({ workspaceId }) {
  const { sendMessage, messages, loading } = useAI();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, workspaceId);
    setInput("");
  };

  return (
    <div className="ai-panel">

      {/* ✅ MESSAGES */}
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {typeof m.content === "string"
              ? m.content
              : m.content?.message || JSON.stringify(m.content)}
          </div>
        ))}
      </div>

      {/* ✅ INPUT AREA */}
      <div className="ai-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VocodeAI..."
        />

        {/* ✅ ONLY ONE VOICE BUTTON */}
        <VoiceInput onCommand={(cmd) => sendMessage(cmd, workspaceId)} />

        <button onClick={handleSend}>Send</button>
      </div>

      {/* ✅ LOADING OUTSIDE INPUT */}
      {loading && <div className="ai-loading">Thinking...</div>}

    </div>
  );
}
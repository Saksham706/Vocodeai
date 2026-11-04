import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  User,
  GripHorizontal,
} from "lucide-react";
import { VOCA_SUGGESTIONS, queryVocaKnowledge, analyzeCurrentPage } from "./vocaKnowledge";
import { playVocaSound, speakVocaText, stopVocaSpeech } from "./vocaSounds";
import "../../styles/VocaChatbot.css";

const CHAT_WIDTH_DESKTOP = 350;
const CHAT_HEIGHT_DESKTOP = 480;
const VIEWPORT_MARGIN = 12;

export default function VocaChatbot({
  isOpen,
  onClose,
  anchorPos = { x: 500, y: 500 },
  onDragMove,
}) {
  const location = useLocation();
  const pageContext = analyzeCurrentPage(location.pathname);

  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      content: `Hey! I'm **Voca**, your VocodeAI guide. 🦉✨

📍 You are currently on the **${pageContext.pageName}** (\`${pageContext.route}\`).

Ask me anything about this page or platform:
- 🔎 **Page Analysis**: *"Explain my current page"*
- 🎙️ **Voice-to-Code**: Hands-free dictation
- ☁️ **Cloud Storage**: Sub-second autosave sync
- 📱 **Any Device**: Code on iPad, phone, or laptop
- ⚡ **Cloud Micro-VMs**: xterm.js terminal & Docker`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("voca_sound_enabled") === "true";
    } catch {
      return false;
    }
  });
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const headerDragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  // 1. Compute dynamic positioning anchored cleanly to the robot mascot
  const computePosition = () => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    const mascotSize = winW <= 480 ? 80 : winW <= 768 ? 88 : 112;
    const chatW = winW <= 480 ? Math.min(340, winW - 20) : CHAT_WIDTH_DESKTOP;
    const chatH = winH <= 640 ? Math.min(460, winH - 90) : CHAT_HEIGHT_DESKTOP;

    // Horizontal placement: align near mascot, clamp to viewport
    let left = anchorPos.x + mascotSize - chatW;
    if (left < VIEWPORT_MARGIN) {
      left = VIEWPORT_MARGIN;
    }
    if (left + chatW > winW - VIEWPORT_MARGIN) {
      left = winW - VIEWPORT_MARGIN - chatW;
    }

    // Vertical placement: prefer floating above the mascot
    let top = anchorPos.y - chatH - 10;
    if (top < VIEWPORT_MARGIN) {
      // If too close to screen top, float below mascot
      top = anchorPos.y + mascotSize + 10;
    }
    if (top + chatH > winH - VIEWPORT_MARGIN) {
      top = Math.max(VIEWPORT_MARGIN, winH - VIEWPORT_MARGIN - chatH);
    }

    return { left, top, width: chatW, height: chatH };
  };

  const pos = computePosition();

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [messages, isTyping, isOpen]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // 2. Sound Toggle (Real & Fully Functional Audio + TTS)
  const handleToggleSound = () => {
    if (!soundEnabled) {
      setSoundEnabled(true);
      try {
        localStorage.setItem("voca_sound_enabled", "true");
      } catch {}
      playVocaSound("toggle-on");
      speakVocaText("Voca voice and audio activated!");
    } else {
      setSoundEnabled(false);
      try {
        localStorage.setItem("voca_sound_enabled", "false");
      } catch {}
      stopVocaSpeech();
      playVocaSound("toggle-off");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your question!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (soundEnabled) playVocaSound("send");
      } catch (err) {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      }
    }
  };

  // 3. Send Message Handler
  const handleSend = async (queryText = null) => {
    const textToSend = typeof queryText === "string" ? queryText : input;
    if (!textToSend.trim() || isTyping) return;

    if (soundEnabled) playVocaSound("send");

    const userMsg = {
      id: `user_${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    let replyContent = "";

    try {
      const res = await fetch("/api/ai/voca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.slice(-3).map((m) => ({ role: m.role, content: m.content })),
          currentPageContext: pageContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          replyContent = data.reply;
        }
      }
    } catch {
      // Backend offline: seamless fallback to knowledge base
    }

    if (!replyContent) {
      const match = queryVocaKnowledge(textToSend, pageContext);
      replyContent = match?.answer || queryVocaKnowledge("overview", pageContext).answer;
    }

    setTimeout(() => {
      const botMsg = {
        id: `voca_${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (soundEnabled) {
        playVocaSound("chirp");
        speakVocaText(replyContent);
      }
    }, 400);
  };

  const handleClearHistory = () => {
    stopVocaSpeech();
    if (soundEnabled) playVocaSound("send");
    setMessages([
      {
        id: "cleared_welcome",
        role: "assistant",
        content: `Chat history cleared! You are on the **${pageContext.pageName}** (\`${pageContext.route}\`). What would you like to explore next? 🦉`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // 4. Header Drag Handler (moves the chatbot and mascot together)
  const handleHeaderPointerDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    headerDragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const handleHeaderPointerMove = (e) => {
    if (!headerDragRef.current.isDragging) return;
    const deltaX = e.clientX - headerDragRef.current.startX;
    const deltaY = e.clientY - headerDragRef.current.startY;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      headerDragRef.current.startX = e.clientX;
      headerDragRef.current.startY = e.clientY;
      if (onDragMove) {
        onDragMove(deltaX, deltaY);
      }
    }
  };

  const handleHeaderPointerUp = (e) => {
    headerDragRef.current.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <aside
      className="voca-chatbot-panel"
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        width: `${pos.width}px`,
        height: `${pos.height}px`,
      }}
      role="dialog"
      aria-labelledby="voca-title"
      aria-modal="true"
    >
      {/* 1. Draggable Header */}
      <header
        className="voca-header"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
        title="Drag by header to move Voca anywhere!"
      >
        <div className="voca-brand">
          <div className="voca-avatar-wrap">
            <img
              src="/mascot.png"
              alt="Voca Robot Owl"
              className="voca-header-avatar"
            />
            <span className="voca-online-pulse" title="Voca Online" />
          </div>
          <div className="voca-brand-text">
            <div className="voca-name-row">
              <h3 id="voca-title" className="voca-name">Voca</h3>
              <span className="voca-badge">Assistant</span>
            </div>
            <span
              className="voca-status-desc voca-page-indicator"
              title={`Active Screen: ${pageContext.pageName} (${pageContext.route})`}
            >
              📍 {pageContext.pageName}
            </span>
          </div>
        </div>

        <div className="voca-header-actions">
          {/* Real Functional Sound / TTS Toggle Button */}
          <button
            type="button"
            className={`voca-btn-icon ${soundEnabled ? "is-active" : ""}`}
            onClick={handleToggleSound}
            title={
              soundEnabled
                ? "Sound & Voice Enabled (Click to mute)"
                : "Sound Muted (Click to activate voice & robot chimes)"
            }
            aria-label="Toggle sound and voice reading"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Reset / Clear Chat */}
          <button
            type="button"
            className="voca-btn-icon"
            onClick={handleClearHistory}
            title="Clear Chat History"
            aria-label="Clear chat"
          >
            <RotateCcw size={14} />
          </button>

          {/* Close Chat Window */}
          <button
            type="button"
            className="voca-btn-icon voca-btn-close"
            onClick={() => {
              stopVocaSpeech();
              onClose();
            }}
            title="Close Voca Chat"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 2. Compact Messages Container */}
      <div className="voca-messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`voca-message-row ${msg.role === "user" ? "user-row" : "bot-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="voca-msg-avatar">
                <img src="/mascot.png" alt="Voca" />
              </div>
            )}

            <div className={`voca-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
              <div className="voca-bubble-text">
                <SimpleMarkdown text={msg.content} />
              </div>

              {/* Message Meta Footer */}
              <div className="voca-msg-meta">
                <span className="voca-timestamp">{msg.timestamp}</span>

                {msg.role === "assistant" && (
                  <div className="voca-msg-actions">
                    <button
                      type="button"
                      className="voca-mini-btn"
                      onClick={() => speakVocaText(msg.content)}
                      title="Read aloud with voice"
                    >
                      <Volume2 size={11} />
                    </button>
                    <button
                      type="button"
                      className="voca-mini-btn"
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={11} color="#00F098" /> : <Copy size={11} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="voca-user-avatar">
                <User size={12} />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="voca-message-row bot-row">
            <div className="voca-msg-avatar">
              <img src="/mascot.png" alt="Voca" />
            </div>
            <div className="voca-bubble bot-bubble voca-typing-bubble">
              <span className="voca-typing-dot" />
              <span className="voca-typing-dot" />
              <span className="voca-typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Compact Suggestion Chips */}
      <div className="voca-suggestions-bar">
        <span className="voca-suggestions-label">
          <Sparkles size={10} /> Quick Topics:
        </span>
        <div className="voca-chips-scroll">
          {VOCA_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              className="voca-chip"
              onClick={() => handleSend(sug.query)}
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Sleek Input Bar */}
      <form
        className="voca-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div className="voca-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="voca-text-input"
            placeholder={isListening ? "Listening... Speak now" : "Ask Voca anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="button"
            className={`voca-mic-btn ${isListening ? "is-recording" : ""}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Voice input (Speak)"}
            aria-label="Voice input"
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          <button
            type="submit"
            className="voca-send-btn"
            disabled={!input.trim() || isTyping}
            title="Send"
            aria-label="Send"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </aside>
  );
}

/**
 * Clean markdown formatter for Voca
 */
function SimpleMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="voca-md-spacer" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="voca-md-h4">
              <FormatSpans text={trimmed.replace(/^###\s+/, "")} />
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="voca-md-h3">
              <FormatSpans text={trimmed.replace(/^##\s+/, "")} />
            </h3>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="voca-md-bullet">
              <span className="voca-bullet-dot">•</span>
              <span className="voca-bullet-content">
                <FormatSpans text={trimmed.replace(/^[-*]\s+/, "")} />
              </span>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s+/)[1];
          return (
            <div key={idx} className="voca-md-bullet">
              <span className="voca-bullet-num">{num}.</span>
              <span className="voca-bullet-content">
                <FormatSpans text={trimmed.replace(/^\d+\.\s+/, "")} />
              </span>
            </div>
          );
        }

        return (
          <p key={idx} className="voca-md-p">
            <FormatSpans text={trimmed} />
          </p>
        );
      })}
    </>
  );
}

function FormatSpans({ text }) {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith("`") && part.endsWith("`")) {
          const inner = part.slice(1, -1);
          if (inner.includes("Ctrl") || inner.includes("Cmd") || inner.includes("Esc")) {
            return <kbd key={i} className="voca-keycap">{inner}</kbd>;
          }
          return <code key={i} className="voca-inline-code">{inner}</code>;
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

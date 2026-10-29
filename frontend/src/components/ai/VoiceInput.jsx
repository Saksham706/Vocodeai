import { useState, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

export default function VoiceInput({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorNotice("Speech recognition is not supported in this browser.");
      setTimeout(() => setErrorNotice(""), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results?.[0]?.[0]?.transcript;
        if (text && onCommand) {
          onCommand(text);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Speech initialization error:", e);
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  };

  return (
    <div className="voice-wrapper" style={{ position: "relative" }}>
      <button
        type="button"
        className={`voice-btn ${listening ? "active" : ""}`}
        onClick={listening ? stopListening : startListening}
        title={listening ? "Click to stop listening" : "Click to speak voice command"}
      >
        {listening ? <FaStop /> : <FaMicrophone />}
      </button>

      {errorNotice && (
        <div className="voice-tooltip">
          {errorNotice}
        </div>
      )}
    </div>
  );
}

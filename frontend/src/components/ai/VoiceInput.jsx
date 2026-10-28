import { useState, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

export default function VoiceInput({ onCommand }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;   
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text =
        event.results[0][0].transcript;

      console.log("VOICE:", text);

      // ✅ DIRECT COMMAND (NO WAKE WORD)
      onCommand(text);
    };

    recognition.onerror = (err) => {
      console.error("Speech error:", err);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <button
      className={`voice-btn ${listening ? "active" : ""}`}
      onClick={listening ? stopListening : startListening}
    >
      {listening ? <FaStop /> : <FaMicrophone />}
    </button>
  );
}
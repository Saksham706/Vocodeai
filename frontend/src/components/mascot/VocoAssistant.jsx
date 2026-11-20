import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Terminal,
  FolderPlus,
  FilePlus,
  Play,
  LayoutDashboard,
  SunMoon,
  FolderOpen,
} from "lucide-react";
import VocoSiriOrb from "./VocoSiriOrb";
import { playVocaSound, speakVocaText, stopVocaSpeech } from "./vocaSounds";
import { queryVocaKnowledge, analyzeCurrentPage } from "./vocaKnowledge";
import { askAI } from "../../services/aiApi";
import { useAuth } from "../../context/AuthContext";
import "../../styles/VocoAssistant.css";

// Voice command patterns for VocodeAI
const COMMAND_PATTERNS = [
  // 1. Open Folder (e.g. "open the hi folder in the workspace", "open hi folder", "open folder hi")
  {
    type: "open-folder",
    regex: /(?:open|expand|show|view|navigate to|go to)(?:\s+the)?\s+(?:folder\s+([a-zA-Z0-9_\-./]+)|([a-zA-Z0-9_\-./]+)\s+folder)(?:\s+in(?:\s+the)?\s+workspace)?/i,
    feedback: (match) => {
      const name = match?.[1] || match?.[2] || "folder";
      return `Opening the ${name} folder in your workspace.`;
    },
    extractPayload: (match) => ({
      name: match?.[1] || match?.[2] || "",
    }),
  },
  // 2. Open File (e.g. "open ThreeSum.java", "open file TwoSum.java")
  {
    type: "open-file",
    regex: /(?:open|edit|show|view)\s+(?:the\s+)?file\s+([a-zA-Z0-9_\-./]+)|(?:open|edit)\s+([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/i,
    feedback: (match) => {
      const name = match?.[1] || match?.[2] || "file";
      return `Opening ${name} in editor.`;
    },
    extractPayload: (match) => ({
      name: match?.[1] || match?.[2] || "",
    }),
  },
  // 3. Open Workspace
  {
    type: "open-workspace",
    regex: /(?:open|go to|launch|switch to)(?:\s+my)?\s+workspace/i,
    feedback: "Opening your workspace now.",
  },
  // 4. Terminal Commands
  {
    type: "open-terminal",
    regex: /(?:run|open|show|start|launch)(?:\s+the)?\s+terminal/i,
    feedback: "Opening integrated cloud terminal.",
  },
  {
    type: "close-terminal",
    regex: /(?:close|hide|exit)(?:\s+the)?\s+terminal/i,
    feedback: "Hiding terminal.",
  },
  // 5. Code Execution
  {
    type: "run-code",
    regex: /(?:run|execute|test)(?:\s+the)?\s+(?:code|file|project|program)/i,
    feedback: "Running your code in the cloud sandbox.",
  },
  // 6. Create File & Folder
  {
    type: "create-file",
    regex: /(?:create|make|add|new)\s+(?:a\s+)?file(?:\s+(?:named|called)?\s*([a-zA-Z0-9_\-./]+))?/i,
    feedback: (match) => `Creating file ${match?.[1] ? match[1] : ""}.`,
    extractPayload: (match) => ({ name: match?.[1] || "" }),
  },
  {
    type: "create-folder",
    regex: /(?:create|make|add|new)\s+(?:a\s+)?folder(?:\s+(?:named|called)?\s*([a-zA-Z0-9_\-./]+))?/i,
    feedback: (match) => `Creating folder ${match?.[1] ? match[1] : ""}.`,
    extractPayload: (match) => ({ name: match?.[1] || "" }),
  },
  // 7. Navigation & Utilities
  {
    type: "open-dashboard",
    regex: /(?:go to|open|show|view)\s+dashboard/i,
    feedback: "Taking you to your workspace dashboard.",
  },
  {
    type: "open-docs",
    regex: /(?:open|show|read|go to)\s+(?:documentation|docs|guide)/i,
    feedback: "Opening VocodeAI documentation.",
  },
  {
    type: "toggle-theme",
    regex: /(?:switch|toggle|change)(?:\s+to)?\s+(?:theme|dark mode|light mode)/i,
    feedback: "Switching appearance theme.",
  },
  {
    type: "open-git",
    regex: /(?:open|show|view)\s+(?:git|source control|repository)/i,
    feedback: "Opening source control panel.",
  },
  {
    type: "save-file",
    regex: /(?:save|persist)(?:\s+this|\s+the)?\s+file/i,
    feedback: "Saving active file to cloud storage.",
  },
  {
    type: "toggle-explorer",
    regex: /(?:open|toggle|show|close)\s+(?:explorer|files|file tree)/i,
    feedback: "Toggling file explorer.",
  },
  {
    type: "open-settings",
    regex: /(?:open|show|view)\s+settings/i,
    feedback: "Opening settings and preferences.",
  },
];

export default function VocoAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Assistant states
  const [isOpen, setIsOpen] = useState(false);
  const [orbState, setOrbState] = useState("idle"); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGreetingToast, setShowGreetingToast] = useState(false);

  // Live Hardware Microphone & Audio Meter States
  const [micActive, setMicActive] = useState(false);
  const [micPermission, setMicPermission] = useState("unknown");
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isListeningEnabledRef = useRef(true);
  const restartTimerRef = useRef(null);
  const autoDismissTimerRef = useRef(null);
  const hasDeniedPermissionRef = useRef(false);
  const autoGreetedRef = useRef(false);

  // 1. Landing Page Speech Greeting ("Welcome to Vocodeai. Hey, I am Voco")
  useEffect(() => {
    if (location.pathname === "/" && !autoGreetedRef.current) {
      const alreadyGreeted = sessionStorage.getItem("voco_landing_greeted");
      if (!alreadyGreeted) {
        autoGreetedRef.current = true;
        sessionStorage.setItem("voco_landing_greeted", "true");

        const greetingSpeech = "Welcome to Vocodeai! Hey, I am Voco.";

        const triggerGreeting = () => {
          setShowGreetingToast(true);
          playVocaSound("open");
          speakVocaText(greetingSpeech);
          cleanupEvents();
        };

        const cleanupEvents = () => {
          window.removeEventListener("pointerdown", triggerGreeting);
          window.removeEventListener("keydown", triggerGreeting);
        };

        try {
          speakVocaText(greetingSpeech);
          setShowGreetingToast(true);
        } catch {
          window.addEventListener("pointerdown", triggerGreeting, { once: true });
          window.addEventListener("keydown", triggerGreeting, { once: true });
        }

        const t = setTimeout(() => setShowGreetingToast(false), 8000);
        return () => {
          clearTimeout(t);
          cleanupEvents();
        };
      }
    }
  }, [location.pathname]);

  // 2. Hardware Microphone Acquisition (Keeps Chrome Mic Stream Open & Active)
  const initMicrophone = useCallback(async () => {
    try {
      hasDeniedPermissionRef.current = false;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      // Check if we already hold an active live audio stream
      if (mediaStreamRef.current && mediaStreamRef.current.active) {
        const liveTracks = mediaStreamRef.current
          .getAudioTracks()
          .filter((t) => t.readyState === "live");
        if (liveTracks.length > 0) {
          liveTracks.forEach((t) => {
            t.enabled = true;
          });
          setMicActive(true);
          setMicPermission("granted");
          startListening();
          return true;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setMicActive(true);
      setMicPermission("granted");
      hasDeniedPermissionRef.current = false;

      // Hook stream to Web Audio API for real-time waveform reactions
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (!audioContextRef.current || audioContextRef.current.state === "closed") {
            audioContextRef.current = new AudioCtx();
          }
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
          }
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.65;
          source.connect(analyser);
          analyserRef.current = analyser;

          const pcmData = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioMeter = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(pcmData);
            let sum = 0;
            for (let i = 0; i < pcmData.length; i++) {
              sum += pcmData[i];
            }
            const avg = sum / pcmData.length;
            const level = Math.min(1, avg / 85);
            setAudioLevel(level);
            animFrameRef.current = requestAnimationFrame(updateAudioMeter);
          };
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          updateAudioMeter();
        }
      } catch (audioErr) {
        console.warn("Audio meter setup notice:", audioErr);
      }

      startListening();
      return true;
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        hasDeniedPermissionRef.current = true;
        setMicPermission("denied");
      }
      setMicActive(false);
      return false;
    }
  }, []);

  // 3. Background Speech Recognition for "Hey Voco" Wake Word & Commands
  const startListening = useCallback(() => {
    if (hasDeniedPermissionRef.current) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        isListeningRef.current = true;
        if (isOpen) setOrbState("listening");
      };

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          currentTranscript += res[0].transcript;
          if (res.isFinal) {
            handleFinalSpokenText(currentTranscript.trim());
            currentTranscript = "";
          }
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
          checkWakeWord(currentTranscript);
        }
      };

      rec.onerror = (e) => {
        if (
          e.error === "not-allowed" ||
          e.error === "service-not-allowed" ||
          e.error === "audio-capture"
        ) {
          hasDeniedPermissionRef.current = true;
          setMicPermission("denied");
          setMicActive(false);
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
          }
          return;
        }
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("Speech recognition notice:", e.error);
        }
      };

      rec.onend = () => {
        isListeningRef.current = false;
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = null;
        }

        if (hasDeniedPermissionRef.current || !isListeningEnabledRef.current) {
          return;
        }

        if (isOpen) {
          restartTimerRef.current = setTimeout(() => {
            if (
              recognitionRef.current &&
              isListeningEnabledRef.current &&
              !hasDeniedPermissionRef.current &&
              isOpen
            ) {
              try {
                recognitionRef.current.start();
              } catch {}
            }
          }, 1000);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      if (err.name === "NotAllowedError") {
        hasDeniedPermissionRef.current = true;
      }
    }
  }, [isOpen]);

  // Check for "Hey Voco" wake word
  const checkWakeWord = (phrase) => {
    const lower = phrase.toLowerCase();
    if (
      lower.includes("hey voco") ||
      lower.includes("hey voko") ||
      lower.includes("voco") ||
      lower.includes("voko") ||
      lower.includes("hi voco") ||
      lower.includes("ok voco")
    ) {
      if (!isOpen) {
        handleWakeUp();
      }
    }
  };

  const handleWakeUp = async () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    hasDeniedPermissionRef.current = false;
    setIsOpen(true);
    setOrbState("listening");
    setTranscript("Listening...");
    await initMicrophone();
    playVocaSound("open"); // Signature Apple Siri double-chime
    speakVocaText("Hey! How can I help you?");
  };

  // Check existing permissions & hook user gesture on mount
  useEffect(() => {
    isListeningEnabledRef.current = true;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((permStatus) => {
          setMicPermission(permStatus.state);
          if (permStatus.state === "granted") {
            hasDeniedPermissionRef.current = false;
            initMicrophone();
          } else if (permStatus.state === "denied") {
            hasDeniedPermissionRef.current = true;
          }
          permStatus.onchange = () => {
            setMicPermission(permStatus.state);
            if (permStatus.state === "granted") {
              hasDeniedPermissionRef.current = false;
              initMicrophone();
            } else if (permStatus.state === "denied") {
              hasDeniedPermissionRef.current = true;
            }
          };
        })
        .catch(() => {});
    }

    const handleFirstGesture = () => {
      if (!hasDeniedPermissionRef.current) {
        initMicrophone();
      }
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });

    return () => {
      isListeningEnabledRef.current = false;
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [initMicrophone]);

  // 4. Process Final Spoken Text / Voice Commands
  const handleFinalSpokenText = async (rawText) => {
    if (!rawText) return;
    const clean = rawText
      .replace(/^(hey|hi|ok)\s+voco[,.]?\s*/i, "")
      .replace(/^voco[,.]?\s*/i, "")
      .trim();

    setTranscript(rawText);

    // If user says just "Hey Voco", wake up and acknowledge
    if (/^(hey|hi|ok)?\s*(voco|voko)\s*$/i.test(rawText)) {
      handleWakeUp();
      return;
    }

    // Check against system voice commands
    let matchedCommand = null;
    let matchResult = null;
    for (const cmd of COMMAND_PATTERNS) {
      const match = clean.match(cmd.regex) || rawText.match(cmd.regex);
      if (match) {
        matchedCommand = cmd;
        matchResult = match;
        break;
      }
    }

    if (matchedCommand) {
      executeVoiceCommand(matchedCommand, matchResult);
    } else {
      // Connect to AI for general coding questions & instructions
      await queryAI(clean || rawText);
    }
  };

  // 5. Voice Command Execution Engine
  const executeVoiceCommand = (cmd, match) => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);

    setOrbState("speaking");
    const feedbackText =
      typeof cmd.feedback === "function" ? cmd.feedback(match) : cmd.feedback;
    setLastAction(feedbackText);
    playVocaSound("chirp");

    if (soundEnabled) {
      speakVocaText(feedbackText, () => {
        setOrbState("idle");
        // Siri auto-dismiss 1.8s after speaking feedback
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = setTimeout(() => {
          handleDismiss();
        }, 1800);
      });
    } else {
      setTimeout(() => {
        setOrbState("idle");
        handleDismiss();
      }, 2500);
    }

    const payload =
      typeof cmd.extractPayload === "function"
        ? cmd.extractPayload(match)
        : {
            name: match?.[1] || "",
            target: match?.[1] || "",
          };

    // Dispatch global custom event for workspace / dashboard components to react
    const event = new CustomEvent("vocode-voice-action", {
      detail: {
        type: cmd.type,
        action: cmd.type,
        payload,
        match,
        feedback: feedbackText,
      },
    });
    window.dispatchEvent(event);

    // Standard page navigation actions
    if (
      cmd.type === "open-workspace" ||
      cmd.type === "open-folder" ||
      cmd.type === "open-file"
    ) {
      if (location.pathname !== "/workspace") {
        navigate("/workspace");
      }
    } else if (cmd.type === "open-dashboard") {
      navigate("/dashboard");
    } else if (cmd.type === "open-docs") {
      window.open("/docs", "_blank");
    } else if (cmd.type === "toggle-theme") {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vocode_theme", next);
    }
  };

  // 6. Connect to AI Engine
  const queryAI = async (prompt) => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setOrbState("thinking");
    setAiResponse(null);
    playVocaSound("ping");

    // Check offline knowledgebase first
    const localAnswer = queryVocaKnowledge(prompt);
    if (localAnswer) {
      const textToSpeak =
        typeof localAnswer === "string"
          ? localAnswer
          : localAnswer?.answer || localAnswer?.title || String(localAnswer);

      setOrbState("speaking");
      setAiResponse(textToSpeak);
      if (soundEnabled) {
        speakVocaText(textToSpeak, () => setOrbState("idle"));
      } else {
        setOrbState("idle");
      }
      return;
    }

    try {
      const systemContext = `You are Voco, the ultra-smart Apple Siri-style voice assistant for VocodeAI Cloud IDE.
The user is speaking to you directly via voice.
Keep answers concise, direct, helpful, and under 3 sentences so they sound natural when spoken out loud.
If providing code, provide only the core 1-3 lines.
Current route: ${location.pathname}.`;

      const res = await askAI(
        [
          { role: "system", content: systemContext },
          { role: "user", content: prompt },
        ],
        accessToken
      );

      const rawAiText =
        typeof res === "string"
          ? res
          : res?.content ||
            res?.message ||
            res?.response ||
            "I processed that command with the AI engine.";

      const aiText =
        typeof rawAiText === "string" ? rawAiText : JSON.stringify(rawAiText);

      setAiResponse(aiText);
      setOrbState("speaking");
      if (soundEnabled) {
        speakVocaText(aiText, () => setOrbState("idle"));
      } else {
        setOrbState("idle");
      }
    } catch (err) {
      console.warn("AI connection fallback:", err);
      const fallbackMsg =
        "I'm here to help. You can ask me to open the hi folder, open terminal, run code, or create files.";
      setAiResponse(fallbackMsg);
      setOrbState("speaking");
      if (soundEnabled) {
        speakVocaText(fallbackMsg, () => setOrbState("idle"));
      } else {
        setOrbState("idle");
      }
    }
  };

  // 7. Manual text input submit
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const q = textInput.trim();
    setTextInput("");
    handleFinalSpokenText(q);
  };

  // Dismiss overlay
  const handleDismiss = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    stopVocaSpeech();
    setIsOpen(false);
    setOrbState("idle");
    setTranscript("");
    setAiResponse(null);
    setLastAction(null);
  };

  // Keyboard shortcut: Escape closes, Ctrl+Shift+V triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (isOpen) {
          handleDismiss();
        } else {
          handleWakeUp();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 1. Landing Page Speech Banner */}
      {showGreetingToast && (
        <div className="voco-landing-greeting-toast">
          <VocoSiriOrb
            size={38}
            state="speaking"
            audioLevel={audioLevel}
            showWaveform={true}
          />
          <div className="voco-greeting-content">
            <span className="voco-greeting-title">Voco Voice AI</span>
            <span className="voco-greeting-desc">
              “Welcome to Vocodeai! Hey, I am Voco. Say <b>‘Hey Voco’</b> to command the IDE.”
            </span>
          </div>
          <button
            className="voco-toast-close"
            onClick={() => setShowGreetingToast(false)}
            title="Dismiss greeting"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 2. Floating Siri Pill Trigger (Clean minimal standby badge, NO "Mic Active" tag) */}
      {!isOpen && (
        <div
          className="voco-trigger-wrapper"
          onClick={handleWakeUp}
          title="Say 'Hey Voco' or click to speak"
        >
          <div className="voco-pill-btn">
            <VocoSiriOrb
              size={26}
              state="idle"
              audioLevel={audioLevel}
              showWaveform={false}
            />
            <span className="voco-pill-name">Hey Voco</span>
          </div>
        </div>
      )}

      {/* 3. Full Siri Active Interface Overlay (Appears when saying 'Hey Voco') */}
      {isOpen && (
        <div
          className="voco-assistant-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <div className="voco-siri-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="voco-card-header">
              <div className="voco-header-left">
                <VocoSiriOrb
                  size={32}
                  state={orbState}
                  audioLevel={audioLevel}
                  showWaveform={false}
                />
                <div className="voco-header-titles">
                  <span className="voco-title-text">Voco</span>
                  <span className="voco-subtitle-text">
                    {orbState === "listening"
                      ? "Listening..."
                      : orbState === "thinking"
                      ? "Thinking..."
                      : orbState === "speaking"
                      ? "Speaking..."
                      : "Say a command..."}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  className="voco-close-btn"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  title={soundEnabled ? "Mute Voice Speech" : "Unmute Voice Speech"}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  className="voco-close-btn"
                  onClick={handleDismiss}
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Center Stage: Apple Siri Animated Energy Orb */}
            <div className="voco-card-stage">
              <VocoSiriOrb
                size={110}
                state={orbState}
                audioLevel={audioLevel}
                onClick={async () => {
                  if (orbState === "listening") {
                    setOrbState("idle");
                  } else {
                    setOrbState("listening");
                    await initMicrophone();
                    speakVocaText("I am listening.");
                  }
                }}
              />

              <div className="voco-transcript-box">
                <div className="voco-live-transcript">
                  {transcript ? `“${transcript}”` : "What can I help you with?"}
                </div>

                {lastAction && (
                  <div className="voco-status-badge is-action">
                    <Sparkles size={11} />
                    <span>{lastAction}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Response Box if present */}
            {aiResponse && (
              <div className="voco-ai-response-box">
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {typeof aiResponse === "string"
                    ? aiResponse
                    : aiResponse?.answer ||
                      aiResponse?.title ||
                      JSON.stringify(aiResponse)}
                </div>
              </div>
            )}

            {/* Quick Voice Command Chips */}
            <div className="voco-chips-row">
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("open the hi folder in the workspace")}
              >
                <FolderOpen size={12} />
                <span>Open "hi" Folder</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("open terminal")}
              >
                <Terminal size={12} />
                <span>Open Terminal</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("run code")}
              >
                <Play size={12} />
                <span>Run Code</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("create file index.js")}
              >
                <FilePlus size={12} />
                <span>Create File</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("create folder src")}
              >
                <FolderPlus size={12} />
                <span>Create Folder</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("open workspace")}
              >
                <LayoutDashboard size={12} />
                <span>Workspace</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("switch theme")}
              >
                <SunMoon size={12} />
                <span>Switch Theme</span>
              </button>
            </div>

            {/* Text Input Fallback Bar */}
            <form className="voco-card-footer" onSubmit={handleTextSubmit}>
              <input
                type="text"
                className="voco-text-input"
                placeholder="Ask Voco or type a command..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <button
                type="button"
                className={`voco-action-btn voco-mic-toggle-btn ${
                  orbState === "listening" ? "is-active" : ""
                }`}
                onClick={async () => {
                  if (orbState === "listening") {
                    setOrbState("idle");
                  } else {
                    setOrbState("listening");
                    await initMicrophone();
                    speakVocaText("Listening.");
                  }
                }}
                title={orbState === "listening" ? "Listening" : "Start Voice Dictation"}
              >
                {orbState === "listening" ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button type="submit" className="voco-action-btn" title="Send to Voco">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

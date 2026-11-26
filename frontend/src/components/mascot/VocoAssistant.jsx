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
import { askVoiceAI } from "../../services/aiApi";
import { useAuth } from "../../context/AuthContext";
import "../../styles/VocoAssistant.css";

// Voice command patterns for VocodeAI
const COMMAND_PATTERNS = [
  // 1. Code Execution (PRIORITY 1: Handles "run the current opened file in terminal", "run ThreeSum.java in terminal", "run code", "run this file in terminal", "run current file", "run")
  {
    type: "run-code",
    regex: /^(?:(?:hey|hi|ok)\s+voco[,.]?\s*)?(?:run|execute|compile|start|test)(?:\s+(?:(?:the|this|my|current|active|opened|open|currently\s+opened)\s+)*(?:file|code|program|project|script)?|\s+["']?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)["']?|\s+file(?:\s+(?:named|called))?\s+["']?([a-zA-Z0-9_\-./]+)["']?)?(?:\s+(?:in|inside|on)(?:\s+the)?\s+(?:integrated\s+|cloud\s+)?(?:terminal|console|sandbox))?$/i,
    feedback: (match) => {
      const target = (match?.[1] || match?.[2] || "").replace(/["']/g, "").trim();
      const wittyLines = [
        target ? `Firing up ${target} in the terminal! Let's see it fly.` : "Firing up your code in the terminal! Zero exit codes incoming.",
        target ? `Executing ${target}! Fingers crossed for clean green output.` : "Executing code now. No pressure, compiler!",
        target ? `Launching ${target}! Let's see what wonders we cooked up.` : "Running your file right now! May your variables stay defined."
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
    extractPayload: (match) => ({
      target: (match?.[1] || match?.[2] || "").replace(/["']/g, "").trim(),
      name: (match?.[1] || match?.[2] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 2. Open Folder (e.g. "open the hi folder in the workspace", "open hi folder", "open folder hi", "open folder called components")
  {
    type: "open-folder",
    regex: /(?:open|expand|show|view|navigate to|go to)(?:\s+the)?\s+(?:folder\s+(?:called\s+|named\s+)?["']?([a-zA-Z0-9_\-./]+)["']?|["']?([a-zA-Z0-9_\-./]+)["']?\s+folder|["']?([a-zA-Z0-9_\-./]+)["']?\s+(?:in|inside)(?:\s+the)?\s+workspace)(?:\s+(?:in|inside)(?:\s+the)?\s+workspace)?/i,
    feedback: (match) => {
      const name = (match?.[1] || match?.[2] || match?.[3] || "folder").replace(/["']/g, "").trim();
      const wittyLines = [
        `Cracking open the ${name} folder!`,
        `Opening ${name} folder. Look at all those lovely files.`,
        `Navigating right into ${name}. Let's explore!`
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
    extractPayload: (match) => ({
      name: (match?.[1] || match?.[2] || match?.[3] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 3. Terminal Commands (handles "open terminal", "show terminal", "launch terminal") - Put BEFORE open-file to avoid shadowing
  {
    type: "open-terminal",
    regex: /^(?:(?:hey|hi|ok)\s+voco[,.]?\s*)?(?:open|show|start|launch|toggle|view)\s+(?:the\s+)?(?:integrated\s+|cloud\s+)?terminal$/i,
    feedback: () => {
      const wittyLines = [
        "Integrated cloud terminal is live and ready for action!",
        "Terminal summoned! Time to unleash some command-line wizardry.",
        "Opening the terminal. Type away, commander!"
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
  },
  {
    type: "close-terminal",
    regex: /^(?:(?:hey|hi|ok)\s+voco[,.]?\s*)?(?:close|hide|exit|minimize)\s+(?:the\s+)?(?:integrated\s+|cloud\s+)?terminal$/i,
    feedback: () => {
      const wittyLines = [
        "Terminal tucked away! Sleek and tidy.",
        "Hiding the terminal for you. Back to pure code focus!",
        "Closed terminal. Clean workspace, clear mind."
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
  },
  // 4. Open File (Handles "open the threesum.java file", "open ThreeSum.java", "open file TwoSum.java", "open threesum", "show me ThreeSum.java")
  {
    type: "open-file",
    regex: /^(?:(?:hey|hi|ok)?\s*voco[,.]?\s*)?(?:open|show|view|edit|display)\s+(?:the\s+)?(?:file(?:\s+(?:named|called))?\s+["']?([a-zA-Z0-9_\-./]+)["']?|["']?([a-zA-Z0-9_\-./]+)["']?\s+file|["']?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)["']?|["']?([a-zA-Z0-9_\-./]+)["']?)$/i,
    feedback: (match) => {
      const name = (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "file").replace(/["']/g, "").trim();
      const wittyLines = [
        `Cracking open ${name}! Let's write some beautiful code.`,
        `Opening ${name} in the editor right away.`,
        `Pulling up ${name}. May your bugs be few and your logic be flawless!`,
        `Opening ${name}! Clean code incoming.`
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
    extractPayload: (match) => ({
      name: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "").replace(/["']/g, "").trim(),
      target: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 5. Close File / Tab (handles "close the file", "close file", "close this file", "close current file", "close tab", "close TwoSum.java")
  {
    type: "close-file",
    regex: /^(?:(?:hey|hi|ok)?\s*voco[,.]?\s*)?(?:(?:close|exit|hide)\s+(?:the\s+)?(?:current\s+|active\s+|opened\s+|open\s+|this\s+)?(?:file|tab)(?:\s+(?:named|called)?\s*["']?([a-zA-Z0-9_\-./]+)["']?)?|(?:close|exit)\s+["']?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)["']?)$/i,
    feedback: (match) => {
      const name = (match?.[1] || match?.[2] || "file").replace(/["']/g, "").trim();
      const target = name && name !== "file" ? name : "active file";
      const wittyLines = [
        `Closing ${target}! Out of sight, out of RAM.`,
        `Closed ${target} for you. More room for fresh ideas!`,
        `Tab closed! Keeping your workspace sleek and clean.`
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
    extractPayload: (match) => ({
      name: (match?.[1] || match?.[2] || "").replace(/["']/g, "").trim(),
      target: (match?.[1] || match?.[2] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 6. Delete File (handles "delete the twosum.java file", "delete twosum.java", "remove TwoSum.java", "delete file TwoSum.java")
  {
    type: "delete-file",
    regex: /^(?:(?:hey|hi|ok)?\s*voco[,.]?\s*)?(?:delete|remove|destroy|trash)\s+(?:the\s+)?(?:file(?:\s+(?:named|called))?\s+["']?([a-zA-Z0-9_\-./]+)["']?|["']?([a-zA-Z0-9_\-./]+)["']?\s+file|["']?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)["']?|["']?([a-zA-Z0-9_\-./]+)["']?)$/i,
    feedback: (match) => {
      const name = (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "file").replace(/["']/g, "").trim();
      const wittyLines = [
        `Deleting ${name}! Out of sight, out of RAM.`,
        `Poof! Deleted ${name} from your workspace.`,
        `Removed ${name}. Keeping your workspace clean and lean.`
      ];
      return wittyLines[Math.floor(Math.random() * wittyLines.length)];
    },
    extractPayload: (match) => ({
      name: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "").replace(/["']/g, "").trim(),
      path: (match?.[1] || match?.[2] || match?.[3] || match?.[4] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 7. Open Workspace
  {
    type: "open-workspace",
    regex: /(?:open|go to|launch|switch to)(?:\s+my)?\s+workspace/i,
    feedback: "Opening your workspace! Time to build something epic.",
  },
  // 8. Create File & Folder
  {
    type: "create-file",
    regex: /(?:create|make|add|new)\s+(?:a\s+)?file(?:\s+(?:named|called)?\s*["']?([a-zA-Z0-9_\-./]+)["']?)?/i,
    feedback: (match) => {
      const name = (match?.[1] || "").replace(/["']/g, "").trim();
      return name ? `Creating ${name}! A fresh canvas for pure genius.` : "Creating a new file for you!";
    },
    extractPayload: (match) => ({
      name: (match?.[1] || "").replace(/["']/g, "").trim(),
    }),
  },
  {
    type: "create-folder",
    regex: /(?:create|make|add|new)\s+(?:a\s+)?folder(?:\s+(?:named|called)?\s*["']?([a-zA-Z0-9_\-./]+)["']?)?/i,
    feedback: (match) => {
      const name = (match?.[1] || "").replace(/["']/g, "").trim();
      return name ? `Creating folder ${name}! Keeping the architecture tidy.` : "Creating a new folder!";
    },
    extractPayload: (match) => ({
      name: (match?.[1] || "").replace(/["']/g, "").trim(),
    }),
  },
  // 7. Navigation & Utilities
  {
    type: "open-dashboard",
    regex: /(?:go to|open|show|view)\s+(?:my\s+)?dashboard/i,
    feedback: "Taking you to your workspace dashboard.",
  },
  {
    type: "open-docs",
    regex: /(?:open|show|read|go to)\s+(?:the\s+)?(?:documentation|docs|guide)/i,
    feedback: "Opening VocodeAI documentation.",
  },
  {
    type: "toggle-theme",
    regex: /(?:switch|toggle|change)(?:\s+to)?\s+(?:the\s+)?(?:theme|dark mode|light mode)/i,
    feedback: "Switching appearance theme.",
  },
  {
    type: "open-git",
    regex: /(?:open|show|view|toggle)\s+(?:the\s+)?(?:git|source control|repository)/i,
    feedback: "Opening source control panel.",
  },
  {
    type: "save-file",
    regex: /(?:save|persist)(?:\s+this|\s+the)?\s+file/i,
    feedback: "Saving active file to cloud storage.",
  },
  {
    type: "toggle-explorer",
    regex: /(?:open|toggle|show|close)\s+(?:the\s+)?(?:explorer|files|file tree)/i,
    feedback: "Toggling file explorer.",
  },
  {
    type: "open-settings",
    regex: /(?:open|show|view|toggle)\s+(?:settings|preferences)/i,
    feedback: "Opening settings and preferences.",
  },
];

export default function VocoAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  // Assistant states
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

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

  // 2. Hardware Microphone Acquisition (Audio Meter Wave Visualizer)
  const initMicrophone = useCallback(async () => {
    try {
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

  // 3. Continuous Background Speech Recognition for Wake Word & Commands
  const startListening = useCallback(() => {
    if (hasDeniedPermissionRef.current || !isListeningEnabledRef.current) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {}
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        isListeningRef.current = true;
        setMicActive(true);
        if (isOpenRef.current) setOrbState("listening");
      };

      rec.onresult = (event) => {
        let interimText = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }

        const spoken = (finalText || interimText).trim();
        if (spoken) {
          setTranscript(spoken);
          checkWakeWord(spoken);
        }

        if (finalText.trim()) {
          handleFinalSpokenText(finalText.trim());
        }
      };

      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          hasDeniedPermissionRef.current = true;
          setMicPermission("denied");
          setMicActive(false);
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
          }
          return;
        }
        if (e.error === "no-speech" || e.error === "aborted") {
          // Normal background silence, Chrome will call onend to recycle
          return;
        }
        console.warn("Speech recognition notice:", e.error);
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

        // ALWAYS restart continuous listening in the background (250ms backoff)
        restartTimerRef.current = setTimeout(() => {
          if (isListeningEnabledRef.current && !hasDeniedPermissionRef.current) {
            startListening();
          }
        }, 250);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      if (err.name === "NotAllowedError") {
        hasDeniedPermissionRef.current = true;
      }
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (isListeningEnabledRef.current && !hasDeniedPermissionRef.current) {
          startListening();
        }
      }, 750);
    }
  }, []);

  // Check for "Hey Voco" wake word
  const checkWakeWord = (phrase) => {
    const lower = phrase.toLowerCase().trim();
    if (
      lower.includes("hey voco") ||
      lower.includes("hey voko") ||
      lower.includes("voco") ||
      lower.includes("voko") ||
      lower.includes("hi voco") ||
      lower.includes("ok voco") ||
      lower.includes("wake up voco")
    ) {
      if (!isOpenRef.current) {
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
    playVocaSound("open"); // Signature Apple Siri double-chime
    speakVocaText("Hey! How can I help you?");
    await initMicrophone();
  };

  // Check existing permissions, start continuous listening & hook gestures
  useEffect(() => {
    isListeningEnabledRef.current = true;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((permStatus) => {
          setMicPermission(permStatus.state);
          if (permStatus.state === "denied") {
            hasDeniedPermissionRef.current = true;
          } else {
            hasDeniedPermissionRef.current = false;
            startListening();
          }
          permStatus.onchange = () => {
            setMicPermission(permStatus.state);
            if (permStatus.state === "denied") {
              hasDeniedPermissionRef.current = true;
              setMicActive(false);
            } else {
              hasDeniedPermissionRef.current = false;
              startListening();
              initMicrophone();
            }
          };
        })
        .catch(() => {});
    }

    // Immediately kick off speech recognition!
    startListening();
    initMicrophone();

    // Hook user interactions (click / typing) to ensure audio context & speech recognition are active
    const handleUserGesture = () => {
      if (!isListeningRef.current && !hasDeniedPermissionRef.current) {
        startListening();
      }
      initMicrophone();
    };

    const handleVoiceToggle = () => {
      if (isOpenRef.current) {
        handleDismiss();
      } else {
        handleWakeUp();
      }
    };

    window.addEventListener("pointerdown", handleUserGesture);
    window.addEventListener("keydown", handleUserGesture);
    window.addEventListener("click", handleUserGesture);
    window.addEventListener("vocode-toggle-voice", handleVoiceToggle);

    return () => {
      isListeningEnabledRef.current = false;
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("vocode-toggle-voice", handleVoiceToggle);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
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
  }, [startListening, initMicrophone]);

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
      if (!isOpen) {
        setIsOpen(true);
      }
      executeVoiceCommand(matchedCommand, matchResult);
    } else {
      // Connect to AI for coding questions & instructions if addressed or HUD is active
      const isAddressed =
        /^(hey|hi|ok)?\s*(voco|voko)/i.test(rawText) || isOpen;
      if (isAddressed) {
        if (!isOpen) setIsOpen(true);
        await queryAI(clean || rawText);
      }
    }
  };

  // Helper to dispatch voice actions into workspace / navigation
  const dispatchActionToWorkspace = async (actionType, payload = {}, feedbackText = "") => {
    const isWorkspaceAction = [
      "open-workspace",
      "open-folder",
      "open-file",
      "close-file",
      "delete-file",
      "delete_file",
      "write-file",
      "write_file",
      "open-terminal",
      "close-terminal",
      "run-code",
      "create-file",
      "create-folder",
      "save-file",
      "open-git",
      "toggle-explorer",
    ].includes(actionType);

    const isInWorkspace = location.pathname.startsWith("/workspace/");

    if (isInWorkspace) {
      // User is already in the workspace - dispatch action directly! NEVER navigate away!
      const event = new CustomEvent("vocode-voice-action", {
        detail: {
          type: actionType,
          action: actionType,
          payload,
          feedback: feedbackText,
        },
      });
      window.dispatchEvent(event);
    } else if (isWorkspaceAction) {
      // User is outside the workspace (e.g. on Landing or Dashboard)
      if (!accessToken) {
        speakVocaText("Please sign in to access your workspace.");
        navigate("/login");
        return;
      }

      // Store pending action in sessionStorage so Workspace executes it on mount
      sessionStorage.setItem(
        "vocode_pending_voice_action",
        JSON.stringify({
          type: actionType,
          action: actionType,
          payload,
          feedback: feedbackText,
        })
      );

      // Resolve target workspace ID
      let targetWsId = localStorage.getItem("vocode_recent_workspace");
      if (!targetWsId) {
        try {
          const { listWorkspaces } = await import("../../services/workspaceApi");
          const list = await listWorkspaces(accessToken);
          if (Array.isArray(list) && list.length > 0) {
            targetWsId = list[0]._id || list[0].id;
            localStorage.setItem("vocode_recent_workspace", targetWsId);
          }
        } catch (err) {
          console.warn("Could not fetch workspaces:", err);
        }
      }

      if (targetWsId) {
        const { getWorkspaceNavTarget } = await import("../../utils/workspaceUrl");
        const target = getWorkspaceNavTarget(targetWsId);
        navigate(target.path, { state: target.state });
      } else {
        // No workspace exists yet, take them to dashboard
        navigate("/dashboard");
      }
    } else if (actionType === "open-dashboard") {
      navigate("/dashboard");
    } else if (actionType === "open-docs") {
      navigate("/docs");
    } else if (actionType === "toggle-theme") {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vocode_theme", next);
      window.dispatchEvent(new CustomEvent("vocode-theme-toggle", { detail: { theme: next } }));
    } else if (actionType === "open-settings") {
      if (isInWorkspace) {
        window.dispatchEvent(
          new CustomEvent("vocode-voice-action", {
            detail: { type: "toggle-settings", action: "toggle-settings" },
          })
        );
      } else {
        navigate("/dashboard");
      }
    }
  };

  // 5. Voice Command Execution Engine
  const executeVoiceCommand = async (cmd, match) => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);

    setOrbState("speaking");
    const feedbackText =
      typeof cmd.feedback === "function" ? cmd.feedback(match) : cmd.feedback;
    setLastAction(feedbackText);
    playVocaSound("chirp");

    if (soundEnabled) {
      speakVocaText(feedbackText, () => {
        setOrbState("idle");
        // Auto-dismiss after speaking feedback
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = setTimeout(() => {
          handleDismiss();
        }, 2000);
      });
    } else {
      setTimeout(() => {
        setOrbState("idle");
        handleDismiss();
      }, 2500);
    }

    const rawPayload =
      typeof cmd.extractPayload === "function"
        ? cmd.extractPayload(match)
        : {
            name: match?.[1] || match?.[2] || match?.[3] || "",
            target: match?.[1] || match?.[2] || match?.[3] || "",
          };

    // Clean payload strings (strip surrounding quotes, whitespace)
    const payload = {};
    for (const key in rawPayload) {
      payload[key] =
        typeof rawPayload[key] === "string"
          ? rawPayload[key].replace(/^["']|["']$/g, "").trim()
          : rawPayload[key];
    }

    await dispatchActionToWorkspace(cmd.type, payload, feedbackText);
  };

  // 6. Connect to AI Engine
  const queryAI = async (prompt) => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    setOrbState("thinking");
    setAiResponse(null);
    playVocaSound("ping");

    try {
      const activeWorkspaceId = localStorage.getItem("vocode_recent_workspace");
      const activeFile = localStorage.getItem("vocode_active_file") || null;
      const res = await askVoiceAI(accessToken, prompt, activeWorkspaceId, activeFile, []);

      let aiText =
        res?.reply ||
        (typeof res === "string" ? res : "I'm ready to help you build.");

      // Clean out identity if not specifically requested
      const isAskingIdentity = /(?:who\s+(?:are\s+you|is\s+voco)|what\s+is\s+your\s+name|what\s+are\s+you|introduce\s+yourself)/i.test(prompt);
      if (!isAskingIdentity && typeof aiText === "string") {
        aiText = aiText
          .replace(/^(?:(?:hello|hey|hi)[,\s]*)?(?:I'm|I am)\s+Voco[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
          .replace(/^(?:(?:hello|hey|hi)[,\s]*)?as\s+Voco[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
          .replace(/^(?:I'm|I am)\s+your\s+(?:voice\s+)?(?:AI\s+)?assistant[,\w\s]*?(?:\.|\!|\:|\—|-)\s*/i, "")
          .trim();
      }

      // Strip any residual ACTION tags or JSON code blocks that might leak into the speech or UI
      aiText = aiText
        .replace(/(?:^|\n)\s*ACTION(?:\s*:\s*|\s+)?[\s\S]*$/i, "")
        .replace(/\bACTION\b\s*:?/gi, "")
        .replace(/```(?:json)?[\s\S]*?```/gi, "")
        .trim();

      if (!aiText && res?.action?.type) {
        aiText = `On it! Executing ${res.action.type.replace(/-/g, " ")}.`;
      }

      setAiResponse(aiText);
      setOrbState("speaking");

      if (soundEnabled) {
        speakVocaText(aiText, () => setOrbState("idle"));
      } else {
        setOrbState("idle");
      }

      // If the AI identified an executable IDE action, dispatch it to workspace directly!
      if (res?.action?.type) {
        const payload = res.action.payload || {};
        await dispatchActionToWorkspace(res.action.type, payload, aiText);
      }
    } catch (err) {
      console.warn("AI connection fallback:", err);
      const fallbackMsg =
        "I'm ready to help you code, run terminal commands, or answer questions about your project.";
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

      {/* 2. Standby Floating Living AI Orb Logo (Visible across every page, pure circular logo, NO text) */}
      {!isOpen && (
        <div
          className="voco-standby-logo-btn"
          onClick={handleWakeUp}
          role="button"
          tabIndex={0}
          title="Voco Voice AI (Say 'Hey Voco' or click to summon)"
          aria-label="Voco Voice AI Assistant"
        >
          <VocoSiriOrb
            size={34}
            state={micActive ? "listening" : "idle"}
            audioLevel={audioLevel}
            showWaveform={true}
          />
        </div>
      )}

      {/* 3. Full Siri-style Active Interface Overlay (Appears when saying 'Hey Voco' or calling commands) */}
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
                onClick={() => handleFinalSpokenText("run the current opened file in terminal")}
              >
                <Play size={12} />
                <span>Run Current File in Terminal</span>
              </button>
              <button
                className="voco-chip-btn"
                onClick={() => handleFinalSpokenText("close the file")}
              >
                <X size={12} />
                <span>Close File</span>
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

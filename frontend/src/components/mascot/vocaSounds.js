/**
 * VOCA AUDIO ENGINE
 * Zero-dependency Web Audio API synthesizer + Web Speech Synthesis (TTS).
 * Provides responsive, futuristic Apple Siri chimes and crystal-clear female voice read-aloud.
 */

let sharedAudioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Synthesizes delightful, futuristic Apple Siri chimes using Web Audio API
 */
export function playVocaSound(type = "chirp") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "chirp") {
      // Soft pleasant two-tone Apple Siri chirp on action
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "open") {
      // Siri wake double chime (D5 -> A5 harmonious chime)
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === "send") {
      // Subtle tactile click on send
      osc.type = "sine";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "toggle-on") {
      // High-energy futuristic activation tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "toggle-off") {
      // Soft power-down tone
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch (err) {
    console.warn("Voca audio effect failed:", err);
  }
}

/**
 * Text-to-Speech (TTS) engine using Web Speech Synthesis.
 * STRICTLY uses FEMALE voices (Samantha, Jenny, Zira, Karen, Victoria, Sonia, etc.)
 */
export function speakVocaText(text, onEnd) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  try {
    window.speechSynthesis.cancel();

    // Safely extract string if an object (e.g. { answer, title, message }) was passed
    const rawText =
      typeof text === "string"
        ? text
        : text?.answer || text?.message || text?.title || String(text || "");

    if (!rawText || typeof rawText !== "string") return;

    // Clean markdown syntax for natural voice cadence
    const cleanSpeech = rawText
      .replace(/[*_#`~[\]()>]/g, "")
      .replace(/\|.*?\|/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 280);

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.02;
    utterance.pitch = 1.14; // Crisp, warm feminine pitch

    const pickFemaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // English voices preferred
      const enVoices = voices.filter((v) => v.lang.startsWith("en"));
      const pool = enVoices.length > 0 ? enVoices : voices;

      // Male names strictly excluded
      const malePattern =
        /david|mark|guy|daniel|george|richard|james|stefan|male|brian|paul|alex|fred|thomas|oliver/i;

      // Known female voice signatures (Windows, macOS, iOS, Android, ChromeOS)
      const femalePattern =
        /female|samantha|jenny|zira|karen|victoria|sonia|natasha|aria|michelle|eva|hazel|heera|veena|susan|catherine|linda|google.*female|natural.*female/i;

      // 1. Explicitly named female voice that is not male
      let femaleVoice = pool.find(
        (v) => femalePattern.test(v.name) && !malePattern.test(v.name)
      );

      // 2. English voice that is not flagged as male
      if (!femaleVoice) {
        femaleVoice = pool.find(
          (v) => !malePattern.test(v.name) && !malePattern.test(v.voiceURI)
        );
      }

      // 3. Fallback: any voice not matching male pattern
      if (!femaleVoice) {
        femaleVoice = voices.find((v) => !malePattern.test(v.name)) || voices[0];
      }

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    };

    pickFemaleVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickFemaleVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Voca TTS speech error:", err);
  }
}

export function stopVocaSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

import React from "react";
import "../../styles/VocoAssistant.css";

/**
 * VOCA SIRI ORB
 * Dynamic, organic, fluid animated energy sphere inspired by Apple Siri.
 * Features:
 * - 4-layer chromatic morphing fluid meshes (Cyan, Magenta, Purple, Emerald)
 * - Dynamic SVG audio waveform ripples reacting to real microphone volume
 * - Responsive states: idle, listening, thinking, speaking
 */
export default function VocoSiriOrb({
  state = "idle", // 'idle' | 'listening' | 'thinking' | 'speaking'
  size = 72,
  audioLevel = 0, // Real-time microphone audio level 0.0 to 1.0
  onClick,
  className = "",
  showWaveform = true,
}) {
  return (
    <div
      className={`voco-siri-container state-${state} ${className}`}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      role="button"
      tabIndex={0}
      title="Voco Voice Assistant (Say 'Hey Voco' or click to speak)"
      aria-label="Voco Siri Voice Assistant"
    >
      {/* Outer ambient radiant atmospheric glow (expands when speaking) */}
      <div
        className="siri-ambient-glow"
        style={{
          transform: audioLevel > 0.02 ? `scale(${1 + audioLevel * 0.4})` : undefined,
          opacity: audioLevel > 0.02 ? Math.min(1, 0.45 + audioLevel * 0.6) : undefined,
        }}
      />

      {/* Layer 1: Ethereal chromatic swirling backdrop */}
      <div className="siri-orb-layer siri-layer-cyan" />

      {/* Layer 2: Neon magenta & electric pink energy swirl */}
      <div className="siri-orb-layer siri-layer-magenta" />

      {/* Layer 3: Deep electric purple & violet plasma */}
      <div className="siri-orb-layer siri-layer-purple" />

      {/* Layer 4: Emerald / cyan core highlight */}
      <div className="siri-orb-layer siri-layer-emerald" />

      {/* Inner luminous glass bead / specular core */}
      <div className="siri-orb-core">
        <div className="siri-specular-highlight" />
      </div>

      {/* Pulsing fluid waveform lines (Siri wave effect reacting to live mic input) */}
      {showWaveform && (
        <div className="siri-waveform-wrap">
          <span
            className="siri-wave-bar siri-bar-1"
            style={{
              transform: audioLevel > 0.02 ? `scaleY(${1 + audioLevel * 3.2})` : undefined,
            }}
          />
          <span
            className="siri-wave-bar siri-bar-2"
            style={{
              transform: audioLevel > 0.02 ? `scaleY(${1 + audioLevel * 4.4})` : undefined,
            }}
          />
          <span
            className="siri-wave-bar siri-bar-3"
            style={{
              transform: audioLevel > 0.02 ? `scaleY(${1 + audioLevel * 5.5})` : undefined,
            }}
          />
          <span
            className="siri-wave-bar siri-bar-4"
            style={{
              transform: audioLevel > 0.02 ? `scaleY(${1 + audioLevel * 4.2})` : undefined,
            }}
          />
          <span
            className="siri-wave-bar siri-bar-5"
            style={{
              transform: audioLevel > 0.02 ? `scaleY(${1 + audioLevel * 3.0})` : undefined,
            }}
          />
        </div>
      )}

      {/* Micro-sparkle particles during thinking / speaking */}
      <div className="siri-particles-ring">
        <span className="siri-particle p-1" />
        <span className="siri-particle p-2" />
        <span className="siri-particle p-3" />
      </div>
    </div>
  );
}

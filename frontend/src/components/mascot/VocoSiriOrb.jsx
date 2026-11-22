import React from "react";
import "../../styles/VocoAssistant.css";

/**
 * VOCO SIRI ORB
 * Dynamic, organic, fluid animated energy sphere inspired by Apple Siri.
 * Features:
 * - 4-layer chromatic morphing fluid plasma meshes (Cyan, Magenta, Purple, Emerald)
 * - Concentric acoustic sonic ripples pulsing outward
 * - Planetary orbital acoustic rings with glowing celestial nodes
 * - 7-bar fluid dynamic acoustic equalizer undulating with live voice decibels
 * - Responsive living states: 'idle' | 'listening' | 'thinking' | 'speaking'
 */
export default function VocoSiriOrb({
  state = "idle", // 'idle' | 'listening' | 'thinking' | 'speaking'
  size = 72,
  audioLevel = 0, // Real-time microphone audio level 0.0 to 1.0
  onClick,
  className = "",
  showWaveform = true,
}) {
  // Normalize live audio level into active acoustic boost multiplier
  const dynamicScale = Math.max(0.12, Math.min(1, audioLevel * 1.8));

  return (
    <div
      className={`voco-siri-container state-${state} ${className}`}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        "--voco-mic-level": dynamicScale,
      }}
      role="button"
      tabIndex={0}
      title="Voco Voice AI (Say 'Hey Voco' or click to speak)"
      aria-label="Voco Voice Assistant"
    >
      {/* 1. Outer ambient radiant atmospheric glow */}
      <div
        className="siri-ambient-glow"
        style={{
          transform: audioLevel > 0.03 ? `scale(${1 + audioLevel * 0.45})` : undefined,
          opacity: audioLevel > 0.03 ? Math.min(1, 0.55 + audioLevel * 0.55) : undefined,
        }}
      />

      {/* 2. Concentric acoustic sonic ripples pulsing outward */}
      <div className="siri-sonic-ripples-wrap">
        <div className="siri-sonic-ring ring-1" />
        <div className="siri-sonic-ring ring-2" />
        <div className="siri-sonic-ring ring-3" />
      </div>

      {/* 3. Concentric celestial orbital rings with glowing points */}
      <div className="siri-orbital-rings">
        <div className="siri-orbit orbit-1">
          <span className="siri-orbit-dot dot-1" />
        </div>
        <div className="siri-orbit orbit-2">
          <span className="siri-orbit-dot dot-2" />
        </div>
      </div>

      {/* 4. Chromatic morphing fluid meshes */}
      <div className="siri-orb-layer siri-layer-cyan" />
      <div className="siri-orb-layer siri-layer-magenta" />
      <div className="siri-orb-layer siri-layer-purple" />
      <div className="siri-orb-layer siri-layer-emerald" />

      {/* 5. Inner luminous glass bead / specular core */}
      <div className="siri-orb-core">
        <div className="siri-specular-highlight" />
      </div>

      {/* 6. Living fluid waveform lines (Apple Siri acoustic wave bars reacting in real time) */}
      {showWaveform && (
        <div className="siri-waveform-wrap">
          <span
            className="siri-wave-bar siri-bar-1"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 2.6})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-2"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 3.8})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-3"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 4.9})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-4"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 5.6})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-5"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 4.7})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-6"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 3.6})` }
                : undefined
            }
          />
          <span
            className="siri-wave-bar siri-bar-7"
            style={
              audioLevel > 0.04
                ? { transform: `scaleY(${1 + dynamicScale * 2.4})` }
                : undefined
            }
          />
        </div>
      )}

      {/* 7. Orbiting particle sparkles */}
      <div className="siri-particles-ring">
        <span className="siri-particle p-1" />
        <span className="siri-particle p-2" />
        <span className="siri-particle p-3" />
      </div>
    </div>
  );
}

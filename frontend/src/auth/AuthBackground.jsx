import React from "react";

/**
 * Unified Background System for Auth Pages
 * Exactly matches the Landing and Dashboard aesthetic:
 * 1. Deep obsidian base (#020708)
 * 2. Precision technical geometric grid with radial vignette mask
 * 3. Soft floating ambient aurora glow orbs (Coral, Emerald, Cyan)
 */
export default function AuthBackground({ theme = "dark" }) {
  return (
    <div className={`auth-background-system ${theme}`} aria-hidden="true">
      {/* Precision Geometric Grid with Radial Fade */}
      <div className="background-grid" />

      {/* Layered Floating Ambient Aurora Glow Orbs */}
      <div className="ambient-aurora ambient-aurora-1" />
      <div className="ambient-aurora ambient-aurora-2" />
      <div className="ambient-aurora ambient-aurora-3" />
    </div>
  );
}

import React, { useEffect, useRef } from "react";

/**
 * Unified Background System for Auth Pages
 * 1. Deep obsidian base (#020708)
 * 2. Precision technical geometric grid with radial vignette mask
 * 3. Soft floating ambient aurora glow orbs (Coral, Emerald, Cyan)
 * 4. Giant Bugatti-style VOCODEAI wordmark with interactive cursor spotlight + ambient sweep
 */
export default function AuthBackground({ theme = "dark" }) {
  const wordmarkRef = useRef(null);

  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;

    const handlePointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      el.style.setProperty("--spot-opacity", "1");
    };

    const handlePointerLeave = () => {
      el.style.setProperty("--spot-opacity", "0");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div className={`auth-background-system ${theme}`} aria-hidden="true">
      {/* Precision Geometric Grid with Radial Fade */}
      <div className="background-grid" />

      {/* Layered Floating Ambient Aurora Glow Orbs */}
      <div className="ambient-aurora ambient-aurora-1" />
      <div className="ambient-aurora ambient-aurora-2" />
      <div className="ambient-aurora ambient-aurora-3" />

      {/* Giant Footer-Style Cursor-Spotlight Wordmark */}
      <div className="auth-bg-wordmark-wrap">
        <span
          ref={wordmarkRef}
          className="auth-bg-giant-wordmark"
          data-text="VOCODEAI"
        >
          VOCODEAI
        </span>
      </div>
    </div>
  );
}

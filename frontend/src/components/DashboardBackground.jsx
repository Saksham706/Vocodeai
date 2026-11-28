import React, { useEffect, useRef } from "react";
import "../styles/appbackground.css";

/**
 * Unified Antigravity Background System
 * Shared across Landing, Dashboard, Workspace, and Auth.
 * Features:
 *  1. Precision 52px technical geometric grid with radial vignette mask
 *  2. Multi-layer floating ambient aurora glow orbs (Coral, Emerald, Cyan)
 *  3. Cybernetic flowing orbital curves & glowing light beads (dual-theme)
 *  4. Giant Footer-Style Cursor-Spotlight Wordmark between circles that enlightens on touch
 */
export default function DashboardBackground({ theme = "dark" }) {
  const isLight = theme === "light";
  const wordmarkRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = wordmarkRef.current;
    const cont = containerRef.current;
    if (!el) return;

    const handlePointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (clientX == null || clientY == null) return;

      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);
      el.style.setProperty("--spot-opacity", "1");

      if (cont) {
        cont.style.setProperty("--cursor-x", `${clientX}px`);
        cont.style.setProperty("--cursor-y", `${clientY}px`);
        cont.style.setProperty("--cursor-glow-opacity", "1");
      }
    };

    const handlePointerLeave = () => {
      el.style.setProperty("--spot-opacity", "0");
      if (cont) cont.style.setProperty("--cursor-glow-opacity", "0");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchstart", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("touchend", () => {
      setTimeout(handlePointerLeave, 600);
    }, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchstart", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`app-background-system ${theme}`}
      aria-hidden="true"
    >
      {/* 1. Precision 52px Geometric Technical Grid Overlay */}
      <div className="background-grid" />

      {/* 2. Layered Floating Ambient Aurora Glow Orbs */}
      <div className="ambient-aurora ambient-aurora-1" />
      <div className="ambient-aurora ambient-aurora-2" />
      <div className="ambient-aurora ambient-aurora-3" />

      {/* 3. Giant Footer-Style Cursor-Spotlight Wordmark between circles */}
      <div className="dash-bg-wordmark-wrap">
        <span
          ref={wordmarkRef}
          className="dash-bg-giant-wordmark"
          data-text="VOCODEAI"
        >
          VOCODEAI
        </span>
      </div>

      {/* 4. Cybernetic Flowing Energy Curves & Orbital Beads */}
      {isLight ? (
        <svg
          className="app-bg-curves"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="dashPeachGlow" cx="80%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#FFEAD8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFAF6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient bottom-right peach glow */}
          <circle cx="1150" cy="750" r="450" fill="url(#dashPeachGlow)" />

          {/* Flowing Lower-Right Orange & Coral Curves matching Landing/Auth */}
          <path
            d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
            stroke="rgba(255, 132, 64, 0.42)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M360,910 C580,710 860,920 1150,710 C1310,590 1430,670 1550,550"
            stroke="rgba(255, 155, 95, 0.32)"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M400,940 C620,740 900,950 1180,740 C1340,620 1460,700 1580,580"
            stroke="rgba(255, 185, 140, 0.22)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Secondary sweeping ribbon */}
          <path
            d="M650,850 C880,580 1200,620 1460,450"
            stroke="rgba(255, 132, 64, 0.28)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M700,890 C920,620 1240,660 1500,480"
            stroke="rgba(255, 171, 119, 0.22)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      ) : (
        <svg
          className="app-bg-curves"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="dashTealLeft" cx="15%" cy="35%" r="55%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#0D9488" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#020506" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="dashOrangeRight" cx="88%" cy="85%" r="50%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.12" />
              <stop offset="55%" stopColor="#F97316" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#020506" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle Teal Ambient Light (Left) + Faint Warm Orange Glow (Lower-Right) */}
          <rect width="1440" height="900" fill="url(#dashTealLeft)" />
          <rect width="1440" height="900" fill="url(#dashOrangeRight)" />

          {/* Concentric Elliptical Rings matching Landing Page */}
          <ellipse
            cx="720"
            cy="450"
            rx="460"
            ry="255"
            stroke="rgba(20, 184, 166, 0.11)"
            strokeWidth="1"
            fill="none"
          />
          <ellipse
            cx="720"
            cy="450"
            rx="590"
            ry="330"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
            fill="none"
          />
          <ellipse
            cx="720"
            cy="450"
            rx="730"
            ry="410"
            stroke="rgba(20, 184, 166, 0.055)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
}

export { DashboardBackground as AppBackground };

import React from "react";
import "../styles/appbackground.css";

/**
 * Unified Antigravity Background System
 * Shared across Landing, Dashboard, Workspace, and Auth.
 * Features:
 *  1. Precision 52px technical geometric grid with radial vignette mask
 *  2. Multi-layer floating ambient aurora glow orbs (Coral, Emerald, Cyan)
 *  3. Cybernetic flowing orbital curves & glowing light beads (dual-theme)
 */
export default function DashboardBackground({ theme = "dark" }) {
  const isLight = theme === "light";

  return (
    <div className={`app-background-system ${theme}`} aria-hidden="true">
      {/* 1. Precision 52px Geometric Technical Grid Overlay */}
      <div className="background-grid" />

      {/* 2. Layered Floating Ambient Aurora Glow Orbs */}
      <div className="ambient-aurora ambient-aurora-1" />
      <div className="ambient-aurora ambient-aurora-2" />
      <div className="ambient-aurora ambient-aurora-3" />

      {/* 3. Cybernetic Flowing Energy Curves & Orbital Beads */}
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
            <filter id="dashGlowDark" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <radialGradient id="dashEmeraldGlow" cx="80%" cy="80%" r="50%">
              <stop offset="0%" stopColor="#0B3826" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#020708" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient bottom-right emerald glow */}
          <circle cx="1150" cy="750" r="450" fill="url(#dashEmeraldGlow)" />

          {/* Glowing cybernetic curves */}
          <path
            d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
            stroke="rgba(184, 255, 43, 0.38)"
            strokeWidth="4"
            filter="url(#dashGlowDark)"
            fill="none"
          />
          <path
            d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
            stroke="rgba(67, 230, 92, 0.50)"
            strokeWidth="1.2"
            fill="none"
          />

          <path
            d="M360,910 C580,710 860,920 1150,710 C1310,590 1430,670 1550,550"
            stroke="rgba(24, 151, 73, 0.38)"
            strokeWidth="1"
            fill="none"
          />

          <path
            d="M650,850 C880,580 1200,620 1460,450"
            stroke="rgba(184, 255, 43, 0.42)"
            strokeWidth="1.2"
            fill="none"
          />

          {/* Glowing node at arc intersection */}
          <circle cx="1120" cy="680" r="6" fill="rgba(184, 255, 43, 0.28)" />
          <circle cx="1120" cy="680" r="2.5" fill="#D0FF55" />
        </svg>
      )}
    </div>
  );
}

export { DashboardBackground as AppBackground };

import React from "react";

export default function DashboardBackground({ theme }) {
  if (theme === "light") {
    return (
      <svg
        className="dashboard-bg-curves"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="dashPeachGlow" cx="80%" cy="80%" r="50%">
            <stop offset="0%" stopColor="#FFEAD8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFAF6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient bottom-right peach glow */}
        <circle cx="1150" cy="750" r="450" fill="url(#dashPeachGlow)" />

        {/* Flowing Lower-Right Orange & Coral Curves matching screenshot */}
        <path
          d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
          stroke="rgba(255, 132, 64, 0.38)"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M360,910 C580,710 860,920 1150,710 C1310,590 1430,670 1550,550"
          stroke="rgba(255, 155, 95, 0.28)"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M400,940 C620,740 900,950 1180,740 C1340,620 1460,700 1580,580"
          stroke="rgba(255, 185, 140, 0.2)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Secondary sweeping ribbon */}
        <path
          d="M650,850 C880,580 1200,620 1460,450"
          stroke="rgba(255, 132, 64, 0.25)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M700,890 C920,620 1240,660 1500,480"
          stroke="rgba(255, 171, 119, 0.2)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    );
  }

  // Dark Mode: Glowing emerald and lime orbital paths with ambient illumination
  return (
    <svg
      className="dashboard-bg-curves"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="dashGlowDark" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <radialGradient id="dashEmeraldGlow" cx="80%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#0B3826" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#020B08" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient bottom-right emerald glow */}
      <circle cx="1150" cy="750" r="450" fill="url(#dashEmeraldGlow)" />

      {/* Blurred glow stroke */}
      <path
        d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
        stroke="rgba(184, 255, 43, 0.35)"
        strokeWidth="4"
        filter="url(#dashGlowDark)"
        fill="none"
      />
      {/* Crisp line */}
      <path
        d="M320,880 C540,680 820,890 1120,680 C1280,560 1400,640 1520,520"
        stroke="rgba(67, 230, 92, 0.45)"
        strokeWidth="1.2"
        fill="none"
      />

      <path
        d="M360,910 C580,710 860,920 1150,710 C1310,590 1430,670 1550,550"
        stroke="rgba(24, 151, 73, 0.35)"
        strokeWidth="1"
        fill="none"
      />

      <path
        d="M650,850 C880,580 1200,620 1460,450"
        stroke="rgba(184, 255, 43, 0.4)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Glowing node at arc intersection */}
      <circle cx="1120" cy="680" r="6" fill="rgba(184, 255, 43, 0.25)" />
      <circle cx="1120" cy="680" r="2.5" fill="#D0FF55" />
    </svg>
  );
}


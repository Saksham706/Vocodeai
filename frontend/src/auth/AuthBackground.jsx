import React from "react";

export default function AuthBackground({ theme }) {
  if (theme === "light") {
    return (
      <svg
        className="auth-bg-curves"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="peachGlowLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFEAD8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFAF6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="720" cy="180" r="440" fill="url(#peachGlowLight)" />

        <path
          d="M-100,250 C320,120 540,480 820,310 C1100,140 1280,360 1540,220"
          stroke="rgba(255, 140, 85, 0.22)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-80,290 C340,160 560,510 840,350 C1120,180 1300,400 1560,260"
          stroke="rgba(255, 140, 85, 0.16)"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M-60,330 C360,200 580,540 860,390 C1140,220 1320,440 1580,300"
          stroke="rgba(255, 140, 85, 0.1)"
          strokeWidth="1"
          fill="none"
        />

        <path
          d="M600,-50 C850,200 1250,150 1500,450"
          stroke="rgba(255, 120, 77, 0.18)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M650,-70 C900,180 1300,130 1550,420"
          stroke="rgba(255, 120, 77, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />

        <path
          d="M-50,750 C280,620 620,840 980,680 C1240,560 1420,720 1600,640"
          stroke="rgba(255, 140, 85, 0.18)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-30,790 C300,660 640,870 1000,720 C1260,600 1440,750 1620,680"
          stroke="rgba(255, 140, 85, 0.12)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    );
  }

  // Dark Mode: Glowing emerald, lime and cyan orbital paths & luminous nodes
  return (
    <>
      <svg
        className="auth-bg-curves"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* Soft Blur Filter for Glowing Paths */}
          <filter id="authGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Node Glows */}
          <radialGradient id="nodeGlowLime" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D0FF55" stopOpacity="1" />
            <stop offset="50%" stopColor="#B7FF29" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#010A08" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nodeGlowEmerald" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#58E8E2" stopOpacity="1" />
            <stop offset="50%" stopColor="#43E65C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#010A08" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Long emerald curve sweeping across the upper edge (Glow + Line) */}
        <path
          d="M-50,60 C280,10 650,110 1050,45 C1240,15 1380,70 1520,30"
          className="auth-orbit-glow"
          stroke="rgba(67, 230, 92, 0.4)"
        />
        <path
          d="M-50,60 C280,10 650,110 1050,45 C1240,15 1380,70 1520,30"
          className="auth-orbit-line"
        />

        {/* 2. Fine green arc passing behind the logo area */}
        <path
          d="M-20,160 C120,70 260,110 380,190"
          className="auth-orbit-secondary"
        />

        {/* 3. Large asymmetrical curve entering upper-left and sweeping toward center */}
        <path
          d="M-80,240 C180,180 440,320 720,260 C980,200 1200,340 1500,280"
          className="auth-orbit-glow"
          stroke="rgba(184, 255, 43, 0.5)"
        />
        <path
          d="M-80,240 C180,180 440,320 720,260 C980,200 1200,340 1500,280"
          className="auth-orbit-lime-bright"
        />

        {/* 4. Overlapping low-opacity curves behind hero heading */}
        <path
          d="M-40,290 C220,220 460,350 740,300 C960,260 1180,370 1480,320"
          className="auth-orbit-secondary"
        />
        <path
          d="M-20,330 C250,260 480,380 760,330 C980,290 1200,400 1500,360"
          className="auth-orbit-cyan"
        />

        {/* 5. Sweeping lime curve near the terminal illustration */}
        <path
          d="M-60,540 C180,440 380,590 640,510 C820,450 1020,530 1220,490"
          className="auth-orbit-glow"
          stroke="rgba(184, 255, 43, 0.45)"
        />
        <path
          d="M-60,540 C180,440 380,590 640,510 C820,450 1020,530 1220,490"
          className="auth-orbit-lime-bright"
        />

        {/* 6. Partial elliptical loop behind form card */}
        <path
          d="M820,180 C1040,110 1380,140 1420,380 C1460,600 1180,680 940,640"
          className="auth-orbit-glow"
          stroke="rgba(67, 230, 92, 0.35)"
        />
        <path
          d="M820,180 C1040,110 1380,140 1420,380 C1460,600 1180,680 940,640"
          className="auth-orbit-line"
        />

        {/* 7. Curved path extending from center toward right edge */}
        <path
          d="M580,420 C760,380 980,450 1200,400 C1340,370 1440,430 1540,410"
          className="auth-orbit-cyan"
        />

        {/* 8. Thin green lines flowing around lower-left corner */}
        <path
          d="M-80,720 C140,660 360,780 620,710 C880,640 1120,760 1460,690"
          className="auth-orbit-secondary"
        />

        {/* 9. Brighter curved path passing beneath terminal panel */}
        <path
          d="M-40,780 C180,720 400,830 680,760 C940,700 1180,810 1500,740"
          className="auth-orbit-glow"
          stroke="rgba(184, 255, 43, 0.48)"
        />
        <path
          d="M-40,780 C180,720 400,830 680,760 C940,700 1180,810 1500,740"
          className="auth-orbit-lime-bright"
        />

        {/* 10. Additional fine orbital arc near bottom right */}
        <path
          d="M880,850 C1080,780 1320,860 1520,810"
          className="auth-orbit-secondary"
        />

        {/* 11. Luminous Nodes (Glowing Dots) at key intersections & arcs */}
        {/* Node 1: near upper curve */}
        <circle cx="650" cy="110" r="6" fill="url(#nodeGlowLime)" />
        <circle cx="650" cy="110" r="2" fill="#D0FF55" />

        {/* Node 2: near logo / heading sweep */}
        <circle cx="380" cy="190" r="7" fill="url(#nodeGlowEmerald)" />
        <circle cx="380" cy="190" r="2.2" fill="#58E8E2" />

        {/* Node 3: center sweep */}
        <circle cx="720" cy="260" r="8" fill="url(#nodeGlowLime)" />
        <circle cx="720" cy="260" r="2.5" fill="#B7FF29" />

        {/* Node 4: near terminal arc */}
        <circle cx="640" cy="510" r="7" fill="url(#nodeGlowEmerald)" />
        <circle cx="640" cy="510" r="2.2" fill="#43E65C" />

        {/* Node 5: loop behind card */}
        <circle cx="1180" cy="680" r="8" fill="url(#nodeGlowLime)" />
        <circle cx="1180" cy="680" r="2.5" fill="#D0FF55" />

        {/* Node 6: lower left sweep */}
        <circle cx="400" cy="830" r="6" fill="url(#nodeGlowLime)" />
        <circle cx="400" cy="830" r="2" fill="#B7FF29" />
      </svg>

      {/* Large Glowing Geometric Rounded Outline Shapes behind cards */}
      <div className="auth-outline-shape shape-top-right" aria-hidden="true" />
      <div className="auth-outline-shape shape-bottom-right" aria-hidden="true" />
    </>
  );
}


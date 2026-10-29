import React from "react";
import { Folder, FileCode2, SquareTerminal } from "lucide-react";
import "../../styles/welcomedashboard.css";

export default function WelcomeDashboard({
  theme = "dark",
  onOpenFolder,
  onNewFile,
  onOpenTerminal,
}) {
  return (
    <div className="welcome-dashboard-container">
      {/* Background flowing curves matching reference */}
      <div className="welcome-bg-curves-wrap" aria-hidden="true">
        {theme === "light" ? (
          <svg
            className="welcome-svg"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="peachGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE8D6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFF9F5" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="600" cy="400" r="450" fill="url(#peachGlow)" />
            {/* Flowing bottom & side curves */}
            <path
              d="M-50,650 C250,520 480,720 750,560 C980,420 1150,560 1300,430"
              stroke="rgba(255, 140, 70, 0.28)"
              strokeWidth="1.8"
            />
            <path
              d="M-50,690 C270,550 510,760 780,590 C1010,450 1180,600 1320,460"
              stroke="rgba(255, 165, 110, 0.2)"
              strokeWidth="1.4"
            />
            <path
              d="M100,780 C360,610 650,790 920,620 C1100,500 1220,580 1350,490"
              stroke="rgba(255, 190, 150, 0.16)"
              strokeWidth="1.2"
            />
          </svg>
        ) : (
          <svg
            className="welcome-svg"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="emeraldGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0B3826" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#020B08" stopOpacity="0" />
              </radialGradient>
              <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="600" cy="400" r="450" fill="url(#emeraldGlow)" />
            {/* Flowing bottom & side curves */}
            <path
              d="M-50,650 C250,520 480,720 750,560 C980,420 1150,560 1300,430"
              stroke="rgba(43, 216, 127, 0.25)"
              strokeWidth="1.6"
              filter="url(#waveGlow)"
            />
            <path
              d="M-50,690 C270,550 510,760 780,590 C1010,450 1180,600 1320,460"
              stroke="rgba(34, 197, 94, 0.18)"
              strokeWidth="1.3"
            />
            <path
              d="M100,780 C360,610 650,790 920,620 C1100,500 1220,580 1350,490"
              stroke="rgba(74, 222, 128, 0.14)"
              strokeWidth="1.2"
            />
          </svg>
        )}
      </div>

      {/* Center Welcome Card */}
      <div className="welcome-center-card">
        {/* Logo matching light and dark themes */}
        <div className="welcome-logo-wrap">
          <img
            src={theme === "light" ? "/vcode-light.png" : "/vcode.png"}
            alt="Vocodeai Logo"
            className="welcome-brand-logo-img"
          />
        </div>

        <p className="welcome-subtitle">Vocodeai IDE</p>

        {/* 3 Action Buttons */}
        <div className="welcome-actions-list">
          {/* 1. Open Folder */}
          <button
            className="welcome-btn welcome-btn-primary"
            onClick={onOpenFolder}
          >
            <span className="welcome-btn-left">
              <Folder size={18} className="btn-icon" />
              <span>Open Folder</span>
            </span>
          </button>

          {/* 2. Create New File */}
          <button
            className="welcome-btn welcome-btn-secondary"
            onClick={onNewFile}
          >
            <span className="welcome-btn-left">
              <FileCode2 size={18} className="btn-icon" />
              <span>Create New File</span>
            </span>
            <span className="welcome-btn-shortcut">Ctrl + N</span>
          </button>

          {/* 3. Open Terminal */}
          <button
            className="welcome-btn welcome-btn-secondary"
            onClick={onOpenTerminal}
          >
            <span className="welcome-btn-left">
              <SquareTerminal size={18} className="btn-icon" />
              <span>Open Terminal</span>
            </span>
            <span className="welcome-btn-shortcut">Ctrl + `</span>
          </button>
        </div>
      </div>
    </div>
  );
}


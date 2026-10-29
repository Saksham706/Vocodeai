export function RobotAvatar({ size = 38, className = "" }) {
  return (
    <div
      className={`robot-avatar-container ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="robot-avatar-svg"
      >
        <defs>
          {/* Head gradients */}
          <linearGradient id="avatarHeadGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Visor gradients */}
          <linearGradient id="avatarVisorGrad" x1="25" y1="35" x2="75" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1C2541" />
          </linearGradient>

          {/* Dark theme ear gradient */}
          <linearGradient id="avatarEarDark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          {/* Light theme ear gradient */}
          <linearGradient id="avatarEarLight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7A45" />
            <stop offset="100%" stopColor="#FA541C" />
          </linearGradient>

          <filter id="eyeGlowAvatar" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Head Base */}
        <rect x="22" y="24" width="56" height="48" rx="22" fill="url(#avatarHeadGrad)" />

        {/* Ear Cups */}
        <rect x="13" y="38" width="10" height="20" rx="5" className="robot-ear-cup" />
        <rect x="77" y="38" width="10" height="20" rx="5" className="robot-ear-cup" />

        {/* Headband / Top joint */}
        <path d="M 36 24 C 36 16 64 16 64 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="robot-headband" />
        <circle cx="50" cy="15" r="4.5" className="robot-antenna-tip" fill="#FF8B32" />

        {/* Visor Display */}
        <rect x="28" y="34" width="44" height="28" rx="12" fill="url(#avatarVisorGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Friendly Visor Eyes */}
        <rect x="36" y="43" width="9" height="10" rx="4.5" className="robot-eye" filter="url(#eyeGlowAvatar)" />
        <rect x="55" y="43" width="9" height="10" rx="4.5" className="robot-eye" filter="url(#eyeGlowAvatar)" />

        {/* Cheerful subtle smile curve */}
        <path d="M 45 56 Q 50 59 55 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="robot-smile" />
      </svg>
    </div>
  );
}

export function RobotIllustration({ size = 100, className = "" }) {
  return (
    <div
      className={`robot-welcome-illustration ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Decorative Floating Sparkles */}
      <span className="robot-sparkle sparkle-top">✦</span>
      <span className="robot-sparkle sparkle-right">✧</span>
      <span className="robot-sparkle sparkle-left">✦</span>

      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="robot-hero-svg"
      >
        <defs>
          <linearGradient id="heroHeadGrad" x1="30" y1="20" x2="130" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="heroVisorGrad" x1="45" y1="45" x2="115" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          <filter id="heroEyeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Robot Body / Torso */}
        <path
          d="M 52 114 C 52 104 108 104 108 114 L 116 150 C 116 154 44 154 44 150 Z"
          fill="url(#heroHeadGrad)"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="1.5"
        />

        {/* Chest Accent Light / Badge */}
        <circle cx="80" cy="126" r="6" className="robot-chest-badge" />

        {/* Neck ring */}
        <rect x="66" y="104" width="28" height="8" rx="4" fill="#94A3B8" />

        {/* Left Arm (Relaxed) */}
        <path d="M 48 116 C 36 122 34 138 42 144" stroke="currentColor" strokeWidth="9" strokeLinecap="round" className="robot-arm" />

        {/* Right Arm (Waving Cheerfully) */}
        <path d="M 112 116 C 126 110 134 94 140 84" stroke="currentColor" strokeWidth="9" strokeLinecap="round" className="robot-arm" />
        {/* Hand */}
        <circle cx="142" cy="81" r="7" fill="url(#heroHeadGrad)" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />

        {/* Head Shell */}
        <rect x="38" y="32" width="84" height="72" rx="34" fill="url(#heroHeadGrad)" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />

        {/* Headband / Arch */}
        <path d="M 58 32 C 58 20 102 20 102 32" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" className="robot-headband" />
        <circle cx="80" cy="18" r="5.5" className="robot-antenna-tip" />

        {/* Ear Cups */}
        <rect x="25" y="52" width="14" height="32" rx="7" className="robot-ear-cup" />
        <rect x="121" y="52" width="14" height="32" rx="7" className="robot-ear-cup" />
        {/* Ear Rings Accent */}
        <circle cx="32" cy="68" r="4" className="robot-ear-light" />
        <circle cx="128" cy="68" r="4" className="robot-ear-light" />

        {/* Dark Visor Screen */}
        <rect x="48" y="47" width="64" height="42" rx="18" fill="url(#heroVisorGrad)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

        {/* Curved Friendly Eyes */}
        <path
          d="M 58 68 C 58 61 68 61 68 68"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="robot-eye-arc"
          filter="url(#heroEyeGlow)"
        />
        <path
          d="M 92 68 C 92 61 102 61 102 68"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="robot-eye-arc"
          filter="url(#heroEyeGlow)"
        />

        {/* Subtle cute blush or smile */}
        <path d="M 74 79 Q 80 84 86 79" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="robot-smile" />
      </svg>
    </div>
  );
}


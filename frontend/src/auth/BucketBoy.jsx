import React from "react";

/**
 * Animated Cartoon Boy with Bucket (Inspired by the viral login animation)
 * States:
 * - "running": running with bucket towards center
 * - "splashing": throwing the water splash forward
 * - "moving-to-side": running to the right side of the revealed card
 * - "standing": standing happily next to the form holding bucket
 * - "clicking": reacting/tapping towards the active input
 */
export default function BucketBoy({
  phase, // "entering" | "splashing" | "revealing" | "ready"
  state, // "running" | "splashing" | "moving" | "standing" | "clicking"
  pos, // { x, y }
  facingLeft = false,
  clickBurstKey = 0,
}) {
  return (
    <div
      className={`bucket-boy-actor phase-${phase} state-${state} ${facingLeft ? "facing-left" : ""}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      {/* Water splash arc when boy throws liquid from bucket */}
      {(phase === "splashing" || phase === "revealing") && (
        <div className="bucket-splash-arc">
          <svg className="splash-svg" viewBox="0 0 240 180" fill="none">
            {/* Fluid splash wave */}
            <path
              className="splash-wave-stream"
              d="M10 90 Q 60 40, 130 65 T 220 85"
            />
            {/* Dynamic splash droplets */}
            <circle className="drop d1" cx="80" cy="50" r="4.5" />
            <circle className="drop d2" cx="120" cy="35" r="6" />
            <circle className="drop d3" cx="150" cy="48" r="5" />
            <circle className="drop d4" cx="180" cy="40" r="7" />
            <circle className="drop d5" cx="205" cy="65" r="5.5" />
            <circle className="drop d6" cx="170" cy="85" r="4" />
            <circle className="drop d7" cx="130" cy="95" r="5" />
            <circle className="drop d8" cx="225" cy="90" r="6.5" />
            <circle className="drop d9" cx="195" cy="110" r="4.5" />
          </svg>
        </div>
      )}

      {/* Tap burst effect on click */}
      {state === "clicking" && (
        <span key={clickBurstKey} className="boy-tap-burst" />
      )}

      {/* SVG Cartoon Boy Character */}
      <svg
        className="boy-character-svg"
        width="82"
        height="108"
        viewBox="0 0 82 108"
        fill="none"
      >
        {/* Soft ground shadow */}
        <ellipse className="boy-ground-shadow" cx="41" cy="103" rx="20" ry="4.5" />

        {/* Back Leg */}
        <g className="boy-leg boy-leg-back">
          <path
            className="boy-skin"
            d="M32 68 L28 89"
            stroke="#f5cfb3"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          {/* Sock */}
          <rect x="23" y="87" width="9" height="7" rx="2" fill="#ffffff" stroke="#23272e" strokeWidth="1.2" />
          {/* Shoe */}
          <path
            d="M20 94 C20 91, 26 90, 31 92 L34 94 C36 96, 36 99, 32 100 L21 100 C19 100, 19 96, 20 94 Z"
            fill="#1e242d"
            stroke="#11151c"
            strokeWidth="1.2"
          />
        </g>

        {/* Back Arm (holds bucket handle in front) */}
        <g className="boy-arm boy-arm-back">
          <path
            className="boy-shirt-sleeve"
            d="M35 44 L27 52"
            stroke="#ffffff"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          <path
            className="boy-skin"
            d="M27 52 L22 62"
            stroke="#f5cfb3"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* Torso & White T-shirt */}
        <g className="boy-body">
          {/* White shirt */}
          <path
            d="M29 38 C32 37, 47 37, 51 39 C54 44, 53 58, 51 63 C46 64, 34 64, 29 63 C27 58, 27 43, 29 38 Z"
            fill="#ffffff"
            stroke="#23272e"
            strokeWidth="1.8"
          />
          {/* Collar line */}
          <path d="M37 38 C39 42, 43 42, 45 38" stroke="#23272e" strokeWidth="1.4" fill="none" />

          {/* Dark Navy Shorts */}
          <path
            d="M28 62 L52 62 L54 74 L42 74 L40 68 L38 74 L26 74 Z"
            fill="#2c3545"
            stroke="#1d232e"
            strokeWidth="1.6"
          />
        </g>

        {/* Front Leg */}
        <g className="boy-leg boy-leg-front">
          <path
            className="boy-skin"
            d="M45 68 L48 89"
            stroke="#f5cfb3"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          {/* Sock */}
          <rect x="44" y="87" width="9" height="7" rx="2" fill="#ffffff" stroke="#23272e" strokeWidth="1.2" />
          {/* Shoe */}
          <path
            d="M42 94 C42 91, 48 90, 53 92 L56 94 C58 96, 58 99, 54 100 L43 100 C41 100, 41 96, 42 94 Z"
            fill="#1e242d"
            stroke="#11151c"
            strokeWidth="1.2"
          />
        </g>

        {/* Head & Face */}
        <g className="boy-head">
          {/* Neck */}
          <rect x="36" y="32" width="8" height="7" rx="2" fill="#f5cfb3" />

          {/* Ears */}
          <circle cx="32" cy="24" r="3.8" fill="#f5cfb3" stroke="#23272e" strokeWidth="1.4" />

          {/* Face base */}
          <circle cx="43" cy="22" r="13" fill="#f5cfb3" stroke="#23272e" strokeWidth="1.8" />

          {/* Hair with iconic swept crest */}
          <path
            d="M32 23 C30 14, 35 7, 47 7 C54 7, 58 10, 60 14 C63 12, 65 14, 63 17 C60 17, 58 20, 57 23 C54 15, 48 11, 42 12 C36 13, 33 17, 32 23 Z"
            fill="#252b36"
            stroke="#1b1f27"
            strokeWidth="1.6"
          />
          {/* Front hair fringe */}
          <path
            d="M36 12 C40 14, 46 13, 51 17 C47 16, 42 16, 36 18 Z"
            fill="#252b36"
          />

          {/* Eyes */}
          <ellipse cx="44.5" cy="20.5" rx="1.6" ry="2.2" fill="#1b1f27" />
          <ellipse cx="52" cy="21" rx="1.6" ry="2.2" fill="#1b1f27" />

          {/* Eyebrows */}
          <path d="M42.5 17 Q 44.5 15.5 46.5 17" stroke="#252b36" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M50.5 17.5 Q 52.5 16 54.5 17.5" stroke="#252b36" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Nose */}
          <path d="M48.5 22.5 Q 50 23.5 48.5 24.5" stroke="#d49b77" strokeWidth="1.3" strokeLinecap="round" fill="none" />

          {/* Cheerful Smile */}
          <path d="M45.5 27 Q 49 30 52 26.5" stroke="#b4533b" strokeWidth="1.4" strokeLinecap="round" fill="none" />

          {/* Cheek blush */}
          <circle cx="42" cy="25" r="2.2" fill="rgba(255, 120, 100, 0.35)" />
          <circle cx="53" cy="25.5" r="2.2" fill="rgba(255, 120, 100, 0.35)" />
        </g>

        {/* Bucket (Swings or Rests) */}
        <g className="boy-bucket-group">
          {/* Metal bucket body */}
          <path
            d="M12 55 L28 55 L25 76 L15 76 Z"
            fill="#525d70"
            stroke="#202530"
            strokeWidth="1.6"
          />
          {/* Bucket top rim */}
          <ellipse cx="20" cy="55" rx="8" ry="2.6" fill="#69768c" stroke="#202530" strokeWidth="1.4" />
          {/* Water inside bucket */}
          <ellipse cx="20" cy="55.5" rx="6.5" ry="1.8" fill="#38bdf8" />
          {/* Bucket handle */}
          <path
            d="M13 54 C13 44, 27 44, 27 54"
            stroke="#202530"
            strokeWidth="2"
            fill="none"
          />
        </g>

        {/* Front Arm (holds bucket or points/taps) */}
        <g className="boy-arm boy-arm-front">
          <path
            className="boy-shirt-sleeve"
            d="M44 43 L32 50"
            stroke="#ffffff"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          <path
            className="boy-skin"
            d="M32 50 L22 51"
            stroke="#f5cfb3"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Hand clasping bucket handle */}
          <circle cx="21" cy="50.5" r="3.4" fill="#f5cfb3" stroke="#23272e" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

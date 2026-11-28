import React from "react";

/**
 * Official VocodeAI Brand Logo Component
 * Replaces the third-party Antigravity rainbow arch with official VocodeAI branding.
 */
export function VocodeLogo({
  size = 28,
  variant = "icon", // 'icon' (square emblem) | 'full' (horizontal brand)
  glow = false,
  className = "",
  style = {},
}) {
  const isFull = variant === "full";
  const src = isFull ? "/vcode.png" : "/icon.png";

  const numericSize = typeof size === "number" ? size : parseInt(size, 10) || 28;

  return (
    <div
      className={`vocode-brand-logo ${glow ? "vocode-logo-glow" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: isFull ? `${numericSize * 3.5}px` : `${numericSize}px`,
        height: `${numericSize}px`,
        position: "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={src}
        alt="VocodeAI"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: glow
            ? "drop-shadow(0 0 4px rgba(16, 185, 129, 0.28))"
            : undefined,
          userSelect: "none",
        }}
        draggable={false}
      />
    </div>
  );
}

export default VocodeLogo;

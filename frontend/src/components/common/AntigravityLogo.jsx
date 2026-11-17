import React from "react";
import VocodeLogo from "./VocodeLogo";

/**
 * AntigravityLogo shim: redirects to official VocodeLogo
 * to ensure all legacy references use Vocode branding.
 */
export function AntigravityLogo({ size = 28, className = "", style = {}, glow = true }) {
  return <VocodeLogo size={size} className={className} style={style} glow={glow} />;
}

export default AntigravityLogo;

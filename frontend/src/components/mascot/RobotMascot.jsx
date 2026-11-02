import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "../../styles/RobotMascot.css";

const STORAGE_KEY = "vocode_mascot_pos";

const MASCOT_QUOTES = [
  "🦉 Vocode AI ready! Drag me anywhere on your screen!",
  "🚀 Real-time coding, voice & automation companion!",
  "💡 Tip: Press Ctrl + K on the dashboard to quick-search!",
  "⚡ Connected & keeping an eye on your workspaces!",
  "✨ Ask me anything or command hands-free with voice!",
];

export default function RobotMascot() {
  const location = useLocation();

  // Hide mascot when entering the coding workspace
  const isWorkspace = location.pathname.startsWith("/workspace");

  // Position state (persisted in localStorage)
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const initW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const initH = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      x: Math.max(16, initW - 120),
      y: Math.max(16, initH - 120),
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [speechText, setSpeechText] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const mascotRef = useRef(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });
  const posRef = useRef(pos);
  posRef.current = pos;

  const speechTimeoutRef = useRef(null);
  const mouseIdleTimeoutRef = useRef(null);
  const rAFRef = useRef(null);

  // 1. Boundary clamping helper
  const clampPos = useCallback((x, y) => {
    const mascotSize = window.innerWidth <= 768 ? 72 : 96;
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - mascotSize - margin);
    const maxY = Math.max(margin, window.innerHeight - mascotSize - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  }, []);

  // 2. Adjust position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => {
        const clamped = clampPos(prev.x, prev.y);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        return clamped;
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [clampPos]);

  // 3. Natural periodic blinking
  useEffect(() => {
    if (isWorkspace) return;

    let blinkTimeout = null;
    const scheduleNextBlink = () => {
      const delay = 3500 + Math.random() * 3000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, [isWorkspace]);

  // 4. Ultra-smooth, 0-rerender 3D Eye Tracking via direct CSS custom properties
  useEffect(() => {
    if (isWorkspace) return;

    const handleMouseMove = (e) => {
      if (!mascotRef.current) return;

      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(() => {
        if (!mascotRef.current) return;
        const rect = mascotRef.current.getBoundingClientRect();
        const mascotCenterX = rect.left + rect.width / 2;
        const mascotCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - mascotCenterX;
        const deltaY = e.clientY - mascotCenterY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > 0) {
          const maxOffset = 3.2;
          const normalizedDist = Math.min(distance / 250, 1);
          const pupilX = (deltaX / distance) * maxOffset * normalizedDist;
          const pupilY = (deltaY / distance) * maxOffset * normalizedDist;

          const tiltMax = 8;
          const tiltX = -Math.max(-tiltMax, Math.min(tiltMax, (deltaY / window.innerHeight) * 16));
          const tiltY = Math.max(-tiltMax, Math.min(tiltMax, (deltaX / window.innerWidth) * 16));

          mascotRef.current.style.setProperty("--pupil-x", `${pupilX.toFixed(2)}px`);
          mascotRef.current.style.setProperty("--pupil-y", `${pupilY.toFixed(2)}px`);
          mascotRef.current.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
          mascotRef.current.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        }

        if (mouseIdleTimeoutRef.current) clearTimeout(mouseIdleTimeoutRef.current);
        mouseIdleTimeoutRef.current = setTimeout(() => {
          if (mascotRef.current) {
            mascotRef.current.style.setProperty("--pupil-x", "0px");
            mascotRef.current.style.setProperty("--pupil-y", "0px");
            mascotRef.current.style.setProperty("--tilt-x", "0deg");
            mascotRef.current.style.setProperty("--tilt-y", "0deg");
          }
        }, 1600);
      });
    };

    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      if (mouseIdleTimeoutRef.current) clearTimeout(mouseIdleTimeoutRef.current);
    };
  }, [isWorkspace]);

  // 5. Drag & Drop Handlers
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    e.preventDefault();
    mascotRef.current?.setPointerCapture(e.pointerId);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: posRef.current.x,
      origY: posRef.current.y,
      hasMoved: false,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.hasMoved = true;
    }

    const newX = dragStartRef.current.origX + deltaX;
    const newY = dragStartRef.current.origY + deltaY;

    const clamped = clampPos(newX, newY);
    setPos(clamped);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;

    setIsDragging(false);
    try {
      mascotRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    if (dragStartRef.current.hasMoved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current));
    } else {
      handleMascotClick();
    }
  };

  // 6. Speech bubble on click
  const handleMascotClick = () => {
    const quote = MASCOT_QUOTES[quoteIndex % MASCOT_QUOTES.length];
    setSpeechText(quote);
    setQuoteIndex((prev) => prev + 1);

    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => {
      setSpeechText(null);
    }, 4500);
  };

  if (isWorkspace) {
    return null;
  }

  return (
    <div
      ref={mascotRef}
      className={`robot-mascot-wrapper ${isDragging ? "is-dragging" : ""}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="VocodeAI 3D Mascot (Drag me anywhere!)"
      aria-label="VocodeAI Mascot"
    >
      {/* Speech Bubble on Click */}
      {speechText && (
        <div className="robot-mascot-speech" role="status">
          <span className="robot-speech-badge">
            <Sparkles size={10} style={{ display: "inline", marginRight: 4 }} />
            VocodeAI Mascot
          </span>
          <p className="robot-speech-text">{speechText}</p>
        </div>
      )}

      {/* Outer Floating Bobber */}
      <div className="robot-mascot-bobber">
        {/* 3D Tilt Card */}
        <div
          className="robot-mascot-card"
          style={{
            transform: "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
          }}
        >
          {/* Subtle Ambient Glowing Aura */}
          <div className="robot-mascot-aura" />

          {/* Exact 3D Robotic Owl Image Asset */}
          <img
            src="/mascot.png"
            alt="VocodeAI 3D Robot Owl Mascot"
            className="robot-mascot-img"
            draggable={false}
          />

          {/* Interactive Pupil / Eye Tracking Layer */}
          <div className={`robot-eyes-layer ${isBlinking ? "is-blinking" : ""}`}>
            {/* Green Eye Socket */}
            <div className="robot-eye-socket-green">
              <div
                className="robot-pupil-green"
                style={{
                  transform: "translate(var(--pupil-x, 0px), var(--pupil-y, 0px))",
                }}
              />
            </div>

            {/* Golden Eye Socket */}
            <div className="robot-eye-socket-gold">
              <div
                className="robot-pupil-gold"
                style={{
                  transform: "translate(var(--pupil-x, 0px), var(--pupil-y, 0px))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

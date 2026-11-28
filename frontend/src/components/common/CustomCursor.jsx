import React, { useEffect, useState, useRef } from "react";
import "../../styles/customcursor.css";

export default function CustomCursor() {
  const ringRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Inject permanent global style rule to eliminate all native cursors across shadow DOMs & editors
    const style = document.createElement("style");
    style.id = "global-no-native-cursor";
    style.textContent = `
      *, *::before, *::after, html, body, #root, button, a, input, textarea, select, label, svg, .monaco-editor, .monaco-editor *, .xterm, .xterm * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Only enable on pointer-capable devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return () => style.remove();
    }

    const onMouseMove = (e) => {
      setIsVisible(true);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    const onPointerOver = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.closest("[role='button']") ||
          target.closest(".clickable") ||
          target.closest(".workspace-card-item") ||
          target.closest(".template-card") ||
          target.closest(".rr-nav-center") ||
          target.closest(".vocode-pill-btn") ||
          target.closest(".dash-nav-item") ||
          target.closest(".workspace-menu-trigger") ||
          target.closest(".rr-menu-btn") ||
          target.closest(".bugatti-enter-link"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onPointerOver, { passive: true });

    return () => {
      style.remove();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onPointerOver);
    };
  }, []);

  return (
    <div
      className={`custom-cursor-container ${isVisible ? "visible" : ""} ${isHovered ? "hovered" : ""} ${isClicked ? "clicked" : ""}`}
      aria-hidden="true"
    >
      <div ref={ringRef} className="custom-cursor-ring" />
    </div>
  );
}

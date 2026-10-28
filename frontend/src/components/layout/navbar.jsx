import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFolder,
  FiTerminal,
  FiMoreVertical,
  FiLogOut,
  FiRefreshCcw,
  FiHome,
} from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

import { useWorkspace } from "../../context/WorkspaceContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openNewTerminal, terminals, killTerminal } = useWorkspace();
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAllTerminals = () => {
    terminals.forEach((t) => killTerminal(t.id));
    setOpen(false);
  };

  return (
    <header className="navbar">
      {/* LEFT */}
      <div
        className="navbar-left"
        onClick={() => navigate("/dashboard")}
      >
        <img src="/icon.png" alt="Vocodeai" className="logo-img" />
      </div>

      {/* CENTER */}
      <nav className="navbar-center">
        <div
          className={`nav-tab ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <FiFolder />
          <span>Files</span>
        </div>

        <div className="nav-tab" onClick={openNewTerminal}>
          <FiTerminal />
          <span>Terminal</span>
        </div>

        <div className="nav-tab ai-tab" onClick={() => {
          const params = new URLSearchParams(location.search);
          const isOpen = params.get("ai") === "true";

          navigate(
            isOpen
              ? location.pathname
              : `${location.pathname}?ai=true`
          );
        }}>
          <FaRobot />
          <span>AI</span>
        </div>
      </nav>

      {/* RIGHT */}
      <div className="navbar-right" ref={menuRef}>
        <button
          className="more-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label="More options"
        >
          <FiMoreVertical />
        </button>

        {open && (
          <div className="dropdown">
            <div className="dropdown-item" onClick={openNewTerminal}>
              <FiTerminal /> <span>New Terminal</span>
            </div>

            <div className="dropdown-item" onClick={closeAllTerminals}>
              <FiTerminal /> <span>Close All Terminals</span>
            </div>

            <div
              className="dropdown-item"
              onClick={() => window.location.reload()}
            >
              <FiRefreshCcw /> <span>Reload Workspace</span>
            </div>

            <div
              className="dropdown-item"
              onClick={() => navigate("/dashboard")}
            >
              <FiHome /> <span>Dashboard</span>
            </div>

            <div className="dropdown-separator" />

            <div
              className="dropdown-item danger"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <FiLogOut /> <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Megaphone } from "lucide-react";
import api from "../../utils/api";
import { BACKEND_URL } from "../../config/apiConfig";

const TYPE_ACCENTS = {
  info:    { border: "rgba(59, 130, 246, 0.35)", bg: "rgba(59, 130, 246, 0.08)",  text: "#93c5fd", pill: "#3b82f6" },
  warning: { border: "rgba(234, 179, 8, 0.38)",  bg: "rgba(234, 179, 8, 0.09)",   text: "#fde047", pill: "#eab308" },
  success: { border: "rgba(34, 197, 94, 0.35)",  bg: "rgba(34, 197, 94, 0.08)",   text: "#86efac", pill: "#22c55e" },
  error:   { border: "rgba(239, 68, 68, 0.38)",  bg: "rgba(239, 68, 68, 0.09)",   text: "#fca5a5", pill: "#ef4444" },
};

export default function AnnouncementTicker({ userPlan = "free" }) {
  const [items, setItems] = useState([]);

  const applyFilter = useCallback(
    (list) => {
      const plan = String(userPlan || "free").toLowerCase();
      return (list || []).filter(
        (a) => !a.targetPlan || a.targetPlan === "all" || a.targetPlan === plan
      );
    },
    [userPlan]
  );

  useEffect(() => {
    let mounted = true;
    let ws = null;
    let reconnectTimer = null;

    // Initial HTTP fetch
    api
      .get("/admin/announcements/active")
      .then((res) => {
        if (mounted) setItems(applyFilter(res.data?.announcements));
      })
      .catch(() => {});

    // Live WebSocket subscription
    const wsBase = BACKEND_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
    const connect = () => {
      if (!mounted) return;
      try {
        ws = new WebSocket(`${wsBase}/ws/announcements`);
        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload?.type === "announcements" && mounted) {
              setItems(applyFilter(payload.announcements));
            }
          } catch {
            // ignore malformed message
          }
        };
        ws.onclose = () => {
          if (mounted) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };
      } catch {
        // ignore connection errors
      }
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [applyFilter]);

  if (items.length === 0) return null;

  const primaryType = items[0]?.type || "info";
  const style = TYPE_ACCENTS[primaryType] || TYPE_ACCENTS.info;

  return (
    <div
      className="vocode-ticker-bar"
      style={{
        borderColor: style.border,
        background: style.bg,
      }}
      role="region"
      aria-label="Platform announcements"
    >
      <div className="vocode-ticker-badge" style={{ background: style.pill }}>
        <Megaphone size={12} />
        <span>NOTICE</span>
      </div>

      <div className="vocode-ticker-viewport">
        <div className="vocode-ticker-track">
          {[0, 1].map((dupIdx) => (
            <div className="vocode-ticker-group" key={dupIdx} aria-hidden={dupIdx === 1}>
              {items.map((a) => (
                <span className="vocode-ticker-item" key={`${dupIdx}-${a._id}`}>
                  <strong style={{ color: style.text }}>{a.title}</strong>
                  <span className="vocode-ticker-sep">—</span>
                  <span>{a.message}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

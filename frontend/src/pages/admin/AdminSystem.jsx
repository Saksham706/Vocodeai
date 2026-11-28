import { useState, useEffect } from "react";
import { Server, Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import adminApi from "../../services/adminApi";

function EnvRow({ label, ok, tooltip }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--admin-border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{label}</div>
        {tooltip && <div className="text-muted" style={{ fontSize: 11 }}>{tooltip}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {ok === true  && <><span className="health-dot ok" /><span style={{ color: "var(--admin-green)", fontSize: 12, fontWeight: 600 }}>Configured</span></>}
        {ok === false && <><span className="health-dot err" /><span style={{ color: "var(--admin-red)", fontSize: 12, fontWeight: 600 }}>Missing</span></>}
      </div>
    </div>
  );
}

function formatUptime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

export default function AdminSystem() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemHealth();
      setData(res.health);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const h = data || {};
  const env = h.env || {};

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">System Health</div>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchData} disabled={loading}>
          <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="admin-page">
        {/* Top metrics */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {[
            { label: "Server Uptime",   value: h.uptimeSeconds != null ? formatUptime(h.uptimeSeconds) : "—", color: "#22c55e" },
            { label: "Memory Usage",    value: h.memoryMB ? `${h.memoryMB} MB` : "—",                        color: "#3b82f6" },
            { label: "Node Version",    value: h.nodeVersion || "—",                                          color: "#d97706" },
            { label: "Environment",     value: env.nodeEnv || "—",                                            color: env.nodeEnv === "production" ? "#22c55e" : "#eab308" },
          ].map((s) => (
            <div className="admin-stat-card" key={s.label}>
              <div className="admin-stat-label">{s.label}</div>
              <div className="admin-stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* DB Status */}
          <div className="admin-card">
            <div className="admin-card-title"><Database size={15} /> Database</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0" }}>
              {h.dbStatus === "connected"
                ? <><span className="health-dot ok" /><span style={{ color: "var(--admin-green)", fontWeight: 600 }}>MongoDB Connected</span></>
                : <><span className="health-dot err" /><span style={{ color: "var(--admin-red)", fontWeight: 600 }}>DB Error</span></>
              }
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>Server time: {h.serverTime ? new Date(h.serverTime).toLocaleString("en-IN") : "—"}</div>
          </div>

          {/* Environment Variables */}
          <div className="admin-card">
            <div className="admin-card-title"><Server size={15} /> Environment Variables</div>
            <EnvRow label="Razorpay"       ok={env.razorpay}  tooltip="RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET" />
            <EnvRow label="Cloudflare R2"  ok={env.r2}        tooltip="CLOUDFLARE_R2_ACCOUNT_ID + CLOUDFLARE_R2_ACCESS_KEY_ID + CLOUDFLARE_R2_SECRET_ACCESS_KEY" />
            <EnvRow label="Redis"          ok={env.redis}     tooltip="REDIS_URL" />
            <EnvRow label="OpenAI API"     ok={env.openai}    tooltip="OPENAI_API_KEY" />
            <EnvRow label="Gemini API"     ok={env.gemini}    tooltip="GEMINI_API_KEY" />
            <EnvRow label="JWT Secret"     ok={env.jwtSecret} tooltip="JWT_SECRET" />
          </div>
        </div>

        {/* Quick Reference */}
        <div className="admin-card">
          <div className="admin-card-title"><CheckCircle size={15} /> Admin Quick Reference</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: 13 }}>
            {[
              ["Admin API base",     "/api/admin (JWT required)"],
              ["Overview endpoint",  "GET /api/admin/overview"],
              ["User list",          "GET /api/admin/users"],
              ["Toggle admin role",  "PATCH /api/admin/users/:id/toggle-admin"],
              ["Subscriptions",      "GET /api/admin/subscriptions"],
              ["Extend plan",        "PATCH /api/admin/subscriptions/:id/extend"],
              ["Workspaces",         "GET /api/admin/workspaces"],
              ["Analytics",          "GET /api/admin/analytics"],
              ["Announcements",      "GET/POST /api/admin/announcements"],
              ["Public banners",     "GET /api/admin/announcements/active (no auth)"],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: "6px 0", borderBottom: "1px solid var(--admin-border)" }}>
                <div className="text-muted" style={{ fontSize: 11 }}>{label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--admin-accent)", marginTop: 2 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

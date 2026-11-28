import { useState, useEffect, useCallback } from "react";
import {
  Users, FolderOpen, Zap, Mic, TrendingUp,
  UserCheck, UserX, Shield, Activity, Calendar, RotateCcw,
} from "lucide-react";
import adminApi from "../../services/adminApi";

function StatCard({ label, value, sub, color = "#d97706", icon: Icon }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: `${color}18` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value ?? "—"}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data }) {
  if (!data?.length) return <div className="text-muted">No data</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="admin-bar-chart">
      {data.map((d) => (
        <div
          key={d._id}
          className="admin-bar"
          style={{ height: `${Math.round((d.count / max) * 100)}%` }}
          title={`${d._id}: ${d.count}`}
        />
      ))}
    </div>
  );
}

function PlanDonut({ breakdown }) {
  const total = (breakdown?.free || 0) + (breakdown?.pro || 0) + (breakdown?.ultra || 0);
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const fp = pct(breakdown?.free || 0);
  const pp = pct(breakdown?.pro || 0);
  const up = pct(breakdown?.ultra || 0);

  // Simple CSS conic-gradient donut
  const gradient = `conic-gradient(
    #71717a 0% ${fp}%,
    #3b82f6 ${fp}% ${fp + pp}%,
    #a855f7 ${fp + pp}% 100%
  )`;

  return (
    <div className="admin-donut-wrap">
      <div className="admin-donut">
        <div
          style={{
            width: 100, height: 100, borderRadius: "50%",
            background: gradient,
            WebkitMask: "radial-gradient(circle at center, transparent 36px, black 36px)",
            mask: "radial-gradient(circle at center, transparent 36px, black 36px)",
          }}
        />
      </div>
      <div className="admin-donut-legend">
        {[
          { label: "Free", value: breakdown?.free || 0, color: "#71717a" },
          { label: "Pro", value: breakdown?.pro || 0, color: "#3b82f6" },
          { label: "Ultra", value: breakdown?.ultra || 0, color: "#a855f7" },
        ].map((item) => (
          <div className="admin-donut-legend-item" key={item.label}>
            <div className="admin-donut-legend-dot" style={{ background: item.color }} />
            <span className="text-muted">{item.label}</span>
            <span className="fw-600" style={{ color: "var(--admin-text)" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("all"); // all | today | 7d | 30d | single | range
  const [singleDate, setSingleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchOverview = useCallback(() => {
    setLoading(true);
    const params = {};
    const today = new Date().toISOString().slice(0, 10);

    if (mode === "today") {
      params.date = today;
    } else if (mode === "7d") {
      params.startDate = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      params.endDate = today;
    } else if (mode === "30d") {
      params.startDate = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      params.endDate = today;
    } else if (mode === "single" && singleDate) {
      params.date = singleDate;
    } else if (mode === "range") {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }

    adminApi.getOverview(params)
      .then((r) => setData(r.overview))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode, singleDate, startDate, endDate]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const o = data || {};
  const resetFilter = () => setMode("all");

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Overview</div>
        <span className="text-muted text-sm">
          {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
        </span>
      </div>

      <div className="admin-page">
        {/* Date Filter Bar */}
        <div className="admin-card mb-4" style={{ padding: "12px 16px" }}>
          <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
            <span className="flex items-center gap-2 text-sm fw-600" style={{ marginRight: 6 }}>
              <Calendar size={14} style={{ color: "var(--admin-accent)" }} /> Filter:
            </span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "single", label: "Specific Date" },
              { id: "range", label: "Date Range" },
            ].map((item) => (
              <button
                key={item.id}
                className={`admin-btn admin-btn-sm ${mode === item.id ? "admin-btn-primary" : "admin-btn-ghost"}`}
                onClick={() => setMode(item.id)}
              >
                {item.label}
              </button>
            ))}

            {mode === "single" && (
              <input
                type="date"
                className="admin-input"
                style={{ padding: "4px 10px", fontSize: 12 }}
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            )}

            {mode === "range" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="admin-input"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-muted">to</span>
                <input
                  type="date"
                  className="admin-input"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            {mode !== "all" && (
              <button className="admin-btn admin-btn-ghost admin-btn-sm ml-auto" onClick={resetFilter}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><Activity size={18} /> Loading…</div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="admin-stats-grid">
              <StatCard label={o.isFiltered ? "Users (Filtered)" : "Total Users"}      value={o.totalUsers}       sub={o.isFiltered ? "in selected period" : `+${o.newUsersToday} today`}       color="#d97706" icon={Users} />
              <StatCard label="New This Week"    value={o.newUsersThisWeek} sub={`+${o.newUsersThisMonth} / month`} color="#3b82f6" icon={TrendingUp} />
              <StatCard label={o.isFiltered ? "Workspaces (Filtered)" : "Total Workspaces"} value={o.totalWorkspaces}  sub={o.isFiltered ? "created in period" : "across all users"}                  color="#22c55e" icon={FolderOpen} />
              <StatCard label="Verified Users"   value={o.verifiedUsers}    sub="email confirmed"                   color="#eab308" icon={UserCheck} />
              <StatCard label="Suspended Users"  value={o.suspendedUsers}   sub="locked accounts"                   color="#ef4444" icon={UserX} />
              <StatCard label={mode === "single" ? `AI Chats (${singleDate})` : "AI Chats Today"}   value={o.aiUsageToday}     sub="all users combined"                color="#d97706" icon={Zap} />
              <StatCard label={mode === "single" ? `Voca (${singleDate})` : "Voca Today"}       value={o.vocaUsageToday}   sub="voice commands"                    color="#f97316" icon={Mic} />
              <StatCard label="Uptime"           value={`${Math.floor((o.serverUptime||0)/3600)}h ${Math.floor(((o.serverUptime||0)%3600)/60)}m`} sub="server uptime" color="#22c55e" icon={Activity} />
            </div>

            <div className="grid-2">
              {/* Signup Trend */}
              <div className="admin-card">
                <div className="admin-card-title"><TrendingUp size={15} /> Signups – Last 30 Days</div>
                <MiniBarChart data={o.signupTrend || []} />
                <div className="text-muted" style={{ marginTop: 8, fontSize: 11 }}>
                  Each bar = 1 day
                </div>
              </div>

              {/* Plan Distribution */}
              <div className="admin-card">
                <div className="admin-card-title"><Shield size={15} /> Plan Distribution</div>
                <PlanDonut breakdown={o.planBreakdown} />
              </div>
            </div>

            {/* Top AI Users Today */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <div className="admin-table-title"><Zap size={14} style={{ display: "inline", marginRight: 6 }} />Top AI Users Today</div>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th><th>User</th><th>Plan</th><th>AI Chats Today</th><th>Lifetime Chats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(o.topAiUsers || []).length === 0 ? (
                      <tr><td colSpan={5} className="admin-empty">No data</td></tr>
                    ) : (
                      (o.topAiUsers || []).map((u, i) => (
                        <tr key={u._id}>
                          <td className="text-muted">{i + 1}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                            <div className="text-muted">{u.email}</div>
                          </td>
                          <td><span className={`badge badge-${u.plan}`}>{u.plan}</span></td>
                          <td style={{ fontWeight: 700, color: "#d97706" }}>{u.aiDailyUsage?.count || 0}</td>
                          <td className="text-muted">{u.aiDailyUsage?.lifetimeCount || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { BarChart2, Zap, Mic, TrendingUp, Activity } from "lucide-react";
import adminApi from "../../services/adminApi";

function LeaderboardTable({ title, icon: Icon, users, valueKey, lifetimeKey }) {
  return (
    <div className="admin-table-wrap mb-4">
      <div className="admin-table-header">
        <div className="admin-table-title"><Icon size={14} style={{ display: "inline", marginRight: 6 }} />{title}</div>
      </div>
      <table className="admin-table">
        <thead><tr><th>#</th><th>User</th><th>Plan</th><th>Today</th>{lifetimeKey && <th>Lifetime</th>}</tr></thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan={5} className="admin-empty">No data</td></tr>
          ) : users.map((u, i) => (
            <tr key={u._id}>
              <td className="text-muted">{i + 1}</td>
              <td>
                <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                <div className="text-muted">{u.email}</div>
              </td>
              <td><span className={`badge badge-${u.plan}`}>{u.plan}</span></td>
              <td style={{ fontWeight: 700, color: "var(--admin-accent)" }}>{u[valueKey]?.count || u[valueKey] || 0}</td>
              {lifetimeKey && <td className="text-muted">{u[valueKey]?.lifetimeCount ?? 0}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then((r) => setData(r.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const a = data || {};

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">AI & Voca Analytics</div>
      </div>

      <div className="admin-page">
        {loading ? (
          <div className="admin-loading"><Activity size={16} /> Loading analytics…</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="admin-stats-grid">
              {[
                { label: "AI Chats Today",          value: a.aiUsageToday,       color: "#d97706", icon: Zap },
                { label: "Voca Today",              value: a.vocaUsageToday,     color: "#f97316", icon: Mic },
                { label: "Total AI (Lifetime)",     value: a.totalAiLifetime,    color: "#3b82f6", icon: TrendingUp },
                { label: "Total Voca (Lifetime)",   value: a.totalVocaLifetime,  color: "#a855f7", icon: Activity },
              ].map((s) => (
                <div className="admin-stat-card" key={s.label}>
                  <div className="admin-stat-icon" style={{ background: `${s.color}18` }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-value">{(s.value ?? 0).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Plan Usage Breakdown */}
            <div className="admin-card mb-4">
              <div className="admin-card-title"><BarChart2 size={15} /> Per-Plan AI Usage Today</div>
              <table className="admin-table">
                <thead><tr><th>Plan</th><th>Users Active</th><th>Total AI Chats</th><th>Avg per User</th></tr></thead>
                <tbody>
                  {(a.planUsageBreakdown || []).length === 0 ? (
                    <tr><td colSpan={4} className="admin-empty">No data</td></tr>
                  ) : (a.planUsageBreakdown || []).map((p) => (
                    <tr key={p._id}>
                      <td><span className={`badge badge-${p._id}`}>{p._id}</span></td>
                      <td>{p.users}</td>
                      <td style={{ fontWeight: 700, color: "var(--admin-accent)" }}>{p.totalAi}</td>
                      <td className="text-muted">{p.users ? (p.totalAi / p.users).toFixed(1) : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Users who hit limit today */}
            <div className="admin-card mb-4">
              <div className="admin-card-title"><Zap size={15} /> Users Who Hit AI Limit Today (by plan)</div>
              <table className="admin-table">
                <thead><tr><th>Plan</th><th>Users at Limit</th></tr></thead>
                <tbody>
                  {(a.usersHitAiLimit || []).length === 0 ? (
                    <tr><td colSpan={2} className="admin-empty">No users hit their limit today</td></tr>
                  ) : (a.usersHitAiLimit || []).map((p) => (
                    <tr key={p._id}>
                      <td><span className={`badge badge-${p._id}`}>{p._id}</span></td>
                      <td style={{ fontWeight: 700, color: "var(--admin-yellow)" }}>{p.hitLimit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-2">
              <LeaderboardTable
                title="Top 10 AI Users (Lifetime)"
                icon={Zap}
                users={a.topAiUsersLifetime || []}
                valueKey="aiDailyUsage"
                lifetimeKey
              />
              <LeaderboardTable
                title="Top 10 Voca Users Today"
                icon={Mic}
                users={a.topVocaUsersToday || []}
                valueKey="vocaDailyUsage"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

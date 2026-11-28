import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, UserCog, UserX, RefreshCw, Shield,
  Folder, MessageSquare, Calendar, Mail,
} from "lucide-react";
import adminApi from "../../services/adminApi";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState("free");

  const load = () => {
    setLoading(true);
    adminApi.getUserDetail(id)
      .then((r) => { setData(r.user); setNewPlan(r.user.plan || "free"); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="admin-loading">Loading user…</div>;
  if (!data) return <div className="admin-empty">User not found.</div>;

  const todayKey = new Date().toISOString().slice(0, 10);
  const aiToday = data.aiDailyUsage?.date === todayKey ? data.aiDailyUsage.count : 0;
  const vocaToday = data.vocaDailyUsage?.date === todayKey ? data.vocaDailyUsage.count : 0;

  return (
    <>
      <div className="admin-topbar">
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => navigate("/admin/users")}>
          <ArrowLeft size={13} /> Back
        </button>
        <div className="admin-topbar-title" style={{ marginLeft: 10 }}>
          {data.firstName} {data.lastName}
          <span className="text-muted text-sm" style={{ marginLeft: 10 }}>{data.email}</span>
        </div>
        <div className="flex gap-2">
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setPlanModal(true)}>
            <UserCog size={13} /> Change Plan
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => adminApi.toggleSuspend(id).then(load)}
            style={{ color: data.isSuspended ? "var(--admin-green)" : "var(--admin-yellow)" }}
          >
            <UserX size={13} /> {data.isSuspended ? "Unsuspend" : "Suspend"}
          </button>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => adminApi.resetQuota(id).then(load)}>
            <RefreshCw size={13} /> Reset Quota
          </button>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => adminApi.toggleAdmin(id).then(load)}
            style={{ color: "var(--admin-orange)" }}
          >
            <Shield size={13} /> {data.isAdmin ? "Remove Admin" : "Make Admin"}
          </button>
        </div>
      </div>

      <div className="admin-page">
        <div className="grid-2">
          {/* Profile */}
          <div className="admin-card">
            <div className="admin-card-title"><Mail size={15} /> Profile</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {[
                  ["Name",       `${data.firstName || ""} ${data.lastName || ""}`.trim() || "—"],
                  ["Email",      data.email],
                  ["Plan",       <span className={`badge badge-${data.plan}`}>{data.plan}</span>],
                  ["Verified",   data.isVerified ? <span className="badge badge-green">Yes</span> : <span className="badge badge-red">No</span>],
                  ["Suspended",  data.isSuspended ? <span className="badge badge-red">Yes</span> : <span className="badge badge-green">No</span>],
                  ["Admin",      data.isAdmin ? <span className="badge badge-orange">Yes</span> : "No"],
                  ["Auth",       [data.googleId && "Google", data.githubId && "GitHub", data.passwordHash && "Email"].filter(Boolean).join(", ") || "—"],
                  ["Joined",     new Date(data.createdAt).toLocaleString("en-IN")],
                ].map(([label, val]) => (
                  <tr key={label}>
                    <td className="text-muted" style={{ padding: "7px 0", width: 110 }}>{label}</td>
                    <td style={{ padding: "7px 0", fontWeight: 500 }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Usage */}
          <div className="admin-card">
            <div className="admin-card-title"><Shield size={15} /> Usage & Subscription</div>
            <div className="admin-stats-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { label: "AI Today",        value: aiToday },
                { label: "Voca Today",      value: vocaToday },
                { label: "AI Lifetime",     value: data.aiDailyUsage?.lifetimeCount ?? 0 },
                { label: "Voca Lifetime",   value: data.vocaDailyUsage?.lifetimeCount ?? 0 },
                { label: "Workspaces",      value: data.workspaces?.length ?? 0 },
                { label: "Total Chats",     value: data.chatCount ?? 0 },
              ].map((s) => (
                <div key={s.label} style={{ padding: "12px 0", borderBottom: "1px solid var(--admin-border)" }}>
                  <div className="admin-stat-label">{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>
            {data.plan !== "free" && (
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--admin-muted)" }}>
                Plan started: {data.planStartedAt ? new Date(data.planStartedAt).toLocaleDateString("en-IN") : "—"}<br />
                Plan expires: {data.planExpiresAt ? new Date(data.planExpiresAt).toLocaleDateString("en-IN") : "—"}
              </div>
            )}
          </div>
        </div>

        {/* Workspaces */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <div className="admin-table-title"><Folder size={14} style={{ display: "inline", marginRight: 6 }} /> Workspaces ({data.workspaces?.length || 0})</div>
          </div>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>Pinned</th><th>R2 Prefix</th><th>Created</th></tr></thead>
            <tbody>
              {(data.workspaces || []).length === 0 ? (
                <tr><td colSpan={5} className="admin-empty">No workspaces</td></tr>
              ) : data.workspaces.map((w) => (
                <tr key={w._id}>
                  <td style={{ fontWeight: 500 }}>{w.name}</td>
                  <td className="text-muted">{w.type}</td>
                  <td>{w.isPinned ? <span className="badge badge-green">Yes</span> : "—"}</td>
                  <td className="text-muted" style={{ fontFamily: "monospace", fontSize: 11 }}>{w.r2Prefix || "—"}</td>
                  <td className="text-muted">{new Date(w.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan modal */}
      {planModal && (
        <div className="admin-modal-overlay" onClick={() => setPlanModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-title">Change Plan</div>
            <div className="admin-form-group">
              <label className="admin-form-label">New Plan</label>
              <select className="admin-select w-full" value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-ghost" onClick={() => setPlanModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={() => adminApi.updateUserPlan(id, { plan: newPlan }).then(() => { setPlanModal(false); load(); })}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

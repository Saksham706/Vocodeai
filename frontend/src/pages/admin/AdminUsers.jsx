import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, UserCog, UserX, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, Shield, Users,
} from "lucide-react";
import adminApi from "../../services/adminApi";

function PlanBadge({ plan }) {
  return <span className={`badge badge-${plan || "free"}`}>{plan || "free"}</span>;
}

function ConfirmModal({ title, message, onConfirm, onClose, danger }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">{title}</div>
        <p className="text-muted text-sm">{message}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={`admin-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanModal({ user, onClose, onSaved }) {
  const [plan, setPlan] = useState(user.plan || "free");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminApi.updateUserPlan(user._id, { plan });
      onSaved();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">Change Plan for {user.email}</div>
        <div className="admin-form-group">
          <label className="admin-form-label">New Plan</label>
          <select className="admin-select w-full" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [suspendedFilter, setSuspendedFilter] = useState("");
  const [modal, setModal]       = useState(null); // { type, user }

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        page, limit: LIMIT, search, plan: planFilter,
        suspended: suspendedFilter,
      });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, planFilter, suspendedFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / LIMIT);

  const action = async (fn) => {
    await fn();
    fetchUsers();
  };

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">User Management</div>
        <span className="badge badge-info">{total} total</span>
      </div>

      <div className="admin-page">
        {/* Filters */}
        <div className="admin-table-wrap mb-4">
          <div className="admin-table-header" style={{ gap: 10, flexWrap: "wrap" }}>
            <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ color: "var(--admin-muted)" }} />
              <input
                className="admin-input"
                style={{ flex: 1 }}
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select className="admin-select" value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}>
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="ultra">Ultra</option>
            </select>
            <select className="admin-select" value={suspendedFilter} onChange={(e) => { setSuspendedFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Suspended</option>
            </select>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchUsers}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="admin-loading"><Users size={16} /> Loading users…</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Plan</th><th>Workspaces</th>
                    <th>AI Today</th><th>Voca Today</th>
                    <th>Status</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={8} className="admin-empty">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div
                          style={{ fontWeight: 500, cursor: "pointer", color: "var(--admin-accent)" }}
                          onClick={() => navigate(`/admin/users/${u._id}`)}
                        >
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-muted">{u.email}</div>
                        {u.isAdmin && <span className="badge badge-orange" style={{ marginTop: 2 }}>Admin</span>}
                      </td>
                      <td><PlanBadge plan={u.plan} /></td>
                      <td>{u.workspaceCount ?? 0}</td>
                      <td>{u.aiDailyUsage?.count ?? 0}</td>
                      <td>{u.vocaDailyUsage?.count ?? 0}</td>
                      <td>
                        {u.isSuspended
                          ? <span className="badge badge-red">Suspended</span>
                          : u.isVerified
                            ? <span className="badge badge-green">Active</span>
                            : <span className="badge badge-yellow">Unverified</span>
                        }
                      </td>
                      <td className="text-muted">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title="Change Plan"
                            onClick={() => setModal({ type: "plan", user: u })}
                          >
                            <UserCog size={12} />
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title={u.isSuspended ? "Unsuspend" : "Suspend"}
                            onClick={() => action(() => adminApi.toggleSuspend(u._id))}
                            style={{ color: u.isSuspended ? "var(--admin-green)" : "var(--admin-yellow)" }}
                          >
                            <UserX size={12} />
                          </button>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            title="Reset Quota"
                            onClick={() => action(() => adminApi.resetQuota(u._id))}
                          >
                            <RefreshCw size={12} />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title="Delete User"
                            onClick={() => setModal({ type: "delete", user: u })}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <span className="text-muted">Page {page} of {totalPages}</span>
              <div className="admin-pagination-pages">
                <button className="admin-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`admin-page-btn ${p === page ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="admin-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={12} />
                </button>
              </div>
              <span className="text-muted">{total} users</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "plan" && (
        <PlanModal user={modal.user} onClose={() => setModal(null)} onSaved={fetchUsers} />
      )}
      {modal?.type === "delete" && (
        <ConfirmModal
          title="Delete User"
          message={`Permanently delete ${modal.user.email} and all their workspaces? This cannot be undone.`}
          danger
          onConfirm={() => action(() => adminApi.deleteUser(modal.user._id))}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

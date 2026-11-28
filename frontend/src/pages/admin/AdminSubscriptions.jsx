import { useState, useEffect, useCallback } from "react";
import { CreditCard, TrendingUp, ChevronLeft, ChevronRight, RefreshCw, CalendarPlus } from "lucide-react";
import adminApi from "../../services/adminApi";

function ExtendModal({ sub, onClose, onSaved }) {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminApi.extendPlan(sub._id, days);
      onSaved();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">Extend Plan for {sub.email}</div>
        <div className="admin-form-group">
          <label className="admin-form-label">Days to extend</label>
          <input
            type="number" min={1} max={365}
            className="admin-input w-full"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
          Current expiry: {sub.planExpiresAt ? new Date(sub.planExpiresAt).toLocaleDateString("en-IN") : "—"}
        </div>
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={loading}>
            {loading ? "Saving…" : "Extend"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSubscriptions() {
  const [data, setData]       = useState({ subscriptions: [], total: 0, revenue: {} });
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [planFilter, setPlanFilter] = useState("");
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [modal, setModal]     = useState(null);
  const LIMIT = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSubscriptions({
        page, limit: LIMIT, plan: planFilter,
        expiringSoon: expiringSoon ? "true" : "",
      });
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, planFilter, expiringSoon]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { subscriptions = [], total = 0, revenue = {} } = data;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Subscriptions & Revenue</div>
      </div>

      <div className="admin-page">
        {/* Revenue KPIs */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {[
            { label: "MRR (INR)",       value: `₹${(revenue.mrrINR || 0).toLocaleString("en-IN")}`, color: "#22c55e" },
            { label: "MRR (USD)",       value: `$${(revenue.mrrUSD || 0).toLocaleString()}`,         color: "#d97706" },
            { label: "Pro Users",       value: revenue.proCount ?? 0,                                 color: "#3b82f6" },
            { label: "Ultra Users",     value: revenue.ultraCount ?? 0,                               color: "#a855f7" },
            { label: "Expired Plans",   value: revenue.expiredCount ?? 0,                             color: "#ef4444" },
          ].map((s) => (
            <div className="admin-stat-card" key={s.label}>
              <div className="admin-stat-label">{s.label}</div>
              <div className="admin-stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <div className="admin-table-title"><CreditCard size={14} style={{ display: "inline", marginRight: 6 }} /> Paid Subscribers</div>
            <select className="admin-select" value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}>
              <option value="">All Paid</option>
              <option value="pro">Pro</option>
              <option value="ultra">Ultra</option>
            </select>
            <label className="flex items-center gap-2 text-sm" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={expiringSoon} onChange={(e) => { setExpiringSoon(e.target.checked); setPage(1); }} />
              Expiring in 7 days
            </label>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchData}>
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="admin-loading">Loading…</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Plan</th><th>Provider</th>
                    <th>Started</th><th>Expires</th><th>Razorpay Order</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr><td colSpan={7} className="admin-empty">No subscriptions</td></tr>
                  ) : subscriptions.map((s) => {
                    const isExpired = s.planExpiresAt && new Date(s.planExpiresAt) < new Date();
                    return (
                      <tr key={s._id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</div>
                          <div className="text-muted">{s.email}</div>
                        </td>
                        <td><span className={`badge badge-${s.plan}`}>{s.plan}</span></td>
                        <td className="text-muted">{s.billingProvider || "—"}</td>
                        <td className="text-muted">{s.planStartedAt ? new Date(s.planStartedAt).toLocaleDateString("en-IN") : "—"}</td>
                        <td>
                          <span className={isExpired ? "badge badge-red" : "badge badge-green"}>
                            {s.planExpiresAt ? new Date(s.planExpiresAt).toLocaleDateString("en-IN") : "—"}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontFamily: "monospace", fontSize: 11 }}>
                          {s.razorpayOrderId?.slice(-10) || "—"}
                        </td>
                        <td>
                          <button
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => setModal(s)}
                            title="Extend plan"
                          >
                            <CalendarPlus size={12} /> Extend
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <span className="text-muted">Page {page} of {totalPages}</span>
              <div className="admin-pagination-pages">
                <button className="admin-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={12} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`admin-page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="admin-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={12} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ExtendModal sub={modal} onClose={() => setModal(null)} onSaved={fetchData} />
      )}
    </>
  );
}

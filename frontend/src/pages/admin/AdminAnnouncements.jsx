import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, ToggleLeft, ToggleRight, Edit3 } from "lucide-react";
import adminApi from "../../services/adminApi";

const TYPE_COLORS = { info: "#3b82f6", warning: "#eab308", success: "#22c55e", error: "#ef4444" };

function AnnouncementModal({ existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: existing?.title || "",
    message: existing?.message || "",
    type: existing?.type || "info",
    targetPlan: existing?.targetPlan || "all",
    expiresAt: existing?.expiresAt ? existing.expiresAt.slice(0, 10) : "",
    isActive: existing?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.title || !form.message) return;
    setLoading(true);
    try {
      if (existing) {
        await adminApi.updateAnnouncement(existing._id, form);
      } else {
        await adminApi.createAnnouncement(form);
      }
      onSaved();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">{existing ? "Edit Announcement" : "New Announcement"}</div>

        <div className="admin-form-group">
          <label className="admin-form-label">Title *</label>
          <input className="admin-input w-full" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Announcement title…" />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Message *</label>
          <textarea
            className="admin-input w-full"
            rows={3}
            style={{ resize: "vertical" }}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Announcement body…"
          />
        </div>

        <div className="grid-2">
          <div className="admin-form-group">
            <label className="admin-form-label">Type</label>
            <select className="admin-select w-full" value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Target Plan</label>
            <select className="admin-select w-full" value={form.targetPlan} onChange={(e) => set("targetPlan", e.target.value)}>
              <option value="all">All Users</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Expires At (optional)</label>
          <input type="date" className="admin-input w-full" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
        </div>

        <div className="admin-form-group flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          <label htmlFor="isActive" className="admin-form-label" style={{ marginBottom: 0, cursor: "pointer" }}>Active (visible to users)</label>
        </div>

        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={save} disabled={loading || !form.title || !form.message}>
            {loading ? "Saving…" : existing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnnouncements() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]   = useState(null); // null | 'new' | announcement obj

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnnouncements();
      setItems(res.announcements || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleActive = async (ann) => {
    await adminApi.updateAnnouncement(ann._id, { isActive: !ann.isActive });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await adminApi.deleteAnnouncement(id);
    fetchData();
  };

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Announcements</div>
        <button className="admin-btn admin-btn-primary" onClick={() => setModal("new")}>
          <Plus size={14} /> New Announcement
        </button>
      </div>

      <div className="admin-page">
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <div className="admin-table-title"><Megaphone size={14} style={{ display: "inline", marginRight: 6 }} />All Announcements</div>
          </div>

          {loading ? (
            <div className="admin-loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="admin-empty">No announcements yet. Create one to show banners to users.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Type</th><th>Target</th><th>Status</th><th>Expires</th><th>Created By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div className="text-muted" style={{ fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.message}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${TYPE_COLORS[a.type]}18`, color: TYPE_COLORS[a.type] }}>
                        {a.type}
                      </span>
                    </td>
                    <td>
                      {a.targetPlan === "all"
                        ? <span className="badge badge-green">All Users</span>
                        : <span className={`badge badge-${a.targetPlan}`}>{a.targetPlan}</span>
                      }
                    </td>
                    <td>
                      {a.isActive
                        ? <span className="badge badge-green">Active</span>
                        : <span className="badge badge-red">Inactive</span>
                      }
                    </td>
                    <td className="text-muted">
                      {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="text-muted">
                      {a.createdBy?.email || "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => toggleActive(a)}
                          title={a.isActive ? "Deactivate" : "Activate"}
                        >
                          {a.isActive ? <ToggleRight size={13} style={{ color: "var(--admin-green)" }} /> : <ToggleLeft size={13} />}
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal(a)}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDelete(a._id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Preview of active banners */}
        <div className="admin-card" style={{ marginTop: 20 }}>
          <div className="admin-card-title"><Megaphone size={15} /> Active Banner Preview</div>
          {items.filter((a) => a.isActive).length === 0 ? (
            <div className="text-muted text-sm">No active announcements.</div>
          ) : items.filter((a) => a.isActive).map((a) => (
            <div
              key={a._id}
              style={{
                background: `${TYPE_COLORS[a.type]}12`,
                border: `1px solid ${TYPE_COLORS[a.type]}30`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 10,
                borderLeft: `3px solid ${TYPE_COLORS[a.type]}`,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: TYPE_COLORS[a.type] }}>{a.title}</div>
              <div className="text-muted" style={{ marginTop: 3, fontSize: 12 }}>{a.message}</div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <AnnouncementModal
          existing={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchData}
        />
      )}
    </>
  );
}

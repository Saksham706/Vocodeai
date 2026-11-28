import { useState, useEffect, useCallback } from "react";
import { FolderOpen, Trash2, Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import adminApi from "../../services/adminApi";

export default function AdminWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const LIMIT = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getWorkspaces({ page, limit: LIMIT, search });
      setWorkspaces(res.workspaces || []);
      setTotal(res.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workspace? This cannot be undone.")) return;
    try {
      await adminApi.deleteWorkspace(id);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-title">Workspace Explorer</div>
        <span className="badge badge-info">{total} total</span>
      </div>

      <div className="admin-page">
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <div className="flex items-center gap-2" style={{ flex: 1 }}>
              <Search size={14} style={{ color: "var(--admin-muted)" }} />
              <input
                className="admin-input"
                style={{ flex: 1, maxWidth: 300 }}
                placeholder="Search by workspace name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchData}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="admin-loading"><FolderOpen size={16} /> Loading…</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Type</th><th>Owner</th><th>Owner Plan</th>
                    <th>Pinned</th><th>R2 Prefix</th><th>Last Synced</th><th>Created</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.length === 0 ? (
                    <tr><td colSpan={9} className="admin-empty">No workspaces found</td></tr>
                  ) : workspaces.map((w) => (
                    <tr key={w._id}>
                      <td style={{ fontWeight: 500 }}>{w.name}</td>
                      <td className="text-muted">{w.type || "general"}</td>
                      <td>
                        {w.owner ? (
                          <>
                            <div style={{ fontWeight: 500 }}>{w.owner.firstName} {w.owner.lastName}</div>
                            <div className="text-muted">{w.owner.email}</div>
                          </>
                        ) : (
                          <span className="badge badge-red">No Owner</span>
                        )}
                      </td>
                      <td>
                        {w.owner ? <span className={`badge badge-${w.owner.plan}`}>{w.owner.plan}</span> : "—"}
                      </td>
                      <td>{w.isPinned ? <span className="badge badge-green">Yes</span> : "—"}</td>
                      <td className="text-muted" style={{ fontFamily: "monospace", fontSize: 11 }}>
                        {w.r2Prefix ? w.r2Prefix.slice(0, 24) + "…" : "—"}
                      </td>
                      <td className="text-muted">
                        {w.lastSyncedToR2 ? new Date(w.lastSyncedToR2).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="text-muted">{new Date(w.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDelete(w._id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <span className="text-muted">Page {page} of {totalPages} &bull; {total} workspaces</span>
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
    </>
  );
}

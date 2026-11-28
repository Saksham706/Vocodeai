import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, CreditCard, FolderOpen,
  BarChart2, Megaphone, Server, LogOut, ShieldCheck,
} from "lucide-react";
import "../../styles/admin.css";

const NAV = [
  { label: "MAIN", items: [
    { to: "/admin",             label: "Overview",       icon: LayoutDashboard, end: true },
  ]},
  { label: "USERS",  items: [
    { to: "/admin/users",       label: "Users",          icon: Users },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  ]},
  { label: "DATA", items: [
    { to: "/admin/workspaces",  label: "Workspaces",     icon: FolderOpen },
    { to: "/admin/analytics",   label: "Analytics",      icon: BarChart2 },
  ]},
  { label: "PLATFORM", items: [
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/system",      label: "System Health",  icon: Server },
  ]},
];

export default function AdminLayout() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!accessToken) { navigate("/", { replace: true }); return; }
    const stored = localStorage.getItem("user");
    const u = stored ? JSON.parse(stored) : null;
    if (!u?.isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setChecking(false);
  }, [accessToken]);

  if (checking) {
    return (
      <div className="admin-loading" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <ShieldCheck size={20} /> Verifying admin access…
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/vcode-light.png" alt="VocodeAI" className="admin-logo-img" />
          <span className="admin-sidebar-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV.map((section) => (
            <div key={section.label}>
              <div className="admin-nav-section">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    "admin-nav-item" + (isActive ? " active" : "")
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ marginBottom: 8, fontSize: 12 }}>
            Signed in as <strong style={{ color: "var(--admin-text)" }}>{user?.email}</strong>
          </div>
          <button
            className="admin-btn admin-btn-ghost admin-btn-sm"
            style={{ width: "100%" }}
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

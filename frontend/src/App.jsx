import React, { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import VocoAssistant from "./components/mascot/VocoAssistant";
import PageMeta from "./components/common/PageMeta";
import { applyThemeExtension, getActiveThemeExtension } from "./utils/themeRegistry";

// Lazy-loaded routes for code splitting and instant page loads
const Landing = lazy(() => import("./pages/Landing"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Login = lazy(() => import("./auth/Login"));
const Signup = lazy(() => import("./auth/Signup"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./auth/ResetPassword"));
const OAuthSuccess = lazy(() => import("./auth/OAuthSuccess"));

/* =========================
   PAGE LOADING SKELETON
========================= */
function PageFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#020B08",
        color: "#43E65C",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "2.5px solid rgba(67, 230, 92, 0.2)",
            borderTopColor: "#43E65C",
            animation: "spin 0.65s linear infinite",
          }}
        />
        <span style={{ fontSize: "13px", letterSpacing: "0.5px", color: "#94A3B8" }}>
          Loading VocodeAI...
        </span>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */
function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return <PageFallback />;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   PUBLIC ROUTE
========================= */
function PublicRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return <PageFallback />;

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* =========================
   WORKSPACE ROUTE FALLBACK
   Resolves /workspace to /workspace/:recentId or /dashboard
========================= */
function WorkspaceRedirect() {
  const { accessToken } = useAuth();
  const [targetUrl, setTargetUrl] = useState(() => {
    const recent = localStorage.getItem("vocode_recent_workspace");
    return recent ? `/workspace/${recent}` : null;
  });
  const [loading, setLoading] = useState(!targetUrl);

  useEffect(() => {
    if (targetUrl) return;
    if (!accessToken) {
      setLoading(false);
      return;
    }
    import("./services/workspaceApi")
      .then(({ listWorkspaces }) => listWorkspaces(accessToken))
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const firstId = list[0]._id || list[0].id;
          localStorage.setItem("vocode_recent_workspace", firstId);
          setTargetUrl(`/workspace/${firstId}`);
        } else {
          setTargetUrl("/dashboard");
        }
      })
      .catch(() => setTargetUrl("/dashboard"))
      .finally(() => setLoading(false));
  }, [accessToken, targetUrl]);

  if (targetUrl) {
    return <Navigate to={targetUrl} replace />;
  }
  if (loading) {
    return <PageFallback />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  // Apply saved theme extension across the whole website on initial load
  useEffect(() => {
    const activeTheme = getActiveThemeExtension();
    if (activeTheme) {
      applyThemeExtension(activeTheme);
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Dynamic SEO Meta & Title Manager */}
        <PageMeta />

        {/* Voco — Siri-like Voice AI Assistant */}
        <VocoAssistant />

        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/docs" element={<Documentation />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            <Route
              path="/forgot"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            <Route
              path="/reset"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            <Route path="/oauth-success" element={<OAuthSuccess />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <WorkspaceRedirect />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workspace/:id"
              element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RobotMascot from "./components/mascot/RobotMascot";
import PageMeta from "./components/common/PageMeta";

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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Dynamic SEO Meta & Title Manager */}
        <PageMeta />

        {/* Global Draggable 3D AI Robot Mascot */}
        <RobotMascot />

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

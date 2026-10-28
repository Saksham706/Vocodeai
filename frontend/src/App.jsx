import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Landing from "./pages/Landing";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import OAuthSuccess from "./auth/OAuthSuccess";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   PUBLIC ROUTE (Optional)
   Prevent logged user from seeing login/signup again
========================= */

function PublicRoute({ children }) {
  const { accessToken } = useAuth();

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <Routes>   {/* ✅ REQUIRED */}

            <Route path="/" element={<Landing />} />

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
        </BrowserRouter>
    </AuthProvider>
  );
}
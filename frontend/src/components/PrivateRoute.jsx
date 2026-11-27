import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!accessToken) return <Navigate to="/?auth=login" replace />;

  return children;
}
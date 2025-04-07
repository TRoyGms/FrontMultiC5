import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (!user) return <Navigate to="/login" replace />;

  if (isAdminRoute && user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

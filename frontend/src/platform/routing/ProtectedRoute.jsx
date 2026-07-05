import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token       = localStorage.getItem("accessToken");
  const role        = localStorage.getItem("role");
  const planSelected = localStorage.getItem("planSelected") === "true";
  const location    = useLocation();

  // Not authenticated → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Plan not selected → redirect to plan selection
  // Only redirect if NOT already on /plan-selection and user is not PLATFORM_ADMIN
  if (!planSelected && location.pathname !== "/plan-selection" && role !== "PLATFORM_ADMIN") {
    return <Navigate to="/plan-selection" replace />;
  }

  return children;
}
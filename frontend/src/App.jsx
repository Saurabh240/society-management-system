import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";
import Dashboard from "./platform/dashboard/Dashboard";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

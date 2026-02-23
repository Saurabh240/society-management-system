import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";
import Dashboard from "./platform/dashboard/Dashboard";
import Settings from "./platform/settings/Settings";
import TenantList from "./platform/tenant/TenantList";
import TenantForm from "./platform/tenant/TenantForm";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Dashboard Home</div>} />

        <Route path="settings" element={<Settings />}>
          <Route index element={<Navigate to="tenants" replace />} />

          <Route path="tenants" element={<TenantList />} />
          <Route path="tenants/create" element={<TenantForm />} />
        </Route>

      </Route>

    </Routes>
  );
}
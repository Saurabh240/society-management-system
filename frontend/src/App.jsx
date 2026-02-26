
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";

import Dashboard from "./platform/dashboard/Dashboard";
import Settings from "./platform/settings/Settings";
import TenantList from "./platform/tenant/TenantList";
import TenantForm from "./platform/tenant/TenantForm";
import UnitList from "./communication/community/unit/UnitList";
import UnitForm from "./communication/community/unit/UnitForm";

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





  <Route
    path="tenants"
    element={
      <ProtectedRoute allowedRoles={["PLATFORM_ADMIN"]}>
        <TenantList />
      </ProtectedRoute>
    }
  />
<Route
  path="tenants/create"
  element={
    <ProtectedRoute allowedRoles={["PLATFORM_ADMIN"]}>
      <TenantForm />
    </ProtectedRoute>
  }
/>
  

  <Route
    path="units"
    element={
      <ProtectedRoute allowedRoles={["TENANT_ADMIN"]}>
        <UnitList />
      </ProtectedRoute>
    }
  />

<Route
  path="units/create"
  element={
    <ProtectedRoute allowedRoles={["TENANT_ADMIN"]}>
      <UnitForm />
    </ProtectedRoute>
  }
/>

  <Route path="settings" element={<Settings />} />
</Route>
  

    </Routes>
  );
}


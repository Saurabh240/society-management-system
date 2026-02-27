import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";

import Dashboard from "./platform/dashboard/Dashboard";
import Settings from "./platform/settings/Settings";
import TenantList from "./platform/tenant/TenantList";
import TenantForm from "./platform/tenant/TenantForm";
import EditSubscription from "./platform/tenant/EditSubscription";
import CommunityList from "./communication/community/CommunityList";
import CommunityForm from "./communication/community/CommunityForm";
import CommunityDetail from "./communication/community/CommunityDetail";
import UnitList from "./communication/community/unit/UnitList";
import UnitForm from "./communication/community/unit/UnitForm";

export default function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

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

          {/* Tenant routes — platform admin only */}
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
          <Route path="tenants/subscription/:tenantId" element={<EditSubscription />} />

          {/* Community routes — specific before dynamic */}
          <Route path="communities" element={<CommunityList />} />
          <Route path="communities/create" element={<CommunityForm />} />
          <Route path="communities/edit/:id" element={<CommunityForm />} />
          <Route path="communities/:id" element={<CommunityDetail />} />

          {/* Unit routes */}
          <Route path="units" element={<UnitList />} />
          <Route path="units/create" element={<UnitForm />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />

        </Route>

      </Routes>
    </>
  );
}


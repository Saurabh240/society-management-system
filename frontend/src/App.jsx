import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";
import Dashboard from "./platform/dashboard/Dashboard";
import DashboardHome from "./platform/dashboard/DashboardHome";
import TenantList from "./platform/tenant/TenantList";
import TenantForm from "./platform/tenant/TenantForm";
import TenantDetails from "./platform/tenant/TenantDetails";
import EditSubscription from "./platform/tenant/EditSubscription";
import UserManagementPage from "./platform/user/UserManagementPage";
import { associationRoutes } from "./modules/associations/routes";
import { ownershipRoutes } from "./modules/ownership/routes";
import { communicationRoutes } from "./modules/communication/routes";
import {accountingRoutes} from "./modules/accounting/routes";
import { settingsRoutes } from "./modules/settings/routes";
import { maintenanceRoutes } from "./modules/maintenance/routes";
import { helpRoutes } from "./modules/help/routes";
import LandingPage from "./platform/landing/LandingPage";
import { financialReportRoutes } from "./modules/reports/routes";

export default function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />

      <Routes>

        <Route path="/" element={<LandingPage />} />
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
          <Route index element={<DashboardHome />} />

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
          <Route
            path="tenants/:id"
            element={
              <ProtectedRoute allowedRoles={["PLATFORM_ADMIN"]}>
                <TenantDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="tenants/subscription/:tenantId"
            element={<EditSubscription />}
          />

          {/* User management — platform admin only */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["PLATFORM_ADMIN"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Association routes */}
          {associationRoutes}

          {/* Ownership Account routes */}
          {ownershipRoutes}
          
          {/* Communication routes */}
           {communicationRoutes}

           {/* accounting routes */ }

           {accountingRoutes}
            
            {/*maintenance routes*/}
            { maintenanceRoutes }

          {/* Settings */}
          {settingsRoutes}
            {/* Help */}
            {helpRoutes}
            {/* Reports */}
            {financialReportRoutes}

        </Route>

      </Routes>
    </>
  );
}
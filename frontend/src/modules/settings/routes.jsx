// src/modules/settings/routes.jsx

import React from "react";
import { Route, Navigate } from "react-router-dom";

import SettingsLayout from "./pages/SettingsPage";
import AccountTab from "./components/AccountTab";
import UsersTab from "./components/UsersTab";

const Placeholder = ({ label }) => (
  <div className="text-gray-400 italic py-4">{label} coming soon...</div>
);

export const settingsRoutes = (
  <Route path="settings" element={<SettingsLayout />}>
    {/* Default redirect /settings/account */}
    <Route index element={<Navigate to="account" replace />} />

    <Route path="account" element={<AccountTab />} />
    <Route path="users" element={<UsersTab />} />
    <Route path="roles" element={<Placeholder label="Roles" />} />
    <Route path="billing" element={<Placeholder label="Billing" />} />
  </Route>
);
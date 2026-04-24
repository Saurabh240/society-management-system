
import React from "react";
import { Route } from "react-router-dom";
import VendorList from "./VendorList";
import AddVendor from "./AddVendor";

export const maintenanceRoutes = (
  <Route path="maintenance">
    {/* Matches /dashboard/maintenance */}
    <Route index element={<VendorList />} />
    
    {/* Matches /dashboard/maintenance/add */}
    <Route path="add" element={<AddVendor />} />
    
    {/* Matches /dashboard/maintenance/edit/:id */}
    <Route path="edit/:id" element={<AddVendor />} />
  </Route>
);
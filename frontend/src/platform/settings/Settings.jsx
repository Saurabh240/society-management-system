

import { NavLink, Outlet } from "react-router-dom";
import Card from "../../components/ui/Card";

export default function Settings() {
  return (
    <div className="p-6">

      <Card className="max-w-5xl mx-auto">

   
        <Card.Header>
          <Card.Title>Settings</Card.Title>
          <Card.Description>
            Manage platform configurations
          </Card.Description>
        </Card.Header>

        {/* Tabs */}
        <Card.Content>

          <div className="flex gap-6 border-b mb-6">

            <NavLink
              to="tenants"
              className={({ isActive }) =>
                `pb-2 text-sm font-medium transition ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              Tenant List
            </NavLink>

            <NavLink
              to="tenants/create"
              className={({ isActive }) =>
                `pb-2 text-sm font-medium transition ${
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`
              }
            >
              Create Tenant
            </NavLink>

          </div>

          
          <Outlet />

        </Card.Content>

      </Card>

    </div>
  );
}
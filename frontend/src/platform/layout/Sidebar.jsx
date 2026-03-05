
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  Settings,
  DoorOpen,
  CreditCard,
} from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-white text-blue-700 font-semibold"
        : "text-white hover:bg-blue-500"
    }`;

  return (
    <div className="h-screen w-64 bg-blue-700 text-white flex flex-col justify-between">
      
      {/* TOP SECTION */}
      <div>
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-blue-500">
          GSTechSystem
        </div>

        <nav className="p-4 space-y-2">
          
          {/* Dashboard */}
          <NavLink to="/dashboard" end className={linkClass}>
            <Home size={18} />
            Dashboard
          </NavLink>

          {/* PLATFORM ADMIN */}
          {role === "PLATFORM_ADMIN" && (
            <NavLink to="/dashboard/tenants" className={linkClass}>
              <Users size={18} />
              Tenants
            </NavLink>
          )}

          {/* TENANT ADMIN */}
          {role === "TENANT_ADMIN" && (
            <>
              <NavLink
                to="/dashboard/associations"
                className={linkClass}
              >
                <Building2 size={18} />
                Associations
              </NavLink>

              <NavLink
                to="/dashboard/associations/units"
                className={linkClass}
              >
                <DoorOpen size={18} />
                Association Units
              </NavLink>

              <NavLink
                to="/dashboard/associations/accounts"
                className={linkClass}
              >
                <CreditCard size={18} />
                Ownership Accounts
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t border-blue-500">
        <NavLink to="/dashboard/settings" className={linkClass}>
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
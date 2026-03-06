

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  Settings,
  DoorOpen,
  CreditCard,
  ChevronDown
} from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const { pathname } = useLocation();


  const [isAssocOpen, setIsAssocOpen] = useState(pathname.includes("/associations"));


  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-white text-blue-700 font-semibold"
        : "text-white hover:bg-blue-500"
    }`;

  // Sub-link Styles (Indented with white text)
  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-3 pl-12 py-2 rounded-lg transition text-sm ${
      isActive
        ? "bg-blue-500 text-white font-medium"
        : "text-blue-100 hover:bg-blue-600"
    }`;

  return (
    <div className="h-screen w-64 bg-blue-700 text-white flex flex-col justify-between">
      
      {/* TOP SECTION */}
      <div>
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-blue-500">
          GSTechSystem
        </div>

        <nav className="p-4 space-y-1">
          
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

          {/* TENANT ADMIN - Nested Structure */}
          {role === "TENANT_ADMIN" && (
            <div className="space-y-1">
             
              <div className="relative group">
                <NavLink 
                  to="/dashboard/associations" 
                  end 
                  className={linkClass}
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={18} />
                    Associations
                  </div>
                </NavLink>
                
              
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAssocOpen(!isAssocOpen);
                  }}
                  className="absolute right-2 top-3 p-1 hover:bg-blue-400 rounded transition"
                >
                  <ChevronDown size={16} className={`transition-transform ${isAssocOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Nested Children */}
              {isAssocOpen && (
                <div className="flex flex-col space-y-1">
                  <NavLink to="/dashboard/associations/units" className={subLinkClass}>
                    <DoorOpen size={16} />
                    Association Units
                  </NavLink>

                  <NavLink to="/dashboard/associations/accounts" className={subLinkClass}>
                    <CreditCard size={16} />
                    Ownership Accounts
                  </NavLink>
                </div>
              )}
            </div>
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
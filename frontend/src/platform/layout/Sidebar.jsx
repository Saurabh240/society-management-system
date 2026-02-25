

import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Building2, Settings, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { clearToken } from "../../shared/utils/storage";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const [openCommunication, setOpenCommunication] = useState(false);

 
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/communities") || location.pathname.startsWith("/dashboard/units")) {
      setOpenCommunication(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-white text-blue-700 font-semibold"
        : "text-white hover:bg-blue-500"
    }`;

  return (
    <div className="h-screen w-64 bg-blue-700 text-white flex flex-col justify-between">

      <div>
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-blue-500">
          GSTechSystem
        </div>

        <nav className="p-4 space-y-2">
     
          <NavLink to="/dashboard" className={linkClass}>
            <Home size={18} />
            Dashboard
          </NavLink>

   
          {role === "PLATFORM_ADMIN" && (
            <NavLink to="/dashboard/tenants" className={linkClass}>
              <Users size={18} />
              Tenants
            </NavLink>
          )}

          {role === "TENANT_ADMIN" && (
            <>
            
              <div
                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-blue-500"
                onClick={() => setOpenCommunication(!openCommunication)}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={18} />
                  Communication
                </div>
                {openCommunication ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

            
              {openCommunication && (
                <div className="ml-6 flex flex-col gap-2 mt-1">
                  <NavLink to="/dashboard/communities" className={linkClass}>
                    Communities
                  </NavLink>
                  <NavLink to="/dashboard/units" className={linkClass}>
                    Units
                  </NavLink>
                </div>
              )}
            </>
          )}

    
          <NavLink to="/dashboard/settings" className={linkClass}>
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
          bg-white text-blue-700 hover:bg-blue-100 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
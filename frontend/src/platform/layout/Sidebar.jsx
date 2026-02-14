import React, { useState } from "react";
import { Home, Users, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../../shared/utils/storage";

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const menuItem = (label, Icon) => {
    const isActive = active === label;

    return (
      <div
        onClick={() => setActive(label)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition
        ${
          isActive
            ? "bg-white text-blue-700 font-semibold"
            : "text-white hover:bg-blue-500"
        }`}
      >
        <Icon size={18} />
        {label}
      </div>
    );
  };

  return (
    <div className="h-screen w-64 bg-blue-700 text-white flex flex-col justify-between">

      <div>
    
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-blue-500">
          GSTechSystem
        </div>

        
        <nav className="p-4 space-y-2">
          {menuItem("Dashboard", Home)}
          {menuItem("Users", Users)}
          {menuItem("Settings", Settings)}
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



import { Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import { clearToken } from "../../shared/utils/storage";
import { ChevronDown } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  const role = localStorage.getItem("role") || "User";

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">

          <h1 className="text-xl font-semibold text-gray-800">
         Welcome
          </h1>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {/*first letter of role as avatar*/}
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {role.charAt(0)}
              </div>

              <div className="hidden sm:flex flex-col text-sm">
                <span className="font-medium text-gray-800">
                  {role}
                </span>
              </div>

              <ChevronDown size={18} />
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Dashboard;
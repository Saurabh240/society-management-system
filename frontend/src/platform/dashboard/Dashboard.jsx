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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-4 md:px-6 shrink-0">
          {/* Left: spacer on mobile to avoid hamburger overlap */}
          <h1 className="text-base md:text-xl font-semibold text-gray-800 pl-12 md:pl-0">
            Welcome
          </h1>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
  className="w-8 h-8 md:w-9 md:h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm"
  style={{ backgroundColor: "var(--color-primary)" }}
>
  {role.charAt(0)}
</div>
              <div className="hidden sm:flex flex-col text-sm">
                <span className="font-medium text-gray-800">{role}</span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </div>

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

        {/* Main content — add pb-16 on mobile so bottom tab bar doesn't cover content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
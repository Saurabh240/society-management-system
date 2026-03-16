import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, Users, Building2, Settings, DoorOpen, CreditCard, Mail, X, Menu,
} from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home, end: true, roles: ["all"] },
    { to: "/dashboard/tenants", label: "Tenants", icon: Users, roles: ["PLATFORM_ADMIN"] },
    { to: "/dashboard/associations", label: "Associations", icon: Building2, end: true, roles: ["TENANT_ADMIN"] },
    { to: "/dashboard/associations/units", label: "Association Units", icon: DoorOpen, end: true, roles: ["TENANT_ADMIN"] },
    { to: "/dashboard/associations/accounts", label: "Ownership Accounts", icon: CreditCard, end: true, roles: ["TENANT_ADMIN"] },
    { to: "/dashboard/communication", label: "Communication", icon: Mail, end: true, roles: ["TENANT_ADMIN"] },
  ];

  const bottomItems = [
    { to: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["all"] },
  ];

  const visibleItems = navItems.filter(
    (item) => item.roles.includes("all") || item.roles.includes(role)
  );
  const visibleBottom = bottomItems.filter(
    (item) => item.roles.includes("all") || item.roles.includes(role)
  );
  const allItems = [...visibleItems, ...visibleBottom];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
      isActive
        ? "bg-white font-semibold"
        : "text-white hover:bg-white/10"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition ${
      isActive ? "" : "text-gray-500"
    }`;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <div
        className="hidden md:flex h-screen w-64 text-white flex-col justify-between shrink-0 sticky top-0"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div>
          {/* Logo */}
          <div
            className="h-16 flex items-center justify-center text-xl font-bold tracking-wide border-b"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            GSTechSystem
          </div>

          <nav className="p-4 space-y-1">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                style={({ isActive }) =>
                  isActive ? { color: "var(--color-primary)" } : {}
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div
          className="p-4 space-y-1 border-t"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
        >
          {visibleBottom.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              style={({ isActive }) =>
                isActive ? { color: "var(--color-primary)" } : {}
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── MOBILE: Hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 text-white p-2 rounded-lg shadow-lg"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── MOBILE: Slide-in drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="md:hidden fixed top-0 left-0 h-full w-64 text-white z-50 flex flex-col justify-between shadow-2xl"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <div>
              <div
                className="h-16 flex items-center justify-between px-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.2)" }}
              >
                <span className="text-lg font-bold tracking-wide">GSTechSystem</span>
                <button onClick={() => setMobileOpen(false)} className="text-white hover:text-white/70">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    style={({ isActive }) =>
                      isActive ? { color: "var(--color-primary)" } : {}
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div
              className="p-4 border-t space-y-1"
              style={{ borderColor: "rgba(255,255,255,0.2)" }}
            >
              {visibleBottom.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  style={({ isActive }) =>
                    isActive ? { color: "var(--color-primary)" } : {}
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE: Bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2">
        {allItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={mobileLinkClass}
            style={({ isActive }) =>
              isActive ? { color: "var(--color-primary)" } : {}
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium leading-tight text-center">
              {item.label.split(" ")[0]}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
/*import { useState } from "react";
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
      {/* ── DESKTOP SIDEBAR ── 
      <div
        className="hidden md:flex h-screen w-64 text-white flex-col justify-between shrink-0 sticky top-0"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div>
          {/* Logo *
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

      {/* ── MOBILE: Hamburger button ── 
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 text-white p-2 rounded-lg shadow-lg"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* ── MOBILE: Slide-in drawer ── 
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

      {/* ── MOBILE: Bottom tab bar ── 
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

export default Sidebar;*/

import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  Settings,
  DoorOpen,
  CreditCard,
  Mail,
  X,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] whitespace-nowrap transition ${
      isActive
        ? "bg-white font-semibold"
        : "text-white hover:bg-white/10"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 ml-8 rounded-md text-[14px] whitespace-nowrap transition ${
      isActive
        ? "bg-white font-medium"
        : "text-white/90 hover:bg-white/10"
    }`;

  const activeStyle = ({ isActive }) =>
    isActive ? { color: "var(--color-primary)" } : {};

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div
        className="hidden md:flex h-screen w-64 text-white flex-col justify-between sticky top-0"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-white/20">
            GSTechSystem
          </div>

          <nav className="p-4 space-y-1">

            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              end
              className={linkClass}
              style={activeStyle}
            >
              <Home size={18} />
              Dashboard
            </NavLink>

            {/* Tenants */}
            {role === "PLATFORM_ADMIN" && (
              <NavLink
                to="/dashboard/tenants"
                className={linkClass}
                style={activeStyle}
              >
                <Users size={18} />
                Tenants
              </NavLink>
            )}

            {/* Associations */}
            {role === "TENANT_ADMIN" && (
              <>
                <NavLink
                  to="/dashboard/associations"
                  end
                  className={linkClass}
                  style={activeStyle}
                >
                  <Building2 size={18} />
                  Associations
                </NavLink>

                <NavLink
                  to="/dashboard/associations/units"
                  className={subLinkClass}
                  style={activeStyle}
                >
                  <DoorOpen size={16} />
                  Association Units
                </NavLink>

                <NavLink
                  to="/dashboard/associations/accounts"
                  className={subLinkClass}
                  style={activeStyle}
                >
                  <CreditCard size={16} />
                  Ownership Accounts
                </NavLink>
              </>
            )}

            {/* Communication */}
            {role === "TENANT_ADMIN" && (
              <NavLink
                to="/dashboard/communication"
                className={linkClass}
                style={activeStyle}
              >
                <Mail size={18} />
                Communication
              </NavLink>
            )}

          </nav>
        </div>

        {/* Bottom Settings */}
        <div className="p-4 border-t border-white/20">
          <NavLink
            to="/dashboard/settings"
            className={linkClass}
            style={activeStyle}
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 text-white p-2 rounded-lg shadow-lg"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Menu size={20} />
      </button>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="fixed top-0 left-0 h-full w-64 text-white z-50 flex flex-col justify-between shadow-2xl"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <div>
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
                <span className="font-bold text-lg">GSTechSystem</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <nav className="p-4 space-y-1">

                <NavLink
                  to="/dashboard"
                  end
                  className={linkClass}
                  style={activeStyle}
                  onClick={() => setMobileOpen(false)}
                >
                  <Home size={18} />
                  Dashboard
                </NavLink>

                {role === "PLATFORM_ADMIN" && (
                  <NavLink
                    to="/dashboard/tenants"
                    className={linkClass}
                    style={activeStyle}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Users size={18} />
                    Tenants
                  </NavLink>
                )}

                {role === "TENANT_ADMIN" && (
                  <>
                    <NavLink
                      to="/dashboard/associations"
                      end
                      className={linkClass}
                      style={activeStyle}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Building2 size={18} />
                      Associations
                    </NavLink>

                    <NavLink
                      to="/dashboard/associations/units"
                      className={subLinkClass}
                      style={activeStyle}
                      onClick={() => setMobileOpen(false)}
                    >
                      <DoorOpen size={16} />
                      Association Units
                    </NavLink>

                    <NavLink
                      to="/dashboard/associations/accounts"
                      className={subLinkClass}
                      style={activeStyle}
                      onClick={() => setMobileOpen(false)}
                    >
                      <CreditCard size={16} />
                      Ownership Accounts
                    </NavLink>

                    <NavLink
                      to="/dashboard/communication"
                      className={linkClass}
                      style={activeStyle}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Mail size={18} />
                      Communication
                    </NavLink>
                  </>
                )}

              </nav>
            </div>

            <div className="p-4 border-t border-white/20">
              <NavLink
                to="/dashboard/settings"
                className={linkClass}
                style={activeStyle}
                onClick={() => setMobileOpen(false)}
              >
                <Settings size={18} />
                Settings
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;


import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  Settings,
  DoorOpen,
  CreditCard,
  Mail,
  Wallet,
  X,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] whitespace-nowrap transition ${isActive
      ? "bg-white font-semibold"
      : "text-white hover:bg-white/10"
    }`;

  const subLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 ml-8 rounded-md text-[14px] whitespace-nowrap transition ${isActive
      ? "bg-white font-medium"
      : "text-white/90 hover:bg-white/10"
    }`;

  const activeStyle = ({ isActive }) =>
    isActive ? { color: "var(--color-primary)" } : {};
  // Add this at the top with useState
  const location = useLocation(); // also import useLocation from react-router-dom
  const accountingOpen = location.pathname.startsWith("/dashboard/accounting");
 



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

            {/* Accounting  */}
            {role === "TENANT_ADMIN" && (
              <div>
                <NavLink
                  to="/dashboard/accounting/overview"
                  className={linkClass}
                  style={activeStyle}
                  onClick={() => setAccountingOpen(!accountingOpen)}
                >
                  <Wallet size={18} />
                  Accounting
                </NavLink>

                {accountingOpen && (
                  <div className="mt-1 space-y-1">
                    <NavLink to="/dashboard/accounting/chart-of-accounts" className={subLinkClass} style={activeStyle}>
                      Chart of Accounts
                    </NavLink>
                    <NavLink to="/dashboard/accounting/general-ledger" className={subLinkClass} style={activeStyle}>
                      General Ledger
                    </NavLink>
                    <NavLink to="/dashboard/accounting/banking" className={subLinkClass} style={activeStyle}>
                      Banking
                    </NavLink>
                    <NavLink to="/dashboard/accounting/bills" className={subLinkClass} style={activeStyle}>
                      Bills
                    </NavLink>
                  </div>
                )}
              </div>
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

                    {/* Accounting with submenu */}
                    <div>
                      <NavLink
                        to="/dashboard/accounting/overview"
                        className={linkClass}
                        style={activeStyle}
                      >
                        <Wallet size={18} />
                        Accounting
                      </NavLink>

                      {accountingOpen && (
                        <div className="mt-1 space-y-1">
                          <NavLink to="/dashboard/accounting/chart-of-accounts" className={subLinkClass} style={activeStyle}>
                            Chart of Accounts
                          </NavLink>
                          <NavLink to="/dashboard/accounting/general-ledger" className={subLinkClass} style={activeStyle}>
                            General Ledger
                          </NavLink>
                          <NavLink to="/dashboard/accounting/banking" className={subLinkClass} style={activeStyle}>
                            Banking
                          </NavLink>
                          <NavLink to="/dashboard/accounting/bills" className={subLinkClass} style={activeStyle}>
                            Bills
                          </NavLink>
                        </div>
                      )}
                    </div>









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
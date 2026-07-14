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
  HelpCircle,
  FileText,
} from "lucide-react";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] whitespace-nowrap transition ${
    isActive ? "bg-white font-semibold" : "text-white hover:bg-white/10"
  }`;

const subLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 ml-8 rounded-md text-[14px] whitespace-nowrap transition ${
    isActive ? "bg-white font-medium" : "text-white/90 hover:bg-white/10"
  }`;

const activeStyle = ({ isActive }) =>
  isActive ? { color: "var(--color-primary)" } : {};

function NavContent({ role, accountingOpen, reportsOpen, onLinkClick }) {
  return (
    <>
      <NavLink to="/dashboard" end className={linkClass} style={activeStyle} onClick={onLinkClick}>
        <Home size={18} /> Dashboard
      </NavLink>

      {role === "PLATFORM_ADMIN" && (
        <>
          <NavLink to="/dashboard/tenants" className={linkClass} style={activeStyle} onClick={onLinkClick}>
            <Users size={18} /> Tenants
          </NavLink>
          <NavLink to="/dashboard/users" className={linkClass} style={activeStyle} onClick={onLinkClick}>
            <Users size={18} /> Users
          </NavLink>
        </>
      )}

      {role === "TENANT_ADMIN" && (
        <>
          {/* Associations */}
          <NavLink to="/dashboard/associations" end className={linkClass} style={activeStyle} onClick={onLinkClick}>
            <Building2 size={18} /> Associations
          </NavLink>
          <NavLink to="/dashboard/associations/units" className={subLinkClass} style={activeStyle} onClick={onLinkClick}>
            <DoorOpen size={16} /> Association Units
          </NavLink>
          <NavLink to="/dashboard/associations/accounts" className={subLinkClass} style={activeStyle} onClick={onLinkClick}>
            <CreditCard size={16} /> Ownership Accounts
          </NavLink>

          {/* Accounting */}
          <div>
            <NavLink to="/dashboard/accounting/overview" className={linkClass} style={activeStyle}>
              <Wallet size={18} /> Accounting
            </NavLink>
            {accountingOpen && (
              <div className="mt-1 space-y-1">
                <NavLink to="/dashboard/accounting/chart-of-accounts" className={subLinkClass} style={activeStyle} onClick={onLinkClick}>Chart of Accounts</NavLink>
                <NavLink to="/dashboard/accounting/general-ledger"    className={subLinkClass} style={activeStyle} onClick={onLinkClick}>General Ledger</NavLink>
                <NavLink to="/dashboard/accounting/banking"           className={subLinkClass} style={activeStyle} onClick={onLinkClick}>Banking</NavLink>
                <NavLink to="/dashboard/accounting/bills"             className={subLinkClass} style={activeStyle} onClick={onLinkClick}>Bills</NavLink>
                <NavLink to="/dashboard/accounting/budgets"           className={subLinkClass} style={activeStyle} onClick={onLinkClick}>Budgets</NavLink>
              </div>
            )}
          </div>

          {/* Communication */}
          <NavLink to="/dashboard/communication" className={linkClass} style={activeStyle} onClick={onLinkClick}>
            <Mail size={18} /> Communication
          </NavLink>

          {/* Maintenance */}
          <NavLink to="/dashboard/maintenance" className={linkClass} style={activeStyle} onClick={onLinkClick}>
            <Building2 size={18} /> Maintenance
          </NavLink>

          {/* Reports — inside nav, above Settings/Help */}
          <div>
            <NavLink to="/dashboard/reports" className={linkClass} style={activeStyle}>
              <FileText size={18} /> Reports
            </NavLink>
            {reportsOpen && (
              <div className="mt-1 space-y-1">
                {/* Association sub-link — navigates to association reports index */}
                <NavLink to="/dashboard/reports/association" className={subLinkClass} style={activeStyle} onClick={onLinkClick}>
                  Association
                </NavLink>
                {/* Financial sub-link — navigates to financial reports index */}
                <NavLink to="/dashboard/reports/financial"   className={subLinkClass} style={activeStyle} onClick={onLinkClick}>
                  Financial
                </NavLink>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const accountingOpen = location.pathname.startsWith("/dashboard/accounting");
  const reportsOpen    = location.pathname.startsWith("/dashboard/reports");

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <div
        className="hidden md:flex h-screen w-64 text-white flex-col justify-between sticky top-0"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div>
          <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-white/20">
            GSTechSystem
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <NavContent role={role} accountingOpen={accountingOpen} reportsOpen={reportsOpen} onLinkClick={undefined} />
          </nav>
        </div>

        {/* Bottom — Help + Settings */}
        <div className="p-4 border-t border-white/20 space-y-1">
          <NavLink to="/dashboard/help" className={linkClass} style={activeStyle}>
            <HelpCircle size={18} /> Help
          </NavLink>
          <NavLink to="/dashboard/settings" className={linkClass} style={activeStyle}>
            <Settings size={18} /> Settings
          </NavLink>
        </div>
      </div>

      {/* ── MOBILE BUTTON ───────────────────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 text-white p-2 rounded-lg shadow-lg"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Menu size={20} />
      </button>

      {/* ── MOBILE SIDEBAR ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div
            className="fixed top-0 left-0 h-full w-64 text-white z-50 flex flex-col justify-between shadow-2xl overflow-y-auto"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <div>
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
                <span className="font-bold text-lg">GSTechSystem</span>
                <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
              </div>
              <nav className="p-4 space-y-1">
                <NavContent role={role} accountingOpen={accountingOpen} reportsOpen={reportsOpen} onLinkClick={() => setMobileOpen(false)} />
              </nav>
            </div>
            <div className="p-4 border-t border-white/20 space-y-1">
              <NavLink to="/dashboard/help" className={linkClass} style={activeStyle} onClick={() => setMobileOpen(false)}>
                <HelpCircle size={18} /> Help
              </NavLink>
              <NavLink to="/dashboard/settings" className={linkClass} style={activeStyle} onClick={() => setMobileOpen(false)}>
                <Settings size={18} /> Settings
              </NavLink>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
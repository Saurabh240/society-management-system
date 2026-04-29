import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { id: "account", label: "Account" },
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles" },
  { id: "billing", label: "Billing" },
];

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Settings
      </h2>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-gray-200 mb-6">
        <div className="flex min-w-max">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.id}
              className={({ isActive }) =>
                `px-4 sm:px-1 sm:mr-8 pb-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-var(--color-primary) text-var(--color-primary)"
                    : "border-transparent text-gray-500"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* THIS is the key */}
      <div className="mt-4 max-w-4xl">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsPage;


import { useNavigate, useLocation, Outlet } from "react-router-dom";

const TABS = [
  { id: "overview",       label: "Overview"       },
  { id: "general-ledger", label: "General Ledger" },
  { id: "banking",        label: "Banking"        },
  { id: "bills",          label: "Bills"          },
  { id: "reports",        label: "Reports"        },
];

export default function AccountingPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const segment   = pathname.split("/accounting/")[1]?.split("/")[0] || "overview";
  const activeTab = TABS.find((t) => t.id === segment)?.id || "overview";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Accounting</h2>

      <div className="overflow-x-auto border-b border-gray-200 mb-6">
        <div className="flex min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="px-4 sm:px-1 sm:mr-8 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
              style={
                activeTab === tab.id
                  ? { borderColor: "var(--color-primary)", color: "var(--color-primary)" }
                  : { borderColor: "transparent", color: "#6b7280" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
}

import { useNavigate, useLocation, Outlet } from "react-router-dom";

const TABS = [
  { id: "emails",        label: "Emails"        },
  { id: "mailings",      label: "Mailings"      },
  { id: "templates",     label: "Templates"     },
  { id: "text-messages", label: "Text Messages" },
];

export default function CommunicationPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Determine active tab from URL
  const activeTab = TABS.find((t) => pathname.includes(t.id))?.id || "emails";

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Communication</h2>

      {/* Tab bar — URL driven, scrollable on mobile */}
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

      {/* Active tab content rendered via nested routes */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
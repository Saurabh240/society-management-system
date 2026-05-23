import { Building2, Users, CreditCard, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ icon: Icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
  >
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: "var(--color-primary)", opacity: 0.9 }}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  </div>
);

export default function DashboardHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "User";

  if (role === "PLATFORM_ADMIN") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            title="Tenants"
            description="Manage all tenant accounts and subscriptions"
            onClick={() => navigate("/dashboard/tenants")}
          />
          <StatCard
            icon={Building2}
            title="Settings"
            description="Configure platform-wide settings"
            onClick={() => navigate("/dashboard/settings")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Building2}
          title="Associations"
          description="Manage your associations and units"
          onClick={() => navigate("/dashboard/associations")}
        />
        <StatCard
          icon={CreditCard}
          title="Accounting"
          description="View financials, bills, and ledger"
          onClick={() => navigate("/dashboard/accounting/overview")}
        />
        <StatCard
          icon={Mail}
          title="Communication"
          description="Send emails and messages to owners"
          onClick={() => navigate("/dashboard/communication")}
        />
      </div>
    </div>
  );
}

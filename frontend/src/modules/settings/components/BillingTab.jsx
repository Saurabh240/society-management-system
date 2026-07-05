import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBillingInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";

const BillingTab = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillingInfo()
      .then((data) => setBilling(data))
      .catch(() => setBilling(null))
      .finally(() => setLoading(false));
  }, []);

  const resolvedPlanLabel = () => {
    if (!billing) return "—";
    if (billing.plan === "STANDARD") return "Standard";
    if (billing.plan === "FREE")     return "Free Trial";
    return billing.planName ?? "Free Trial";
  };

  const resolvedUnitLimit = () => {
    if (!billing) return "—";
    const limit = billing.unitLimit ?? 15;
    if (billing.plan === "FREE" || billing.plan === "STANDARD" || limit <= 15) {
      return "15 (first 15 free)";
    }
    return `${limit}`;
  };

  const rows = billing ? [
    { label: "Current Plan",      value: resolvedPlanLabel() },
    { label: "Plan Type",         value: billing.plan ?? "FREE" },
    { label: "Unit Limit",        value: resolvedUnitLimit() },
    { label: "Units Used",        value: billing.unitsUsed ?? 0 },
    { label: "Next Billing Date", value: billing.nextBillingDate ?? "—" },
  ] : [];

  const isStandard = billing?.plan === "STANDARD";

  return (
    <div>
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto mb-4">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">
                Subscription Details
              </th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={2} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : billing === null ? (
              <tr><td colSpan={2} className="p-10 text-center text-gray-500">No subscription data found.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-600">{row.label}</td>
                  <td className="p-4 text-sm font-medium text-gray-900 text-right">{row.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => navigate("/plan-selection")}>
            {isStandard ? "Manage Plan" : "Upgrade Plan"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillingTab;
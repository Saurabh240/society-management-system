import { useEffect, useState } from "react";
import { getBillingInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";

const BillingTab = () => {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBillingInfo()
      .then((data) => setBilling(data))
      .catch(() => {
        setBilling({
          currentPlan:     "Professional",
          unitLimit:       200,
          unitsUsed:       145,
          nextBillingDate: "March 15, 2026",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = billing ? [
    { label: "Current Plan",      value: billing.currentPlan     },
    { label: "Unit Limit",        value: billing.unitLimit       },
    { label: "Units Used",        value: billing.unitsUsed       },
    { label: "Next Billing Date", value: billing.nextBillingDate },
  ] : [];

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

      {/* Upgrade button */}
      {!loading && (
        <div className="flex justify-end">
          <Button variant="primary">Upgrade Plan</Button>
        </div>
      )}
    </div>
  );
};

export default BillingTab;
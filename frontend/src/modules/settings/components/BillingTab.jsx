import { useEffect, useState } from "react";
import { getBillingInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day:   "numeric",
      year:  "numeric",
    });
  } catch {
    return String(dateStr);
  }
};

const BillingTab = () => {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // /subscription returns SubscriptionResponse directly (no ApiResponse wrapper)
    // Fields: id, tenantId, unitLimit, unitsUsed, status, planName, nextBillingDate
    getBillingInfo()
      .then((res) => setBilling(res.data))
      .catch(() => toast.error("Failed to load billing information"))
      .finally(() => setLoading(false));
  }, []);

  const rows = billing
    ? [
        { label: "Current Plan",      value: billing.planName           },
        { label: "Unit Limit",        value: billing.unitLimit          },
        { label: "Units Used",        value: billing.unitsUsed          },
        { label: "Status",            value: billing.status             },
        { label: "Next Billing Date", value: formatDate(billing.nextBillingDate) },
      ]
    : [];

  const handleUpgrade = () => {
    toast.info(
      "To upgrade your subscription plan, please contact your account manager or reach out to support@gstech.com",
      { autoClose: 6000 }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Subscription information unavailable.
      </div>
    );
  }

  return (
    <div>
      {/* Subscription details table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-5">
        {/* Header */}
        <div style={{ backgroundColor: "#a9c3f7" }} className="px-5 py-3">
          <span className="text-xs font-bold uppercase text-gray-800 tracking-wide">
            Subscription Details
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center px-5 py-4 hover:bg-gray-50">
              <span className="flex-1 text-sm text-gray-600">{row.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {row.label === "Status" ? (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    String(row.value).toUpperCase() === "ACTIVE"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {row.value}
                  </span>
                ) : (
                  row.value ?? "—"
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleUpgrade}>
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};

export default BillingTab;
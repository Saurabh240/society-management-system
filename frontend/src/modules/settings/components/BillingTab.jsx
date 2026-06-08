import { useEffect, useState } from "react";
import { getBillingInfo } from "@/modules/settings/api/settingsApi";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return String(dateStr); }
};

const BillingTab = () => {
  const navigate   = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SubscriptionController returns SubscriptionResponse directly (no ApiResponse wrapper)
    getBillingInfo()
      .then((res) => setBilling(res.data))
      .catch(() => toast.error("Failed to load billing information"))
      .finally(() => setLoading(false));
  }, []);

  const rows = billing ? [
    { label: "Current Plan",      value: billing.planName                        },
    { label: "Unit Limit",        value: billing.unitLimit                       },
    { label: "Units Used",        value: billing.unitsUsed                       },
    { label: "Status",            value: billing.status                          },
    { label: "Next Billing Date", value: formatDate(billing.nextBillingDate)     },
  ] : [];

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-5">
        <div style={{ backgroundColor: "#a9c3f7" }} className="px-5 py-3">
          <span className="text-xs font-bold uppercase text-gray-800 tracking-wide">
            Subscription Details
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : !billing ? (
            <div className="p-10 text-center text-gray-500 text-sm">Subscription information unavailable.</div>
          ) : (
            rows.map((row) => (
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
                  ) : (row.value ?? "—")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade Plan — navigates to the in-app pricing page */}
      {!loading && billing && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard/pricing")}
          >
            Upgrade Plan
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillingTab;
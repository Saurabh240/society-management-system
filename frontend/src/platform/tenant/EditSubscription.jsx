import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchSubscription, updateSubscription } from "./tenantApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../shared/components/Loader";

export default function EditSubscription() {
  const { tenantId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Tenant basic info (name, subdomain) from navigation state
  const tenant = state?.tenant || {};

  const [unitLimit, setUnitLimit] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [currentUsage, setCurrentUsage] = useState(0);

  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Fetch current subscription on mount ──────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingSubscription(true);
      try {
        const data = await fetchSubscription(tenantId);
        if (data) {
          setUnitLimit(data.unitLimit ?? "");
          setStatus(data.status ?? "ACTIVE");
          setCurrentUsage(data.currentUsage ?? 0);
        }
      } catch {
        // No subscription yet — form stays with empty defaults
      } finally {
        setLoadingSubscription(false);
      }
    };
    load();
  }, [tenantId]);

  const usagePercent =
    unitLimit > 0 ? Math.min((currentUsage / unitLimit) * 100, 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSubscription(tenantId, unitLimit, status);
      toast.success("Subscription updated successfully");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">

      {/* ── Tenant Information ── */}
      <Card className="w-full">
        <Card.Content className="pt-5">
          <h2 className="text-base font-bold mb-4">Tenant Information</h2>

          <div className="flex justify-between items-center py-2 border-b text-sm">
            <span className="text-gray-500">Tenant Name:</span>
            <span className="font-semibold">{tenant.name || "—"}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm">
            <span className="text-gray-500">Subdomain:</span>
            <span className="text-gray-700">{tenant.subdomain || "—"}</span>
          </div>
        </Card.Content>
      </Card>

      {/* ── Current Usage ── */}
      <Card className="w-full">
        <Card.Content className="pt-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">
            Current Usage
          </h2>
          <p className="mb-3">
            <span className="text-4xl font-bold text-gray-900">
              {currentUsage}
            </span>
            <span className="text-gray-500 ml-2 text-base">
              / {unitLimit || "—"} units used
            </span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gray-800 transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </Card.Content>
      </Card>

      {/* ── Subscription Settings ── */}
      <Card className="w-full">
        <Card.Content className="pt-5">
          <h2 className="text-base font-bold mb-5">Subscription Settings</h2>

          {loadingSubscription ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Loading subscription...
            </p>
          ) : (
            <>
              {/* Unit Limit */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Limit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={unitLimit}
                  onChange={(e) =>
                    setUnitLimit(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || loadingSubscription}
          className="bg-gray-900 text-white hover:bg-gray-700"
        >
          {saving ? <Loader /> : "Save Changes"}
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>

    </div>
  );
}
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { updateSubscription } from "./tenantApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../shared/components/Loader";
import ErrorMessage from "../../shared/components/ErrorMessage";

export default function EditSubscription() {
  const { tenantId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Tenant data passed via navigate(..., { state: { tenant } }) from TenantList
  const tenant = state?.tenant || {};

  const [unitLimit, setUnitLimit] = useState(tenant.unitLimit ?? "");
  const [status, setStatus] = useState(tenant.status ?? "ACTIVE");
  const currentUsage = tenant.currentUsage ?? 0;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const usagePercent =
    unitLimit > 0 ? Math.min((currentUsage / unitLimit) * 100, 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateSubscription(tenantId, unitLimit, status);
      setSuccess(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
              / {unitLimit} units used
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

          {/* Unit Limit */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={unitLimit}
              onChange={(e) => setUnitLimit(Math.max(1, Number(e.target.value)))}
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
        </Card.Content>
      </Card>

      {/* ── Feedback ── */}
      {error && <ErrorMessage message={error} />}
      {success && (
        <p className="text-green-600 text-sm text-center">
          Saved successfully! Redirecting...
        </p>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white hover:bg-gray-700"
        >
          {saving ? <Loader /> : "Save Changes"}
        </Button>

        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </Button>
      </div>

    </div>
  );
}
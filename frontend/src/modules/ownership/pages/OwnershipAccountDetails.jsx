import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil } from "lucide-react";
import { getOwnerById } from "../ownershipApi";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-blue-600 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
    <p className="text-sm text-gray-800">{value || "—"}</p>
  </div>
);

const Card = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden shadow-sm">
    <div className="px-5 py-3 border-b border-gray-100 bg-blue-50">
      <p className="text-sm font-semibold text-blue-700">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const OwnershipAccountDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [owner, setOwner]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerById(id)
      .then((res) => setOwner(res.data?.data || null))
      .catch(() => toast.error("Failed to load owner details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-blue-400">Loading…</div>;
  if (!owner)  return <div className="p-6 text-sm text-red-500">Owner not found.</div>;

  const unitNumber      = state?.unitNumber      || "—";
  const associationName = state?.associationName || "—";
  const fullName        = `${owner.firstName} ${owner.lastName}`;
  const altAddress      = [owner.altStreet, owner.altCity, owner.altState, owner.altZip].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-0.5">Owner Details</p>
          <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
        </div>
        <button
          onClick={() => navigate(`/dashboard/associations/accounts/${id}/edit`, { state })}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Pencil size={14} /> Edit Owner
        </button>
      </div>

      <Card title="Owner Information">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="First Name"  value={owner.firstName} />
          <Field label="Last Name"   value={owner.lastName} />
          <Field label="Association" value={associationName} />
          <Field label="Unit"        value={unitNumber} />
        </div>
      </Card>

      <Card title="Primary Address">
        <div className="grid grid-cols-1 gap-y-4">
          <Field label="Street Address" value={owner.primaryStreet} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="City"  value={owner.primaryCity} />
            <Field label="State" value={owner.primaryState} />
          </div>
          <Field label="ZIP Code" value={owner.primaryZip} />
        </div>
      </Card>

      {altAddress && (
        <Card title="Alternative Address">
          <div className="grid grid-cols-1 gap-y-4">
            <Field label="Street Address" value={owner.altStreet} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="City"  value={owner.altCity} />
              <Field label="State" value={owner.altState} />
            </div>
            <Field label="ZIP Code" value={owner.altZip} />
          </div>
        </Card>
      )}

      <Card title="Contact Information">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Email" value={owner.email} />
          <Field label="Phone" value={owner.phone} />
          {owner.altEmail && <Field label="Alternative Email" value={owner.altEmail} />}
          {owner.altPhone && <Field label="Alternative Phone" value={owner.altPhone} />}
        </div>
      </Card>

      <Card title="Board Member Status">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Is Board Member" value={owner.isBoardMember ? "Yes" : "No"} />
          {owner.isBoardMember && (
            <>
              <Field label="Term Start" value={owner.termStartDate ? new Date(owner.termStartDate).toLocaleDateString() : "—"} />
              <Field label="Term End"   value={owner.termEndDate   ? new Date(owner.termEndDate).toLocaleDateString()   : "—"} />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OwnershipAccountDetails;
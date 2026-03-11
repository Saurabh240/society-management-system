import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getOwnerById } from "../ownershipApi";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm text-gray-900 break-words">{value || "—"}</p>
  </div>
);

const Card = ({ children }) => (
  <div className="border border-gray-200 rounded-lg p-4 sm:p-5 mb-4">{children}</div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-semibold text-gray-800 mb-4">{children}</h2>
);

const OwnershipAccountDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [owner, setOwner]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerById(id)
      .then((res) => setOwner(res.data?.data || null))
      .catch(() => toast.error("Failed to load owner details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;
  if (!owner)  return <div className="p-6 text-sm text-red-500">Owner not found.</div>;

  const unitNumber      = state?.unitNumber      || "—";
  const associationName = state?.associationName || "—";
  const fullName        = `${owner.firstName} ${owner.lastName}`;
  const altAddress      = [owner.altStreet, owner.altCity, owner.altState, owner.altZip].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl mx-auto w-full px-2 sm:px-0">

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{fullName}</h1>
        <button
          onClick={() => navigate(`/dashboard/associations/accounts/${id}/edit`, { state })}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-black transition whitespace-nowrap"
        >
          Edit Owner
        </button>
      </div>

      {/* Owner Information */}
      <Card>
        <SectionTitle>Owner Information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="First Name"  value={owner.firstName} />
          <Field label="Last Name"   value={owner.lastName} />
          <Field label="Association" value={associationName} />
          <Field label="Unit"        value={unitNumber} />
        </div>
      </Card>

      {/* Primary Address */}
      <Card>
        <SectionTitle>Primary Address</SectionTitle>
        <div className="grid grid-cols-1 gap-y-4">
          <Field label="Street Address" value={owner.primaryStreet} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="City"  value={owner.primaryCity} />
            <Field label="State" value={owner.primaryState} />
          </div>
          <Field label="Zip Code" value={owner.primaryZip} />
        </div>
      </Card>

      {/* Alternative Address */}
      {altAddress && (
        <Card>
          <SectionTitle>Alternative Address</SectionTitle>
          <div className="grid grid-cols-1 gap-y-4">
            <Field label="Street Address" value={owner.altStreet} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="City"  value={owner.altCity} />
              <Field label="State" value={owner.altState} />
            </div>
            <Field label="Zip Code" value={owner.altZip} />
          </div>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <SectionTitle>Contact Information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Email" value={owner.email} />
          <Field label="Phone" value={owner.phone} />
          {owner.altEmail && <Field label="Alternative Email" value={owner.altEmail} />}
          {owner.altPhone && <Field label="Alternative Phone" value={owner.altPhone} />}
        </div>
      </Card>

      {/* Board Member Status */}
      <Card>
        <SectionTitle>Board Member Status</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
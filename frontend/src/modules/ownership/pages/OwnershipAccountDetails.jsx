import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Pencil } from "lucide-react";
import { getOwnerById } from "../ownershipApi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const Field = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-gray-800">{value || "—"}</p>
  </div>
);

const OwnershipAccountDetails = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [owner, setOwner]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerById(id, state?.unitId, state?.associationId)
      .then((res) => setOwner(res.data?.data || null))
      .catch(() => toast.error("Failed to load owner details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-blue-900">Loading…</div>;
  if (!owner)  return <div className="p-6 text-sm text-red-500">Owner not found.</div>;

  const unitNumber      = owner.unitNumber      || state?.unitNumber      || "—";
  const associationName = owner.associationName || state?.associationName || "—";
  const fullName        = `${owner.firstName} ${owner.lastName}`;
  const hasAltAddress   = [owner.altStreet, owner.altCity, owner.altState, owner.altZip].some(Boolean);

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-900 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Ownership Accounts</span>
      </button>

      {/* Page title + Edit button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{fullName}</h1>
        <Button
          variant="primary"
          onClick={() => navigate(`/dashboard/associations/accounts/${id}/edit`, { state })}
        >
          <Pencil size={14} className="mr-2" /> Edit Owner
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Content className="p-8 space-y-10">

          {/* Association + Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Association" value={associationName} />
            <Field label="Unit"        value={unitNumber} />
          </div>

          {/* Owner Information */}
          <section className="space-y-6">
            <h4 className="text-lg font-semibold">Owner Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="First Name" value={owner.firstName} />
              <Field label="Last Name"  value={owner.lastName} />
            </div>
          </section>

          {/* Primary Address */}
          <section className="space-y-6">
            <h4 className="text-lg font-semibold">Primary Address</h4>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Street Address" value={owner.primaryStreet} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="City"     value={owner.primaryCity} />
                <Field label="State"    value={owner.primaryState} />
                <Field label="ZIP Code" value={owner.primaryZip} />
              </div>
            </div>
          </section>

          {/* Alternative Address */}
          {hasAltAddress && (
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Alternative Address</h4>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Street Address" value={owner.altStreet} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="City"     value={owner.altCity} />
                  <Field label="State"    value={owner.altState} />
                  <Field label="ZIP Code" value={owner.altZip} />
                </div>
              </div>
            </section>
          )}

          {/* Contact Information */}
          <section className="space-y-6">
            <h4 className="text-lg font-semibold">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Email Address"     value={owner.email} />
              <Field label="Alternative Email" value={owner.altEmail} />
              <Field label="Phone Number"      value={owner.phone} />
              <Field label="Alternative Phone" value={owner.altPhone} />
            </div>
          </section>

          {/* Board Member Status */}
          <section className="space-y-6 pt-4">
            <h4 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Board Member Status</h4>
            <div className="flex items-center">
              <span
                className="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                style={
                  owner.isBoardMember
                    ? { backgroundColor: "#EEF1F9", color: "#1A2B6B", border: "1px solid #1A2B6B" }
                    : { backgroundColor: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }
                }
              >
                {owner.isBoardMember ? "Yes — Board Member" : "No"}
              </span>
            </div>

            {owner.isBoardMember && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                <Field label="Designation"   value={owner.designation} />
                <Field label="Term Start Date" value={owner.termStartDate ? new Date(owner.termStartDate).toLocaleDateString() : "—"} />
                <Field label="Term End Date"   value={owner.termEndDate   ? new Date(owner.termEndDate).toLocaleDateString()   : "—"} />
              </div>
            )}
          </section>

        </Card.Content>
      </Card>
    </div>
  );
};

export default OwnershipAccountDetails;
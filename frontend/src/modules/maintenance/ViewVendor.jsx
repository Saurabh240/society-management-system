import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import { getVendorById, deleteVendor } from "@/modules/maintenance/api/maintenanceApi";

export default function ViewVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVendor(id);
      toast.success("Vendor deleted");
      navigate("/dashboard/maintenance");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await getVendorById(id);
        setVendor(res.data?.data || res.data);
      } catch {
        toast.error("Failed to load vendor details");
        navigate("/dashboard/maintenance");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-400px">
        <Loader2 className="animate-spin text-blue-900 mb-2" size={32} />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const DataField = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-base text-gray-900">{value || "—"}</span>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8 mb-6 uppercase tracking-tight">
      {title}
    </h3>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/maintenance")}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Vendors
      </button>

    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">View Vendor</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/maintenance/edit/${id}`)}>
            <Pencil size={14} className="mr-1" /> Edit
          </Button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Basic Information */}
        <SectionHeader title="Basic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <DataField label="First Name:" value={vendor?.firstName} />
          <DataField label="Last Name:" value={vendor?.lastName} />
          <DataField label="Company Name:" value={vendor?.companyName} />
          <DataField label="Category:" value={vendor?.serviceCategory} />
        </div>

        {/* Contact Information */}
        <SectionHeader title="Contact Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <DataField label="Primary Email:" value={vendor?.email} />
          <DataField label="Alternative Email:" value={vendor?.altEmail} />
          <DataField label="Mobile Phone:" value={vendor?.mobilePhone} />
          <DataField label="Work Phone:" value={vendor?.workPhone} />
          <DataField label="Home Phone:" value={vendor?.homePhone} />
          <DataField label="Website:" value={vendor?.website} />
        </div>

        {/* Address */}
        <SectionHeader title="Address" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <div className="md:col-span-2">
            <DataField label="Street Address:" value={vendor?.street} />
          </div>
          <DataField label="City:" value={vendor?.city} />
          <DataField label="State:" value={vendor?.state} />
          <DataField label="ZIP Code:" value={vendor?.zipCode} />
          <DataField label="Country:" value={vendor?.country || "United States"} />
        </div>

        {/* Tax Information */}
        <SectionHeader title="Tax Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <DataField label="Tax Identity Type:" value={vendor?.taxIdentityType} />
          <DataField label="Taxpayer ID:" value={vendor?.taxPayerId} />
        </div>

        {/* Insurance Details */}
        <SectionHeader title="Insurance Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
          <DataField label="Insurance Provider:" value={vendor?.insuranceProvider} />
          <DataField label="Policy Number:" value={vendor?.policyNumber} />
          <DataField label="Expiration Date:" value={vendor?.insuranceExpiry} />
          <DataField label="Created Date:" value={vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "—"} />
        </div>

        {/* Additional Notes */}
        <SectionHeader title="Additional Notes" />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-80px">
          <p className="text-gray-700 text-sm leading-relaxed">
            {vendor?.notes || "No additional notes provided."}
          </p>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
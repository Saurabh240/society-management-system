import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import { getVendorById } from "@/modules/maintenance/api/maintenanceApi";

export default function ViewVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-5xl mx-auto my-6">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900">View Vendor</h2>
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition">
          <X size={24} />
        </button>
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

        {/* Footer Actions */}
        <div className="flex justify-end mt-10">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
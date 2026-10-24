import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, Trash2, Loader2 } from "lucide-react";

import Button from "@/components/ui/Button";
import PageHeader from "@/shared/components/PageHeader";
import StatusBadge from "@/shared/components/StatusBadge";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import { DetailSection, DetailGrid, DetailField } from "@/shared/components/DetailView";
import { getVendorById, deleteVendor } from "@/modules/maintenance/api/maintenanceApi";

const LIST_PATH = "/dashboard/maintenance";

export default function ViewVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getVendorById(id);
        setVendor(res.data?.data || res.data);
      } catch {
        toast.error("Failed to load vendor details");
        navigate(LIST_PATH);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVendor(id);
      toast.success("Vendor deleted");
      navigate(LIST_PATH);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-[var(--color-primary)] mb-2" size={32} />
        <p className="text-gray-500">Loading vendor...</p>
      </div>
    );
  }
  if (!vendor) return null;

  const title = vendor.companyName || [vendor.firstName, vendor.lastName].filter(Boolean).join(" ") || "Vendor";
  const fullName = [vendor.firstName, vendor.lastName].filter(Boolean).join(" ");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        onBack={() => navigate(LIST_PATH)}
        backLabel="Back to Maintenance"
        title={title}
        subtitle={vendor.serviceCategory}
        badge={<StatusBadge status={vendor.status || "ACTIVE"} />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate(`${LIST_PATH}/edit/${id}`)}>
              <Pencil size={16} className="mr-1" /> Edit Vendor
            </Button>
          </>
        }
      />

      <DetailSection title="Basic Information">
        <DetailGrid>
          <DetailField label="Vendor Type" value={vendor.isCompany ? "Company" : "Individual"} />
          <DetailField label="Company Name" value={vendor.companyName} />
          <DetailField label="Contact Name" value={fullName} />
          <DetailField label="Category" value={vendor.serviceCategory} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Contact Information">
        <DetailGrid>
          <DetailField label="Primary Email" value={vendor.email} />
          <DetailField label="Alternative Email" value={vendor.altEmail} />
          <DetailField label="Mobile Phone" value={vendor.mobilePhone} />
          <DetailField label="Work Phone" value={vendor.workPhone} />
          <DetailField label="Home Phone" value={vendor.homePhone} />
          <DetailField label="Website" value={vendor.website} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Address">
        <DetailGrid>
          <DetailField label="Street Address" value={vendor.street} span2 />
          <DetailField label="City" value={vendor.city} />
          <DetailField label="State" value={vendor.state} />
          <DetailField label="ZIP Code" value={vendor.zipCode} />
          <DetailField label="Country" value={vendor.country || "United States"} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Tax Information">
        <DetailGrid>
          <DetailField label="Tax Identity Type" value={vendor.taxIdentityType} />
          <DetailField label="Taxpayer ID" value={vendor.taxPayerId} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Insurance Details">
        <DetailGrid>
          <DetailField label="Insurance Provider" value={vendor.insuranceProvider} />
          <DetailField label="Policy Number" value={vendor.policyNumber} />
          <DetailField label="Expiration Date" value={vendor.insuranceExpiry} />
          <DetailField label="Created" value={vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : null} />
        </DetailGrid>
      </DetailSection>

      <DetailSection title="Additional Notes">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {vendor.notes || "No additional notes provided."}
        </p>
      </DetailSection>

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this vendor? This cannot be undone."
          loading={deleting}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

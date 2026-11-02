import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2 } from "lucide-react";

import VendorForm from "@/modules/maintenance/components/VendorForm";
import { vendorToForm } from "@/modules/maintenance/components/vendorFormUtils";
import { createVendor, getVendorById, updateVendor } from "@/modules/maintenance/api/maintenanceApi";

export default function AddVendorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const isEditMode = !!id;

  const [fetching, setFetching] = useState(isEditMode);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!isEditMode) return;
    (async () => {
      try {
        const res = await getVendorById(id);
        setInitialData(vendorToForm(res.data?.data || res.data));
      } catch {
        toast.error("Failed to load vendor data");
        navigate("/dashboard/maintenance");
      } finally {
        setFetching(false);
      }
    })();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (payload, formData) => {
    if (isEditMode) {
      await updateVendor(id, payload);
      if (formData.defaultExpenseAccountId) {
        localStorage.setItem(`vendor_expense_account_${id}`, String(formData.defaultExpenseAccountId));
      }
      toast.success("Vendor updated successfully!");
    } else {
      const createRes = await createVendor(payload);
      const createdId = createRes?.data?.data?.id || createRes?.data?.id;
      if (createdId && formData.defaultExpenseAccountId) {
        localStorage.setItem(`vendor_expense_account_${createdId}`, String(formData.defaultExpenseAccountId));
      }
      toast.success("Vendor created successfully!");
      if (returnTo) {
        navigate(returnTo, { state: { newVendorId: createdId } });
        return;
      }
    }
    navigate("/dashboard/maintenance");
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-900" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} className="mr-1" /> Back to Vendors
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        {isEditMode ? "Edit Vendor" : "Add Vendor"}
      </h2>

      <VendorForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel={isEditMode ? "Update Vendor" : "Save Vendor"}
      />
    </div>
  );
}

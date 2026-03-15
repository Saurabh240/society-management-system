import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createOwner } from "../ownershipApi";
import OwnershipAccountForm from "../components/OwnershipAccountForm";



const OwnershipAccountCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createOwner(data);
      toast.success("Owner created successfully!");
      navigate("/dashboard/associations/accounts");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create owner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full w-full">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--color-primary)" }}>Ownership Accounts</p>
        <h1 className="text-xl font-bold text-gray-900">Add Owner</h1>
      </div>
      <OwnershipAccountForm onSubmit={handleSubmit} loading={loading} mode="create" />
    </div>
  );
};

export default OwnershipAccountCreate;
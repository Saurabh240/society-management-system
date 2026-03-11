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
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Add Owner</h1>
      <OwnershipAccountForm onSubmit={handleSubmit} loading={loading} mode="create" />
    </div>
  );
};

export default OwnershipAccountCreate;
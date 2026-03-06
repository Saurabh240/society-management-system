import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OwnershipAccountForm from "../components/OwnershipAccountForm";

const OwnershipAccountCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      try {
        console.log("New account:", data);
        toast.success("Owner created successfully!");
        navigate("/dashboard/associations/accounts");
      } catch {
        toast.error("Failed to create owner.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="max-w-2xl w-full">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back
      </button>
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Add Owner</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
        <OwnershipAccountForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default OwnershipAccountCreate;
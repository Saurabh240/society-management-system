import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import OwnershipAccountForm from "../components/OwnershipAccountForm";

const DUMMY_ACCOUNTS = [
  { id: "1", firstName: "Emily",   lastName: "Martinez", associationId: "1", unitId: "201", email: "emily.martinez@example.com",  phone: "(555) 111-2222" },
  { id: "2", firstName: "David",   lastName: "Chen",     associationId: "1", unitId: "202", email: "david.chen@example.com",       phone: "(555) 222-3333" },
  { id: "3", firstName: "Sarah",   lastName: "Chen",     associationId: "1", unitId: "202", email: "sarah.chen@example.com",       phone: "(555) 222-3334" },
  { id: "4", firstName: "Jessica", lastName: "Williams", associationId: "2", unitId: "301", email: "jessica.williams@example.com", phone: "(555) 333-4444" },
  { id: "5", firstName: "Robert",  lastName: "Taylor",   associationId: "2", unitId: "302", email: "robert.taylor@example.com",    phone: "(555) 444-5555" },
];

const OwnershipAccountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const initialData = DUMMY_ACCOUNTS.find((a) => a.id === id) || DUMMY_ACCOUNTS[0];

  const handleSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      try {
        console.log("Updated:", data);
        toast.success("Owner updated successfully!");
        navigate("/dashboard/associations/accounts");
      } catch {
        toast.error("Failed to update owner.");
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
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Edit Owner</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
        <OwnershipAccountForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default OwnershipAccountEdit;
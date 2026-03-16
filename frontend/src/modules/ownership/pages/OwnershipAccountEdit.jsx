import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getOwnerById, updateOwner } from "../ownershipApi";
import OwnershipAccountForm from "../components/OwnershipAccountForm";

const OwnershipAccountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOwnerById(id)
      .then((res) => {
        const owner = res.data?.data;
        if (!owner) return;

        const assoc = owner.unitAssociations?.[0];

        // Pass associationName + unitNumber to form.
        // The form already loads all associations + units,
        setInitialData({
          ...owner,
          associationName: assoc?.associationName || "",
          unitNumber: assoc?.unitNumber || "",
          isBoardMember: Boolean(assoc?.isBoardMember),
          termStartDate: assoc?.termStartDate ? assoc.termStartDate.slice(0, 10) : "",
          termEndDate: assoc?.termEndDate ? assoc.termEndDate.slice(0, 10) : "",
        });
      })
      .catch(() => toast.error("Failed to load owner details."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updateOwner(id, data);
      toast.success("Owner updated successfully!");
      navigate("/dashboard/associations/accounts");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update owner.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6 text-sm text-blue-400">Loading…</div>;
  if (!initialData) return <div className="p-6 text-sm text-red-500">Owner not found.</div>;

  return (
    <div className="max-w-full w-full">
      <div className="mb-6">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-0.5">Ownership Accounts</p>
        <h1 className="text-xl font-bold text-gray-900">Edit Owner</h1>
      </div>
      <OwnershipAccountForm initialData={initialData} onSubmit={handleSubmit} loading={loading} mode="edit" />
    </div>
  );
};

export default OwnershipAccountEdit;
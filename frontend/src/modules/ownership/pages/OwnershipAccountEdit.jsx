

import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getOwnerById, updateOwner } from "../ownershipApi";
import OwnershipAccountForm from "../components/OwnershipAccountForm";

const OwnershipAccountEdit = () => {
  
  const { associationId, unitId, id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    const finalId = id;
    const finalUnitId = unitId || state?.unitId;
    const finalAssocId = associationId || state?.associationId;

    getOwnerById(finalId, finalUnitId, finalAssocId)
      .then((res) => {
        const owner = res.data?.data;
        if (!owner) return;

       
        const assoc = owner.unitAssociations?.[0];

        setInitialData({
          ...owner,
          associationId:   String(assoc?.associationId || finalAssocId || ""),
          unitId:          String(assoc?.unitId || finalUnitId || ""),
          associationName: assoc?.associationName || "",
          unitNumber:      assoc?.unitNumber || "",
          isBoardMember:   Boolean(assoc?.isBoardMember),
          termStartDate:   assoc?.termStartDate ? assoc.termStartDate.slice(0, 10) : "",
          termEndDate:     assoc?.termEndDate   ? assoc.termEndDate.slice(0, 10)   : "",
          designation:     assoc?.designation || "",
        });
      })
      .catch(() => toast.error("Failed to load owner details."))
      .finally(() => setFetching(false));
  }, [id, unitId, associationId]); 

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updateOwner(id, data);
      toast.success("Owner updated successfully!");
      
      
      navigate(-1); 
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
      <OwnershipAccountForm 
        key={id} 
        initialData={initialData} 
        onSubmit={handleSubmit} 
        loading={loading} 
        mode="edit" 
      />
    </div>
  );
};

export default OwnershipAccountEdit;
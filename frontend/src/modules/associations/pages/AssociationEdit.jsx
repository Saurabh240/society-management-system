import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AssociationForm from "../components/ AssociationForm";

import {
  getAssociationById,
  updateAssociation,
} from "../associationApi";

export default function AssociationEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const res = await getAssociationById(id);
    setData(res.data);
  };

  const handleSubmit = async (formData) => {
    await updateAssociation(id, formData);
    navigate("..");
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Edit Association
      </h1>

      <AssociationForm
        initialData={data}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
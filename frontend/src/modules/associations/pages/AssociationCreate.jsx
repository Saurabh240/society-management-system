import { useNavigate } from "react-router-dom";
import AssociationForm from "../components/AssociationForm";
import { createAssociation } from "../associationApi";

export default function AssociationCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createAssociation(data);
    navigate(".."); 
  };

  return (
    <div>
     <h1 className="text-2xl font-semibold mb-6">
        Add Association
      </h1>

      <AssociationForm onSubmit={handleSubmit} />
    </div>
  );
}


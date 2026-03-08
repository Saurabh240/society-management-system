import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react"; 
import AssociationUnitForm from "../components/AssociationUnitForm";

export default function AssociationUnitCreate() {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log("Create Unit", data);
    navigate("/dashboard/associations/units");
  };

  return (
    <div className="p-6">

     
      <button
        onClick={() => navigate("/dashboard/associations/units")}
        className="flex items-center gap-1 text-gray-600  mb-4 text-sm cursor-pointer"
      >
        <ChevronLeft size={18} />
        Back to Association Units
      </button>

      <h2 className="text-xl font-semibold mb-4">Add Unit</h2>

      <AssociationUnitForm onSubmit={handleSubmit} />

    </div>
  );
}


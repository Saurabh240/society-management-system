
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; 
import { toast } from "react-toastify"; 
import AssociationUnitForm from "../components/AssociationUnitForm";
import { createUnit } from "../unitApi"; 

export default function AssociationUnitCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
     
      const response = await createUnit(data);
      
     
      if (response.status === 200 || response.status === 201) {
        toast.success("Unit created successfully!");
        
      
        navigate("/dashboard/associations/units");
      }
    } catch (error) {
      console.error("Failed to create unit:", error);
    
      const errorMsg = error.response?.data?.message || "Failed to create unit";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/dashboard/associations/units")}
        className="flex items-center gap-1 text-gray-600 mb-4 text-sm cursor-pointer hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={18} />
        Back to Association Units
      </button>

      <h2 className="text-xl font-semibold mb-4">Add Unit</h2>

      <AssociationUnitForm onSubmit={handleSubmit} />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
/*import AssociationUnitForm from "../../associations/components/AssociationUnitForm";*/

export default function AssociationUnitCreate() {

  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log("Create Unit", data);
    navigate("/dashboard/associations/units");
  };

  return (
    <div className="p-6">

      <h2 className="text-xl mb-4">Create Unit</h2>

      <AssociationUnitForm onSubmit={handleSubmit} />

    </div>
  );
}
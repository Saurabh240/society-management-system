import { useNavigate } from "react-router-dom";
/*import AssociationUnitForm from "../components/AssociationUnitForm";*/


export default function AssociationUnitEdit() {

  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log("Update Unit", data);
    navigate("/dashboard/associations/units");
  };

  return (
    <div className="p-6">

      <h2 className="text-xl mb-4">Edit Unit</h2>

      <AssociationUnitForm
        onSubmit={handleSubmit}
        initialData={{
          unitNumber: "201",
          address: "456 Sunset Blvd",
          owner: "Emily Martinez",
        }}
      />

    </div>
  );
}
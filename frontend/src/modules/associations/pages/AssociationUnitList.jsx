

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import { Plus } from "lucide-react";
import AssociationUnitTable from "../components/AssociationUnitTable";

export default function AssociationUnitList({ associations = [], unitsData = [] }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedAssociation, setSelectedAssociation] = useState("");


  const filteredUnits = unitsData.filter((unit) => {
    const matchesSearch =
      unit.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      unit.address.toLowerCase().includes(search.toLowerCase()) ||
      unit.association.toLowerCase().includes(search.toLowerCase());

    const matchesAssociation =
      selectedAssociation === "" || unit.association === selectedAssociation;

    return matchesSearch && matchesAssociation;
  });

  return (
    <div className="p-6">

 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Association Units</h1>

      <Button
  variant="primary"
  onClick={() => navigate("/dashboard/associations/units/create")}
  className="flex items-center gap-2 "
>
  <Plus size={18} />
  Add Unit
</Button>
</div>

   
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by unit number, address, or association..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <Select
          value={selectedAssociation}
          onChange={(e) => setSelectedAssociation(e.target.value)}
          options={[
            { label: "All Associations", value: "" },
            ...associations.map((a) => ({ label: a.name, value: a.name })),
          ]}
          className="w-full md:w-60 "
        />
      </div>

    
      <Card>
        <AssociationUnitTable units={filteredUnits} />
      </Card>

    </div>
  );
}



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import { Plus } from "lucide-react";
import AssociationUnitTable from "../components/AssociationUnitTable";

//   DUMMY DATA FOR THE LIST 
const DUMMY_ASSOCIATIONS = [
  { id: "1", name: "Sunset Village" },
  { id: "2", name: "Greenwood Apartments" },
  { id: "3", name: "Oak Ridge Community" },
];

const DUMMY_UNITS = [
  {
    id: 1,
    unitNumber: "A-101",
    association: "Sunset Village",
    address: "456 Sunset Blvd, Apt 101",
    occupancy: "Owner Occupied",
    owner: "John Doe",
    balance: "$0.00",
  },
  {
    id: 2,
    unitNumber: "B-205",
    association: "Greenwood Apartments",
    address: "789 Pine St, Unit 205",
    occupancy: "Vacant",
    owner: null,
    balance: "$150.00",
  },
];

export default function AssociationUnitList({ 
  // 2. Set default values to the dummy data so it shows immediately
  associations = DUMMY_ASSOCIATIONS, 
  unitsData = DUMMY_UNITS 
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedAssociation, setSelectedAssociation] = useState("");

  const filteredUnits = unitsData.filter((unit) => {
 
    const unitNum = unit.unitNumber?.toLowerCase() || "";
    const addr = unit.address?.toLowerCase() || "";
    const assoc = unit.association?.toLowerCase() || "";
    const term = search.toLowerCase();

    const matchesSearch =
      unitNum.includes(term) ||
      addr.includes(term) ||
      assoc.includes(term);

    const matchesAssociation =
      selectedAssociation === "" || unit.association === selectedAssociation;

    return matchesSearch && matchesAssociation;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Association Units</h1>

        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/associations/units/create")}
          className="flex items-center gap-2"
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
          className="w-full md:w-64"
        />
      </div>

      <Card className="p-0 border-none shadow-none">
      
        <AssociationUnitTable units={filteredUnits} />
      </Card>
    </div>
  );
}
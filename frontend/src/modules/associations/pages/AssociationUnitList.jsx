

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import { Plus } from "lucide-react";
import AssociationUnitTable from "../components/AssociationUnitTable";
import { getAllUnits } from "../unitApi";
import { getAssociations } from "../associationApi";

export default function AssociationUnitList() {
  const navigate = useNavigate();

  const [associations, setAssociations] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAssociation, setSelectedAssociation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [assocRes, unitsRes] = await Promise.all([
          getAssociations(),
          getAllUnits()
        ]);

        // Standardizing data access: backend often nests in .data.data or just .data
        const assocData = assocRes.data?.data || assocRes.data || [];
        const unitsData = unitsRes.data?.data || unitsRes.data || [];

        setAssociations(Array.isArray(assocData) ? assocData : []);
        setUnits(Array.isArray(unitsData) ? unitsData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredUnits = units.filter((unit) => {
    const unitNum = (unit.unitNumber || "").toLowerCase();
    const addr = `${unit.street || ""} ${unit.city || ""}`.toLowerCase();
    const assoc = (unit.associationName || "").toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch = unitNum.includes(term) || addr.includes(term) || assoc.includes(term);
    const matchesAssociation = selectedAssociation === "" || unit.associationName === selectedAssociation;

    return matchesSearch && matchesAssociation;
  });

  if (loading) return <div className="p-6 text-center text-gray-500">Loading units...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Association Units</h1>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/associations/units/create")}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Unit
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

      <Card className="p-0 border-none shadow-none bg-transparent">
        <AssociationUnitTable
          units={filteredUnits}
          onRefresh={async () => {
            const res = await getAllUnits();
            setUnits(res.data?.data || res.data || []);
          }}
        />
      </Card>
    </div>
  );
}
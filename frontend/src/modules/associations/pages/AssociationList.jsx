import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import AssociationTable from "../components/AssociationTable";
import { getAssociations } from "../associationApi";
import Button from "@/components/ui/Button";

export default function AssociationListPage() {
  const navigate = useNavigate();

  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssociations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAssociations();
      setAssociations(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch associations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations]);

  return (
  <div className="max-w-6xl mx-auto p-4 sm:p-6"> 
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
      Associations
    </h1>

    <Button
      onClick={() => navigate("create")}
      className="w-full sm:w-auto flex justify-center" 
      leftIcon={<Plus size={18} />}
    >
      Add Association
    </Button>
  </div>

  {loading ? (
    <div className="py-16 flex justify-center">
      <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  ) : (
    <AssociationTable data={associations} onRefresh={fetchAssociations} />
  )}
</div>
  );
}
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
      setAssociations(res?.data || []);
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
    <div className="max-w-6xl mx-auto p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Associations
        </h1>

        <Button
          onClick={() => navigate("create")}
          leftIcon={<Plus size={18} />}
        >
          Add Association
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AssociationTable
          data={associations}
          onRefresh={fetchAssociations}
        />
      )}
    </div>
  );
}